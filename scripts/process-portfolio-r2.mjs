import sharp from 'sharp';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY })) {
  if (!v) throw new Error(`Missing env var ${k}`);
}

const PREFIX = 'portfolio/';
const FORCE = process.argv.includes('--force');
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const SIZES = { thumb: { width: 800, quality: 75 }, full: { width: 2000, quality: 82 } };
const IMMUTABLE = 'public, max-age=31536000, immutable';
const CONCURRENCY = 4;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function exists(Key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key }));
    return true;
  } catch {
    return false;
  }
}

const put = (Key, Body, ContentType, CacheControl) =>
  s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key, Body, ContentType, CacheControl }));

async function listAll() {
  const keys = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: PREFIX, ContinuationToken: token })
    );
    keys.push(...(res.Contents ?? []).map((o) => o.Key));
    token = res.NextContinuationToken;
  } while (token);
  return keys;
}

// Originals sit directly in portfolio/<category>/
const originals = (await listAll())
  .map((key) => key.slice(PREFIX.length).split('/'))
  .filter((parts) => parts.length === 2 && IMAGE_RE.test(parts[1]))
  .map(([category, file]) => ({ category, file }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.file.localeCompare(b.file, undefined, { numeric: true }));

async function processOne({ category, file }) {
  const base = file.replace(/\.[^.]+$/, '');
  let input;
  for (const [variant, opts] of Object.entries(SIZES)) {
    const Key = `${PREFIX}${category}/${variant}/${base}.webp`;
    if (!FORCE && (await exists(Key))) {
      console.log(`skip   ${Key}`);
      continue;
    }
    if (!input) {
      const { Body } = await s3.send(
        new GetObjectCommand({ Bucket: R2_BUCKET, Key: `${PREFIX}${category}/${file}` })
      );
      input = Buffer.from(await Body.transformToByteArray());
    }
    const body = await sharp(input)
      .rotate()
      .resize({ width: opts.width, withoutEnlargement: true })
      .webp({ quality: opts.quality })
      .toBuffer();
    await put(Key, body, 'image/webp', IMMUTABLE);
    console.log(`upload ${Key} (${Math.round(body.length / 1024)} KB)`);
  }
}

const queue = [...originals];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        await processOne(item);
      } catch (err) {
        console.error(`FAILED ${item.category}/${item.file}: ${err.message}`);
        item.failed = true;
      }
    }
  })
);

const marks = [];
let markToken;
do {
  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: 'watermark/', ContinuationToken: markToken })
  );
  marks.push(...(res.Contents ?? []).map((o) => o.Key));
  markToken = res.NextContinuationToken;
} while (markToken);

const manifest = { categories: [], watermarks: {} };
for (const key of marks) {
  const file = key.slice('watermark/'.length);
  if (/\.(png|webp|svg)$/i.test(file)) manifest.watermarks[file.replace(/\.[^.]+$/, '')] = key;
}
for (const { category, file, failed } of originals) {
  if (failed) continue;
  let entry = manifest.categories.find((c) => c.name === category);
  if (!entry) manifest.categories.push((entry = { name: category, images: [] }));
  const base = file.replace(/\.[^.]+$/, '');
  entry.images.push({
    file,
    thumb: `${PREFIX}${category}/thumb/${base}.webp`,
    full: `${PREFIX}${category}/full/${base}.webp`,
  });
}

await put('portfolio/manifest.json', JSON.stringify(manifest, null, 2), 'application/json', 'public, max-age=60');
console.log(`manifest uploaded: ${manifest.categories.map((c) => `${c.name} (${c.images.length})`).join(', ')}`);

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

const PREFIX = 'domegalleryCollection/';
const TILE = { width: 320, quality: 30 };
const FORCE = process.argv.includes('--force');
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const IMMUTABLE = 'public, max-age=31536000, immutable';

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

const listing = await s3.send(
  new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: PREFIX, Delimiter: '/' })
);
const originals = (listing.Contents ?? [])
  .map((o) => o.Key)
  .filter((k) => IMAGE_RE.test(k));

for (const key of originals) {
  const base = key.slice(PREFIX.length).replace(/\.[^.]+$/, '');
  const Key = `${PREFIX}tiles/${base}.webp`;
  if (!FORCE && (await exists(Key))) {
    console.log(`skip   ${Key}`);
    continue;
  }
  const { Body } = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const input = Buffer.from(await Body.transformToByteArray());
  const body = await sharp(input)
    .rotate()
    .resize({ width: TILE.width, withoutEnlargement: true })
    .webp({ quality: TILE.quality, effort: 6 })
    .toBuffer();
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key,
      Body: body,
      ContentType: 'image/webp',
      CacheControl: IMMUTABLE,
    })
  );
  console.log(`upload ${Key} (${Math.round(body.length / 1024)} KB)`);
}
console.log(`done: ${originals.length} originals processed`);

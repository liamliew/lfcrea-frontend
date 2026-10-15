import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY })) {
  if (!v) throw new Error(`Missing env var ${k}`);
}

const SRC = path.resolve('src/assets/portfolio');
const FORCE = process.argv.includes('--force');
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const SIZES = { thumb: { width: 800, quality: 75 }, full: { width: 2000, quality: 82 } };
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

const put = (Key, Body, ContentType, CacheControl) =>
  s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key, Body, ContentType, CacheControl }));

const manifest = { categories: [] };
const folders = (await readdir(SRC, { withFileTypes: true })).filter((d) => d.isDirectory());

for (const dir of folders.sort((a, b) => a.name.localeCompare(b.name))) {
  const files = (await readdir(path.join(SRC, dir.name)))
    .filter((f) => IMAGE_RE.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const images = [];

  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, '');
    const keys = {};
    let input;
    for (const [variant, opts] of Object.entries(SIZES)) {
      const Key = `portfolio/${dir.name}/${variant}/${base}.webp`;
      keys[variant] = Key;
      if (!FORCE && (await exists(Key))) {
        console.log(`skip   ${Key}`);
        continue;
      }
      input ??= await readFile(path.join(SRC, dir.name, file));
      const body = await sharp(input)
        .rotate()
        .resize({ width: opts.width, withoutEnlargement: true })
        .webp({ quality: opts.quality })
        .toBuffer();
      await put(Key, body, 'image/webp', IMMUTABLE);
      console.log(`upload ${Key} (${Math.round(body.length / 1024)} KB)`);
    }
    images.push({ file, thumb: keys.thumb, full: keys.full });
  }

  manifest.categories.push({ name: dir.name, images });
}

await put(
  'portfolio/manifest.json',
  JSON.stringify(manifest, null, 2),
  'application/json',
  'public, max-age=60'
);
console.log(`manifest uploaded: ${manifest.categories.length} categories`);

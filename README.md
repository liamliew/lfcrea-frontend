# lfcrea-frontend

Beta prebuild of LF Creative's home website.

## Tech stack

- React 19, React Router 7
- Vite 8
- GSAP
- three.js (profile lanyard)
- lucide-react, react-aria-components, Tailwind Merge
- Supabase
- Stripe
- Sentry
- OpenTelemetry + SigNoz
- Cloudflare R2 for photos

## Local development

```bash
git clone https://github.com/liamliew/lfcrea-frontend.git
cd lfcrea-frontend
cp .env.example .env
npm install
npm run dev
```

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SIGNOZ_ENDPOINT` | SigNoz Cloud OTLP HTTP endpoint (e.g. `https://ingest.us2.signoz.cloud`). Found under Settings &rarr; Ingestion Settings in your SigNoz Cloud dashboard. |
| `VITE_SIGNOZ_INGESTION_KEY` | SigNoz Cloud ingestion key. Found under Settings &rarr; Ingestion Settings. |
| `VITE_APP_NAME` | Application identifier used in traces. Default: `lfcrea-frontend`. |
| `VITE_SUPABASE_URL` | Supabase project URL. Found under Settings &rarr; API in your Supabase dashboard. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key. Found under Settings &rarr; API in your Supabase dashboard. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, used by the booking flow. |
| `VITE_MINIO_PUBLIC_URL` | Public base URL of the MinIO instance, used for Instagram thumbnails. No trailing slash. |
| `VITE_MEDIA_URL` | Public base URL of the Cloudflare R2 bucket. No trailing slash. Used by the site for photos. |
| `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Used only by the image scripts below. Never prefix with `VITE_`. |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run process:portfolio` | Generate thumb and full WebP variants for every original in R2 `portfolio/<category>/` and rewrite `portfolio/manifest.json` |
| `npm run upload:dome` | Generate compressed dome tiles from the originals in R2 `domegalleryCollection/` |
| `npm run upload:portfolio` | Older script that builds variants from a local `src/assets/portfolio` folder. Do not run it unless that folder is complete, because it overwrites the manifest. |

All three image scripts skip files that already exist. Add `--force` to regenerate.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/portfolio`, `/portfolio/:category` | Portfolio from the R2 manifest |
| `/booking` | Booking flow |
| `/services/photo`, `/services/video` | Service pages with the particle title |
| `/services/marketing`, `/services/webdesign` | Empty for now |
| `/profile/:slug` | Team profile with the lanyard |

Team and service content is in `src/data/teamData.js` and `src/data/servicesData.js`.

## Adaptive performance

`QualityProvider` picks a starting tier (`high`, `medium`, `low`) from device memory, CPU cores, data saver and reduced motion. It then watches FPS and steps down or up one tier. The tier is set as `data-quality` on the html element, and `src/quality.css` removes blur, large shadows and non-essential animation on lower tiers. Components can read it with `useQualityTier()`.

## Portfolio and media

Portfolio photos are served from Cloudflare R2 through `VITE_MEDIA_URL`. The portfolio page reads `portfolio/manifest.json` and shows 800px thumbnails in the masonry grid and 2000px versions in the lightbox. The original is available from the lightbox.

### Adding photos

1. Upload originals to R2 under `portfolio/<category>/<file>`. A new folder becomes a new category.
2. Run `npm run process:portfolio`. It creates `thumb/` (800px, quality 75) and `full/` (2000px, quality 82) WebP files and rewrites the manifest.

### Dome gallery

The home page dome uses the originals in `domegalleryCollection/` for the enlarged view and small `tiles/` files (320px, quality 30) for the tiles. After uploading new originals, run `npm run upload:dome`, then add the filename to `DOME_FILES` in `src/components/DomeGallery.jsx`. Tile URLs carry a `?v=` query (`TILE_VERSION`) so a stale CDN cache can be bypassed by bumping it.

### Instagram and other Supabase media

The Instagram carousel reads posts from Supabase, and thumbnails are served from MinIO via `VITE_MINIO_PUBLIC_URL`. The `mediaUrl()` helper in `src/lib/mediaUrl.js` passes absolute URLs through and prefixes relative paths with the base URL.

## Deployment & Webhook Setup

This repository includes a webhook server (in the `webhook/` directory) for automatic deployment on your server.

### 1. Setup Webhook Server

1. Navigate to the `webhook` directory on your server.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

4. Generate a secret:

   ```bash
   openssl rand -hex 32
   ```

   Add this secret to your `.env` file as `GITHUB_WEBHOOK_SECRET`.

5. Start the server with PM2:

   ```bash
   pm2 start index.js --name lfcrea-webhook
   pm2 save
   pm2 startup
   ```

### 2. Configure GitHub

1. Go to your GitHub repository **Settings** &rarr; **Webhooks** &rarr; **Add webhook**.
2. **Payload URL**: `https://your-domain.com/webhook` (must be HTTPS via reverse proxy — see security notice in `webhook/index.js`)
3. **Content type**: `application/json`
4. **Secret**: Paste the same secret you generated in step 4.
5. Select **Just the push event**.
6. Click **Add webhook**.

v2

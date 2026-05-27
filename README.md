# lfcrea-frontend

Beta prebuild of LF Creative's home website.

## Tech stack

- React 19
- Vite 8
- Tailwind Merge
- GSAP
- react-aria-components
- Supabase
- Sentry
- OpenTelemetry + SigNoz

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

## Portfolio

The portfolio is a Supabase-backed section displaying photography and videography work. Published items are fetched client-side from the `portfolio_items` table and rendered in a tabbed grid with a lightbox modal. Content is managed via lf-portal, which connects to the same Supabase project.

### Table: `portfolio_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` | Primary key, auto-generated |
| `title` | `TEXT` | Required |
| `category` | `TEXT` | `'photography'` or `'videography'` |
| `thumbnail_url` | `TEXT` | Optional; falls back to a placeholder |
| `media_url` | `TEXT` | Required; full image or video URL |
| `description` | `TEXT` | Optional |
| `client` | `TEXT` | Optional |
| `date` | `DATE` | Optional |
| `published` | `BOOLEAN` | Only published items appear on the site |
| `sort_order` | `INTEGER` | Controls display order within a category |
| `created_at` | `TIMESTAMPTZ` | Auto-set on insert |

### Media storage

Media files are served from a self-hosted MinIO instance that runs as part of the lf-portal infrastructure on the same server. The frontend accesses them via `VITE_MINIO_PUBLIC_URL` (e.g. `https://media.lfcrea.com`).

lf-portal should write either a full absolute URL or a path relative to the MinIO base URL into the `media_url` and `thumbnail_url` columns. The `mediaUrl()` helper in `src/lib/mediaUrl.js` handles both cases — it passes absolute URLs through unchanged and prepends the base URL to relative paths.

### Content management

Connect lf-portal to the same Supabase project (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) to create, edit, and publish portfolio items without touching this repository.

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

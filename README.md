# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## SigNoz Cloud Tracing

This project is configured with OpenTelemetry for frontend tracing via SigNoz Cloud.

### Setup

1.  **Clone the environment variables:**
    ```bash
    cp .env.example .env
    ```

2.  **Configure SigNoz Credentials:**
    Open `.env` and fill in the following values from your SigNoz Cloud dashboard (**Settings** &rarr; **Ingestion Settings**):
    -   `VITE_SIGNOZ_ENDPOINT`: Your SigNoz Cloud OTLP HTTP Endpoint.
    -   `VITE_SIGNOZ_INGESTION_KEY`: Your SigNoz Cloud Ingestion Key.
    -   `VITE_APP_NAME`: Your application's identifier.

### Deployment & Webhook Setup

This repository includes a webhook server (in the `webhook/` directory) for automatic deployment on your server.

#### 1. Setup Webhook Server
1.  Navigate to the `webhook` directory on your server.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    ```bash
    cp .env.example .env
    ```
4.  Generate a secret:
    ```bash
    openssl rand -hex 32
    ```
    Add this secret to your `.env` file as `GITHUB_WEBHOOK_SECRET`.
5.  Start the server with PM2:
    ```bash
    pm2 start index.js --name lfcrea-webhook
    pm2 save
    pm2 startup
    ```

#### 2. Configure GitHub
1.  Go to your GitHub repository **Settings** &rarr; **Webhooks** &rarr; **Add webhook**.
2.  **Payload URL**: `http://your-server-ip:9000/webhook`
3.  **Content type**: `application/json`
4.  **Secret**: Paste the same secret you generated in step 4.
5.  Select **Just the push event**.
6.  Click **Add webhook**.

v2
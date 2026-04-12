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

### Features

The following automatic instrumentations are enabled:
-   **Fetch & XHR**: Captures all outgoing network requests.
-   **User Interaction**: Captures clicks and other user interactions.
-   **Document Load**: Captures page load metrics.

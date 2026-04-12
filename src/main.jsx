import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.jsx'

Sentry.init({
  dsn: "https://314523f056ae19a3d592db545aa457af@o4511195124531200.ingest.us.sentry.io/4511195133050880",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please try again later.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)

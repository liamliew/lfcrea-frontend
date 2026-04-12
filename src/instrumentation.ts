import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const signozEndpoint = import.meta.env.VITE_SIGNOZ_ENDPOINT;
const signozIngestionKey = import.meta.env.VITE_SIGNOZ_INGESTION_KEY;
const appName = import.meta.env.VITE_APP_NAME || 'lfcrea-frontend';

if (signozEndpoint && signozIngestionKey) {
  const exporter = new OTLPTraceExporter({
    url: `${signozEndpoint}/v1/traces`,
    headers: {
      'signoz-ingestion-key': signozIngestionKey,
    },
  });

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: appName,
    }),
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [getWebAutoInstrumentations()],
  });

  console.log(`SigNoz Tracing initialized for ${appName} pointing to ${signozEndpoint}`);
} else {
  console.warn('SigNoz Tracing not initialized. Missing VITE_SIGNOZ_ENDPOINT or VITE_SIGNOZ_INGESTION_KEY');
}

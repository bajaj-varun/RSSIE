import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const elasticApiKey = process.env.ELASTIC_API_KEY;
const otelHeader = process.env.OTEL_EXPORTER_OTLP_HEADERS;

if (otelEndpoint && elasticApiKey) {
    const sdk = new NodeSDK({
        resource: resourceFromAttributes({
            [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'rssie-backend',
        }),
        traceExporter: new OTLPTraceExporter({
            url: `${otelEndpoint}/v1/traces`,
            headers: otelHeader ? undefined : {
                Authorization: `ApiKey ${elasticApiKey}`,
            },
        }),
        instrumentations: [getNodeAutoInstrumentations()],
    });

    try {
        sdk.start();
        console.log('OpenTelemetry initialized and sending traces to:', otelEndpoint);
    } catch (error) {
        console.error('Error starting OpenTelemetry SDK', error);
    }

    process.on('SIGTERM', () => {
        sdk
            .shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error) => console.log('Error terminating tracing', error))
            .finally(() => process.exit(0));
    });
} else {
    console.warn('OpenTelemetry not initialized: OTEL_EXPORTER_OTLP_ENDPOINT or ELASTIC_API_KEY missing');
}

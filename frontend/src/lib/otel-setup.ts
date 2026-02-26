import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const OTEL_ENDPOINT = "https://my-observability-project-d9e884.ingest.asia-southeast1.gcp.elastic.cloud:443";
const OTEL_HEADERS = {
    "Authorization": "ApiKey UFU4LWRKd0JDQzVhTnl5NTNvc186YkJFelFFazFIamdmWXpqUV84VTFpQQ=="
};

export const initOtel = () => {
    if (typeof window === 'undefined') return;

    const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: 'rssie-frontend',
    });

    // --- Tracing ---
    const traceExporter = new OTLPTraceExporter({
        url: `${OTEL_ENDPOINT}/v1/traces`,
        headers: OTEL_HEADERS,
    });

    const tracerProvider = new WebTracerProvider({
        resource: resource,
        spanProcessors: [new BatchSpanProcessor(traceExporter)],
    });

    tracerProvider.register({
        contextManager: new ZoneContextManager(),
    });

    // --- Metrics ---
    const metricExporter = new OTLPMetricExporter({
        url: `${OTEL_ENDPOINT}/v1/metrics`,
        headers: OTEL_HEADERS,
    });

    new MeterProvider({
        resource: resource,
        readers: [
            new PeriodicExportingMetricReader({
                exporter: metricExporter,
                exportIntervalMillis: 60000,
            }),
        ],
    });

    // --- Instrumentations ---
    registerInstrumentations({
        instrumentations: [
            new FetchInstrumentation(),
            new XMLHttpRequestInstrumentation(),
            new DocumentLoadInstrumentation(),
        ],
    });

    console.log("OpenTelemetry Frontend Initialized (Traces & Metrics)");
};

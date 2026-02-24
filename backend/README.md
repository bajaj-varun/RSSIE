# Runway Surface & Safety Intelligence Engine Backend

The backend for **RSSIE (Runway Surface & Safety Intelligence Engine)** acts as the orchestrator for the Decoupled RAG pattern, managing Elastic Cloud Serverless integration and real-time telemetry streaming.

## Core Features
- **Decoupled RAG:** Vector search via Elasticsearch + generation via OpenAI.
- **Real-time Telemetry:** Stream simulated IoT sensor data (Friction & Weather).
- **Elastic Cloud Integration:** Supports Serverless deployment with API Key / Basic Auth.

## Installation
```bash
npm install --legacy-peer-deps
npm run start:dev
```

## API Endpoints

### AI (RAG Orchestration)
- **POST `/ai/chat`**: Query safety manuals with RAG.
  - Body: `{ "query": "What are friction maintenance levels?" }`
  - Returns: Generated insight + source metadata.

### Safety Manuals (Vector Store)
- **GET `/safety-manuals`**: Health check for the safety repository.
- **POST `/safety-manuals/ingest`**: Manually index data into Elasticsearch.
  - Body: `{ "content": "...", "embedding": [...], "metadata": {...} }`
- **GET `/safety-manuals/search`**: Metadata-based search dashboard.

### Telemetry (Sensor Intelligence)
- **GET `/telemetry/friction?runwayId=09L`**: Fetch the latest friction time-series data.
- **GET `/telemetry/weather?icao=KJFK`**: Fetch the latest METAR and weather metrics.

## Background Tasks
- **DataGeneratorService**: Automatically streams simulated sensor logs to Elastic Cloud every 30-60 seconds when enabled in the module.

## Environment Variables
Defined in `.env`:
- `ELASTIC_CLOUD_ID`: Your Elastic Serverless Deployment ID.
- `ELASTIC_API_KEY`: Serverless API Key (prefixed with `essu_`).
- `elastic_cloud_username`: Primary admin username.
- `elastic_cloud_password`: Cluster password.
- `OPENAI_API_KEY`: For generating RAG insights.

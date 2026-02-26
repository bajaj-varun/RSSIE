# RSSIE Frontend: Runway Intelligence Dashboard

A premium, high-impact cockpit for airport operations officers, built with **Next.js 15+** and **Tailwind CSS**.

## Design Philosophy
- **Aviation Dark Theme:** Deep navy backgrounds (`#020617`) with Safety Orange accents.
- **Glassmorphism:** Frosted-glass UI components for a modern, enterprise-grade feel.
- **Real-time Visualization:** Live telemetry charts and pulse animations.

## Getting Started
```bash
npm install
npm run dev
```

## Technical Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS (globals.css)
- **Icons:** Lucide React
- **Charts:** Recharts (Runway Friction visualization)
- **Components:** Headless chat interface & status widgets.

## Page Structure
- **Dashboard (`/`):**
  - **Header:** System status indicators and operator profiles.
  - **Weather Widget:** Real-time METAR data and airport visibility metrics.
  - **Safety Alerts:** High-priority warnings based on sensor thresholds.
  - **Friction Chart:** Interactive AreaChart showing runway Mu-values over time.
  - **Safety Agent (Chat):** Sidebar interface for querying the RAG system.

## Backend Integration
The frontend connects to the RSSIE Backend (default `localhost:3001`):
- Fetches runway metrics from `/telemetry/friction`.
- Fetches weather status from `/telemetry/weather`.
- Sends safety queries to `/ai/chat`.

## Key Components
- `ChatInterface`: Handles the RAG chat flow with the Aviation Safety Officer.
- `RunwayFrictionChart`: Visualizes Mu-value trends against maintenance thresholds.
- `WeatherWidget`: Formats and displays station weather metadata.

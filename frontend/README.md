# Lite Observer Frontend

Web client for Lite Observer: explore OpenTelemetry traces against the Lite Observer API. Trace views are the primary experience today.

![Lite Observer trace explorer UI](../assets/lite-observer-frontend.png)

## Features

- **Trace list** -> Scan recent traces with timing, service context, span count, duration, and status at a glance.
- **Search and filters** -> Narrow the list by free-text search and by outcome (all, success, error, or unset) before opening a trace.
- **Pagination and refresh** -> Move through large result sets in pages and pull the latest data when you need it.
- **Trace detail** -> Open a single trace to see how its spans relate in hierarchy and on a relative timeline.
- **Span inspection** -> Review attributes, resource metadata, status, events, and links in a side panel; copy a span as JSON for debugging.

## Tech stack

- **React 19** and **TypeScript**
- **Vite 8**
- **React Router 7**
- **TanStack Query 5** for data fetching and caching
- **Tailwind CSS 4** for styling
- **Zod** for API-oriented schemas and types
- **Lucide React** for icons

## Setup

The UI is a thin layer over the Lite Observer API. In practice you will run Postgres (or point at an existing database), start the API, and only then point this app at that server so traces can load in the browser.

**Prerequisites**

- **Node.js** 20 or newer.
- **[pnpm](https://pnpm.io)** — the repo includes `pnpm-lock.yaml`; using pnpm keeps installs aligned with the lockfile.
- **Network access to the API** from your machine — the browser will call whatever you put in `VITE_API_URL`, so the Lite Observer server must already be listening there.

> **Note:** The frontend will not work on its own. You need a **database** (Postgres for local development) and the Lite Observer **backend** both configured and running so the API can serve data. For step-by-step instructions—connection string, migrations, server env vars, and how to start the API—see the **[backend README](../backend/README.md)**.

**Run the frontend**

1. **Configure the client** — from `frontend/`, copy the sample environment file and set the API base URL your Vite app should use:

   ```bash
   cp .env.sample .env
   ```

   Edit `.env` and set `VITE_API_URL` (for example `http://localhost:3001`). If the backend checks `CORS_ORIGIN`, it must include the origin where you open the UI (Vite’s default dev server is often `http://localhost:5173`).

2. **Install dependencies** — still in `frontend/`:

   ```bash
   pnpm install
   ```

3. **Start the dev server**:

   ```bash
   pnpm dev
   ```

   You should then get the trace explorer at `http://localhost:5173` (unless Vite prints a different URL).

## Project Structure

```text
src/
  app.tsx                  # active routes
  routes/
    traces.tsx             # trace list
    trace-detail.tsx       # trace detail
  hooks/
    use-traces.ts          # trace queries
  components/traces/
    traces-filter-bar.tsx
    trace-spans-panel.tsx
    spans-interactive-map.tsx
    span-detail-panel.tsx
  lib/api.ts               # fetch helper + query params
  types/api.ts             # types and schemas
```

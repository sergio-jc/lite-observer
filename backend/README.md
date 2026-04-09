# Lite Observer Backend

HTTP API and persistence layer for Lite Observer. It accepts OpenTelemetry-style trace exports, stores span rows in PostgreSQL, and serves query endpoints the web UI and other clients can use. **Trace ingest and trace queries are the parts wired up today**; metrics and logs pipelines exist in the codebase but are not registered on the running server yet.

## Features

- **Trace ingest** -> Accept trace batches over HTTP and normalize them into span records ready for indexing and listing.
- **Trace list API** -> Return traces with summaries (root name, service, span count, timing, status) and support pagination plus optional filters.
- **Trace detail API** -> Return all spans for a given trace id, ordered for timeline and hierarchy views in clients.
- **Retention** -> Periodically purge older rows based on a configurable age window so the database does not grow without bound.
- **Operational basics** -> Structured logging, CORS for browser clients, request rate limiting, and a health endpoint that reflects database connectivity.

## Tech stack

- **Node.js** and **TypeScript**
- **Fastify 5** for the HTTP server
- **Drizzle ORM** and **postgres** (driver) for PostgreSQL access
- **Zod** for runtime validation (env, query strings, ingest payloads)
- **dotenv** for configuration
- **tsx** for development (`pnpm dev` watches `src/index.ts`)

## Setup

This service owns the database connection, schema migrations, and API process. The frontend (or any OTLP-compatible exporter you configure) depends on it being up and reachable.

**Prerequisites**

- **Node.js** 20 or newer.
- **[pnpm](https://pnpm.io)** — the backend declares a `packageManager` and includes `pnpm-lock.yaml`; use pnpm for consistent installs.
- **PostgreSQL** — a reachable instance and a database the app can write to (local Docker is the usual path in this monorepo).

> **Note:** The Lite Observer **frontend** only renders data once this API is running and `DATABASE_URL` points at a live database. For installing dependencies, `VITE_API_URL`, and CORS from the browser’s point of view, see the **[frontend README](../frontend/README.md)**.

**Run the backend**

1. **Start Postgres (local example)** — from the monorepo root, the bundled Compose file starts Postgres on host port `5433`:

   ```bash
   docker compose up -d
   ```

   Default credentials in that compose file match the sample connection string in `backend/.env.sample`.

2. **Configure environment** — from `backend/`, copy the sample file and edit values as needed:

   ```bash
   cp .env.sample .env
   ```

   Important fields:

   - `DATABASE_URL` — PostgreSQL connection string (must match your compose or hosted instance).
   - `PORT` — HTTP port for the API (sample uses `3001`).
   - `CORS_ORIGIN` — origin allowed for browser clients (e.g. `http://localhost:5173` for Vite’s default dev server; the schema default in code is `http://localhost:5173` if unset).
   - `LOG_LEVEL` — `debug` | `info` | `warn` | `error`.
   - `MAX_BODY_SIZE` — maximum JSON body size in bytes for ingest routes.
   - `RETENTION_DAYS` — rows older than this many days are eligible for periodic cleanup.

3. **Install dependencies** — from `backend/`:

   ```bash
   pnpm install
   ```

4. **Run the API** — development with reload:

   ```bash
   pnpm dev
   ```

   On startup the app applies SQL migrations from the `drizzle/` folder, then listens on `PORT` (default in schema is `3000` if not set — align with your `.env`).

## Trace API (overview)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/traces` | Ingest traces. Body shape: `{ "resourceSpans": [ ... ] }` (OpenTelemetry export-style JSON; elements are validated loosely and parsed into span rows). |
| `GET` | `/api/traces` | List traces. Query params: `search` (root span name, `ILIKE`), `status` (`unset` \| `ok` \| `error`), optional `from` / `to` on `startTimeUnixNano`, `limit` (default 25, max 500), `offset`. |
| `GET` | `/api/traces/:traceId` | All spans for one trace, ordered by start time. |

Other routes currently registered include `GET /health`, `GET /api/services`, and `GET /api/summary` (aggregates may include metrics/logs tables even though ingest for those signals is not enabled yet).

## Project structure

```text
src/
  index.ts                 # Fastify app, migrations, retention timer, listen
  env.ts                   # validated environment
  db/
    client.ts              # Postgres + Drizzle client
    schema.ts              # tables (spans, metrics, logs, …)
  routes/
    ingest/
      index.ts             # ingest route registration
      traces.ts            # POST /v1/traces
    query/
      index.ts             # query route registration
      traces.ts            # GET /api/traces, GET /api/traces/:traceId
      health.ts            # GET /health
      services.ts          # GET /api/services
      summary.ts           # GET /api/summary
  parsers/
    traces.ts              # OTLP-ish JSON -> span rows
  validators/
    ingest.ts              # ingest body schemas
    query.ts               # list query schemas + status map
  plugins/
    cors.ts
    rateLimiter.ts
drizzle/                   # generated SQL migrations
```

## Notes and next steps

- Enable **metrics** and **logs** ingest and query plugins when you are ready to expose them (`routes/ingest/index.ts` and `routes/query/index.ts` comment switches today).
- Remove or gate **debug logging** in ingest handlers if you need quieter production logs.
- Point OTLP or bridge tooling at `POST /v1/traces` using the JSON shape your parser expects; adjust `MAX_BODY_SIZE` for large batches.

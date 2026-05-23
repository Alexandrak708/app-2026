# University Research Agent — Implementation Plan (Detailed)

## Purpose

This document specifies a concrete, step-by-step implementation plan for the
University Research Agent pipeline described in `docs/pipeline-plan.md`. It
assumes the pipeline will be implemented as a standalone Node service inside
this repository (folder: `agent/`) so it doesn't introduce server-only
dependencies into the Expo mobile app.

## High-level goals
- Implement a repeatable two-phase agentic pipeline (Discovery → Deep Research)
- Provide safe, auditable tooling for scraping and inserting structured data
- Store results in Supabase while avoiding client keys and respecting security

## Project layout (recommended)

- `agent/`
  - `package.json` (type: module)
  - `.env` (local; not committed)
  - `agent.js` (CLI entry) — parses args, orchestrates phases
  - `loop.js` — generic agentic loop implementation
  - `tools.js` — implement `search`, `fetch_page`, `save_university`
  - `prompts.js` — system prompts and minor prompt helpers
  - `supabase-service.js` — server Supabase client (uses SERVICE_KEY)
  - `firecrawl.js` — light wrapper around Firecrawl calls (rate limiting)
  - `cities/` — cache folder produced by the pipeline
  - `logs/` — run logs and run metadata
  - `README.md` — run instructions for the agent

Files created under `cities/{city-slug}/`:
- `_discovery.json` — raw name+website objects from Phase 1
- `{uni-slug}.json` — extracted data per university (before DB insert)
- `_run_log.json` — iteration counts, errors, skipped universities

## Dependencies

- Server runtime: Node 18+ (LTS)
- Libraries (agent/package.json):
  - `@supabase/supabase-js` (server client)
  - `@mendable/firecrawl-js` (or the Firecrawl JS client available)
  - `@google/generative-ai` (Gemini function-calling client) or HTTP wrapper
  - `dotenv` (env loading)
  - `p-retry` / `p-limit` or simple rate limiter
  - `node-fetch` (if needed)

Keep these in `agent/package.json` so the Expo app dependencies remain unchanged.

## Environment variables

`agent/.env.example`:

```
FIRECRAWL_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
DRY_RUN=true
```

Notes:
- `SUPABASE_SERVICE_KEY` is mandatory for DB inserts. Never commit it.
- Keep a `DRY_RUN` mode for development to avoid accidental inserts.

## Implementation phases and steps

Phase A — Scaffolding (1 day)
- Create `agent/` folder and `package.json` with `type: "module"`.
- Add `.env.example`, `README.md`, and a minimal `agent.js` that prints help.
- Add lint/format scripts optionally.

Phase B — Tools (2–3 days)
- Implement `tools.js` exposing three functions used by the loop:
  - `search(query)` — calls Firecrawl search API, returns top 5–8 results.
  - `fetch_page(url)` — calls Firecrawl or fetches and returns page markdown/text.
  - `save_university(data)` — validates against live Supabase rows and inserts.
- Implement `firecrawl.js` wrapper with retries, exponential backoff, and rate
  limiting (e.g. 1 request/sec default) and optional proxy support.

Phase C — Loop & prompts (2–4 days)
- Implement `loop.js` that:
  - Maintains full history (system + user + model + tool outputs) per iteration.
  - Sends full history to Gemini using function-calling schema.
  - Executes returned tool calls and appends tool responses to history.
  - Enforces iteration caps and the stopping criteria described in
    `docs/pipeline-plan.md`.
- Add `prompts.js` with the discovery and deep-research system prompts.

Phase D — Supabase service (1 day)
- Add `supabase-service.js` that creates a server-side Supabase client using
  `SUPABASE_SERVICE_KEY` and exposes helper functions:
  - `readExamples(table, limit)` — returns sample rows for schema mirroring
  - `insertUniversity(obj)` — deduplicates and inserts, returns result

Phase E — End-to-end testing & dry runs (2–3 days)
- Add `--dry-run` to `agent.js` to run the full pipeline without inserts.
- Create reproducible test cases (one city) and verify output files under
  `cities/{slug}` match expected shapes and `save_university` behavior.

Phase F — Hardening & CI (1–2 days)
- Add a CI job that runs lints, and runs a dry-run against a small, mocked
  Firecrawl/Gemini responses (or recorded fixtures).
- Add runtime logging to `logs/` and rotation/retention policies.

## Data model & validation

- Mirror the `universities` table shape; `save_university` should:
  - Read 3–5 sample rows to detect formatting conventions
  - Normalize fields (trim, lowercase where appropriate)
  - Deduplicate on normalized `name + city`
  - Optionally produce a deterministic UUID for idempotency (but prefer
    Supabase-generated `id`)

## Rate limiting, retries, and costs

- Implement a default rate limit for search/fetch calls.
- Retry transient errors with exponential backoff (max 3 attempts).
- Track and log API usage counts for Gemini and Firecrawl to estimate cost.

## Compliance & ethics

- Honor `robots.txt` and site terms where practicable. Firecrawl may handle
  some of this but log when a site blocks crawling.
- Avoid storing or exposing sensitive data. Keep PII out of logs.

## Monitoring & observability

- Store run metadata in `logs/_runs.json` including date, city, iteration
  counts, and number of universities discovered/inserted.
- Add optional Slack/email alerts for failures or rate-limit exhaustion.

## Quick run examples

From `agent/` after installing deps and creating `.env`:

```bash
node agent.js "Varna" "Bulgaria"          # full run (discovery + research)
node agent.js "Sofia" "Bulgaria" --dry-run
node agent.js "Berlin" "Germany" --discovery-only
```

## Acceptance criteria

- Pipeline creates `cities/{city}/_discovery.json` with at least one entry
- For each discovery row, the deep research produces `{uni-slug}.json` with
  populated `name`, `country`, `city`, `website`, and `description` at minimum
- `save_university` inserts new rows into Supabase when `DRY_RUN=false`

## Risks & mitigation

- Cost: Track and limit API calls; use `DRY_RUN` for development.
- Data quality: Add manual review step or a confidence score before inserts.
- Blocking by websites: Honor robots.txt, fallback to alternative sources.

## Next steps for me (I can implement)

1. Scaffold `agent/` with `package.json`, `.env.example`, `agent.js`.
2. Implement `supabase-service.js` and a minimal `save_university` stub.
3. Implement loop + tools with dry-run capability.

---

Place this file at `docs/implementation-plan.md` and review for any changes.

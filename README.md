# Country Explorer

A Next.js country explorer widget that loads live country data from the [REST Countries](https://restcountries.com/) API and presents capital, region, currencies, population, and time zones in a searchable dropdown UI.

## Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**

## Features

- Server-side REST Countries integration (API key never exposed to the browser)
- Parallel paginated fetch with field trimming and 24-hour caching
- Safe-mode gate to prevent accidental quota usage during development
- Custom searchable country dropdown with keyboard navigation
- Country details panel matching the product design (capital, region, currencies, population, time zones)

## Getting started

### Prerequisites

- Node.js 20+
- A REST Countries API key ([sign up](https://restcountries.com/sign-up))

### Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
RESTCOUNTRIES_API_KEY=your_api_key_here
SAFE_MODE=false
```

| Variable | Description |
| --- | --- |
| `RESTCOUNTRIES_API_KEY` | Server-only key. Do **not** prefix with `NEXT_PUBLIC_`. |
| `SAFE_MODE` | When `true` (default if unset), live upstream calls are blocked. Set to `false` to enable real API requests. |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

## Architecture

```
Browser                    Next.js server                 REST Countries
───────                    ──────────────                 ──────────────
CountryWidget
  └─ GET /api/countries →  getCountries()
                              ├─ SAFE_MODE? → 403 message (no upstream call)
                              └─ fetchAllCountriesFromRestCountries()
                                   └─ parallel paginated GETs ──────────→ v5 API
```

| Layer | Responsibility |
| --- | --- |
| `app/api/countries/route.ts` | HTTP boundary for the client; returns normalized JSON |
| `lib/countries/get-countries.ts` | Safe-mode check + orchestration |
| `lib/countries/fetch-all.ts` | Upstream fetch, timeouts, errors, pagination |
| `lib/countries/normalize.ts` | Map REST Countries v5 payloads → app `Country` type |
| `lib/countries/format.ts` | Display formatting for the details panel |
| `lib/countries/filter.ts` | Client-side search matching |
| `components/country-explorer/*` | UI: explorer shell, widget, select, details |

The browser only talks to **`/api/countries`**. The REST Countries key stays on the server.

## API fetch strategy

REST Countries v5 (free plan) returns at most **100** countries per request, while the full dataset is roughly **250** entries. A complete list therefore needs about **three** page requests (`offset` 0 / 100 / 200).

This project optimizes that flow in several ways:

1. **Parallel pages** — the three pages are requested with `Promise.all`, so wall-clock time is roughly one round-trip instead of three sequential waits. Quota usage is unchanged (~3 calls per cold refresh).
2. **Trimmed fields** — requests use `response_fields` so only widget-relevant data is transferred (names, codes, flags, capital, region, currencies, population, time zones).
3. **Normalization** — incomplete records (e.g. missing ISO alpha-2 codes) are dropped; results are sorted A–Z by common name.
4. **Timeouts & errors** — each upstream call uses a hard timeout; `401` / `403` / `429` and network failures are mapped to clear API responses.
5. **No per-keystroke upstream search** — after the list is loaded once, filtering happens entirely in the client (see below).

A single full list load is preferred over “lean list + detail-on-select” for this UI: selection stays instant, and cached refreshes stay within a free-tier monthly quota when revalidation is respected.

### Endpoint

`GET /api/countries`

**Success**

```json
{
  "source": "restcountries",
  "count": 250,
  "countries": [ /* normalized Country objects */ ]
}
```

**Safe mode / errors**

```json
{
  "code": "SAFE_MODE",
  "error": "Live API calls are blocked because SAFE_MODE is enabled. …",
  "status": 403
}
```

The route is `force-dynamic` so `next build` does not call the live API at build time.

## Caching

Caching is applied at two levels:

| Layer | Behavior |
| --- | --- |
| **Upstream `fetch`** | Each REST Countries page request uses `next: { revalidate: 86400 }` (24 hours) and a shared `countries` tag. Cold loads hit the provider; warm loads reuse Next’s Data Cache. |
| **HTTP response** | Successful `/api/countries` responses send `Cache-Control: private, max-age=60, stale-while-revalidate=3600`. Error / safe-mode responses use `no-store`. |

Together, this keeps free-plan usage low: a typical day may consume only a handful of upstream requests after the first warm cache, not one full pagination cycle per page view.

## Search & dropdown

The country control is a custom dropdown (not a native `<select>`):

- Opens with a search field and a scrollable list of flags + names
- Filters **in memory** against the already-fetched list (name, native name, and ISO code)
- Supports keyboard navigation: `↑` / `↓`, `Enter`, `Escape`
- Selecting a country updates the details panel with formatted fields

No additional API calls are made while typing.

## Project structure

```
src/
  app/
    api/countries/route.ts    # GET /api/countries
    page.tsx                  # Home page
    layout.tsx
    globals.css
  components/country-explorer/
    CountryExplorer.tsx
    CountryWidget.tsx
    CountrySelect.tsx
    CountryDetails.tsx
  lib/countries/
    fetch-all.ts
    get-countries.ts
    normalize.ts
    format.ts
    filter.ts
    safe-mode.ts
  types/country.ts
```

## Security notes

- Store secrets only in `.env` (gitignored). `.env.example` documents names without real values.
- Never expose the REST Countries key via `NEXT_PUBLIC_*` or client-side fetches to `api.restcountries.com`.
- Keep `SAFE_MODE=true` until you intentionally need live data.

## License

Private assignment project.

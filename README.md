# Walmart → SHV Load Builder

Fetches open Walmart freight tenders, sanitizes them per SHV Logistics' business rules, and pushes the valid ones into the SHV TMS system of record — built for the Runbook take-home case.

## What it does

1. **Fetch Loads** — pulls all open tenders from the Walmart Freight Tender API.
2. Each tender is sanitized client-side against SHV's rules and classified `Ready` or `Manual review`.
3. Select some or all of the `Ready` loads via checkboxes (manual-review rows can't be selected — they have no valid `equipment_type`/`weight` to push).
4. **Sanitize & Push** — re-sanitizes the selection and POSTs it to the SHV SOR API in one batched call, then shows a per-row Accepted/Rejected/Skipped result plus a summary banner.

## Business rules implemented

| SHV field | Walmart field | Rule |
|---|---|---|
| `load_number` | `load_no` | copy, trimmed |
| `bol_number` | `frt_ord_no` | copy, trimmed |
| `shipper_name` | `shipper_nm` | copy, trimmed |
| `origin_city` / `origin_state` | `orig_city` / `orig_st` | copy, trimmed |
| `destination_city` / `destination_state` | `dest_city` / `dest_st` | copy, trimmed |
| `ship_date` / `delivery_date` | `shp_dt` / `del_dt` | `MMDDYYYY` → `DDMMYYYY` digit rearrangement |
| `weight` | `wgt` | strip `lbs`/commas/whitespace, parse to a whole-pound JSON number |
| `equipment_type` | `mode` | keyword match (case-insensitive): `AMBIENT`→`Dry Van 53'`, `REFRIGERATED`/`FREEZER`→`Reefer 53'`, `FRESH`/unrecognized → manual review |

Per the case instructions, the video's 45,000 lb weight-limit exception is **not** implemented — all fetched records are sanitized and eligible for push regardless of weight.

A record is flagged for **manual review** (excluded from push) if: the mode can't be mapped, the weight is missing/unparseable, a required string field is blank, or a date isn't a clean 8-digit string. These mirror SHV's own "all fields required" validation so the UI can explain a failure before the API would reject it.

## Architecture

```
src/
  lib/
    config.ts          Hardcoded candidate email + API base URLs
    types.ts             Shared data models
    api-error.ts          ApiError + Retry-After parsing
    walmart-client.ts    Fetches tenders from the Walmart API
    shv-client.ts          Pushes to SHV, batches ≤50 per the API's batch limit
    sanitize.ts             Pure field-mapping/validation logic (no fetch/React deps)
  app/
    api/fetch-loads/route.ts       GET — proxies + sanitizes the Walmart fetch
    api/sanitize-push/route.ts     POST — re-fetches, re-sanitizes, pushes the selected loads
    page.tsx              Client UI: two buttons, checkboxes, summary, table
  components/
    Logos.tsx, LoadsTable.tsx, SummaryBanner.tsx
```

Both API calls are proxied through server routes so the bearer-token email never has to round-trip through client-side `fetch` calls to third-party origins (avoids CORS and keeps request/response handling in one place for error/rate-limit parsing).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on Vercel with auto-deploy on push to `main`.

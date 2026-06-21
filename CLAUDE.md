# Croatian Parliament (Sabor) Voting Tracker — Project Brief

> Handoff doc for Claude Code. Read this first, then start at **Milestone 0**.
> **Code & comments in English. UI strings in Croatian (HR).**

---

## 1. Goal

A static, searchable one-pager listing votes (glasanja) in the Croatian Parliament (Hrvatski sabor).

Core user-facing features (MVP):
- List of votes, newest first.
- Search / filter by **proposal title**, **date / year**, and **proposer (predlagatelj)**.
- Per-vote view showing: proposal, proposer, overall result (za / protiv / suzdržan), and a **breakdown by parliamentary club (klub)**.
- Example query the UI must serve well: *"give me everything from 2025"*.

Non-goals for MVP (revisit later): amendment-level votes, committee (radno tijelo) votes, speech transcripts, per-MP roll-call UI (data may be fetched, but UI can start at club level).

---

## 2. Tech decisions (assumed — change if preferred)

- **Stack:** vanilla single-page `index.html` (HTML + JS + CSS), no framework. Matches the FastTrack pattern.
- **Data strategy:** **build-time snapshot**, NOT live API calls from the browser.
  - A Node script pulls from the data source, writes JSON into `/data`, and commits it.
  - The page reads local JSON only → no runtime API dependency, no CORS issues, $0 hosting.
- **Hosting:** GitHub Pages.
- **Sync:** GitHub Actions cron regenerates `/data` and auto-commits on change. Each commit is also a historical snapshot of Sabor state on that date.
- **Fetch script language:** Node (`.mjs`). Switch to Python if preferred.

---

## 3. Data source

### Primary: Parladata API (Parlametar)
- Parlametar.hr (Gong + *Danes je nov dan*) runs on a 3-part architecture: **Parladata** (raw data + REST API) → Parlalize (analytics) → Parlametar (frontend).
- All code is open source, **CC0 / public domain**: https://github.com/danesjenovdan
- Parladata already has acts, votes, roll-call votes, clubs, and MPs **structured** — i.e. someone already did the Sabor scraping + normalization. We just consume the API.

### ⚠️ Open dependency — resolve in Milestone 0
The exact **Parladata API base URL for the Croatian (HR) instance** is not yet confirmed. Do not guess/fabricate endpoints. Confirm it first by:
- inspecting network requests on https://10.parlametar.hr (current 10th convocation) — the frontend calls the API directly,
- and/or checking the `danesjenovdan` GitHub repos for the HR deployment config / API docs.
- Verify auth model (likely public GET, no key) and CORS.

### Fallback: scrape sabor.hr directly
Only if Parladata proves unusable.
- Votes live in `edoc.sabor.hr` (INFODOK / e-Doc) and on individual act pages under sabor.hr `dnevni-red`. This means HTML scraping.
- **The official sabor.hr "Otvoreni podaci" CSV bulk does NOT contain votes** — only budget + (stale, up to 9th convocation, last updated 2021) lists of MPs/clubs/parties. Useful only as reference lookups, not for votes.

---

## 4. Data model (minimal)

Normalize to these shapes. Field names are a starting point — adjust to whatever Parladata actually returns (capture the real shape in Milestone 0).

```jsonc
// act / proposal
{
  "act_id": "string",
  "title": "string",
  "proposer_type": "vlada | klub | radno_tijelo | zastupnik(ci) | ostalo_tijelo",
  "proposer_name": "string",   // raw label, e.g. "Klub zastupnika SDP-a"
  "reading": "string|null"     // e.g. "prvo čitanje", "drugo čitanje"
}

// vote (one ballot on one act)
{
  "vote_id": "string",
  "act_id": "string",
  "date": "YYYY-MM-DD",
  "result": "prihvaceno | odbijeno",
  "tally": { "za": 0, "protiv": 0, "suzdrzani": 0 },
  "by_club": [ { "club": "string", "za": 0, "protiv": 0, "suzdrzani": 0 } ],
  "by_mp": [ { "mp": "string", "club": "string", "vote": "za|protiv|suzdrzan|odsutan" } ] // optional for MVP UI
}
```

### Important modelling notes
- **Split proposer into two fields** (`proposer_type` enum + `proposer_name` raw string). The enum drives the most useful filter: *Government proposals vs opposition proposals*. Legislative initiative belongs to only 4 types per Ustav čl. 85: Vlada, klub zastupnika, radno tijelo, zastupnik(ci). Reports/other acts can have additional submitters (pravobranitelj, DORH, agencije…) → bucket those as `ostalo_tijelo`.
- **Club ≠ party, and clubs change over a convocation.** To group by party/opposition you need a club→party(+government/opposition) mapping for the given convocation. Build this as a small editable lookup file (`data/clubs_map.json`); do not hardcode.
- A "X zastupnika" proposer is a different set of people each time — treat as `zastupnik(ci)`, don't try to identify individuals for MVP.

### Known data gaps (out of scope, document only)
- Amendment-level votes are not published separately by Sabor.
- Committee (radno tijelo) votes/attendance are not in open machine-readable form.

---

## 5. Repo structure

```
sabor-glasanja/
├─ README.md
├─ CLAUDE.md                 # this file
├─ index.html                # one-pager (HR UI): search/filter + club breakdown
├─ scripts/
│  └─ fetch.mjs              # pulls from Parladata → writes /data
├─ data/
│  ├─ clubs_map.json         # editable club → party / gov-opp lookup
│  ├─ sample.json            # Milestone 0 output (one session)
│  └─ 2025.json              # later: chunked by year (or by session)
└─ .github/workflows/
   └─ refresh.yml            # cron: run fetch.mjs, auto-commit on diff
```

---

## 6. Build / sync (GitHub Actions)

- Workflow: `schedule` (e.g. weekly) + `workflow_dispatch` for manual runs.
- Steps: checkout → setup-node → `node scripts/fetch.mjs` → commit & push `/data` only if changed.
- Keep `fetch.mjs` idempotent and incremental where possible (don't refetch the whole history every run once it works).

---

## 7. UI requirements

- **Language: Croatian.** All labels, buttons, table headers, empty/error states in HR. Keep code/identifiers English.
- Light/dark theme optional (nice-to-have, FastTrack already has the pattern).
- MVP layout: a search bar + filters (year/proposer/text) on top, a results table below; clicking a row expands the per-club breakdown.
- No browser storage APIs needed for MVP (all data is in the shipped JSON).

---

## 8. Milestones

### Milestone 0 — tiny sample (do this first)
1. Confirm the Parladata HR API base URL + auth + CORS (see §3).
2. `fetch.mjs`: pull **one session / a handful of votes**, write `data/sample.json`.
3. Capture the **real field shapes** returned, and reconcile against the model in §4 (update the model if needed).
4. Minimal `index.html` that just renders `sample.json` as a table (no styling needed yet).
✅ Done when: one real session renders in the browser from a committed JSON snapshot.

### Milestone 1 — framework
- Generalize `fetch.mjs` to a full year (2025), chunk output, add `clubs_map.json`.
- Build the real HR UI: search + filters + club breakdown.
- Wire up GitHub Actions refresh + GitHub Pages.

### Milestone 2 — polish / scale (only if needed)
- If JSON grows unwieldy: chunk per session, or prebuild a SQLite file read in-browser via `sql.js` / DuckDB-wasm to enable real SQL filtering ("everything from 2025 proposed by the Government") with no backend.

---

## 9. First action for Claude Code
Start at **Milestone 0, step 1**: confirm the Parladata HR API endpoint. Report the base URL, a sample request, and the raw response shape before writing the rest of `fetch.mjs`.

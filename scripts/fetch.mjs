// Fetches vote data from data.parlametar.hr and writes per-year JSON into /data.
//
// Usage:  node scripts/fetch.mjs [year ...]
//         node scripts/fetch.mjs            -> defaults to current + previous year
//         node scripts/fetch.mjs 2025 2026
//
// Strategy: the /votes/ list is chronological by id (oldest first) and each stub
// carries an accurate `timestamp` plus the `name` (with the predlagatelj suffix).
// We page all stubs, keep the ones whose year we want, then fetch one card per
// vote for the per-club / per-MP breakdown.

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const API = 'https://data.parlametar.hr/v3';
const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, '..', 'data');

const PAGE_SIZE = 500;      // stub listing page size (smaller = faster per request)
const CONCURRENCY = 5;      // parallel card fetches (gentle to avoid throttling)
const REQ_TIMEOUT = 30000;  // per-request timeout (ms)
const REQ_RETRIES = 3;      // retries per request before giving up
const CHECKPOINT_EVERY = 25; // flush partial year files this often

// Years to fetch: CLI args, or default to current + previous year.
const now = new Date();
const YEARS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [String(now.getFullYear()), String(now.getFullYear() - 1)];

async function get(url) {
  let lastErr;
  for (let attempt = 1; attempt <= REQ_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQ_TIMEOUT);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 * attempt)); // backoff
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`${lastErr?.message || 'failed'}: ${url}`);
}

function parseProposer(name) {
  // Name field format: "Title text - predlagatelj(ica): Proposer Name"
  const match = (name || '').match(/[-–]\s*predlagatelj(?:ica)?:\s*(.+)$/i);
  if (!match) return { proposer_type: 'ostalo', proposer_name: null };

  const raw = match[1].trim();
  let type;
  const lower = raw.toLowerCase();

  if (lower.includes('vlada')) type = 'vlada';
  else if (lower.includes('klub zastupnika')) type = 'klub';
  else if (lower.includes('odbor') || lower.includes('radno tijelo')) type = 'radno_tijelo';
  else if (lower.includes('zastupni')) type = 'zastupnici';
  else type = 'ostalo';

  return { proposer_type: type, proposer_name: raw };
}

function normalizeVote(card, stub) {
  const r = card.results || {};
  const { proposer_type, proposer_name } = parseProposer(stub.name);

  // Find proposer color from groups if proposer is a club.
  let proposer_color = null;
  if (proposer_type === 'klub' && proposer_name) {
    const pLower = proposer_name.toLowerCase();
    const match = r.groups?.find(g =>
      g.group?.name?.toLowerCase().includes(pLower.replace('klub zastupnika ', '').split(' ')[0])
    );
    if (match) proposer_color = match.group.color;
  }

  const by_club = (r.groups || [])
    .filter(g => g.group)
    .map(g => ({
      club: g.group.acronym || g.group.name,
      club_name: g.group.name,
      club_slug: g.group.slug,
      club_color: g.group.color,
      is_coalition: g.group.is_in_coalition,
      za: g.votes.for ?? 0,
      protiv: g.votes.against ?? 0,
      suzdrzani: g.votes.abstain ?? 0,
      odsutni: (g.votes.absent ?? 0) + (g.votes['did not vote'] ?? 0),
    }))
    .sort((a, b) => (b.is_coalition ? 1 : 0) - (a.is_coalition ? 1 : 0));

  const by_mp = (r.members || [])
    .filter(m => m.person)
    .map(m => ({
      mp_name: m.person.name,
      mp_slug: m.person.slug,
      club: m.person.group?.acronym || m.person.group?.name || null,
      club_slug: m.person.group?.slug || null,
      club_color: m.person.group?.color || null,
      vote: m.option,
    }));

  const av = r.all_votes || {};

  // Prefer the stub timestamp (actual vote moment) for the date.
  const date = (stub.timestamp || r.session?.start_time || '').slice(0, 10);

  // Fall back to the stub `result` boolean if the card lacks a verdict.
  const passed = r.result?.passed ?? stub.result ?? null;

  return {
    vote_id: String(stub.id),
    date,
    session: r.session?.name ?? '',
    title: (r.title || stub.name || '').replace(/\s*[-–]\s*predlagatelj(?:ica)?:.*$/i, '').trim(),
    summary: null,
    proposer_type,
    proposer_name,
    proposer_color,
    result: passed === true ? 'prihvaceno' : passed === false ? 'odbijeno' : 'nepoznato',
    tally: {
      za: av.for ?? stub.results?.for ?? 0,
      protiv: av.against ?? stub.results?.against ?? 0,
      suzdrzani: av.abstain ?? stub.results?.abstain ?? 0,
      odsutni: (av.absent ?? stub.results?.absent ?? 0) + (av['did not vote'] ?? stub.results?.['did not vote'] ?? 0),
    },
    by_club,
    by_mp,
  };
}

// The vote list is chronological (id/date ascending), so the requested years
// sit at the tail. We page backwards from the end and stop once we cross below
// the oldest wanted year — only a handful of listing requests, throttle-friendly.
async function listStubs(years) {
  const wanted = new Set(years);
  const minYear = years.reduce((a, b) => (a < b ? a : b));
  const first = await get(`${API}/votes/?format=json&limit=1`);
  const total = first.count;
  console.log(`Total votes in API: ${total}. Scanning tail for years: ${years.join(', ')}…`);

  const stubs = [];
  for (let offset = Math.max(0, total - PAGE_SIZE); offset >= 0; offset -= PAGE_SIZE) {
    const d = await get(`${API}/votes/?format=json&limit=${PAGE_SIZE}&offset=${offset}`);
    let pageHasOlder = false;
    for (const v of d.results) {
      const y = (v.timestamp || '').slice(0, 4);
      if (wanted.has(y)) stubs.push(v);
      if (y && y < minYear) pageHasOlder = true;
    }
    console.log(`  scanned offset ${offset} (have ${stubs.length} matches)`);
    // Once a page dips below the oldest wanted year, everything earlier is older too.
    if (pageHasOlder) break;
    if (offset === 0) break;
  }
  return stubs;
}

// Load already-fetched votes from existing year files (for resuming).
function loadExisting(years) {
  const byId = new Map();
  for (const y of years) {
    const f = join(DATA_DIR, `${y}.json`);
    if (existsSync(f)) {
      try {
        for (const v of JSON.parse(readFileSync(f, 'utf-8'))) byId.set(v.vote_id, v);
      } catch { /* ignore corrupt partial */ }
    }
  }
  return byId;
}

// Write per-year files + manifest from the current vote map. Called repeatedly.
function flush(byId) {
  const byYear = {};
  for (const v of byId.values()) (byYear[v.date.slice(0, 4)] ||= []).push(v);

  const manifest = [];
  for (const y of Object.keys(byYear)) {
    const list = byYear[y].sort((a, b) => b.date.localeCompare(a.date) || Number(b.vote_id) - Number(a.vote_id));
    writeFileSync(join(DATA_DIR, `${y}.json`), JSON.stringify(list, null, 2), 'utf-8');
    manifest.push({ year: y, count: list.length });
  }
  manifest.sort((a, b) => b.year.localeCompare(a.year));
  writeFileSync(join(DATA_DIR, 'index.json'),
    JSON.stringify({ years: manifest, generated_at: new Date().toISOString() }, null, 2), 'utf-8');
  return manifest;
}

async function main() {
  const stubs = await listStubs(YEARS);

  // Resume: skip votes already fetched in existing year files.
  const byId = loadExisting(YEARS);
  const todo = stubs.filter(s => !byId.has(String(s.id)));
  console.log(`Matched ${stubs.length} votes (${byId.size} already cached, ${todo.length} to fetch). Concurrency ${CONCURRENCY}.`);

  let done = 0;
  let next = 0;

  async function worker() {
    while (next < todo.length) {
      const stub = todo[next++];
      const date = (stub.timestamp || '').slice(0, 10);
      try {
        const card = await get(`${API}/cards/vote/single/?id=${stub.id}&date=${date}`);
        const v = normalizeVote(card, stub);
        byId.set(v.vote_id, v);
      } catch (e) {
        console.error(`  ✗ ${stub.id}: ${e.message}`);
      }
      done++;
      if (done % CHECKPOINT_EVERY === 0) {
        flush(byId);
        console.log(`  …${done}/${todo.length} (checkpoint saved)`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const manifest = flush(byId);
  for (const m of manifest) console.log(`  → data/${m.year}.json (${m.count} votes)`);
  console.log(`  → data/index.json`);
  console.log(`\nDone. ${byId.size} votes across ${manifest.length} year file(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });

// Generates plain-language Croatian ELI5 summaries for votes that don't have one
// yet, and writes them into the `summary` field of the per-year data files.
//
// Usage:  ANTHROPIC_API_KEY=sk-ant-... node scripts/summarize.mjs [year ...]
//         node scripts/summarize.mjs 2026        -> only that year
//         node scripts/summarize.mjs             -> every data/<year>.json
//
// Optional env:
//   MODEL   model id (default claude-opus-4-8; use claude-haiku-4-5 to cut cost)
//   LIMIT   max number of votes to summarize this run (default: all missing)
//
// Incremental: only votes with summary === null are sent to the API, so it's
// safe to re-run and to interrupt. Each summary is grounded in the proposal
// title + proposer (Parladata exposes no abstract text for these votes).

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL || 'claude-opus-4-8';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, '..', 'data');

if (!API_KEY) {
  console.error('Set ANTHROPIC_API_KEY in the environment first.');
  process.exit(1);
}

const SYSTEM = `Ti si pomoćnik koji objašnjava prijedloge zakona i odluka Hrvatskoga sabora običnim građanima.
Za zadani naslov prijedloga i predlagatelja napiši kratak sažetak na hrvatskom jeziku (ELI5 stil):
- 1-2 rečenice, jednostavnim jezikom, bez pravničkog žargona.
- Objasni što zakon/odluka uređuje i koga se tiče.
- Oslanjaj se na naslov; NEMOJ izmišljati konkretne brojke ili odredbe kojih nema u naslovu.
- Vrati SAMO tekst sažetka, bez uvoda poput "Ovaj prijedlog..." i bez navodnika.`;

async function summarize(vote) {
  const proposer = vote.proposer_name ? `\nPredlagatelj: ${vote.proposer_name}` : '';
  const body = {
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Naslov: ${vote.title}${proposer}` }],
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!text) throw new Error('empty summary');
  return text;
}

async function main() {
  const years = process.argv.slice(2).length
    ? process.argv.slice(2).map(y => `${y}.json`)
    : readdirSync(DATA_DIR).filter(f => /^\d{4}\.json$/.test(f));

  let done = 0;
  for (const file of years) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) { console.warn(`skip (missing): ${file}`); continue; }

    const votes = JSON.parse(readFileSync(path, 'utf-8'));
    const missing = votes
      .filter(v => v.summary == null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(`${file}: ${missing.length} votes need a summary`);

    for (const vote of missing) {
      if (done >= LIMIT) break;
      try {
        vote.summary = await summarize(vote);
        done++;
        writeFileSync(path, JSON.stringify(votes, null, 2), 'utf-8'); // checkpoint each
        console.log(`  ✓ ${vote.vote_id}: ${vote.summary.slice(0, 70)}…`);
      } catch (e) {
        console.error(`  ✗ ${vote.vote_id}: ${e.message}`);
      }
    }
    if (done >= LIMIT) break;
  }

  console.log(`\nDone. Summarized ${done} vote(s) with ${MODEL}.`);
}

main().catch(e => { console.error(e); process.exit(1); });

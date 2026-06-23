// Fetches the Sabor's annual per-MP work-expenses XLS and writes
// data/expenses_<year>.json, keyed by mp_slug (matched by name to the vote data).
//
// RUN MANUALLY, once a year, when the Sabor publishes a new annual report — this is
// NOT part of the weekly refresh (the source updates annually, and parsing .xls needs
// a dependency we don't otherwise ship). Requires SheetJS:
//
//     npm i xlsx        # one-off, in this folder
//     node scripts/fetch-expenses.mjs
//
// For a new year: update YEAR / XLS_URL / SOURCE / PERIOD below (find the file URL on
// the Sabor "Javnost rada → Pregled troškova rada zastupnika" page).

import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dir, '..', 'data');

const YEAR = '2025';
const XLS_URL = 'https://www.sabor.hr/sites/default/files/Zastupnici_statistike/TRO%C5%A0KOVI%2011.%20SAZIVA%20PO%20OSOBAMA%2001.01.2025.-29.12.2025.xls';
const SOURCE = 'https://www.sabor.hr/hr/press/javnost-rada/pregled-troskova-rada-zastupnika-u-razdoblju-od-1-sijecnja-do-29-prosinca-2025';
const PERIOD = '01.01.2025. – 29.12.2025.';

// Name normalisation: drop diacritics, lowercase, split on space/hyphen, sort tokens.
// Reconciles "SURNAME NAME" (expenses) vs "Name Surname" (votes) and multi-word names.
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/đ/g, 'd')
  .split(/[\s-]+/).filter(Boolean).sort().join(' ');
const ALIAS = { 'anka mrak taritis': 'anka mrak taritas' };   // source typo: Taritiš -> Taritaš

const COLS = ['dnevnica', 'auto', 'cestarina', 'avion', 'javni', 'hotel', 'stanarina', 'rezije', 'odvzivot', 'sluzstan', 'ostalo'];
const num = x => typeof x === 'number' ? Math.round(x * 100) / 100 : 0;

// MP name -> slug, from the committed vote data (this year + next, to cover turnover).
function loadMpKeys() {
  const byKey = new Map();
  for (const y of [YEAR, String(Number(YEAR) + 1)]) {
    let votes;
    try { votes = JSON.parse(readFileSync(join(DATA, `${y}.json`), 'utf8')); } catch { continue; }
    for (const v of votes) for (const m of (v.by_mp || [])) if (m.mp_slug) byKey.set(norm(m.mp_name), m.mp_slug);
  }
  return byKey;
}

async function main() {
  const byKey = loadMpKeys();
  const buf = Buffer.from(await (await fetch(XLS_URL)).arrayBuffer());
  const wb = XLSX.read(buf, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
  const hi = rows.findIndex(r => Array.isArray(r) && r.includes('Prezime i ime'));

  const by_mp = {};
  let matched = 0;
  const miss = [];
  for (const r of rows.slice(hi + 1)) {
    if (!r[1] || !String(r[1]).trim()) continue;
    const raw = String(r[1]).trim().replace(/\s+do\s+\d.*$/i, '').trim();   // drop former-member "do <date>" suffix
    let key = norm(raw);
    key = ALIAS[key] || key;
    const slug = byKey.get(key);
    if (!slug) { miss.push(String(r[1]).trim()); continue; }
    const breakdown = {};
    COLS.forEach((c, i) => breakdown[c] = num(r[4 + i]));
    by_mp[slug] = { ukupno: num(r[3]), breakdown };
    matched++;
  }

  writeFileSync(join(DATA, `expenses_${YEAR}.json`),
    JSON.stringify({ year: YEAR, period: PERIOD, source: SOURCE, by_mp }, null, 2), 'utf8');
  console.log(`matched ${matched} MPs → data/expenses_${YEAR}.json`);
  if (miss.length) console.log(`unmatched (footnote rows / source typos, expected few): ${JSON.stringify(miss.map(s => s.slice(0, 40)))}`);
}

main().catch(e => { console.error(e); process.exit(1); });

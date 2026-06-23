// Scrapes official Sabor MP pages → data/mp_info.json (keyed by mp_slug).
// Fields: photo, party (stranka), electoral unit (izborna), mandate start, committees (odbori).
// (Bio free-text / birth / gender live on a separate "životopis" page and are NOT scraped.)
//
// RUN MANUALLY — bios are near-static, and this is dependency-free (node fetch + regex),
// so it's kept out of the weekly refresh.
//   node scripts/fetch-mp-info.mjs           # full run, writes data/mp_info.json
//   node scripts/fetch-mp-info.mjs 15        # sample N (no write) — to check the URL hit rate

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dir, '..', 'data');
const BASE = 'https://www.sabor.hr';
const SAMPLE = Number(process.argv[2]) || 0;

const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const clean = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// "Jasenka Auguštan-Pentek" -> "augustan-pentek-jasenka-11-saziv"  (surname(s) first)
function saborSlug(name) {
  const toks = name.trim().split(/\s+/);
  const reordered = toks.slice(1).join(' ') + ' ' + toks[0];
  return strip(reordered).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-11-saziv';
}

// Manual overrides where the Sabor slug differs from the derived one (duplicate-name
// "-0" suffix; last-token surname; or a fuller surname on the Sabor than in our data).
const ALIAS = {
  'Ante Babić': 'babic-ante-11-saziv-0',
  'Sanda Livia Maduna': 'maduna-sanda-livia-11-saziv',
  'Boška Ban': 'ban-vlahek-boska-11-saziv',
};

const blockAfter = (html, label) => {
  const m = html.match(new RegExp('<h3>\\s*' + label + '\\s*:?\\s*</h3>([\\s\\S]{0,6000}?)(?:<h3|<h2)', 'i'));
  return m ? m[1] : '';
};
const linksIn = b => [...b.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(a => clean(a[1])).filter(Boolean);

function parse(html) {
  const photo = (html.match(/<img src="(\/sites\/default\/files\/uploads[^"]+)"/) || [])[1] || null;
  const mandat = (clean(blockAfter(html, 'Početak obnašanja zastupničkog mandata')).match(/\d{2}\.\d{2}\.\d{4}\./) || [])[0] || null;
  return {
    photo: photo ? BASE + photo : null,
    stranka: linksIn(blockAfter(html, 'Stranačka pripadnost'))[0] || null,
    izborna: linksIn(blockAfter(html, 'Izborna jedinica'))[0] || null,
    mandat,
    odbori: linksIn(blockAfter(html, 'Dužnosti u saboru')),
  };
}

function loadMps() {
  const seen = new Map();
  for (const y of ['2025', '2026']) {
    let votes; try { votes = JSON.parse(readFileSync(join(DATA, `${y}.json`), 'utf8')); } catch { continue; }
    for (const v of votes) for (const m of (v.by_mp || [])) if (m.mp_slug) seen.set(m.mp_slug, m.mp_name);
  }
  return [...seen].map(([slug, name]) => ({ slug, name }));
}

async function main() {
  let mps = loadMps();
  if (SAMPLE) mps = mps.slice(0, SAMPLE);
  const by_mp = {};
  const miss = [];
  for (const { slug, name } of mps) {
    const url = `${BASE}/hr/zastupnici/${ALIAS[name] || saborSlug(name)}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) { miss.push(`${name} -> ${saborSlug(name)} (${res.status})`); continue; }
      by_mp[slug] = { ...parse(await res.text()), source: url };
    } catch (e) { miss.push(`${name} (${e.message})`); }
    await new Promise(r => setTimeout(r, 250));
  }
  if (!SAMPLE) {
    writeFileSync(join(DATA, 'mp_info.json'),
      JSON.stringify({ scraped: new Date().toISOString().slice(0, 10), by_mp }, null, 2), 'utf8');
  }
  console.log(`matched ${Object.keys(by_mp).length} / ${mps.length} · misses ${miss.length}`);
  if (miss.length) console.log('MISSES:', JSON.stringify(miss, null, 1));
  if (SAMPLE) console.log('SAMPLE:', JSON.stringify(Object.values(by_mp).slice(0, 2), null, 1));
}
main().catch(e => { console.error(e); process.exit(1); });

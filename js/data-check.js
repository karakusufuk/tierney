// /data-check/ — hidden page that proves the demo data never leaves a visitor with an empty result.
import { JOBS, CERTS, IMPLIES, SECTORS, SHIFTS, COUNTIES, county, fit, filtered, groups, expand, sectorCount } from './data.js';
import { esc } from './site.js';

const $ = id => document.getElementById(id);
const docs = Object.keys(CERTS);

// seeded random so the 30 combinations are the same on every load (change with ?seed=)
let seed = +(new URLSearchParams(location.search).get('seed') || 2026) || 2026;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];

// 1. every job
$('jobs').innerHTML = JOBS.map(j => `<tr><td>${j.id}</td><td>${esc(j.title)}</td><td>${j.sector}</td><td>${j.type}</td><td>${county(j)}</td><td>${j.req.length ? j.req.join(', ') : '—'}</td><td>${j.home === undefined ? '—' : j.home ? 'yes' : 'no'}</td></tr>`).join('');
$('n').textContent = JOBS.length;

// 2. sector counts
$('sectors').innerHTML = ['haulage', 'warehouse', 'factory'].map(s => `<tr><td>${s}</td><td>${sectorCount(s)}</td></tr>`).join('');

// 3. results for every single document, then 30 random combinations of documents and filters
const run = (have, st) => { const { list, relaxed } = filtered(st); const g = groups(list, have); return { ok: g.ok.length, near: g.near.length, relaxed, listed: list.length }; };
const label = st => [st.sector !== 'all' && SECTORS.find(s => s[0] === st.sector)[1], st.shift !== 'any' && SHIFTS.find(s => s[0] === st.shift)[1], st.county !== 'any' && st.county, st.home && 'Home every night'].filter(Boolean).join(' · ') || 'no filters';
const rows = [];
let bad = 0;
const add = (what, have, st) => {
  const r = run(have, st);
  const fail = r.near === 0 || (r.ok === 0 && r.near === 0);
  if (fail) bad++;
  rows.push(`<tr class="${fail ? 'bad' : ''}"><td>${what}</td><td>${have.map(h => CERTS[h]).join(', ') || '—'}</td><td>${label(st)}</td><td>${r.ok}</td><td>${r.near}</td><td>${r.relaxed ? 'relaxed ' + r.relaxed : ''}</td></tr>`);
};
const none = { sector: 'all', shift: 'any', county: 'any', home: false };
docs.forEach(d => add('single', [d], none));
for (let i = 1; i <= 30; i++) {
  const n = 1 + Math.floor(rnd() * 3);
  const have = [...new Set(Array.from({ length: n }, () => pick(docs)))];
  const st = { sector: pick(SECTORS)[0], shift: pick(SHIFTS)[0], county: pick(COUNTIES)[0], home: rnd() < .3 };
  add('random ' + i, have, st);
}
$('combos').innerHTML = rows.join('');
$('verdict').textContent = bad ? `${bad} combination(s) FAIL: an empty group.` : `All ${rows.length} combinations pass: "You can apply" and "One cert away" are never both empty, and "One cert away" is never empty.`;
$('verdict').className = bad ? 'bad' : 'good';

// 4. licence hierarchy
const covers = Object.entries(IMPLIES).map(([k, v]) => `<tr><td>${CERTS[k]}</td><td>${v.map(x => CERTS[x]).join(', ')}</td></tr>`).join('');
$('implies').innerHTML = covers;
const ceHave = ['CE', 'CPC', 'TACHO'];
const lower = JOBS.filter(j => j.req.some(r => ['C', 'C1', 'B'].includes(r)));
$('hier').innerHTML = lower.map(j => `<tr><td>${j.id}</td><td>${esc(j.title)}</td><td>${j.req.join(', ')}</td><td>${fit(j, ceHave) === 'ok' ? 'You can apply' : fit(j, ceHave) === 'near' ? 'One cert away' : 'further away'}</td></tr>`).join('');
$('hierNote').textContent = `Holding ${ceHave.map(h => CERTS[h]).join(', ')} covers ${[...expand(ceHave)].join(', ')}. ${lower.filter(j => fit(j, ceHave) === 'ok').length} of ${lower.length} jobs that ask for a lower licence are "You can apply"; the rest also need a document outside the licence family (${lower.filter(j => fit(j, ceHave) !== 'ok').map(j => j.id + ': ' + j.req.filter(r => !expand(ceHave).has(r)).join('+')).join(', ')}).`;

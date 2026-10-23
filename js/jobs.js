// Find a job: filters drawer (left), For you drawer (right), never-empty results.
import { JOBS, CERTS, SECTORS, SHIFTS, COUNTIES, DONE, NEXT, implied, filtered, groups } from './data.js';
import { store, qs, dropdown, drawers, row, X, esc } from './site.js';

const $ = id => document.getElementById(id);
const sec = qs('sector');
const st = { sector: SECTORS.some(s => s[0] === sec) ? sec : 'all', shift: 'any', county: 'any', home: false,
  held: store.get('have', []), done: store.get('done', null), next: store.get('next', null) };

// ---------- filters drawer ----------
const ddSector = dropdown($('ddSector'), { options: SECTORS, value: st.sector, labelledBy: 'lblSector', onChange: v => { st.sector = v; render(); } });
const ddShift = dropdown($('ddShift'), { options: SHIFTS, value: st.shift, labelledBy: 'lblShift', onChange: v => { st.shift = v; render(); } });
const ddCounty = dropdown($('ddCounty'), { options: COUNTIES, value: st.county, labelledBy: 'lblCounty', onChange: v => { st.county = v; render(); } });
$('fHome').onchange = e => { st.home = e.target.checked; render(); };

// ---------- For you drawer ----------
const ddHold = dropdown($('ddHold'), { options: Object.entries(CERTS), value: null, placeholder: 'Choose a licence or ticket', labelledBy: 'lblHold' });
$('addHold').onclick = () => { const v = ddHold.value; if (v && !st.held.includes(v)) { st.held.push(v); paintHeld(); } ddHold.value = null; };
function paintHeld() {
  $('held').innerHTML = st.held.map(h => `<li>${esc(CERTS[h])}<button type="button" data-h="${h}" aria-label="Remove ${esc(CERTS[h])}">${X}</button></li>`).join('');
}
$('held').onclick = e => { const b = e.target.closest('button'); if (b) { st.held = st.held.filter(x => x !== b.dataset.h); paintHeld(); } };
dropdown($('ddDone'), { options: DONE.map(d => [d[0], d[1]]), value: st.done, placeholder: 'Choose your last job', labelledBy: 'lblDone', onChange: v => { st.done = v; } });
dropdown($('ddNext'), { options: NEXT.map(n => [n[0], n[1]]), value: st.next, placeholder: 'Choose what you want next', labelledBy: 'lblNext', onChange: v => { st.next = v; $('otherBox').hidden = v !== 'other'; if (v === 'other') $('other').focus(); } });
$('otherBox').hidden = st.next !== 'other';
$('other').oninput = e => {
  const q = e.target.value.trim().toLowerCase();
  if (q.length < 3) { $('suggest').innerHTML = ''; return; }
  const hit = JOBS.find(j => j.title.toLowerCase().includes(q)) || JOBS.find(j => j.title.toLowerCase().split(/[ ,]+/).some(w => w.startsWith(q.slice(0, 4))));
  $('suggest').innerHTML = hit ? `Did you mean <button type="button" data-id="${hit.id}">${esc(hit.title)}</button>?` : "No close match yet. We'll still show you the nearest roles.";
};
$('suggest').onclick = e => { const b = e.target.closest('button'); if (b) location.href = '/job/?id=' + b.dataset.id; };

const dr = drawers({ scrim: $('scrim'), panels: { f: $('filters'), y: $('foryou') }, onOpen: which => { if (which === 'y') paintHeld(); } });
$('openFilters').onclick = () => dr.open('f');
$('openForYou').onclick = () => dr.open('y');
$('showMine').onclick = () => {
  const n = NEXT.find(x => x[0] === st.next);
  if (n && n[2]) { st.sector = n[2]; ddSector.value = n[2]; }
  store.set('have', implied(st.held, st.done)); store.set('done', st.done); store.set('next', st.next);
  dr.close(); render();
};

// ---------- results ----------
function render() {
  let { list, relaxed } = filtered(st);
  const n = NEXT.find(x => x[0] === st.next);
  if (n && n[3]) list = [...list.filter(j => n[3].test(j.title)), ...list.filter(j => !n[3].test(j.title))];
  const have = store.get('have', []);
  const act = [];
  if (st.sector !== 'all') act.push(['sector', 'all', SECTORS.find(s => s[0] === st.sector)[1]]);
  if (st.shift !== 'any') act.push(['shift', 'any', SHIFTS.find(s => s[0] === st.shift)[1]]);
  if (st.county !== 'any') act.push(['county', 'any', st.county]);
  if (st.home) act.push(['home', false, 'Home every night']);
  const fc = act.length; $('fcount').hidden = !fc; $('fcount').textContent = fc;
  $('openFilters').setAttribute('aria-label', fc ? `Filters, ${fc} active` : 'Filters');
  have.forEach(h => act.push(['have', h, CERTS[h]]));
  $('active').innerHTML = act.map(([, , l], i) => `<button type="button" class="chip" data-i="${i}" aria-label="Remove ${esc(l)}">${esc(l)}${X}</button>`).join('');
  $('active').onclick = e => {
    const b = e.target.closest('button'); if (!b) return; const [k, v] = act[+b.dataset.i];
    if (k === 'have') { store.set('have', have.filter(x => x !== v)); st.held = st.held.filter(x => x !== v); }
    else { st[k] = v; const dd = { sector: ddSector, shift: ddShift, county: ddCounty }[k]; if (dd) dd.value = v; if (k === 'home') $('fHome').checked = false; }
    render();
  };
  let html = relaxed ? `<div class="note">No exact matches, so we relaxed <b>${relaxed}</b>. These are the closest.</div>` : '';
  if (have.length) {
    const { ok, near } = groups(list, have);
    html += `<div class="group-title"><span class="fit ok" style="margin:0">You can apply</span> ${ok.length} ${ok.length === 1 ? 'job' : 'jobs'}</div>`;
    html += ok.length ? `<ul class="rows">${ok.map(j => row(j, have)).join('')}</ul>` : `<div class="note">Nothing you can apply for here yet. The jobs below are one certificate away.</div>`;
    html += `<div class="group-title"><span class="fit near" style="margin:0">One cert away</span> ${near.length} ${near.length === 1 ? 'job' : 'jobs'}</div><ul class="rows">${near.map(j => row(j, have)).join('')}</ul>`;
    $('count').textContent = `${ok.length} you can apply for · ${near.length} one cert away`;
  } else {
    html += `<ul class="rows">${list.map(j => row(j)).join('')}</ul>`;
    $('count').textContent = `${list.length} ${list.length === 1 ? 'job' : 'jobs'}`;
  }
  $('results').innerHTML = html;
}
render();

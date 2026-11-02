// Hire staff: the checked, anonymous candidate pool with sector chips, and the "Work with us" form (its Request a call
// stays faded and inactive: nothing is sent and no message appears).
import { POOL } from './data.js';
import { esc } from './site.js';

const F = [['all', 'All'], ['drivers', 'Drivers'], ['warehouse', 'Warehouse'], ['factory', 'Factory']];
let cur = 'all';
const f = document.getElementById('f');
function render() {
  f.innerHTML = F.map(([v, l]) => `<button type="button" class="chip" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('');
  document.getElementById('pool').innerHTML = POOL.filter(p => cur === 'all' || p[1] === cur).map(([ref, , t, area, tags, av]) =>
    `<article class="cand"><div class="cand-h"><span>REF ${ref}</span><span>CHECKED</span></div><div class="cand-b"><h3>${esc(t)}</h3><p>${esc(area)}</p><div class="tags" aria-label="Documents">${tags.map(x => `<span>${esc(x)}</span>`).join('')}</div><span class="avail">${esc(av)}</span></div></article>`).join('');
}
f.onclick = e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.v; render(); f.querySelector(`[data-v="${cur}"]`).focus(); };
document.getElementById('tf').onsubmit = e => e.preventDefault();
render();

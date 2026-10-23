// Become a driver: tick what you have, see the steps left, time and cost; funding chat opens the concept modal.
import { modal, esc } from './site.js';

const $ = id => document.getElementById(id);
// weeks and euro ranges are rough guides for a learner in Ireland
const STEPS = [
  { k: 'B', t: 'Full car licence (Category B)', d: 'You need this before you can start on a truck licence.', w: [0, 0], c: [0, 0], have: 'Full car licence' },
  { k: 'MED', t: 'Medical report', d: 'A doctor completes the D501 medical report form for a truck licence.', w: [1, 1], c: [60, 100], have: 'Medical report' },
  { k: 'THEORY', t: 'Driver theory test, truck', d: 'Computer-based test on the Rules of the Road, hazards and safe driving.', w: [2, 3], c: [45, 45], have: 'Truck theory test' },
  { k: 'PERMIT', t: 'Learner permit, Category C', d: 'You must be at least 21. A full licence holder in the same category sits beside you.', w: [1, 2], c: [35, 35], have: 'C learner permit' },
  { k: 'LESSONS', t: 'Lessons with an RSA Approved Driving Instructor', d: 'Most learners take 6 to 10 lessons in a truck.', w: [2, 6], c: [600, 1200], have: 'Lessons done' },
  { k: 'TEST', t: 'Driving test, Category C', d: 'About 100 minutes, with reversing, braking checks and a road drive.', w: [4, 10], c: [110, 160], have: 'C driving test passed' },
  { k: 'CPC', t: 'Driver CPC', d: 'CPC theory test (case studies) and the CPC practical test. Needed to drive for a living.', w: [2, 4], c: [200, 300], have: 'Driver CPC' },
  { k: 'CE', t: 'Category CE: learner permit, lessons and test', d: 'Once you hold Category C, you can add a trailer and drive an articulated truck.', w: [6, 12], c: [900, 1500], have: 'CE in progress', ceOnly: true }
];
let target = 'C', have = new Set();
const list = () => STEPS.filter(s => target === 'CE' || !s.ceOnly);
function chips() {
  $('have').innerHTML = list().map(s => `<button type="button" class="chip" data-k="${s.k}" aria-pressed="${have.has(s.k)}">${esc(s.have)}</button>`).join('');
}
$('have').onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k; have.has(k) ? have.delete(k) : have.add(k); render(); b.focus(); const nb = $('have').querySelector(`[data-k="${k}"]`); nb && nb.focus(); };
$('target').onclick = e => { const b = e.target.closest('button'); if (!b) return; target = b.dataset.v; [...$('target').children].forEach(x => x.setAttribute('aria-pressed', x === b)); render(); };
const euro = n => '€' + n.toLocaleString('en-IE');
function render() {
  chips();
  const steps = list(), left = steps.filter(s => !have.has(s.k));
  const w = left.reduce((a, s) => [a[0] + s.w[0], a[1] + s.w[1]], [0, 0]), c = left.reduce((a, s) => [a[0] + s.c[0], a[1] + s.c[1]], [0, 0]);
  $('left').textContent = left.length;
  $('time').textContent = left.length ? `${w[0]}–${w[1]} weeks` : 'Done';
  $('cost').textContent = left.length ? `${euro(c[0])}–${euro(c[1])}` : '€0';
  let nextMarked = false;
  $('steps').innerHTML = steps.map(s => {
    const done = have.has(s.k), next = !done && !nextMarked; if (next) nextMarked = true;
    const time = s.w[1] ? (s.w[0] === s.w[1] ? `${s.w[0]} week${s.w[0] > 1 ? 's' : ''}` : `${s.w[0]}–${s.w[1]} weeks`) : 'Before you start';
    const cost = s.c[1] ? (s.c[0] === s.c[1] ? `about ${euro(s.c[0])}` : `${euro(s.c[0])}–${euro(s.c[1])}`) : '—';
    return `<li class="${done ? 'done' : next ? 'next' : ''}"${next ? ' aria-current="step"' : ''}><span class="num" aria-hidden="true"></span><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div><span class="t"><small>Time</small>${time}</span><span class="c"><small>Cost</small>${cost}</span></li>`;
  }).join('');
}
$('fund').onclick = () => modal('Funding chat', 'In the live site this books a call with a Tierney consultant, who checks you meet the age and licence rules and explains the repayment terms in writing. This is a concept site, so nothing is sent.');
render();

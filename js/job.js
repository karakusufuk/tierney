// Job page: facts, a day in this job, what you need, about, the sticky side card and similar jobs.
import { JOBS, CERTS, DRIVING, byId, missing } from './data.js';
import { store, qs, words, row, fitBadge, ICONS, ARROW, esc } from './site.js';

const j = byId(qs('id')) || JOBS[0];
document.title = j.title + ' · Tierney';
const have = store.get('have', []), miss = missing(j, have);
const unit = j.year ? ' /yr' : ' /hr';
const isDriver = j.sector === 'haulage' && j.type !== 'office';
const facts = [
  ['Pay', j.pay + unit], ['Shift', j.shift],
  isDriver ? ['Home every night', j.home ? 'Yes' : 'No, nights out'] : ['Start time', j.start],
  isDriver ? ['Vehicle', j.vehicle] : ['Sector', j.sector[0].toUpperCase() + j.sector.slice(1)],
  ['Area', j.where]
];
// times of day from the job's start time
const t = (h, m) => { let [H, M] = j.start.split(':').map(Number); M += h * 60 + m; H = (H + Math.floor(M / 60)) % 24; M %= 60; return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0'); };
const DAY = {
  haulage: [[0, 0, 'Walk-round check', 'Tyres, lights, load straps and the tachograph card in.'], [0, 30, 'Loading at the depot', 'Paperwork checked and the route confirmed.'], [2, 0, 'First drop', 'Unload with the customer and get signatures.'], [4, 30, 'Break', '45 minutes, as the tachograph rules require.'], [8, 30, j.home ? 'Back at the depot and home' : 'Last drop, night in the cab', j.home ? 'Vehicle parked, defects reported, done for the day.' : 'Sleeper cab, overnight allowance paid.']],
  warehouse: [[0, 0, 'Briefing', 'Pick rates and priorities for the shift.'], [0, 15, 'Pre-use truck check', 'Forks, mast, brakes and horn checked and logged.'], [2, 30, 'Picking and putaway', 'Scanner or voice-directed, aisle by aisle.'], [4, 0, 'Break', '30 minutes in the canteen.'], [8, 0, 'Hand-over', 'Stock counted and the next shift briefed.']],
  factory: [[0, 0, 'Line start-up', 'PPE on, hygiene checks, machine set-up.'], [0, 30, 'Production run', 'Packing, labelling and quality checks.'], [3, 0, 'Break', '30 minutes.'], [3, 30, 'Changeover', 'New product, line cleaned between runs.'], [8, 0, 'Line clean-down', 'Records signed and handed over.']],
  office: [[0, 0, 'Morning check-in', 'Overnight loads and driver hours reviewed.'], [1, 0, 'Planning', 'Routes, trailers and drivers matched for tomorrow.'], [4, 0, 'Lunch', '45 minutes.'], [5, 0, 'Customer calls', 'Delivery slots and any delays sorted.'], [8, 30, 'Finish', 'Plan published for the morning team.']]
}[j.type === 'office' ? 'office' : j.sector];
const need = j.req.length ? j.req.map(r => {
  const ok = !miss.includes(r);
  const tail = ok && have.length ? '<span class="have">You have this</span>' : (!ok && DRIVING.includes(r) ? '<a class="miss" href="/become-a-driver/">How to get it</a>' : (!ok ? '<span class="miss">We can arrange training</span>' : ''));
  return `<li><span>${esc(CERTS[r])}</span>${tail}</li>`;
}).join('') : '<li><span>No certificates needed. Experience in logistics helps.</span></li>';
const similar = JOBS.filter(x => x.sector === j.sector && x.id !== j.id).slice(0, 3);
const who = j.placed ? `${esc(j.employer)} · we've placed ${j.placed} people here` : esc(j.employer);
const root = document.getElementById('job');
root.innerHTML = `
  <a class="back" href="/jobs/">${ARROW}All jobs</a>
  <div class="jh"><span class="icon">${ICONS[j.sector]}</span><div><h1 class="words">${esc(j.title)}</h1><p>${who}</p></div></div>
  <div class="facts">${facts.map(([k, v]) => `<div class="fact reveal"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
  <div class="jgrid">
    <div>
      <section aria-labelledby="dayH"><h2 id="dayH">A day in this job</h2><ol class="day">${DAY.map(([h, m, b, s]) => `<li><time>${t(h, m)}</time><i aria-hidden="true"></i><div><b>${esc(b)}</b><span>${esc(s)}</span></div></li>`).join('')}</ol></section>
      <section class="sec" aria-labelledby="needH"><h2 id="needH">What you need</h2><ul class="need">${need}</ul></section>
      <section class="sec about" aria-labelledby="aboutH"><h2 id="aboutH">About the job</h2>
        <p>${j.employer === 'Confidential client' ? 'A well-known Irish distribution business that prefers not to be named until interview.' : esc(j.employer) + ' is a long-standing Tierney client.'} The role is permanent after a 13-week assignment, with paid overtime after 39 hours.</p>
        <p>You'll get a full induction, PPE provided and a named Tierney consultant who calls you in your first week to check everything is as promised.</p>
      </section>
    </div>
    <aside class="side" aria-label="Apply">
      <span class="p">${j.pay}<em>${unit}</em></span>
      <span class="s">${esc(j.shift)} · ${esc(j.where)}</span>
      ${fitBadge(j, have)}
      <a class="btn" href="/apply/?id=${j.id}">Apply in 20 seconds</a>
      <span class="s" style="font-size:14px">No CV needed.</span>
    </aside>
  </div>
  <section class="sec similar" aria-labelledby="simH"><h2 id="simH">Similar jobs</h2><ul class="rows">${similar.map(x => row(x, have.length ? have : null)).join('')}</ul></section>`;
words(root);

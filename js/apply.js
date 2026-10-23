// Apply in 20 seconds, and the standalone "Send us your CV" page (/apply/?cv). Nothing is ever sent.
import { JOBS, byId } from './data.js';
import { qs, words, modal, ARROW, esc } from './site.js';

const app = document.getElementById('app');
const cvOnly = new URLSearchParams(location.search).has('cv');
const j = byId(qs('id')) || (cvOnly ? null : JOBS[0]);
const driver = j && j.sector === 'haulage' && j.type !== 'office';
const answers = {};
const seg = (name, opts, multi) => `<div class="seg" role="group" data-q="${name}">${opts.map(o => `<button type="button" class="chip" aria-pressed="false" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
const cvBox = title => `<div class="cvbox"><b>${title}</b><span class="muted">PDF or Word, up to 5 MB. It goes straight to your consultant.</span>
  <label class="file">Choose a file<input type="file" id="cv" accept=".pdf,.doc,.docx"></label><span id="cvName" class="muted" aria-live="polite"></span></div>`;
function bindCv() {
  const i = document.getElementById('cv'); if (!i) return;
  i.onchange = () => { document.getElementById('cvName').textContent = i.files[0] ? i.files[0].name + ' added.' : ''; };
}

if (cvOnly) {
  app.innerHTML = `<div class="page-head"><h1 class="words">Send us your CV</h1><p>No CV is needed to apply for a job. If you'd like us to keep yours on file for roles that aren't advertised yet, add it here.</p></div>
    <div class="done">${cvBox('Your CV')}<div class="two"><div class="field"><label for="n">Name</label><input class="input" id="n" autocomplete="name"></div><div class="field"><label for="p">Phone</label><input class="input" id="p" type="tel" autocomplete="tel"></div></div><button type="button" class="btn" id="sendCv" style="justify-self:start">Send</button></div>`;
  words(app); bindCv();
  document.getElementById('sendCv').onclick = () => modal('CV received', 'In the live site your CV goes to a consultant, who calls you within one working day. This is a concept site, so nothing was sent.');
} else {
  app.innerHTML = `<div class="page-head"><h1 class="words">Apply in 20 seconds</h1><p>${esc(j.title)} · ${esc(j.where)}. No CV, no account. A consultant calls you back.</p></div>
    <form class="form" id="f" novalidate>
      ${driver ? `<div class="q"><span class="label" id="qLic">Which licence do you hold?</span>${seg('licence', ['Category B', 'C1', 'C', 'CE'])}</div>
      <div class="q"><span class="label" id="qCpc">Do you have a Driver CPC card?</span>${seg('cpc', ['Yes', 'No'])}</div>`
      : `<div class="q"><span class="label" id="qTix">Which of these do you hold?</span>${seg('tickets', ['Counterbalance forklift', 'Reach truck', 'Manual handling', 'HACCP', 'None yet'], true)}</div>`}
      <div class="q"><span class="label" id="qRtw">Do you have the right to work in Ireland?</span>${seg('rtw', ['Yes', 'No'])}</div>
      <div id="gentle" aria-live="polite"></div>
      <div class="two"><div class="field"><label for="n">Name</label><input class="input" id="n" autocomplete="name" required></div><div class="field"><label for="p">Phone</label><input class="input" id="p" type="tel" autocomplete="tel" required></div></div>
      <button class="btn" type="submit">Send application ${ARROW}</button>
      <span class="timer" id="msg" aria-live="polite"></span>
    </form>`;
  words(app);
  // the segmented groups take their names from their question
  app.querySelectorAll('.q').forEach(q => { const l = q.querySelector('.label'), g = q.querySelector('.seg'); if (l && g) g.setAttribute('aria-labelledby', l.id); });
  app.querySelectorAll('.seg').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const q = s.dataset.q;
    if (q === 'tickets') { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); answers[q] = [...s.querySelectorAll('[aria-pressed="true"]')].map(x => x.dataset.v); }
    else { s.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); answers[q] = b.dataset.v; }
    if (q === 'rtw') document.getElementById('gentle').innerHTML = answers.rtw === 'No'
      ? `<div class="gentle">Thanks for being upfront. We can only place people who already have the right to work in Ireland, so we can't take this application forward. <b>If that changes, we'd love to hear from you.</b></div>` : '';
  }));
  document.getElementById('f').addEventListener('submit', e => {
    e.preventDefault();
    const msg = document.getElementById('msg');
    if (answers.rtw === 'No') { msg.textContent = 'We can only place people with the right to work in Ireland.'; return; }
    if (!answers.rtw || !document.getElementById('n').value.trim() || !document.getElementById('p').value.trim()) { msg.textContent = 'Please answer the right-to-work question and add your name and phone number.'; return; }
    app.innerHTML = `<div class="page-head"><h1 class="words">You're in. We'll call you.</h1></div>
      <div class="done"><p style="font-size:19px">Your application for <b>${esc(j.title)}</b> is with your consultant. Expect a call within one working day, usually the same afternoon.</p>
      ${cvBox('Have a CV? Add it here.')}
      <a class="link" href="/candidate/">Track your application ${ARROW}</a></div>`;
    words(app); bindCv();
    app.querySelector('h1').setAttribute('tabindex', '-1'); app.querySelector('h1').focus({ preventScroll: true });
  });
}

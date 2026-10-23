// Candidate panel: demo sign-in with a toast, then two applications, documents and "The one thing to do".
import { CANDIDATE, byId } from './data.js';
import { words, modal, toast, ICONS, ARROW, esc } from './site.js';

const main = document.getElementById('main');
function login() {
  main.innerHTML = `<form class="login" id="lf" novalidate>
    <h1 class="words">Sign in</h1>
    <div class="field"><label for="em">Email or phone</label><input class="input" id="em" value="${CANDIDATE.email}" autocomplete="username"></div>
    <div class="field"><label for="pw">Password</label><input class="input" id="pw" type="password" value="${CANDIDATE.password}" autocomplete="current-password"></div>
    <button class="btn" type="submit">Sign in</button>
    <button class="forgot" type="button" id="fg">Forgot password?</button>
  </form>`;
  words(main);
  document.getElementById('fg').onclick = () => modal('Reset by text message', 'In the live site we text a one-time code to your phone, so you never need to remember a password. This is a concept site, so no message is sent.');
  const tt = setTimeout(() => toast(`Demo account: your temporary password <b>${CANDIDATE.password}</b> is already filled in.`, 6000), 600);
  document.getElementById('lf').onsubmit = e => { e.preventDefault(); clearTimeout(tt); document.querySelectorAll('.toast').forEach(t => t.remove()); dash(); };
}
const STAGES = CANDIDATE.stages;
const stages = n => `<ol class="stages" aria-label="Progress: ${STAGES[n]}"><span class="sbar" style="width:${n * 20}%" aria-hidden="true"></span>${STAGES.map((s, i) => `<li class="${i < n ? 'done' : i === n ? 'now' : ''}"${i === n ? ' aria-current="step"' : ''}><i aria-hidden="true"></i>${s}</li>`).join('')}</ol>`;
function dash() {
  const apps = CANDIDATE.applications.map(a => ({ ...a, job: byId(a.job) }));
  main.innerHTML = `<div class="page-head"><h1 class="words">Your applications</h1><p class="reveal">Two applications in progress and one message from your consultant.</p></div>
    <div class="dash">
      <div>
        ${apps.map(a => `<article class="app reveal"><div class="app-top"><span class="icon">${ICONS[a.job.sector]}</span><div><h3>${esc(a.job.title)}</h3><p>${esc(a.job.employer)} · ${esc(a.job.where)}</p></div></div>${stages(a.stage)}</article>`).join('')}
        <div class="docs reveal"><h3>Your documents</h3>
          ${CANDIDATE.documents.map(([d, v, warn]) => `<div class="doc"><span>${esc(d)}</span><span${warn ? ' class="warn"' : ''}>${esc(v)}</span></div>`).join('')}
        </div>
      </div>
      <aside class="one reveal" aria-labelledby="oneH">
        <h2 id="oneH">The one thing to do</h2>
        <p>Book your interview with O'Rourke Logistics. Thursday 10:00 or Friday 14:30 at Ballycoolin.</p>
        <button type="button" class="btn" id="book">Book Thursday 10:00</button>
        <button type="button" class="link" id="other" style="background:none;border:0;padding:0;cursor:pointer">Other times ${ARROW}</button>
      </aside>
    </div>`;
  words(main);
  main.querySelector('h1').setAttribute('tabindex', '-1'); main.querySelector('h1').focus({ preventScroll: true });
  document.getElementById('book').onclick = () => modal('Interview booked', 'In the live site this confirms the slot with the employer and texts you the address and what to bring. This is a concept site, so nothing was booked.');
  document.getElementById('other').onclick = () => modal('Other times', 'Your consultant offers three more slots this week. This is a concept site, so the calendar is not connected.');
}
login();

// Employer panel: demo sign-in, then the company heading, the big "+ New job ad", the CPC alert, candidates, open jobs and the consultant card.
import { EMPLOYER, byId } from './data.js';
import { words, modal, esc } from './site.js';

const main = document.getElementById('main');
function login() {
  main.innerHTML = `<form class="login" id="lf" novalidate>
    <h1 class="words">Employer sign in</h1>
    <div class="field"><label for="em">Work email</label><input class="input" id="em" value="${EMPLOYER.email}" autocomplete="username"></div>
    <div class="field"><label for="pw">Password</label><input class="input" id="pw" type="password" value="${EMPLOYER.password}" autocomplete="current-password"></div>
    <button class="btn dark" type="submit">Sign in</button>
  </form>`;
  words(main);
  document.getElementById('lf').onsubmit = e => { e.preventDefault(); panel(); };
}
function panel() {
  const c = EMPLOYER.consultant;
  main.innerHTML = `
    <div class="page-head top2"><div><h1 class="words">${esc(EMPLOYER.name)}</h1><p class="reveal">${EMPLOYER.stats}</p></div>
      <button type="button" class="new" id="newJob"><span aria-hidden="true">+</span>New job ad</button></div>
    <div class="alert reveal" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg><span><b>2 drivers on your sites have a Driver CPC expiring within 60 days.</b> We've already reminded them and booked their training.</span><button type="button" class="see" id="see">See who</button></div>
    <div class="panel">
      <div>
        <h2 class="sub">Candidates for you</h2>
        <div class="tbl reveal" role="table" aria-label="Candidates for you">${EMPLOYER.candidates.map(([r, t, j, d, s, hot]) => `<div class="ap" role="row"><span class="ref" role="cell">REF ${r}</span><div role="cell"><b>${esc(t)}</b><div class="muted for">for ${esc(j)}</div></div><div class="apdocs" role="cell">${d.map(x => `<span>${esc(x)}</span>`).join('')}</div><span class="stg${hot ? ' hot' : ''}" role="cell">${esc(s)}</span></div>`).join('')}</div>
        <h2 class="sub" style="margin-top:36px">Your open jobs</h2>
        <div class="jobs2 reveal">
          ${EMPLOYER.openJobs.map(([id, n]) => `<a href="/job/?id=${id}">${esc(byId(id).title)} <span>${n}</span></a>`).join('')}
        </div>
      </div>
      <aside class="consult reveal" aria-label="Your consultant">
        <div class="who"><span class="av" aria-hidden="true">${c.initials}</span><div><h3>${esc(c.name)}</h3><p>${esc(c.since)}</p></div></div>
        <span class="line">${c.phone}</span>
        <span class="mail">${c.email}</span>
        <p>Need someone for tomorrow? Call before 3 pm and we'll confirm a driver the same day.</p>
      </aside>
    </div>`;
  words(main);
  main.querySelector('h1').setAttribute('tabindex', '-1'); main.querySelector('h1').focus({ preventScroll: true });
  document.getElementById('newJob').onclick = () => modal('New job ad', 'In the live site a short form asks for the role, shift, pay and start date. Your consultant checks it and it goes live the same day. This is a concept site, so nothing is posted.');
  document.getElementById('see').onclick = () => modal('CPC expiries', 'TR-2207 expires 5 Dec 2026 and TR-2311 expires 19 Dec 2026. Both have training booked for November. Names are shown in the live panel.');
}
login();

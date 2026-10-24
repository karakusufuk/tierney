// Tierney — shared behaviour: store, word-by-word headings, dropdown, drawers, toast, concept modal, job rows.
import { CERTS, fit } from './data.js';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
export const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
export const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
export const ICONS = {
  haulage: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 8.5h15v13H3z"/><path d="M18 12.5h5.5l4.5 5v4H18z"/><circle cx="9" cy="23.5" r="2.6" fill="#DCFF1C"/><circle cx="23" cy="23.5" r="2.6" fill="#DCFF1C"/></svg>',
  warehouse: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 23V13h8l3 6v4"/><path d="M6 13V7.5h5l2.2 5.5"/><path d="M21 5v18h7"/><path d="M15 19.5h6"/><circle cx="8" cy="24" r="2.6" fill="#DCFF1C"/><circle cx="16" cy="24" r="2.6" fill="#DCFF1C"/></svg>',
  factory: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 27V14l7 4v-4l7 4v-4l7 4V5h3v22z"/><path d="M9 22.5h3M15 22.5h3M21 22.5h2"/></svg>',
  office: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="9" width="22" height="16" rx="2"/><path d="M12 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 16h22"/></svg>'
};

// For you choices are kept for the visit; never fail if storage is blocked
export const store = {
  get(k, d) { try { const v = localStorage.getItem('tierney.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tierney.' + k, JSON.stringify(v)); } catch (e) {} }
};
export const qs = k => new URLSearchParams(location.search).get(k);

// ---------- word-by-word headings ----------
// Splits every .words element into word spans. Inner pages start at once (0.12 s stagger);
// the homepage passes autoIn=false and adds .in when a section enters.
export function words(root = document, stagger = .12, autoIn = true) {
  root.querySelectorAll('.words').forEach(el => {
    if (el.dataset.split) return; el.dataset.split = 1;
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="animation-delay:${+(i * stagger).toFixed(2)}s">${esc(w)}</span>`).join(' ');
    if (autoIn) el.classList.add('in');
  });
}

// ---------- our own dropdown: never the browser's default select ----------
let seq = 0;
export function dropdown(host, { options, value = null, placeholder = 'Choose', onChange, labelledBy }) {
  let cur = value, open = false, act = -1;
  const id = 'dd' + (++seq);
  host.classList.add('dd');
  host.innerHTML = `<button type="button" class="dd-btn" id="${id}-b" aria-haspopup="listbox" aria-expanded="false"${labelledBy ? ` aria-labelledby="${labelledBy} ${id}-v"` : ''}><span class="dd-val" id="${id}-v"></span>${CHEV}</button><ul class="dd-list" id="${id}-l" role="listbox" tabindex="-1" hidden${labelledBy ? ` aria-labelledby="${labelledBy}"` : ''}></ul>`;
  const btn = host.querySelector('.dd-btn'), list = host.querySelector('.dd-list'), val = host.querySelector('.dd-val');
  const label = () => { const o = options.find(o => o[0] === cur); val.textContent = o ? o[1] : placeholder; val.classList.toggle('ph', !o); };
  const paint = () => {
    list.innerHTML = options.map(([v, l], i) => `<li role="option" id="${id}-o${i}" data-i="${i}" aria-selected="${v === cur}" class="${i === act ? 'act' : ''}">${esc(l)}</li>`).join('');
    if (act >= 0) { list.setAttribute('aria-activedescendant', `${id}-o${act}`); const li = list.children[act]; li && li.scrollIntoView({ block: 'nearest' }); }
  };
  const set = o => {
    open = o; list.hidden = !o; btn.setAttribute('aria-expanded', o); host.classList.toggle('open', o);
    if (o) { act = Math.max(0, options.findIndex(x => x[0] === cur)); paint(); }
  };
  const pick = i => { if (i < 0) return; cur = options[i][0]; label(); set(false); btn.focus(); onChange && onChange(cur); };
  btn.addEventListener('click', () => set(!open));
  list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
  host.addEventListener('keydown', e => {
    if (!open) { if (e.target === btn && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); set(true); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(options.length - 1, act + 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); paint(); }
    else if (e.key === 'Home') { e.preventDefault(); act = 0; paint(); }
    else if (e.key === 'End') { e.preventDefault(); act = options.length - 1; paint(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(act); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); set(false); btn.focus(); }
    else if (e.key === 'Tab') set(false);
  });
  document.addEventListener('click', e => { if (open && !host.contains(e.target)) set(false); });
  label();
  return { get value() { return cur; }, set value(v) { cur = v; label(); }, get open() { return open; } };
}

// ---------- drawers (Find a job): one open at a time, the rest inert; focus goes in and comes back ----------
export function drawers({ scrim, panels, onOpen }) {
  let current = null, opener = null;
  const set = which => {
    if (which === current) return;
    if (which) opener = document.activeElement;
    for (const [k, el] of Object.entries(panels)) { const on = k === which; el.classList.toggle('open', on); el.inert = !on; el.setAttribute('aria-hidden', String(!on)); }
    scrim.classList.toggle('open', !!which);
    const was = current; current = which;
    if (which) { onOpen && onOpen(which); const first = panels[which].querySelector('.close'); first && first.focus(); }
    else if (was && opener && opener.focus) opener.focus();
  };
  set(null);
  Object.values(panels).forEach(el => el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => set(null))));
  scrim.addEventListener('click', () => set(null));
  addEventListener('keydown', e => { if (e.key === 'Escape' && current && !document.querySelector('.dd.open')) set(null); });
  return { open: set, close: () => set(null), get current() { return current; } };
}

// ---------- toast ----------
export function toast(html, ms = 5000) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = html; document.body.appendChild(t);
  setTimeout(() => t.classList.add('gone'), ms); setTimeout(() => t.remove(), ms + 600);
  return t;
}

// ---------- concept modal: one script for the whole site ----------
// Never closes by itself; closes with the button, the backdrop or Esc. Focus moves in and returns.
export function modal(title, text) {
  const opener = document.activeElement;
  const id = 'm' + (++seq);
  const s = document.createElement('div'); s.className = 'modal-scrim';
  s.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}-t" aria-describedby="${id}-d"><h3 id="${id}-t">${esc(title)}</h3><p id="${id}-d">${esc(text)}</p><button type="button" class="btn dark">Got it</button></div>`;
  const rest = [...document.body.children].filter(el => !el.inert); rest.forEach(el => { el.inert = true; });
  const btn = s.querySelector('button');
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); btn.focus(); }
  };
  function close() { document.removeEventListener('keydown', onKey, true); s.remove(); rest.forEach(el => { el.inert = false; }); if (opener && opener.focus) opener.focus(); }
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('button')) close(); });
  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(s); btn.focus();
  return close;
}

// ---------- menu (≤ 900 px): the nav and Sign in are hidden there, so the header's menu button opens them in a panel ----------
// A right-hand drawer like the For you one. Closes with ×, Esc or the backdrop; focus goes in and comes back; the page behind is inert and does not scroll.
(function menu() {
  const btn = document.querySelector('.top .menu-btn'); if (!btn) return;
  const narrow = matchMedia('(max-width:900px)');
  const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const links = [...document.querySelectorAll('.top .nav a')].map(a => `<a href="${a.getAttribute('href')}"${a.hasAttribute('aria-current') ? ' aria-current="page"' : ''}><span>${esc(a.textContent)}</span><span class="go">${ARROW}</span></a>`).join('');
  const acts = ['.top .pill.sign', '.top .pill.solid'].map(s => document.querySelector(s)).filter(Boolean).map(a => a.outerHTML).join('');
  const scrim = document.createElement('div'); scrim.className = 'drawer-scrim mscrim'; scrim.hidden = true;
  const panel = document.createElement('aside');
  panel.className = 'drawer right mnav'; panel.id = 'menu'; panel.hidden = true; panel.inert = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'menuTitle');
  panel.innerHTML = `<button type="button" class="close" aria-label="Close menu">${CLOSE}</button><h2 id="menuTitle">Menu</h2>
    <nav class="mnav-links" aria-label="Main">${links}</nav><div class="mnav-acts">${acts}</div>`;
  document.body.append(scrim, panel);
  let isOpen = false, opener = null, rest = [], hideT = 0;
  const focusables = () => [...panel.querySelectorAll('a[href],button')];
  function open() {
    if (isOpen) return; isOpen = true; clearTimeout(hideT);
    opener = document.activeElement;
    rest = [...document.body.children].filter(el => el !== panel && el !== scrim && !el.inert);
    rest.forEach(el => { el.inert = true; });
    scrim.hidden = panel.hidden = false; panel.inert = false;
    document.documentElement.classList.add('mlock');
    btn.setAttribute('aria-expanded', 'true');
    void panel.offsetWidth; // let the slide-in run from the closed position
    panel.classList.add('open'); scrim.classList.add('open');
    panel.querySelector('.close').focus();
  }
  function close() {
    if (!isOpen) return; isOpen = false;
    panel.classList.remove('open'); scrim.classList.remove('open'); panel.inert = true;
    rest.forEach(el => { el.inert = false; }); rest = [];
    document.documentElement.classList.remove('mlock');
    btn.setAttribute('aria-expanded', 'false');
    hideT = setTimeout(() => { scrim.hidden = panel.hidden = true; }, reduce ? 0 : 450);
    if (opener && opener.focus) opener.focus();
  }
  btn.addEventListener('click', open);
  panel.querySelector('.close').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') {
      const f = focusables(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  narrow.addEventListener('change', () => { if (!narrow.matches) close(); });
})();

// ---------- job row (homepage rows are static HTML; Find a job, Job and others render these) ----------
export function row(j, have) {
  const f = have && have.length ? fit(j, have) : '';
  const badge = f === 'ok' ? '<span class="fit ok">You can apply</span>' : f === 'near' ? '<span class="fit near">One cert away</span>' : '';
  const who = j.placed ? `<b>${esc(j.employer)}</b> · we've placed ${j.placed} people here` : `<b>${esc(j.employer)}</b>`;
  return `<li><a class="row" href="/job/?id=${j.id}">
    <span class="icon">${ICONS[j.sector]}</span>
    <div class="role"><h3>${esc(j.title)}${badge}</h3><p>${who}</p></div>
    <div class="cell"><small>Where</small>${esc(j.where)}</div>
    <div class="cell"><small>Shift</small>${esc(j.shift)}</div>
    <div class="cell pay"><small>Pay</small>${j.pay}<em>${j.year ? ' /yr' : ' /hr'}</em></div>
    <span class="go">${ARROW}</span></a></li>`;
}
export const fitBadge = (j, have) => { const f = have && have.length ? fit(j, have) : ''; return f === 'ok' ? '<span class="fit ok">You can apply</span>' : f === 'near' ? '<span class="fit near">One cert away</span>' : ''; };

// headings on inner pages start as soon as the module runs
if (!document.body.classList.contains('home')) words(document);

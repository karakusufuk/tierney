// Tierney homepage: the hero scene, word-by-word sections, the checked-driver sequence and the road.
import { reduce, words } from './site.js';

const $ = id => document.getElementById(id);

/* ---------- hero ---------- */
const hero = $('hero'), stage = $('stage'), hl = $('headline');
// a 1536 × 1024 scene scaled to cover the screen × 1.065 and centred, so the pan never shows an edge
function fit() {
  const w = hero.clientWidth, h = hero.clientHeight;
  const s = Math.max(w / 1536, h / 1024) * 1.065;
  stage.style.transform = `translate(${(w - 1536 * s) / 2}px,${(h - 1024 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit); fit();

const LINES = ['Steady hours. Real work.', 'Home every night.', 'Start by Monday.'];
let line = 0, timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
function write(text, delay) {
  hl.classList.remove('leaving');
  hl.innerHTML = text.split(' ').map(w => `<span>${w}</span>`).join(' ');
  [...hl.children].forEach((s, i) => later(() => s.classList.add('in'), reduce ? 0 : delay + i * 320));
}
// middle lamp: off, on, off, on — the headline changes in the dark moment
const midG = $('midGlow'), midR = $('midRef');
const lamp = off => { midG.classList.toggle('off', off); midR.classList.toggle('off', off); };
function cycle() {
  lamp(true); hl.classList.add('leaving');
  later(() => lamp(false), 170);
  later(() => { lamp(true); line = (line + 1) % LINES.length; write(LINES[line], 300); }, 360);
  later(() => lamp(false), 560);
  later(cycle, 20000);
}
function start() {
  timers.forEach(clearTimeout); timers = []; line = 0; lamp(false);
  hero.classList.add('play');
  hl.innerHTML = '';
  write(LINES[0], reduce ? 0 : 3000);
  if (!reduce) later(cycle, 3000 + 20000);
}

// mouse parallax, horizontal only: the lorry drifts least and slowest, the forklift more, the pallets most and quickest.
// The pallets never move right of the forklift, so the forklift's cut rear never shows.
const P = { truck: stage.querySelector('.pan.truck'), fork: stage.querySelector('.pan.fork'), pal: stage.querySelector('.pan.pal') };
let tx = 0; const c = { truck: 0, fork: 0, pal: 0 };
hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; });
hero.addEventListener('pointerleave', () => { tx = 0; });
if (!reduce) (function tick() {
  c.truck += (tx - c.truck) * .025; c.fork += (tx - c.fork) * .05; c.pal += (tx - c.pal) * .09;
  const t = -c.truck * 5, f = -c.fork * 14, p = f + Math.min(0, -c.pal * 22);
  P.truck.style.translate = `${t.toFixed(2)}px 0px`; P.fork.style.translate = `${f.toFixed(2)}px 0px`; P.pal.style.translate = `${p.toFixed(2)}px 0px`;
  requestAnimationFrame(tick);
})();
start();

/* ---------- word-by-word headings, soft reveals (sections start when they enter) ---------- */
words(document, .14, false);
const watch = (els, fn, thr = .35) => {
  if (!('IntersectionObserver' in window)) return els.forEach(fn);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), { threshold: thr });
  els.forEach(el => io.observe(el));
};
document.querySelectorAll('main section.band:not([data-seq])').forEach(sec => {
  watch([sec], s => {
    const h = s.querySelector('h2.words'); const nWords = h ? h.children.length : 0;
    if (h) h.classList.add('in');
    const start = reduce ? 0 : 200 + nWords * 140;
    s.querySelectorAll('.reveal').forEach((r, i) => setTimeout(() => r.classList.add('in'), reduce ? 0 : start + i * 260));
  }, .25);
});

// checked driver: only once 60 % of the section is on screen. Heading, then the card, then the text, then the markers.
const chk = $('checked');
watch([chk], s => {
  const h = s.querySelector('h2.words'), n = h.children.length, base = reduce ? 0 : n * 140 + 300;
  h.classList.add('in');
  setTimeout(() => $('card').classList.add('in'), reduce ? 0 : base);
  s.querySelectorAll('.reveal').forEach((r, i) => setTimeout(() => r.classList.add('in'), reduce ? 0 : base + 700 + i * 250));
  s.querySelectorAll('.mark').forEach((m, i) => setTimeout(() => m.classList.add('on'), reduce ? 0 : base + 1500 + i * 450));
}, .6);

/* ---------- road: snaps into view, then plays on its own ---------- */
const road = $('road'), cv = $('roadCanvas'), ctx = cv.getContext('2d');
const choices = [...document.querySelectorAll('.choice')];
const NAVY = [19, 35, 74], YELLOW = '#DCFF1C';
let W = 0, H = 0, dpr = 1, tile = null;
const TILE_H = 1024;

// asphalt: three octaves of value noise plus grain, in the Tierney navy, flowing down with the road
function makeTile(w) {
  const c = document.createElement('canvas'); c.width = w; c.height = TILE_H;
  const g = c.getContext('2d'); const img = g.createImageData(w, TILE_H); const d = img.data;
  let seed = 1234567; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function grid(cell) { const gw = Math.ceil(w / cell) + 2, gh = TILE_H / cell, a = new Float32Array(gw * gh); for (let i = 0; i < a.length; i++) a[i] = rnd() * 2 - 1; return { cell, gw, gh, a }; }
  const big = grid(128), mid = grid(32), small = grid(8), sm = t => t * t * (3 - 2 * t);
  function sample(G, x, y) {
    const gx = x / G.cell, gy = y / G.cell, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = sm(gx - x0), ty = sm(gy - y0);
    const r0 = (y0 % G.gh) * G.gw, r1 = ((y0 + 1) % G.gh) * G.gw;
    const a = G.a[r0 + x0], b = G.a[r0 + x0 + 1], c2 = G.a[r1 + x0], e = G.a[r1 + x0 + 1];
    return (a + (b - a) * tx) * (1 - ty) + (c2 + (e - c2) * tx) * ty;
  }
  for (let y = 0; y < TILE_H; y++) for (let x = 0; x < w; x++) {
    let v = sample(big, x, y) * 5 + sample(mid, x, y) * 3 + sample(small, x, y) * 2;
    const r = rnd(); v += (r - .5) * 14; if (r < .006) v -= 18; else if (r > .994) v += 22;
    const i = (y * w + x) * 4; d[i] = NAVY[0] + v; d[i + 1] = NAVY[1] + v; d[i + 2] = NAVY[2] + v * 1.2; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}

// line widths in CSS px, one per dash; the last one becomes the new background
const BASE = [3, 3, 3, 5, 5, 8, 12, 13, 15, 20, 25, 30, 40, 50, 70, 100, 150, 250, 420, 700];
let dashes = [], travelEnd = 0, lead = 0;
function layout() {
  const gap = H * .16; let pos = 0; dashes = [];
  const widths = BASE.map(w => w * dpr).concat([W * 3.2]);
  widths.forEach((w, k) => {
    const last = k === widths.length - 1;
    const len = last ? Infinity : H * .2 + w * .5;
    if (k) pos += gap + (last ? 0 : len / 2) + (dashes[k - 1].len / 2);
    dashes.push({ w, len, pos, last });
  });
  lead = H * .95;
  travelEnd = dashes[dashes.length - 1].pos + H + 4 - lead;
}
// width down the screen: wide at the top, narrow through the middle, wide again at the bottom
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prof = t => { t = clamp(t); return .38 + 1.15 * Math.pow(1 - t, 2.6) + 1.3 * Math.pow(t, 5); };

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const r = cv.getBoundingClientRect();
  const nw = Math.round(r.width * dpr), nh = Math.round(r.height * dpr);
  if (!nw || (nw === W && nh === H)) return;
  W = cv.width = nw; H = cv.height = nh; tile = makeTile(W); layout(); draw(dNow, 0);
}

function dashPath(ds, d) {
  const centre = d + lead - ds.pos;
  const top = ds.last ? 0 : centre - ds.len / 2, bot = ds.last ? centre : centre + ds.len / 2;
  if (bot < 0 || top > H) return false;
  // straight sides: the width is read at the two ends of the line, no bulge in between
  const ht = ds.w * prof(top / H) / 2, hb = ds.w * prof(bot / H) / 2, cx = W / 2;
  ctx.beginPath(); ctx.moveTo(cx - ht, top); ctx.lineTo(cx + ht, top); ctx.lineTo(cx + hb, bot); ctx.lineTo(cx - hb, bot); ctx.closePath();
  return true;
}

let dNow = 0;
function draw(d, v) {
  if (!W) return;
  const off = ((d % TILE_H) + TILE_H) % TILE_H;
  ctx.globalAlpha = 1;
  ctx.drawImage(tile, 0, TILE_H - off, W, off, 0, 0, W, off);
  ctx.drawImage(tile, 0, 0, W, TILE_H - off, 0, off, W, TILE_H - off);
  if (H > TILE_H) ctx.drawImage(ctx.canvas, 0, 0, W, H - TILE_H, 0, TILE_H, W, H - TILE_H);
  ctx.fillStyle = YELLOW;
  // a little motion blur: faint copies trail behind each line while it moves
  const trail = Math.min(Math.abs(v), H * .25);
  if (trail > 1) [[.9, .07], [.75, .09], [.6, .11], [.45, .13], [.3, .15], [.15, .17]].forEach(([k, a]) => {
    ctx.globalAlpha = a; dashes.forEach(ds => { if (dashPath(ds, d - trail * k)) ctx.fill(); });
  });
  ctx.globalAlpha = 1; dashes.forEach(ds => { if (dashPath(ds, d)) ctx.fill(); });
}

function finish() {
  ctx.globalAlpha = 1; ctx.fillStyle = YELLOW; ctx.fillRect(0, 0, W, H);
  if (road.classList.contains('done')) return;
  road.classList.add('done');
  choices.forEach((c, i) => {
    const h = c.querySelector('.words');
    [...h.children].forEach((w, j) => w.style.animationDelay = (i * .5 + j * .14) + 's');
    h.classList.add('in');
    setTimeout(() => c.classList.add('in'), reduce ? 0 : 500 + i * 500 + h.children.length * 140);
  });
}

// scroll lock while the sequence plays: wheel, touch and keys are swallowed, and the page is held on the band
let locked = false, holdY = null, arrived = false;
const stop = e => { if (locked) e.preventDefault(); };
addEventListener('wheel', stop, { passive: false });
addEventListener('touchmove', stop, { passive: false });
addEventListener('keydown', e => { if (locked && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault(); });

let played = false;
function play() {
  if (played) return; played = true;
  holdY = Math.round(road.getBoundingClientRect().top + scrollY); arrived = false;
  window.scrollTo({ top: holdY, behavior: 'smooth' });
  if (reduce) return finish();
  locked = true;
  const DUR = 3400, t0 = performance.now(); let last = 0;
  (function step(now) {
    const p = clamp((now - t0) / DUR);
    const d = travelEnd * Math.pow(p, 1.6);     // starts gently, speeds up as the lines get wider
    draw(d, d - last); last = d; dNow = d;
    if (p < 1) requestAnimationFrame(step);
    else { finish(); setTimeout(() => { locked = false; holdY = null; }, 400); }
  })(t0);
}
let lastY = scrollY;
addEventListener('scroll', () => {
  if (locked && holdY != null) {
    // once the smooth scroll has landed, anything that nudges the page (trackpad inertia) is undone
    if (Math.abs(scrollY - holdY) < 2) arrived = true;
    else if (arrived) scrollTo(0, holdY);
  }
  const goingDown = scrollY > lastY; lastY = scrollY;
  if (played || !goingDown) return;
  const r = road.getBoundingClientRect();
  if (r.top < innerHeight * .6 && r.bottom > innerHeight * .5) play();
}, { passive: true });
addEventListener('resize', () => { resize(); if (road.classList.contains('done')) finish(); });
resize();
// reduced motion: the finished yellow screen from the start, no snap, no lock
if (reduce) { played = true; finish(); }

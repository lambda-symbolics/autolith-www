/* Autolith landing, motion layer. No dependencies. */
(() => {
"use strict";

const STILL = location.search.indexOf("still") > -1;
const FORCE_STAGE = (() => { const m = /[?&]stage=(\d)/.exec(location.search); return m ? +m[1] : null; })();
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
const easeIO = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

/* ---------------------------------------------------------- rAF ticker */
const ticks = [];
let ticking = false;
function onTick(fn){ ticks.push(fn); start(); }
function start(){ if (ticking) return; ticking = true; requestAnimationFrame(loop); }
function loop(t){ for (const f of ticks) f(t); requestAnimationFrame(loop); }

/* --------------------------------------------------- headline splitting */
function tokenize(el){
  const out = [];
  const walk = (node, em) => {
    for (const child of node.childNodes){
      if (child.nodeType === 3){
        for (const w of child.textContent.split(/(\s+)/)){
          if (!w) continue;
          if (/^\s+$/.test(w)) continue;
          out.push({ text: w, em });
        }
      } else if (child.nodeType === 1){
        walk(child, em || child.tagName === "EM");
      }
    }
  };
  walk(el, false);
  return out;
}

function splitHeading(el){
  if (!el.__tokens) el.__tokens = tokenize(el);
  const toks = el.__tokens;
  // measure pass: plain inline spans
  el.innerHTML = "";
  const probes = toks.map(t => {
    const s = document.createElement("span");
    s.textContent = t.text;
    if (t.em) s.className = "is-em";
    el.append(s, document.createTextNode(" "));
    return s;
  });
  const lines = [];
  let cur = null, lastTop = null;
  probes.forEach((s, i) => {
    const top = Math.round(s.offsetTop);
    if (lastTop === null || Math.abs(top - lastTop) > 3){ cur = []; lines.push(cur); lastTop = top; }
    cur.push(toks[i]);
  });
  el.innerHTML = "";
  lines.forEach((line, i) => {
    const outer = document.createElement("span");
    outer.className = "lineclip";
    const inner = document.createElement("span");
    inner.style.setProperty("--d", i);
    line.forEach((t, j) => {
      if (t.em){
        const e = document.createElement("em");
        e.textContent = t.text;
        inner.append(e);
      } else {
        inner.append(document.createTextNode(t.text));
      }
      if (j < line.length - 1) inner.append(document.createTextNode(" "));
    });
    outer.append(inner);
    el.append(outer);
  });
}

function splitAll(){
  $$("[data-split]").forEach(el => {
    const wasIn = el.classList.contains("in");
    splitHeading(el);
    if (wasIn) el.classList.add("in");
  });
}

/* --------------------------------------------------------- reveal setup */
function observeReveals(){
  const all = $$("[data-rv], [data-split]");
  if (STILL){ all.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => {
    for (const e of entries){
      if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  all.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 1.05 && r.bottom > 0){ el.classList.add("in"); return; }
    io.observe(el);
  });
  // safety: nothing stays invisible if an observer never fires
  setTimeout(() => all.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add("in");
  }), 1200);
}

/* ------------------------------------------------------------------ nav */
function navSetup(){
  const nav = $("#nav");
  const burger = $("#burger");
  const menu = $("#menu");
  const inkEls = () => $$(".foot");

  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#menu a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  let cached = [];
  const measure = () => {
    cached = inkEls().map(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top + scrollY, bot: r.bottom + scrollY };
    });
    secs = $$("main section[id]").map(el => {
      const r = el.getBoundingClientRect();
      return { id: el.id, top: r.top + scrollY, bot: r.bottom + scrollY };
    });
  };
  let secs = [];
  const links = $$("#navLinks a[href^='#']");
  measure();
  addEventListener("resize", measure);
  addEventListener("load", measure);

  let last = null, lastSec = null;
  onTick(() => {
    const y = scrollY;
    nav.classList.toggle("is-stuck", y > 24);
    const probe = y + (nav.offsetHeight * 0.55);
    let onInk = false;
    for (const b of cached) if (probe >= b.top && probe < b.bot){ onInk = true; break; }
    if (onInk !== last){ nav.classList.toggle("is-ink", onInk); last = onInk; }

    // scroll spy: whichever section owns the upper third of the viewport
    const mark = y + innerHeight * 0.34;
    let cur = null;
    for (const sc of secs) if (mark >= sc.top && mark < sc.bot){ cur = sc.id; break; }
    if (cur !== lastSec){
      links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + cur));
      lastSec = cur;
    }
  });
}

/* ---------------------------------------------------- hero: the monolith
   A tower of bricks that edits itself, and obeys gravity while it does.
   A brick is pulled out of the middle, everything above it drops into the
   gap, and the discarded brick falls into the grass and dissolves. New
   bricks are only ever dropped onto the top. A brick can also be recut in
   place, which is the one change that happens without anything moving.

   One bit, the whole way down. The scene renders at a third of the screen
   resolution into ordered-dither tiles and is thresholded to pure ink or
   pure paper before it is blitted back, so no anti-aliased edge can smuggle
   a grey onto the page. */

const BAYER4 = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];

function monolith(){
  const cv = $("#monolith");
  if (!cv) return;
  const ctx = cv.getContext("2d", { alpha: false });
  const hero = cv.parentElement;

  const S = 3;                                  // dither cell, in css pixels
  let W = 0, H = 0, rw = 1, rh = 1, dpr = 1, mobile = false;
  const off = document.createElement("canvas");
  const og = off.getContext("2d", { alpha: false, willReadFrequently: true });

  /* seventeen tones, bare paper to solid ink, and nothing in between */
  const tiles = [];
  function buildTiles(){
    tiles.length = 0;
    for (let k = 0; k <= 16; k++){
      const c = document.createElement("canvas");
      c.width = 4; c.height = 4;
      const g = c.getContext("2d");
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 4, 4);
      g.fillStyle = "#000000";
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++)
        if (BAYER4[y * 4 + x] < k) g.fillRect(x, y, 1, 1);
      tiles.push(og.createPattern(c, "repeat"));
    }
  }

  /* ------------------------------------------------------------- the tower */
  const G = 6.4;                  // gravity, object units per second squared
  const RECUT = 1.15;             // a redefinition in place
  const OUT = 0.44;               // how long a brick takes to slide clear
  const REST = 0.30;              // how long it lies in the grass first
  const GONE = 0.46;              // how long the discarded brick takes to go
  const RISE = 0.66;              // how high a new brick starts above the top

  let N = 21, TH = 0;
  const JOINT = 1;                // bricks sit flush. an open joint turns the
                                  // tower into a stack of plates seen head on
  let stack = [], loose = [];
  let lastYaw = 0;

  function seedGeom(i){
    const f = i / (N - 1);
    return {
      w:  0.258 + 0.040 * Math.sin(f * 4.1 + 0.8) + 0.020 * Math.sin(f * 9.7 + 2.0),
      d:  0.182 + 0.028 * Math.sin(f * 3.3 + 2.1),
      ox: 0.020 * Math.sin(f * 5.2),
      oz: 0.016 * Math.cos(f * 4.4)
    };
  }
  const jit = (v, a, lo, hi) => clamp(v + (Math.random() - 0.5) * a, lo, hi);
  const recutGeom = c => ({
    w:  jit(c.w,  0.118, 0.165, 0.336),
    d:  jit(c.d,  0.072, 0.130, 0.232),
    ox: jit(c.ox, 0.055, -0.048, 0.048),
    oz: jit(c.oz, 0.045, -0.038, 0.038)
  });
  function freshGeom(prev, i){
    const f = clamp(i / Math.max(1, N - 1), 0, 1.25);
    const aim = 0.268 - 0.054 * f;                    // the tower tapers
    const w0 = prev ? prev.w * 0.55 + aim * 0.45 : aim;
    return {
      w:  clamp(w0 + (Math.random() - 0.5) * 0.108, 0.158, 0.326),
      d:  clamp((prev ? prev.d : 0.182) + (Math.random() - 0.5) * 0.054, 0.126, 0.228),
      ox: clamp((prev ? prev.ox : 0) + (Math.random() - 0.5) * 0.046, -0.034, 0.034),
      oz: clamp((prev ? prev.oz : 0) + (Math.random() - 0.5) * 0.040, -0.034, 0.034)
    };
  }
  const brick = (g, y) => ({ ...g, y, vy: 0, sq: 0, glow: 0, cut: null, pull: null });

  /* ------------------------------------------------------------ what grows */
  let flora = [];
  function spot(){                            // a point on the ground, clear of the stone
    for (let g = 0; g < 40; g++){
      const a = Math.random() * 6.2832;
      const r = 0.32 + Math.pow(Math.random(), 0.8) * 0.50;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85;
      if (Math.abs(x) > 0.33 || Math.abs(z) > 0.24) return [x, z];
    }
    return null;
  }
  function grow(){
    flora = [];
    /* grass comes in tufts. scattered single blades read as sticks. */
    const tufts = mobile ? 11 : 22;
    for (let i = 0; i < tufts; i++){
      const c = spot();
      if (!c) continue;
      const n = 7 + ((Math.random() * 6) | 0);
      for (let b = 0; b < n; b++){
        flora.push({
          x: c[0] + (Math.random() - 0.5) * 0.14,
          z: c[1] + (Math.random() - 0.5) * 0.10,
          h: 0.085 + Math.random() * 0.115,
          lean: (Math.random() - 0.5) * 1.5,
          leanz: (Math.random() - 0.5) * 1.5,
          ph: Math.random() * 6.2832,
          flower: false
        });
      }
    }
    const blooms = mobile ? 5 : 10;
    for (let i = 0; i < blooms; i++){
      const c = spot();
      if (!c) continue;
      flora.push({
        x: c[0], z: c[1],
        h: 0.165 + Math.random() * 0.075,
        lean: (Math.random() - 0.5) * 0.5,
        leanz: (Math.random() - 0.5) * 0.5,
        ph: Math.random() * 6.2832,
        flower: true,
        kind: (Math.random() * 2) | 0
      });
    }
  }

  function build(){
    mobile = innerWidth < 900;
    N = mobile ? 14 : 21;
    TH = 2 / N;
    stack = []; loose = [];
    for (let i = 0; i < N; i++) stack.push(brick(seedGeom(i), -1 + i * TH));
    grow();
  }

  /* --------------------------------------------------------- what it does */
  let nextMove = 1.0;

  function pullOut(){
    /* never the bottom course, and never one already busy */
    const pick = [];
    for (let i = 1; i < stack.length; i++)
      if (!stack[i].pull && !stack[i].cut && stack[i].vy === 0) pick.push(i);
    if (!pick.length) return;
    const i = pick[(Math.random() * pick.length) | 0];
    /* it comes out the face nearest the viewer, in object space, and keeps
       that direction afterwards because the world turns, not the brick */
    const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
    let best = dirs[0], bestZ = Infinity;
    for (const d of dirs){
      const zv = d[1] * Math.cos(lastYaw) - d[0] * Math.sin(lastYaw);
      if (zv < bestZ){ bestZ = zv; best = d; }
    }
    stack[i].pull = { t: 0, dx: best[0], dz: best[1] };
  }

  function dropTop(){
    const i = stack.length;
    stack.push(brick(freshGeom(stack[i - 1], i), -1 + i * TH + RISE));
    stack[i].glow = 1;
  }

  function recutOne(){
    const pick = [];
    for (let i = 0; i < stack.length; i++)
      if (!stack[i].pull && !stack[i].cut && stack[i].vy === 0) pick.push(i);
    if (!pick.length) return;
    const b = stack[pick[(Math.random() * pick.length) | 0]];
    b.cut = { t: 0, to: recutGeom(b), done: false };
  }

  function schedule(t){
    const n = stack.length;
    const roll = Math.random();
    if (n > N + 1) pullOut();
    else if (n < N - 2) dropTop();
    else if (roll < 0.34) pullOut();
    else if (roll < 0.68) dropTop();
    else recutOne();
    nextMove = t + 1.0 + Math.random() * 1.4;
  }

  /* how wide a brick is mid-recut, and how hot it still is */
  function amount(c){
    if (!c) return 1;
    const h = RECUT * 0.45;
    return c.t < h ? 1 - 0.9 * easeIO(c.t / h)
                   : 0.1 + 0.9 * easeIO((c.t - h) / (RECUT - h));
  }
  const cutFlash = c => c ? clamp(1 - c.t / (RECUT * 0.75), 0, 1) : 0;

  /* ------------------------------------------------------------ the physics */
  function step(dt, t){
    if (t > nextMove) schedule(t);

    /* bricks on their way out. the tower only settles once one is clear. */
    for (let i = stack.length - 1; i >= 0; i--){
      const b = stack[i];
      if (!b.pull) continue;
      b.pull.t += dt;
      if (b.pull.t >= OUT){
        stack.splice(i, 1);
        loose.push({ g: b, y: b.y, vy: 0, sq: 0, dead: null, fl: 0.85,
                     ox: b.ox + b.pull.dx * 0.52, oz: b.oz + b.pull.dz * 0.52 });
      }
    }

    /* everything falls to the slot it now occupies */
    for (let i = 0; i < stack.length; i++){
      const b = stack[i];
      if (b.pull) continue;
      const target = -1 + i * TH;
      const atRest = b.vy === 0 && b.y <= target + 1e-5;
      if (b.y > target + 1e-5 || b.vy !== 0){
        b.vy -= G * dt;
        b.y += b.vy * dt;
        if (b.y <= target){
          const hit = -b.vy;
          b.y = target; b.vy = 0;
          if (hit > 0.3) b.sq = Math.min(1, hit / 2.2);
        }
      } else if (b.y < target){ b.y = target; }
      if (b.sq > 0) b.sq = Math.max(0, b.sq - dt * 7);
      if (b.glow > 0 && atRest) b.glow = Math.max(0, b.glow - dt * 2.6);
      if (b.cut){
        b.cut.t += dt;
        if (!b.cut.done && b.cut.t >= RECUT * 0.45){
          Object.assign(b, b.cut.to); b.cut.done = true;
        }
        if (b.cut.t > RECUT) b.cut = null;
      }
    }

    /* the discarded brick drops into the grass and goes */
    for (let k = loose.length - 1; k >= 0; k--){
      const l = loose[k];
      if (l.dead !== null){
        l.dead += dt;
        if (l.dead > GONE) loose.splice(k, 1);
        continue;
      }
      l.vy -= G * dt;
      l.y += l.vy * dt;
      if (l.y <= -1){
        const hit = -l.vy;
        l.y = -1;
        if (hit > 0.75){ l.vy = hit * 0.24; l.sq = Math.min(1, hit / 2.4); }
        else { l.vy = 0; l.dead = -REST; }
      }
      if (l.sq > 0) l.sq = Math.max(0, l.sq - dt * 7);
      if (l.fl > 0) l.fl = Math.max(0, l.fl - dt * 1.7);   // it cools as it falls
    }
  }

  /* ------------------------------------------------------------ the canvas */
  let keep = { x0: 0, x1: 0, y0: 0, y1: 0 };
  function measureKeepOut(){
    const copy = hero.querySelector(".hero__copy");
    const hr = hero.getBoundingClientRect();
    if (!copy){ keep = { x0: W * 0.58, x1: W * 0.66, y0: H * 0.70, y1: H * 0.80 }; return; }
    const cr = copy.getBoundingClientRect();
    keep = { x0: cr.right - hr.left + 24, x1: cr.right - hr.left + 120,
             y0: cr.bottom - hr.top + 18, y1: cr.bottom - hr.top + 30 };
  }

  function resize(){
    const r = hero.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    rw = Math.max(1, Math.ceil(W / S));
    rh = Math.max(1, Math.ceil(H / S));
    off.width = rw; off.height = rh;
    buildTiles();
    build();
    measureKeepOut();
  }

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener("pointermove", e => {
    tmx = e.clientX / innerWidth - 0.5;
    tmy = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  const FACES = [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]];
  const LX = -0.339, LY = 0.619, LZ = -0.708;   // light, fixed to the camera
  const BIAS = [0, 0, -3, 0, 0, 0];              // the top catches the sky

  /* ?t=<seconds> runs the tower forward before the first frame, so a still
     capture can land in the middle of a pull or a drop */
  const FF = (() => { const m = /[?&]t=([\d.]+)/.exec(location.search); return m ? +m[1] : null; })();

  const t0 = performance.now();
  let last = 0, visible = true, simT = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; },
    { threshold: 0 }).observe(hero);

  function draw(t){
    mx = lerp(mx, tmx, 0.05);
    my = lerp(my, tmy, 0.05);

    /* orientation */
    const yaw   = STILL ? 0.62 + t * 0.155 : t * 0.155 + mx * 0.42;
    const pitch = (STILL ? 0.24 : 0.235 + Math.sin(t * 0.21) * 0.04) - my * 0.14;
    lastYaw = yaw;
    const cy_ = Math.cos(yaw),   sy_ = Math.sin(yaw);
    const cp_ = Math.cos(pitch), sp_ = Math.sin(pitch);

    /* one tone per face orientation, shared by every brick */
    const tone = new Array(6), shown = new Array(6);
    for (let f = 0; f < 6; f++){
      const n = FACES[f];
      const X = n[0] * cy_ + n[2] * sy_;
      const Z = n[2] * cy_ - n[0] * sy_;
      const Y2 = n[1] * cp_ + Z * sp_;
      const Z2 = Z * cp_ - n[1] * sp_;
      shown[f] = Z2 < -0.02;
      const lum = 0.10 + 0.86 * Math.max(0, X * LX + Y2 * LY + Z2 * LZ);
      tone[f] = clamp(Math.round((1 - lum) * 16) + BIAS[f], 1, 16);
    }

    /* placement: beside the type on wide screens, under it on narrow ones */
    const blockH = mobile ? 268 : Math.min(H * 0.70, 660);
    const scl = blockH;
    const F = 3.4, D = 3.4;
    const halfW = scl * 0.40;                 // the grass counts as the block
    const cx = (mobile ? W * 0.52 : Math.max(W * 0.775, keep.x0 + halfW)) / S;
    const cyp = (mobile ? keep.y1 + blockH * 0.5 : H * 0.5 - 32) / S;
    const sc = scl / S;

    function px(x, y, z){
      const X = x * cy_ + z * sy_;
      const Z = z * cy_ - x * sy_;
      const Y2 = y * cp_ + Z * sp_;
      const Z2 = Z * cp_ - y * sp_;
      const p = F / (F + Z2 + D);
      return [cx + X * sc * p, cyp - Y2 * sc * p, p];
    }

    og.fillStyle = "#ffffff";
    og.fillRect(0, 0, rw, rh);

    og.save();
    if (mobile){
      og.beginPath();
      og.rect(0, Math.max(0, (keep.y1 - 8) / S), rw, rh);
      og.clip();
    }

    /* it stands on something */
    const foot = px(0, -1.04, 0);
    og.fillStyle = tiles[2];
    og.beginPath();
    og.ellipse(foot[0], foot[1] + sc * 0.018, sc * 0.26, sc * 0.038, 0, 0, 6.2832);
    og.fill();
    og.fillStyle = tiles[7];
    og.beginPath();
    og.ellipse(foot[0], foot[1] + sc * 0.014, sc * 0.145, sc * 0.021, 0, 0, 6.2832);
    og.fill();

    /* a blade is a filled taper, not a stroke: wide at the root, a point at
       the tip, so it reads as grass and not as a piece of wire */
    function sprig(f){
      const sway = Math.sin(t * 0.85 + f.ph) * 0.026 + Math.sin(t * 2.2 + f.ph * 1.7) * 0.008;
      const off1 = f.lean * f.h + sway;
      const off2 = f.leanz * f.h + Math.cos(t * 0.73 + f.ph) * 0.020;
      const bw = f.flower ? 0.0068 : 0.0072;
      const bL = px(f.x - bw, -1, f.z);
      const bR = px(f.x + bw, -1, f.z);
      const mL = px(f.x - bw * 0.5 + off1 * 0.34, -1 + f.h * 0.55, f.z + off2 * 0.34);
      const mR = px(f.x + bw * 0.5 + off1 * 0.34, -1 + f.h * 0.55, f.z + off2 * 0.34);
      const tip = px(f.x + off1, -1 + f.h, f.z + off2);
      og.fillStyle = "#000000";
      og.beginPath();
      og.moveTo(bL[0], bL[1]);
      og.quadraticCurveTo(mL[0], mL[1], tip[0], tip[1]);
      og.quadraticCurveTo(mR[0], mR[1], bR[0], bR[1]);
      og.closePath();
      og.fill();
      if (!f.flower) return;
      /* the stem again as a hairline, so distance never thins it to nothing */
      og.strokeStyle = "#000000";
      og.lineWidth = 0.9;
      og.beginPath();
      og.moveTo((bL[0] + bR[0]) / 2, (bL[1] + bR[1]) / 2);
      og.quadraticCurveTo((mL[0] + mR[0]) / 2, (mL[1] + mR[1]) / 2, tip[0], tip[1]);
      og.stroke();
      /* two leaves, so a flower is not a pin with a dot on it */
      const lz = -1 + f.h * 0.42, lo = f.x + off1 * 0.30, lzz = f.z + off2 * 0.30;
      for (const side of [-1, 1]){
        const root = px(lo, lz, lzz);
        const lt   = px(lo + side * 0.052, lz + 0.034, lzz);
        const cA   = px(lo + side * 0.016, lz + 0.032, lzz);
        const cB   = px(lo + side * 0.032, lz + 0.002, lzz);
        og.beginPath();
        og.moveTo(root[0], root[1]);
        og.quadraticCurveTo(cA[0], cA[1], lt[0], lt[1]);
        og.quadraticCurveTo(cB[0], cB[1], root[0], root[1]);
        og.closePath(); og.fill();
      }
      const r = Math.max(1.3, 0.028 * sc * tip[2]);
      if (f.kind === 0){
        og.beginPath(); og.arc(tip[0], tip[1], r, 0, 6.2832); og.fill();
        og.fillStyle = "#ffffff";
        og.beginPath(); og.arc(tip[0], tip[1], r * 0.40, 0, 6.2832); og.fill();
      } else {
        for (let k = 0; k < 5; k++){
          const a = k * 1.2566 + f.ph;
          og.beginPath();
          og.arc(tip[0] + Math.cos(a) * r * 0.82, tip[1] + Math.sin(a) * r * 0.82, r * 0.48, 0, 6.2832);
          og.fill();
        }
        og.fillStyle = "#ffffff";
        og.beginPath(); og.arc(tip[0], tip[1], r * 0.34, 0, 6.2832); og.fill();
      }
    }

    const ext = 0.36 * Math.abs(sy_) + 0.23 * Math.abs(cy_);
    const infront = [];
    for (const f of flora){
      const zr = f.z * cy_ - f.x * sy_;
      if (zr < -ext) infront.push(f); else sprig(f);
    }

    const quad = (a, b, c, d, k) => {
      og.fillStyle = tiles[k];
      og.beginPath();
      og.moveTo(a[0], a[1]); og.lineTo(b[0], b[1]);
      og.lineTo(c[0], c[1]); og.lineTo(d[0], d[1]);
      og.closePath(); og.fill();
    };

    /* one brick: geometry in object units, tone from the shared face table */
    function cube(ox, oz, w, d, y0, h, fl, ruleY, air){
      const y1 = y0 + h;
      const x0 = ox - w, x1 = ox + w;
      const z0 = oz - d, z1 = oz + d;
      const ink = v => clamp(Math.round(v + (16 - v) * fl), 0, 16);
      if (shown[0]) quad(px(x1,y0,z0), px(x1,y0,z1), px(x1,y1,z1), px(x1,y1,z0), ink(tone[0]));
      if (shown[1]) quad(px(x0,y0,z0), px(x0,y0,z1), px(x0,y1,z1), px(x0,y1,z0), ink(tone[1]));
      if (shown[4]) quad(px(x0,y0,z1), px(x1,y0,z1), px(x1,y1,z1), px(x0,y1,z1), ink(tone[4]));
      if (shown[5]) quad(px(x0,y0,z0), px(x1,y0,z0), px(x1,y1,z0), px(x0,y1,z0), ink(tone[5]));
      if (shown[2]) quad(px(x0,y1,z0), px(x1,y1,z0), px(x1,y1,z1), px(x0,y1,z1), ink(tone[2]));
      if (air || shown[3]) quad(px(x0,y0,z0), px(x1,y0,z0), px(x1,y0,z1), px(x0,y0,z1), ink(tone[3]));
      if (ruleY != null){
        const a = px(-0.44, ruleY, 0), b = px(0.44, ruleY, 0);
        og.strokeStyle = "#000000";
        og.lineWidth = 1;
        og.beginPath();
        og.moveTo(a[0], Math.round(a[1]) + 0.5);
        og.lineTo(b[0], Math.round(b[1]) + 0.5);
        og.stroke();
      }
    }

    /* the tower, bottom brick first, so each paints over the top of the one
       below it. a brick on its way out is held back and drawn over all of it. */
    const held = [];
    for (const b of stack){
      const k = amount(b.cut);
      const sq = 1 - 0.24 * b.sq, sw = 1 + 0.10 * b.sq;
      const w = b.w * k * sw, d = b.d * Math.max(k, 0.55) * sw;
      const fl = Math.max(b.glow, cutFlash(b.cut));
      const rule = (b.cut && b.cut.t < RECUT * 0.26) ? b.y + TH / 2 : null;
      if (b.pull){
        const e = easeIO(clamp(b.pull.t / OUT, 0, 1));
        held.push([b.ox + b.pull.dx * 0.52 * e, b.oz + b.pull.dz * 0.52 * e,
                   w, d, b.y, TH * JOINT * sq, Math.max(fl, e * 0.8)]);
      } else {
        cube(b.ox, b.oz, w, d, b.y, TH * JOINT * sq, fl, rule, b.vy !== 0);
      }
    }
    for (const l of loose){
      const g = l.g;
      const s = (l.dead === null || l.dead <= 0) ? 1 : 1 - easeIO(l.dead / GONE);
      if (s <= 0.02) continue;
      const sq = (1 - 0.24 * l.sq) * s;
      held.push([l.ox, l.oz, g.w * s * (1 + 0.10 * l.sq), g.d * s * (1 + 0.10 * l.sq),
                 l.y, TH * JOINT * sq, l.fl]);
    }
    held.sort((a, b) => a[4] - b[4]);
    for (const h of held) cube(h[0], h[1], h[2], h[3], h[4], h[5], h[6], null, true);

    for (const f of infront) sprig(f);

    og.restore();

    /* threshold: pure ink or pure paper, nothing else reaches the page */
    const im = og.getImageData(0, 0, rw, rh);
    const dta = im.data;
    for (let i = 0; i < dta.length; i += 4){
      if (dta[i] * 0.299 + dta[i+1] * 0.587 + dta[i+2] * 0.114 < 150){
        dta[i] = 0; dta[i+1] = 0; dta[i+2] = 0;
      } else {
        dta[i] = 255; dta[i+1] = 254; dta[i+2] = 250;
      }
    }
    og.putImageData(im, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, rw, rh, 0, 0, rw * S * dpr, rh * S * dpr);
  }

  function frame(now){
    if (!visible || !tiles.length) return;
    if (!STILL && now - last < 40) return;
    const dt = last ? Math.min(0.12, (now - last) / 1000) : 0.04;
    last = now;
    if (!STILL){ simT += dt; step(dt, simT); }
    draw(simT);
  }

  function fastForward(seconds){
    const dt = 1 / 30;
    for (let i = 0; i < seconds * 30; i++){ simT += dt; step(dt, simT); }
  }

  resize();
  cv.classList.add("ready");
  if (STILL){
    if (FF !== null) fastForward(FF);
    draw(simT);
  } else {
    onTick(frame);
  }

  addEventListener("resize", () => { resize(); if (STILL) draw(simT); });

  /* the copy box moves when the webfonts land */
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => {
      measureKeepOut();
      if (STILL) draw(simT);
    }, () => {});
  }
}

/* --------------------------------------------- scrub: desugaring stages */
function sugar(){
  const host = $("#sugar");
  const scrub = $("#sugarScrub");
  if (!host || !scrub) return;

  const caps = $$("#sugarCaption span");
  let BODY, STAGES, keys, els = new Map(), cw = 10, maxCols = 1;

  // monochrome, Algol style: weight and slope carry the syntax, never hue
  function palette(ch, kind){
    if (kind === "kw")  return "kw";
    if (kind === "str") return "st";
    return "";
  }

  function compose(){
    BODY = innerWidth < 700 ? "Hello Autolith!" : "Hello Autolith! How do you do?";
    const PRE  = "(prompt ";
    const MID  = ":to 'autolith ";
    const Q    = '"';
    const SUF  = '")';

    // keyed character sets
    keys = [];
    const add = (id, ch, kind) => keys.push({ id, ch, kind });
    [...PRE].forEach((ch, i) => add("p" + i, ch, i >= 1 && i <= 6 ? "kw" : ""));
    [...MID].forEach((ch, i) => add("m" + i, ch, i < 3 ? "kw" : ""));
    add("q0", Q, "str");
    [...BODY].forEach((ch, i) => add("b" + i, ch, "str"));
    [...SUF].forEach((ch, i) => add("s" + i, ch, i === 0 ? "str" : ""));

    // stage layouts: id -> column, or undefined when absent
    const L0 = {}, L1 = {}, L2 = {};
    [...BODY].forEach((_, i) => { L0["b" + i] = i; });

    let c = 0;
    [...PRE].forEach((_, i) => { L1["p" + i] = c++; });
    L1["q0"] = c++;
    [...BODY].forEach((_, i) => { L1["b" + i] = c++; });
    [...SUF].forEach((_, i) => { L1["s" + i] = c++; });
    const w1 = c;

    c = 0;
    [...PRE].forEach((_, i) => { L2["p" + i] = c++; });
    [...MID].forEach((_, i) => { L2["m" + i] = c++; });
    L2["q0"] = c++;
    [...BODY].forEach((_, i) => { L2["b" + i] = c++; });
    [...SUF].forEach((_, i) => { L2["s" + i] = c++; });
    const w2 = c;

    STAGES = [L0, L1, L2];
    maxCols = Math.max(BODY.length, w1, w2);

    host.innerHTML = "";
    els = new Map();
    for (const k of keys){
      const b = document.createElement("b");
      b.textContent = k.ch === " " ? " " : k.ch;
      const cls = palette(k.ch, k.kind);
      if (cls) b.className = cls;
      host.append(b);
      els.set(k.id, b);
    }
  }

  function measure(){
    const stage = host.parentElement;
    const avail = stage.getBoundingClientRect().width || innerWidth;
    // fit font size so the widest stage fits
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-family:var(--mono);font-size:100px";
    probe.textContent = "M".repeat(10);
    document.body.append(probe);
    const per100 = probe.getBoundingClientRect().width / 10;
    probe.remove();
    let fs = avail / (maxCols * (per100 / 100));
    fs = clamp(fs, 9, innerWidth < 700 ? 19 : 42);
    host.parentElement.style.fontSize = fs + "px";
    cw = fs * (per100 / 100);
  }

  function render(pair, t){
    const A = STAGES[pair[0]], B = STAGES[pair[1]];
    for (const k of keys){
      const el = els.get(k.id);
      const a = A[k.id], b = B[k.id];
      let col, op;
      if (a !== undefined && b !== undefined){ col = lerp(a, b, t); op = 1; }
      else if (a !== undefined){ col = a; op = 1 - t; }
      else if (b !== undefined){ col = b; op = t; }
      else { el.style.opacity = 0; continue; }
      el.style.transform = `translateX(${(col * cw).toFixed(2)}px)`;
      el.style.opacity = op.toFixed(3);
    }
  }

  const SEG = [{ a: 0, b: 1, from: .14, to: .44 }, { a: 1, b: 2, from: .56, to: .86 }];

  function update(){
    const r = scrub.getBoundingClientRect();
    const total = r.height - innerHeight;
    let p = total > 0 ? clamp(-r.top / total, 0, 1) : (r.top < 0 ? 1 : 0);
    if (FORCE_STAGE !== null) p = [0, .5, 1][FORCE_STAGE];

    let pair = [0, 0], t = 0, active = 0;
    if (p < SEG[0].from){ pair = [0, 1]; t = 0; active = 0; }
    else if (p < SEG[0].to){ pair = [0, 1]; t = easeIO((p - SEG[0].from) / (SEG[0].to - SEG[0].from)); active = t > .5 ? 1 : 0; }
    else if (p < SEG[1].from){ pair = [1, 1]; t = 0; active = 1; }
    else if (p < SEG[1].to){ pair = [1, 2]; t = easeIO((p - SEG[1].from) / (SEG[1].to - SEG[1].from)); active = t > .5 ? 2 : 1; }
    else { pair = [2, 2]; t = 0; active = 2; }

    render(pair, t);
    caps.forEach((c, i) => c.classList.toggle("on", i === active));
  }

  function rebuild(){ compose(); measure(); update(); }
  rebuild();
  addEventListener("resize", rebuild);
  if (document.fonts) document.fonts.ready.then(rebuild);
  onTick(update);
}

/* ------------------------------------------------------------ diagrams
   One builder for every figure on the page. Boxes, arrows, labels, drawn
   in ink on paper and animated in reading order. */
const NS = "http://www.w3.org/2000/svg";
const svgEl = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
function svgText(x, y, str, size, anchor, cls){
  const t = svgEl("text", { x, y, "font-size": size, "text-anchor": anchor || "middle" });
  if (cls) t.setAttribute("class", cls);
  t.textContent = str;
  return t;
}
function svgLines(x, y, lines, size, anchor, cls){
  const g = svgEl("g", cls ? { class: cls } : {});
  const step = size * 1.25;
  const top = y - ((lines.length - 1) * step) / 2;
  lines.forEach((l, i) => g.append(svgText(x, top + i * step + size * 0.34, l, size, anchor)));
  return g;
}

function flow(host, spec){
  const svg = svgEl("svg", { viewBox: `0 0 ${spec.w} ${spec.h}`, width: spec.w, height: spec.h, preserveAspectRatio: "xMidYMid meet" });
  const at = {};
  for (const n of spec.nodes) at[n.id] = n;

  const marker = svgEl("marker", { id: spec.id + "-tip", viewBox: "0 0 8 8", refX: 7, refY: 4,
    markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
  marker.append(svgEl("path", { d: "M0 0 L8 4 L0 8 z", fill: "currentColor" }));
  const defs = svgEl("defs", {});
  defs.append(marker);
  svg.append(defs);

  const edges = [], nodes = [];

  // edges first, so boxes sit on top of their arrowheads
  for (const e of spec.edges){
    const a = at[e.from], b = at[e.to];
    const ax = e.fromSide === "b" ? a.x + a.w / 2 : (e.fromSide === "t" ? a.x + a.w / 2 : a.x + a.w);
    const ay = e.fromSide === "b" ? a.y + a.h : (e.fromSide === "t" ? a.y : a.y + a.h / 2);
    const bx = e.toSide === "t" ? b.x + b.w / 2 : (e.toSide === "b" ? b.x + b.w / 2 : b.x);
    const by = e.toSide === "t" ? b.y : (e.toSide === "b" ? b.y + b.h : b.y + b.h / 2);
    let d;
    if (e.fromSide === "b" || e.fromSide === "t" || e.toSide === "t" || e.toSide === "b"){
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      d = `M${ax} ${ay} C ${ax} ${my}, ${bx} ${my}, ${bx} ${by}`;
      if (Math.abs(ax - bx) > 4 && Math.abs(ay - by) < 4) d = `M${ax} ${ay} L${bx} ${by}`;
      if (e.elbow) d = `M${ax} ${ay} L${ax} ${my} L${bx} ${my} L${bx} ${by}`;
    } else {
      d = `M${ax} ${ay} L${bx} ${by}`;
    }
    const p = svgEl("path", { d, class: "edge" + (e.dashed ? " dash" : ""),
      "marker-end": `url(#${spec.id}-tip)` });
    svg.append(p);
    edges.push({ el: p, order: e.order ?? 1 });
    if (e.label){
      const lx = e.lx ?? (ax + bx) / 2, ly = e.ly ?? (ay + by) / 2 - 7;
      const g = svgLines(lx, ly, Array.isArray(e.label) ? e.label : [e.label], 9, "middle", "node edgelabel");
      svg.append(g);
      nodes.push({ el: g, order: (e.order ?? 1) + 0.5 });
    }
  }

  for (const n of spec.nodes){
    const g = svgEl("g", { class: "node " + (n.kind || "boxn") });
    if (n.kind !== "bare"){
      g.append(svgEl("rect", { x: n.x, y: n.y, width: n.w, height: n.h }));
    }
    const lines = Array.isArray(n.label) ? n.label : [n.label];
    g.append(svgLines(n.x + n.w / 2, n.y + n.h / 2, lines, n.size || 10, "middle"));
    svg.append(g);
    nodes.push({ el: g, order: n.order ?? 0 });
  }

  host.append(svg);

  for (const e of edges){
    let len = 260;
    try { const v = e.el.getTotalLength(); if (v && isFinite(v)) len = v; } catch {}
    e.el.style.setProperty("--len", len.toFixed(1));
  }

  const play = () => {
    const step = 240;
    const all = nodes.concat(edges);
    if (STILL){ all.forEach(o => o.el.classList.add("on")); return; }
    all.forEach(o => setTimeout(() => o.el.classList.add("on"), 200 + o.order * step));
  };

  if (STILL){ play(); return; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ play(); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(host);
}

function figures(){
  const mut = $("#mutFig");
  if (mut) flow(mut, {
    id: "mut", w: 392, h: 356,
    nodes: [
      { id: "src", x: 122, y: 4,   w: 148, h: 40, label: "tracked source", size: 12, order: 0 },
      { id: "img", x: 122, y: 88,  w: 148, h: 40, label: "active image", size: 12, order: 1 },
      { id: "jrn", x: 122, y: 172, w: 148, h: 44, label: ["mutation journal"], size: 12, order: 2 },
      { id: "exr", x: 288, y: 176, w: 100, h: 36, label: ["self.exercise", "asserts"], kind: "bare", size: 10, order: 3 },
      { id: "dis", x: 4,   y: 264, w: 158, h: 44, label: ["discarded,", "image restored"], size: 11, order: 4 },
      { id: "com", x: 222, y: 264, w: 166, h: 44, label: ["private", "image commit"], kind: "boxn solid", size: 11, order: 4 },
      { id: "rep", x: 222, y: 322, w: 166, h: 22, label: "replays at next start", kind: "bare", size: 10, order: 5 }
    ],
    edges: [
      { from: "src", to: "img", fromSide: "b", toSide: "t", order: 1, label: "loads", lx: 236, ly: 70 },
      { from: "img", to: "jrn", fromSide: "b", toSide: "t", order: 2, label: "self.redefine", lx: 254, ly: 154 },
      { from: "jrn", to: "dis", fromSide: "b", toSide: "t", elbow: true, order: 3, label: "self.discard", lx: 46, ly: 244 },
      { from: "jrn", to: "com", fromSide: "b", toSide: "t", elbow: true, order: 4, label: "self.commit", lx: 346, ly: 244 },
      { from: "jrn", to: "exr", order: 3, dashed: true }
    ]
  });

  const rec = $("#recFig");
  if (rec) flow(rec, {
    id: "rec", w: 392, h: 348,
    nodes: [
      { id: "brk", x: 4,   y: 4,   w: 154, h: 40, label: "bad redefinition", size: 12, order: 0 },
      { id: "cap", x: 4,   y: 84,  w: 154, h: 40, label: "crash capsule", size: 12, order: 1 },
      { id: "pri", x: 4,   y: 164, w: 154, h: 46, label: ["pristine", "recovery image"], kind: "boxn solid", size: 11, order: 2 },
      { id: "gen", x: 238, y: 164, w: 150, h: 46, label: ["known-good", "generation"], size: 11, order: 3 },
      { id: "dia", x: 4,   y: 280, w: 384, h: 46, label: ["read-only diagnosis turn", "inspect, report, ask"], size: 11, order: 5 }
    ],
    edges: [
      { from: "brk", to: "cap", fromSide: "b", toSide: "t", order: 1, label: "written", lx: 116, ly: 66 },
      { from: "cap", to: "pri", fromSide: "b", toSide: "t", order: 2, label: "boots", lx: 110, ly: 146 },
      { from: "pri", to: "gen", order: 3, label: "selects", lx: 198, ly: 179 },
      { from: "gen", to: "dia", fromSide: "b", toSide: "t", elbow: true, order: 4, label: "conversation restored", lx: 236, ly: 231 }
    ]
  });
}

/* --------------------------------------------------------- rlm fan-out */
function rlm(){
  const host = $("#rlmViz");
  if (!host) return;
  const W = 500, H = 420;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
  const mk = svgEl;
  const txt = svgText;

  const COL_ROOT = 150, COL_F = 300, COL_S = 424, MID = 220;

  // column captions
  const caps = mk("g", { class: "caps" });
  caps.append(txt(48, 14, "corpus", 10, "middle"));
  caps.append(txt(COL_ROOT, 14, "root frame", 10, "middle"));
  caps.append(txt(COL_F, 14, "frames", 10, "middle"));
  caps.append(txt(COL_S - 16, 14, "sub-inferences", 10, "middle"));
  svg.append(caps);

  // corpus object
  const corpusG = mk("g", { class: "node corpus" });
  corpusG.append(mk("rect", { x: 8, y: MID - 42, width: 80, height: 84 }));
  corpusG.append(txt(48, MID - 12, "3.1 MB", 13, "middle", "big"));
  corpusG.append(txt(48, MID + 6, "content-", 9, "middle"));
  corpusG.append(txt(48, MID + 18, "addressed", 9, "middle"));
  corpusG.append(txt(48, MID + 32, "sha256", 8, "middle"));
  svg.append(corpusG);

  const dash = mk("path", { d: `M88 ${MID} H ${COL_ROOT - 20}`, class: "edge dash" });
  svg.append(dash);

  const root = { x: COL_ROOT, y: MID };
  const l1 = [54, 120, 186, 252, 326].map(y => ({ x: COL_F, y }));
  const l2 = [];
  const spread = { 0: [34, 76], 1: [110, 148], 3: [242, 276], 4: [312, 348] };
  for (const k in spread) for (const y of spread[k]) l2.push({ x: COL_S, y, parent: +k });

  const edges = [];
  const addEdge = (a, b, order) => {
    const m = (a.x + b.x) / 2;
    const p = mk("path", { d: `M${a.x} ${a.y} C ${m} ${a.y}, ${m} ${b.y}, ${b.x} ${b.y}`, class: "edge" });
    svg.append(p);
    edges.push({ el: p, order });
  };
  l1.forEach(n => addEdge(root, n, 1));
  l2.forEach(n => addEdge(l1[n.parent], n, 3));

  const nodes = [];
  const addNode = (n, r, order, cls) => {
    const g = mk("g", { class: "node " + cls });
    g.append(mk("circle", { cx: n.x, cy: n.y, r }));
    svg.append(g);
    nodes.push({ el: g, order, cls });
    return g;
  };
  const rootG = addNode(root, 19, 0, "root");
  rootG.append(txt(root.x, root.y + 3.4, "root", 9, "middle"));
  l1.forEach(n => addNode(n, 8.5, 2, "frame"));
  l2.forEach(n => addNode(n, 4.5, 4, "leaf"));

  host.append(svg);

  const armEdges = () => {
    for (const e of edges.concat([{ el: dash }])){
      let len = 300;
      try { const v = e.el.getTotalLength(); if (v && isFinite(v)) len = v; } catch {}
      e.el.style.setProperty("--len", len.toFixed(1));
    }
  };
  armEdges();

  const play = () => {
    const step = 250;
    if (STILL){
      corpusG.classList.add("on"); dash.classList.add("on"); caps.classList.add("on");
      [...edges, ...nodes].forEach(o => o.el.classList.add("on"));
      nodes.filter(o => o.cls === "leaf").forEach(o => o.el.classList.add("lit"));
      return;
    }
    caps.classList.add("on");
    corpusG.classList.add("on");
    setTimeout(() => dash.classList.add("on"), 220);
    nodes.concat(edges).forEach(o => setTimeout(() => o.el.classList.add("on"), 340 + o.order * step));
    const leaves = nodes.filter(o => o.cls === "leaf");
    setTimeout(() => leaves.forEach((o, i) => setTimeout(() => o.el.classList.add("lit"), i * 110)), 340 + 5.4 * step);
    setTimeout(() => nodes.filter(o => o.cls === "frame").forEach((o, i) => setTimeout(() => o.el.classList.add("ret"), i * 110)), 340 + 7.4 * step);
    setTimeout(() => rootG.classList.add("ret"), 340 + 9.6 * step);
  };

  if (STILL){ play(); return; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ play(); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(host);
}

/* --------------------------------------------------------- image box */
function imagebox(){
  const box = $("#imagebox");
  if (!box) return;
  const cells = $$("i", box);
  let timer = null;
  const io = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !timer && !STILL){
      timer = setInterval(() => {
        cells.forEach(c => c.classList.remove("lit"));
        cells[Math.floor(Math.random() * cells.length)].classList.add("lit");
      }, 900);
    } else if (!es[0].isIntersecting && timer){
      clearInterval(timer); timer = null;
      cells.forEach(c => c.classList.remove("lit"));
    }
  }, { threshold: 0.25 });
  io.observe(box);
}

/* ------------------------------------------------------------ tabs etc */
function tabs(){
  $$(".tabgroup").forEach(group => {
    const btns = $$("[data-tab]", group);
    const panels = $$("[data-tabpanel]", group);
    btns.forEach(b => b.addEventListener("click", () => {
      btns.forEach(o => o.setAttribute("aria-selected", String(o === b)));
      panels.forEach(p => p.hidden = p.dataset.tabpanel !== b.dataset.tab);
    }));
  });
}

/* ------------------------------------------------------- copy buttons */
function copy(){
  $$("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        if (navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(text);
        else {
          const f = document.createElement("textarea");
          f.value = text; f.setAttribute("readonly", ""); f.style.cssText = "position:fixed;opacity:0";
          document.body.append(f); f.select(); document.execCommand("copy"); f.remove();
        }
        const old = btn.textContent;
        btn.textContent = "Copied"; btn.classList.add("ok");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("ok"); }, 1800);
      } catch { btn.textContent = "Copy failed"; }
    });
  });
}

/* ------------------------------------------------------ asciinema load */
function casts(){
  $$(".player").forEach(p => {
    const btn = $(".player__load", p);
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (typeof AsciinemaPlayer === "undefined") return;
      const poster = $(".player__poster", p);
      const mount = document.createElement("div");
      mount.style.cssText = "position:absolute;inset:0";
      p.append(mount);
      AsciinemaPlayer.create(p.dataset.cast, mount, {
        cols: +p.dataset.cols || 120,
        rows: +p.dataset.rows || 34,
        fit: "both",
        autoPlay: true,
        idleTimeLimit: 2,
        theme: "asciinema",
        terminalFontFamily: '"CMUT","CMU Typewriter Text",monospace'
      });
      poster && poster.classList.add("gone");
    });
  });
}


/* ------------------------------------------------- the reader, live
   Prose is sugar for (prompt ...). A form is already a form. The page
   applies the same rule Autolith applies, on whatever you type. */
function tryit(){
  const input = $("#replInput");
  const out = $("#replOut");
  const note = $("#replNote");
  if (!input || !out) return;

  const esc = s => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const tag = (cls, text) => {
    const e = document.createElement("span");
    if (cls) e.className = cls;
    e.textContent = text;
    return e;
  };

  let prevBody = "";

  function render(){
    const raw = input.value;
    const text = raw.trim();
    out.textContent = "";

    if (!text){
      out.append(tag("dimmed", "(prompt :to 'autolith \"…\")"));
      note.textContent = "Read as a call to (prompt), addressed to the primary agent.";
      note.classList.remove("is-form");
      prevBody = "";
      return;
    }

    if (text[0] === "("){
      out.append(tag(null, text));
      note.textContent = "Already a form. It is read, evaluated in the active image, and the model sees the result.";
      note.classList.add("is-form");
      prevBody = "";
      return;
    }

    const body = esc(text);
    out.append(tag(null, "("));
    out.append(tag("kw", "prompt"));
    out.append(tag(null, " "));
    out.append(tag("kw", ":to"));
    out.append(tag(null, " 'autolith "));

    // the wrapper holds still; only the part you just typed lights up
    const shared = body.startsWith(prevBody) ? prevBody.length : 0;
    out.append(tag("st", '"' + body.slice(0, shared)));
    if (shared < body.length) out.append(tag("st fresh", body.slice(shared)));
    out.append(tag("st", '"'));
    out.append(tag(null, ")"));
    prevBody = body;

    note.textContent = "Read as a call to (prompt), addressed to the primary agent.";
    note.classList.remove("is-form");

    if (!STILL){
      const fresh = $(".fresh", out);
      if (fresh) setTimeout(() => fresh.classList.remove("fresh"), 260);
    }
  }

  input.addEventListener("input", render);
  render();
}


/* --------------------------------------------------------------- swell
   An ordered-dither sea. The page is paper at the top of the band and ink
   at the bottom, and the line between them is a moving wave. Two tones and
   a 4x4 Bayer threshold, nothing in between. */
function swell(){
  const cv = $("#swell");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const host = cv.parentElement;
  const CELL = 3;
  const BAYER = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];

  let cw = 0, ch = 0, img = null, data = null;

  function resize(){
    const r = host.getBoundingClientRect();
    cw = Math.max(1, Math.ceil(r.width / CELL));
    ch = Math.max(1, Math.ceil(r.height / CELL));
    cv.width = cw; cv.height = ch;
    ctx.imageSmoothingEnabled = false;
    img = ctx.createImageData(cw, ch);
    data = img.data;
  }

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(host);

  const t0 = performance.now();
  let lastDraw = 0;

  function frame(now){
    if (!visible || !data) return;
    if (now - lastDraw < 55) return;                 // 18fps is plenty for a sea
    lastDraw = now;
    const t = STILL ? 0 : (now - t0) / 1000;

    for (let y = 0; y < ch; y++){
      const sy = y / ch;
      for (let x = 0; x < cw; x++){
        const fx = x / cw;
        // stacked swells, with a sharpened crest so it breaks rather than rolls
        let h = Math.sin(fx * 5.6 + t * 0.42)
              + 0.52 * Math.sin(fx * 11.3 - t * 0.31)
              + 0.28 * Math.sin(fx * 21.7 + t * 0.67);
        h = h / 1.8;
        const surface = 0.34 + 0.21 * h + 0.07 * Math.sign(h) * h * h;
        const below = sy - surface;
        let ink = below <= 0 ? 0 : below * 1.7;
        if (below > 0 && below < 0.055) ink += 0.5;   // foam along the crest
        if (ink > 1) ink = 1;
        const on = ink * 17 > BAYER[(y & 3) * 4 + (x & 3)];
        const i = (y * cw + x) * 4;
        data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
        data[i + 3] = on ? 255 : 0;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  resize();
  addEventListener("resize", () => { resize(); frame(performance.now() + 1e6); });
  if (STILL) frame(performance.now() + 1e6);
  else onTick(frame);
}

/* -------------------------------------------------------------- boot */
function boot(){
  splitAll();
  observeReveals();
  navSetup();
  monolith();
  sugar();
  rlm();
  figures();
  swell();
  imagebox();
  tabs();
  tryit();
  copy();
  casts();

  let rt = null;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { splitAll(); $$("[data-split]").forEach(e => e.classList.add("in")); }, 220);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
    splitAll();
    $$("[data-split]").forEach(e => { const r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add("in"); });
    observeReveals();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();

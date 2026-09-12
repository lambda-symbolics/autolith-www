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
   gap, and the discarded brick tumbles into the grass and dissolves. New
   bricks are only ever dropped onto the top. A brick can also be recut in
   place, turned a quarter, or split in two, and every so often a bar runs
   up the whole stack and reads it back. Weather happens above it.

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
  const TURN = 0.92;              // a quarter turn in place
  const OUT = 0.44;               // how long a brick takes to slide clear
  const REST = 0.30;              // how long it lies in the grass first
  const GONE = 0.46;              // how long the discarded brick takes to go
  const RISE = 0.66;              // how high a new brick starts above the top
  const SCAN = 1.5;               // how long the bar takes to read the stack
  const DUST = 0.62;              // how long a cloud of dust hangs about

  let N = 21, TH = 0;
  const JOINT = 1;                // bricks sit flush. an open joint turns the
                                  // tower into a stack of plates seen head on
  let stack = [], loose = [], puffs = [], clouds = [], flock = null;
  let lastYaw = 0, gust = 0, scan = null;

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
  const brick = (g, y) => ({ ...g, y, vy: 0, sq: 0, glow: 0,
                             cut: null, pull: null, turn: null });
  const idle = b => !b.pull && !b.cut && !b.turn && b.vy === 0;

  /* a piece that has left the tower and is on its own */
  const piece = (g, y, ox, oz, vx, vz, vy) => ({
    g, y, ox, oz, vx, vz, vy: vy || 0,
    rx: 0, ry: 0,
    vrx: (Math.random() - 0.5) * 3.2,
    vry: (Math.random() - 0.5) * 2.0,
    sq: 0, dead: null, fl: 0.85
  });

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

  /* the weather. kept off the narrow layout, where the block has no sky. */
  function sky(){
    clouds = [];
    flock = null;
    if (mobile) return;
    for (let i = 0; i < 2; i++)
      clouds.push({ u: Math.random(), h: Math.random(),
                    r: 0.048 + Math.random() * 0.026,
                    n: 4 + ((Math.random() * 3) | 0),
                    v: 0.010 + Math.random() * 0.009,
                    p: Math.random() * 6.2832 });
  }

  function build(){
    mobile = innerWidth < 900;
    N = mobile ? 14 : 21;
    TH = 2 / N;
    stack = []; loose = []; puffs = []; scan = null;
    for (let i = 0; i < N; i++) stack.push(brick(seedGeom(i), -1 + i * TH));
    grow();
    sky();
  }

  /* --------------------------------------------------------- what it does */
  let nextMove = 1.0, nextScan = 7.0, nextFlock = 5.0;

  const free = () => {
    const pick = [];
    for (let i = 0; i < stack.length; i++) if (idle(stack[i])) pick.push(i);
    return pick;
  };

  function pullOut(){
    /* never the bottom course, and never one already busy */
    const pick = [];
    for (let i = 1; i < stack.length; i++) if (idle(stack[i])) pick.push(i);
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
    const pick = free();
    if (!pick.length) return;
    const b = stack[pick[(Math.random() * pick.length) | 0]];
    b.cut = { t: 0, to: recutGeom(b), done: false };
  }

  /* a quarter turn in place. the brick keeps its volume and loses its
     footprint, which is the cheapest way to show a definition changing
     shape without anything leaving the tower. */
  function turnOne(){
    const pick = free();
    if (!pick.length) return;
    const b = stack[pick[(Math.random() * pick.length) | 0]];
    if (Math.abs(b.w - b.d) < 0.02) return;
    b.turn = { t: 0, dir: Math.random() < 0.5 ? 1 : -1 };
  }

  /* one definition becomes two. the smaller part is not needed. */
  function splitOne(){
    const pick = free();
    if (!pick.length) return;
    const i = pick[(Math.random() * pick.length) | 0];
    const b = stack[i];
    if (b.w < 0.20) return;
    const side = Math.random() < 0.5 ? -1 : 1;
    const cut = b.w * (0.32 + Math.random() * 0.22);
    loose.push(piece({ w: cut, d: b.d }, b.y,
                     b.ox + side * (b.w - cut), b.oz,
                     side * (0.20 + Math.random() * 0.16), 0, 0.42));
    b.ox = clamp(b.ox - side * cut * 0.5, -0.07, 0.07);   // the stack stays a stack
    b.w -= cut;
    b.glow = 1;
    puff(b.ox + side * b.w, b.y + TH * 0.5, b.oz, 0.55, b.d);
  }

  function schedule(t){
    const n = stack.length;
    const roll = Math.random();
    if (n > N + 1) pullOut();
    else if (n < N - 2) dropTop();
    else if (roll < 0.26) pullOut();
    else if (roll < 0.52) dropTop();
    else if (roll < 0.71) recutOne();
    else if (roll < 0.88) turnOne();
    else splitOne();
    nextMove = t + 0.9 + Math.random() * 1.3;
  }

  /* how wide a brick is mid-recut, and how hot it still is */
  function amount(c){
    if (!c) return 1;
    const h = RECUT * 0.45;
    return c.t < h ? 1 - 0.9 * easeIO(c.t / h)
                   : 0.1 + 0.9 * easeIO((c.t - h) / (RECUT - h));
  }
  const cutFlash = c => c ? clamp(1 - c.t / (RECUT * 0.75), 0, 1) : 0;

  /* dust, where something landed */
  function puff(x, y, z, s, r){
    if (s < 0.12) return;
    puffs.push({ x, y, z, t: 0, s: clamp(s, 0, 1), r: r || 0.2 });
  }

  const wind = t => 0.55 * Math.sin(t * 0.29)
                  + 0.30 * Math.sin(t * 0.11 + 1.7)
                  + 0.20 * Math.sin(t * 0.71 + 0.4);

  /* the height the reading bar has reached */
  const scanY = () => -1 + (scan.t / SCAN) * (TH * (stack.length + 1.2));

  /* ------------------------------------------------------------ the physics */
  function step(dt, t){
    gust = wind(t);
    if (t > nextMove) schedule(t);
    if (!scan && t > nextScan){ scan = { t: 0 }; nextScan = t + 11 + Math.random() * 9; }
    if (!mobile && !flock && t > nextFlock){
      const n = 3 + ((Math.random() * 4) | 0);
      flock = { t: 0, dir: Math.random() < 0.5 ? 1 : -1,
                sp: 0.24 + Math.random() * 0.12, b: [] };
      for (let i = 0; i < n; i++)
        flock.b.push({ o: -i * (0.10 + Math.random() * 0.07),
                       d: (Math.random() - 0.5) * 0.075,
                       ph: Math.random() * 6.2832 });
      nextFlock = t + 22 + Math.random() * 26;
    }

    if (scan){
      const yb = scanY();
      for (const b of stack)
        if (yb >= b.y - TH * 0.3 && yb <= b.y + TH * 1.3) b.glow = Math.max(b.glow, 0.66);
      scan.t += dt;
      if (scan.t > SCAN) scan = null;
    }
    if (flock){
      flock.t += dt;
      if (flock.t * flock.sp > 3.4) flock = null;
    }

    /* bricks on their way out. the tower only settles once one is clear. */
    for (let i = stack.length - 1; i >= 0; i--){
      const b = stack[i];
      if (!b.pull) continue;
      b.pull.t += dt;
      if (b.pull.t >= OUT){
        stack.splice(i, 1);
        loose.push(piece({ w: b.w, d: b.d }, b.y,
                         b.ox + b.pull.dx * 0.52, b.oz + b.pull.dz * 0.52,
                         b.pull.dx * (0.05 + Math.random() * 0.07),
                         b.pull.dz * (0.05 + Math.random() * 0.07), 0));
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
          if (hit > 0.3){
            b.sq = Math.min(1, hit / 2.2);
            puff(b.ox, b.y, b.oz, Math.min(1, hit / 1.9), Math.max(b.w, b.d) * 1.25);
          }
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
      if (b.turn){
        b.turn.t += dt;
        if (b.turn.t >= TURN){
          const w = b.w; b.w = b.d; b.d = w;
          b.turn = null;
        }
      }
    }

    /* the discarded piece tumbles into the grass and goes */
    for (let k = loose.length - 1; k >= 0; k--){
      const l = loose[k];
      if (l.dead !== null){
        l.dead += dt;
        if (l.dead > GONE) loose.splice(k, 1);
        continue;
      }
      l.vy -= G * dt;
      l.y  += l.vy * dt;
      l.ox = clamp(l.ox + l.vx * dt, -0.72, 0.72);    // rubble stays in frame
      l.oz = clamp(l.oz + l.vz * dt, -0.62, 0.62);
      l.rx += l.vrx * dt;
      l.ry += l.vry * dt;
      if (l.y <= -1){
        const hit = -l.vy;
        l.y = -1;
        puff(l.ox, -1, l.oz, Math.min(1, hit / 1.9), Math.max(l.g.w, l.g.d) * 1.4);
        if (hit > 0.75){
          l.vy = hit * 0.24;
          l.sq = Math.min(1, hit / 2.4);
          l.vx *= 0.45; l.vz *= 0.45;
          l.vrx *= 0.35; l.vry *= 0.35;
        } else {
          l.vy = 0; l.vx = 0; l.vz = 0;
          l.vrx = 0; l.vry = 0;
          l.rx = Math.round(l.rx / 1.5708) * 1.5708;   // it comes to rest square
          l.dead = -REST;
        }
      }
      if (l.sq > 0) l.sq = Math.max(0, l.sq - dt * 7);
      if (l.fl > 0) l.fl = Math.max(0, l.fl - dt * 1.7);   // it cools as it falls
    }

    for (let k = puffs.length - 1; k >= 0; k--){
      puffs[k].t += dt;
      if (puffs[k].t > DUST) puffs.splice(k, 1);
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

  /* corners of a box, indexed by sign bits: 1 is +x, 2 is +y, 4 is +z */
  const QUAD  = [[1,5,7,3], [0,4,6,2], [2,3,7,6], [0,1,5,4], [4,5,7,6], [0,1,3,2]];
  const ORDER = [0, 1, 4, 5, 2, 3];

  /* a rotation about the brick's own centre: tumble first, then turn */
  function spin(r, x, y, z){
    if (r.x){
      const c = Math.cos(r.x), s = Math.sin(r.x);
      const y2 = y * c - z * s; z = y * s + z * c; y = y2;
    }
    if (r.y){
      const c = Math.cos(r.y), s = Math.sin(r.y);
      const x2 = x * c + z * s; z = z * c - x * s; x = x2;
    }
    return [x, y, z];
  }

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

    /* a face's tone and whether the camera can see it */
    function shade(nx, ny, nz){
      const X = nx * cy_ + nz * sy_;
      const Z = nz * cy_ - nx * sy_;
      const Y2 = ny * cp_ + Z * sp_;
      const Z2 = Z * cp_ - ny * sp_;
      const lum = 0.10 + 0.86 * Math.max(0, X * LX + Y2 * LY + Z2 * LZ);
      return [clamp(Math.round((1 - lum) * 16), 1, 16), Z2 < -0.02];
    }

    /* one tone per face orientation, shared by every brick that stands square */
    const tone = new Array(6), shown = new Array(6);
    for (let f = 0; f < 6; f++){
      const s = shade(FACES[f][0], FACES[f][1], FACES[f][2]);
      tone[f] = clamp(s[0] + BIAS[f], 1, 16);
      shown[f] = s[1];
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

    /* --------------------------------------------------------- the weather
       A cloud gathers, crosses, and comes apart again, so it can drift the
       whole width without ever popping into existence over the type. Birds
       keep to the empty band under the nav. */
    if (clouds.length){
      for (const c of clouds){
        const u = (c.u + t * c.v) % 1;
        const g = Math.sin(Math.PI * u);
        if (g < 0.06) continue;
        const R = c.r * sc * (0.22 + 0.78 * g);
        const X = cx + (u * 2.7 - 1.35) * sc;
        const Y = Math.max(rh * 0.12, (0.165 + c.h * 0.085) * rh);
        og.fillStyle = tiles[clamp(Math.round(1 + 5.6 * g), 1, 6)];
        og.beginPath();
        for (let k = 0; k < c.n; k++){
          const f = c.n === 1 ? 0.5 : k / (c.n - 1);
          const rr = R * (0.26 + 0.36 * Math.sin(Math.PI * f)
                              + 0.09 * Math.sin(c.p + k * 2.1));
          og.ellipse(X + (f - 0.5) * R * 1.9, Y - rr * 0.52, rr, rr * 0.86, 0, 0, 6.2832);
        }
        og.fill();
      }
    }
    if (flock){
      og.strokeStyle = "#000000";
      og.lineWidth = 1;
      for (const b of flock.b){
        const u = -0.12 + (flock.t * flock.sp + b.o) * 0.42;
        if (u < -0.1 || u > 1.12) continue;
        const X = flock.dir > 0 ? u * rw : (1 - u) * rw;
        const Y = (0.135 + b.d) * rh + Math.sin(flock.t * 0.9 + b.ph) * rh * 0.014;
        const sp = sc * 0.036;                                  // half a span
        const up = 0.22 + 0.78 * (0.5 + 0.5 * Math.sin(flock.t * 6.2 + b.ph));
        og.beginPath();
        og.moveTo(X - sp, Y - sp * 0.78 * up);
        og.quadraticCurveTo(X - sp * 0.44, Y - sp * 0.34 * up, X, Y);
        og.quadraticCurveTo(X + sp * 0.44, Y - sp * 0.34 * up, X + sp, Y - sp * 0.78 * up);
        og.stroke();
      }
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
      const off1 = f.lean * f.h + sway + gust * f.h * 0.42;
      const off2 = f.leanz * f.h + Math.cos(t * 0.73 + f.ph) * 0.020 + gust * f.h * 0.14;
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

    /* dust, drawn as a ring so it never wipes out what it sits on */
    function dust(){
      for (const p of puffs){
        const e = p.t / DUST;
        const k = Math.round((1 - e) * (1 - e) * 8 * p.s);
        if (k < 1) continue;
        const rr = p.r * (0.45 + 2.4 * easeIO(e)) * sc;
        const c = px(p.x, p.y + 0.01, p.z);
        og.fillStyle = tiles[k];
        og.beginPath();
        og.ellipse(c[0], c[1], rr * c[2], rr * c[2] * 0.32, 0, 0, 6.2832);
        og.ellipse(c[0], c[1], rr * c[2] * 0.66, rr * c[2] * 0.21, 0, 0, 6.2832);
        og.fill("evenodd");
      }
    }

    const ext = 0.36 * Math.abs(sy_) + 0.23 * Math.abs(cy_);
    const infront = [];
    for (const f of flora){
      const zr = f.z * cy_ - f.x * sy_;
      if (zr < -ext) infront.push(f); else sprig(f);
    }
    dust();

    const quad = (a, b, c, d, k) => {
      og.fillStyle = tiles[k];
      og.beginPath();
      og.moveTo(a[0], a[1]); og.lineTo(b[0], b[1]);
      og.lineTo(c[0], c[1]); og.lineTo(d[0], d[1]);
      og.closePath(); og.fill();
    };

    /* one brick. rot turns it about its own centre, which is how a quarter
       turn and a tumbling offcut are drawn. */
    function cube(ox, oz, w, d, y0, h, fl, ruleY, air, rot){
      const yc = y0 + h / 2, hy = h / 2;
      const P = new Array(8);
      for (let k = 0; k < 8; k++){
        const lx = (k & 1) ? w : -w;
        const ly = (k & 2) ? hy : -hy;
        const lz = (k & 4) ? d : -d;
        const l = rot ? spin(rot, lx, ly, lz) : [lx, ly, lz];
        P[k] = px(ox + l[0], yc + l[1], oz + l[2]);
      }
      const ink = v => clamp(Math.round(v + (16 - v) * fl), 0, 16);
      for (const f of ORDER){
        let tn = tone[f], vis = shown[f];
        if (rot){
          const n = FACES[f], l = spin(rot, n[0], n[1], n[2]);
          const s = shade(l[0], l[1], l[2]);
          tn = clamp(s[0] + BIAS[f], 1, 16);
          vis = s[1];
        }
        if (!vis && !(air && f === 3)) continue;
        const q = QUAD[f];
        quad(P[q[0]], P[q[1]], P[q[2]], P[q[3]], ink(tn));
      }
      if (ruleY != null) rule(ruleY, 0.44);
    }

    function rule(y, half){
      const a = px(-half, y, 0), b = px(half, y, 0);
      const yy = Math.round((a[1] + b[1]) / 2) + 0.5;
      og.strokeStyle = "#000000";
      og.lineWidth = 1;
      og.beginPath();
      og.moveTo(a[0], yy);
      og.lineTo(b[0], yy);
      og.stroke();
    }

    /* the tower, bottom brick first, so each paints over the top of the one
       below it. a brick on its way out is held back and drawn over all of it. */
    const held = [];
    for (const b of stack){
      const k = amount(b.cut);
      const sq = 1 - 0.24 * b.sq, sw = 1 + 0.10 * b.sq;
      const w = b.w * k * sw, d = b.d * Math.max(k, 0.55) * sw;
      const fl = Math.max(b.glow, cutFlash(b.cut));
      const rot = b.turn
        ? { x: 0, y: b.turn.dir * easeIO(b.turn.t / TURN) * 1.5708 }
        : null;
      const ruleY = (b.cut && b.cut.t < RECUT * 0.26) ? b.y + TH / 2 : null;
      if (b.pull){
        const e = easeIO(clamp(b.pull.t / OUT, 0, 1));
        held.push({ ox: b.ox + b.pull.dx * 0.52 * e, oz: b.oz + b.pull.dz * 0.52 * e,
                    w, d, y: b.y, h: TH * JOINT * sq,
                    fl: Math.max(fl, e * 0.8), rot: null });
      } else {
        cube(b.ox, b.oz, w, d, b.y, TH * JOINT * sq, fl, ruleY, b.vy !== 0, rot);
      }
    }
    for (const l of loose){
      const g = l.g;
      const s = (l.dead === null || l.dead <= 0) ? 1 : 1 - easeIO(l.dead / GONE);
      if (s <= 0.02) continue;
      const sq = (1 - 0.24 * l.sq) * s;
      held.push({ ox: l.ox, oz: l.oz,
                  w: g.w * s * (1 + 0.10 * l.sq), d: g.d * s * (1 + 0.10 * l.sq),
                  y: l.y, h: TH * JOINT * sq, fl: l.fl,
                  rot: (l.rx || l.ry) ? { x: l.rx, y: l.ry } : null });
    }
    held.sort((a, b) => a.y - b.y);
    for (const h of held) cube(h.ox, h.oz, h.w, h.d, h.y, h.h, h.fl, null, true, h.rot);

    /* the bar that reads the whole stack back */
    if (scan) rule(scanY(), 0.5);

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

/* -------------------------------------------------------------- plates
   Small figures down the page, in the same one bit as the hero. Each one
   renders at a third of the page resolution and is thresholded to ink or
   paper, so nothing here is grey either. Two of them are solids lit by the
   same lamp as the tower, two are fields written a pixel at a time. */
function plates(){
  const CELL = 3;
  const LX = -0.339, LY = 0.619, LZ = -0.708;
  const FACES6 = [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]];
  const QUAD6  = [[1,5,7,3], [0,4,6,2], [2,3,7,6], [0,1,5,4], [4,5,7,6], [0,1,3,2]];

  const hash = (a, b) => {
    const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  function spin(r, x, y, z){
    if (r.x){
      const c = Math.cos(r.x), s = Math.sin(r.x);
      const y2 = y * c - z * s; z = y * s + z * c; y = y2;
    }
    if (r.y){
      const c = Math.cos(r.y), s = Math.sin(r.y);
      const x2 = x * c + z * s; z = z * c - x * s; x = x2;
    }
    return [x, y, z];
  }

  /* a camera, and the two things every solid figure needs from it */
  function view(yaw, pitch, w, h, span){
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const F = 6.5, D = 0;
    const sc = Math.min(w, h * 1.62) * span;
    const ox = w / 2, oy = h * 0.52;
    const px = (x, y, z) => {
      const X = x * cy + z * sy;
      const Z = z * cy - x * sy;
      const Y2 = y * cp + Z * sp;
      const Z2 = Z * cp - y * sp;
      const p = F / (F + Z2 + D);
      return [ox + X * sc * p, oy - Y2 * sc * p, Z2];
    };
    const cam = (x, y, z) => {
      const X = x * cy + z * sy;
      const Z = z * cy - x * sy;
      return [X, y * cp + Z * sp, Z * cp - y * sp];
    };
    const tone = (nx, ny, nz) => {
      const l = 0.10 + 0.86 * Math.max(0, nx * LX + ny * LY + nz * LZ);
      return clamp(Math.round((1 - l) * 16), 1, 16);
    };
    function quad(g, tiles, a, b, c, d, k){
      g.fillStyle = tiles[k];
      g.beginPath();
      g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
      g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]);
      g.closePath(); g.fill();
    }
    function box(g, tiles, b){
      const P = new Array(8);
      for (let k = 0; k < 8; k++){
        const lx = (k & 1) ? b.w : -b.w;
        const ly = (k & 2) ? b.h : -b.h;
        const lz = (k & 4) ? b.d : -b.d;
        const l = b.rot ? spin(b.rot, lx, ly, lz) : [lx, ly, lz];
        P[k] = px(b.x + l[0], b.y + l[1], b.z + l[2]);
      }
      for (let f = 0; f < 6; f++){
        const n = FACES6[f];
        const l = b.rot ? spin(b.rot, n[0], n[1], n[2]) : n;
        const c = cam(l[0], l[1], l[2]);
        if (c[2] >= -0.02) continue;
        const k = clamp(tone(c[0], c[1], c[2]) + (f === 2 ? -3 : 0), 1, 16);
        const q = QUAD6[f];
        quad(g, tiles, P[q[0]], P[q[1]], P[q[2]], P[q[3]], k);
      }
    }
    return { px, cam, tone, quad, box };
  }

  /* ----------------------------------------------------------- plate one
     A Mobius band. The surface is tessellated, every facet is lit from the
     same side, and the strip is painted back to front because it passes
     through its own depth twice. */
  function mobius(g, w, h, t, tiles){
    const NU = 76, NV = 3, R = 1, HW = 0.46;
    const V = view(t * 0.30, 0.46 + 0.14 * Math.sin(t * 0.23), w, h, 0.36);
    const O = [], P = [];
    for (let i = 0; i <= NU; i++){
      const u = i / NU * 6.2832;
      const c2 = Math.cos(u / 2), s2 = Math.sin(u / 2);
      const cu = Math.cos(u), su = Math.sin(u);
      const ro = [], rp = [];
      for (let j = 0; j <= NV; j++){
        const v = (j / NV - 0.5) * 2 * HW;
        const rr = R + v * c2;
        const o = [rr * cu, v * s2, rr * su];
        ro.push(o);
        rp.push(V.px(o[0], o[1], o[2]));
      }
      O.push(ro); P.push(rp);
    }
    const faces = [];
    for (let i = 0; i < NU; i++)
      for (let j = 0; j < NV; j++){
        const a = P[i][j], b = P[i + 1][j], c = P[i + 1][j + 1], d = P[i][j + 1];
        const oa = O[i][j], ob = O[i + 1][j], od = O[i][j + 1];
        const ux = ob[0] - oa[0], uy = ob[1] - oa[1], uz = ob[2] - oa[2];
        const vx = od[0] - oa[0], vy = od[1] - oa[1], vz = od[2] - oa[2];
        let n = V.cam(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
        const m = Math.hypot(n[0], n[1], n[2]) || 1;
        const f = n[2] > 0 ? -1 / m : 1 / m;       // a band has no far side
        faces.push([a, b, c, d, (a[2] + b[2] + c[2] + d[2]) / 4,
                    V.tone(n[0] * f, n[1] * f, n[2] * f)]);
      }
    faces.sort((a, b) => b[4] - a[4]);
    for (const f of faces) V.quad(g, tiles, f[0], f[1], f[2], f[3], f[5]);
  }

  /* ---------------------------------------------------------- plate four
     A block of layers that fans apart and shuts again. */
  function layers(g, w, h, t, tiles){
    const V = view(t * 0.26, 0.36 + 0.10 * Math.sin(t * 0.17), w, h, 0.55);
    const N = 5, TH = 0.17;
    const open = 0.5 - 0.5 * Math.cos(t * 0.40);
    const items = [];
    for (let i = 0; i < N; i++){
      const f = i / (N - 1);
      const tw = 0.46 - 0.022 * i;
      const b = { x: open * (f - 0.5) * 0.52, y: -0.36 + i * TH * (1 + open * 0.55),
                  z: 0,
                  w: tw, d: tw * 0.64, h: TH * 0.44,
                  rot: { x: 0, y: open * (f - 0.5) * 0.34 } };
      b.k = V.cam(b.x, b.y, b.z)[2];
      items.push(b);
    }
    items.sort((a, b) => b.k - a.k);
    for (const b of items) V.box(g, tiles, b);
  }

  /* ----------------------------------------------------------- plate two
     A corpus, and the window that is small enough to read. */
  function corpus(g, w, h, t, img){
    const d = img.data;
    /* one line of text: a row of ink every `pitch` cells, broken into words */
    function ink(fx, fy, pitch, blk){
      const r = Math.floor(fy / pitch);
      if (((fy % pitch) + pitch) % pitch >= (pitch > 3 ? 2 : 1)) return 0;
      if (hash(r, 9.1) < 0.07) return 0;                  // a break between paragraphs
      const b = Math.floor(fx / blk);
      return fx - b * blk < 2 + ((hash(b, r) * (blk - 2)) | 0) ? 1 : 0;
    }
    const sx = t * 2.2, sy = t * 0.75;
    const ww = Math.max(19, (w * 0.34) | 0), wh = Math.max(13, (h * 0.42) | 0);
    const wx = Math.round((w - ww) * (0.5 + 0.5 * Math.sin(t * 0.31)));
    const wy = Math.round((h - wh) * (0.5 + 0.5 * Math.sin(t * 0.23 + 1.1)));
    const Z = 2;                                          // how much the window magnifies
    for (let y = 0; y < h; y++){
      const insideY = y >= wy && y < wy + wh;
      for (let x = 0; x < w; x++){
        const inside = insideY && x >= wx && x < wx + ww;
        let on;
        if (inside){
          const fx = Math.floor((sx + wx + (x - wx) / Z) * 1);
          const fy = Math.floor((sy + wy + (y - wy) / Z) * 1);
          on = ink(fx, fy, 3, 5) === 1;
          if (x === wx || x === wx + ww - 1 || y === wy || y === wy + wh - 1) on = true;
        } else {
          const v = ink(Math.floor(sx + x), Math.floor(sy + y), 2, 5) * 0.85;
          on = v * 17 > BAYER4[(y & 3) * 4 + (x & 3)];
        }
        const i = (y * w + x) * 4;
        d[i] = on ? 0 : 255; d[i + 1] = on ? 0 : 254; d[i + 2] = on ? 0 : 250;
        d[i + 3] = 255;
      }
    }
  }

  /* --------------------------------------------------------- plate three
     Two sources, and the fringes where they disagree. */
  function moire(g, w, h, t, img){
    const d = img.data;
    const r = Math.min(w, h) * 0.42;
    const a = t * 0.19;
    const c1x = w / 2 + Math.cos(a) * r * 0.92, c1y = h / 2 + Math.sin(a) * r * 0.52;
    const c2x = w / 2 - Math.cos(a) * r * 0.92, c2y = h / 2 - Math.sin(a) * r * 0.52;
    const K = 0.44 + 0.10 * Math.sin(t * 0.13);
    for (let y = 0; y < h; y++){
      for (let x = 0; x < w; x++){
        const d1 = Math.sqrt((x - c1x) * (x - c1x) + (y - c1y) * (y - c1y));
        const d2 = Math.sqrt((x - c2x) * (x - c2x) + (y - c2y) * (y - c2y));
        let v = 0.5 + 0.5 * Math.cos((d1 - d2) * K - t * 1.2);
        v = v * v * 0.55 + v * 0.45;                // thin the ink, fatten the paper
        const ex = (x - w / 2) / (w * 0.5), ey = (y - h / 2) / (h * 0.5);
        v *= clamp(2.1 - 2.1 * Math.sqrt(ex * ex + ey * ey), 0, 1);
        const on = v * 17 > BAYER4[(y & 3) * 4 + (x & 3)];
        const i = (y * w + x) * 4;
        d[i] = on ? 0 : 255; d[i + 1] = on ? 0 : 254; d[i + 2] = on ? 0 : 250;
        d[i + 3] = 255;
      }
    }
  }

  const KIND = {
    mobius: { draw: mobius },
    layers: { draw: layers },
    corpus: { draw: corpus, raw: true },
    moire:  { draw: moire,  raw: true }
  };

  function mount(cv, kind){
    const g = cv.getContext("2d", { alpha: false, willReadFrequently: true });
    let w = 1, h = 1, img = null;
    const tiles = [];

    function build(){
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      w = Math.max(8, Math.round(r.width / CELL));
      h = Math.max(8, Math.round(r.height / CELL));
      cv.width = w; cv.height = h;
      g.imageSmoothingEnabled = false;
      img = kind.raw ? g.createImageData(w, h) : null;
      if (kind.raw) return;
      tiles.length = 0;
      for (let k = 0; k <= 16; k++){
        const c = document.createElement("canvas");
        c.width = 4; c.height = 4;
        const q = c.getContext("2d");
        q.fillStyle = "#ffffff"; q.fillRect(0, 0, 4, 4);
        q.fillStyle = "#000000";
        for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++)
          if (BAYER4[yy * 4 + xx] < k) q.fillRect(xx, yy, 1, 1);
        tiles.push(g.createPattern(c, "repeat"));
      }
    }

    let vis = false, last = 0;
    new IntersectionObserver(es => { vis = es[0].isIntersecting; },
      { threshold: 0 }).observe(cv);

    const t0 = performance.now();
    function frame(now){
      if (!vis || (!img && !tiles.length)) return;
      if (!STILL && now - last < 62) return;      // sixteen a second is plenty
      last = now;
      const t = STILL ? 4.7 : (now - t0) / 1000;
      if (kind.raw){
        kind.draw(g, w, h, t, img);
        g.putImageData(img, 0, 0);
        return;
      }
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, w, h);
      kind.draw(g, w, h, t, tiles);
      const im = g.getImageData(0, 0, w, h);
      const d = im.data;
      for (let i = 0; i < d.length; i += 4){
        if (d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114 < 150){
          d[i] = 0; d[i+1] = 0; d[i+2] = 0;
        } else { d[i] = 255; d[i+1] = 254; d[i+2] = 250; }
      }
      g.putImageData(im, 0, 0);
    }

    build();
    if (STILL){ vis = true; frame(performance.now() + 1e6); }
    else onTick(frame);
    addEventListener("resize", () => {
      build();
      if (STILL) frame(performance.now() + 1e6);
    });
  }

  for (const cv of $$("[data-plate]")){
    const kind = KIND[cv.dataset.plate];
    if (kind) mount(cv, kind);
  }
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
  plates();
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

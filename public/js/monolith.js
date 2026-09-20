import { $, $$, STILL, FORCE_STAGE, clamp, lerp, easeIO, onTick, BAYER4 } from './runtime.js';

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

  /* The bar floats over the hero, so the tower is fitted to the band beneath
     it rather than to the whole canvas. HEAD is how far the tallest thing
     drawn reaches above the tower's centre, in units of the block height: the
     stack tops out at 1, and a brick dropped in above it starts RISE higher.
     FOOT covers the ground shadow and the grass. Both are in projected units.
     They allow for a brick that is also turned towards the camera, which
     magnifies it, so the tower keeps its distance from the bar at every
     rotation rather than only at rest. */
  const HEAD = 1.05, FOOT = 0.62, GAP = 14, MAXH = 660;
  let keep = { x0: 0, x1: 0, y0: 0, y1: 0 };
  let fitted = MAXH, centreY = 0, skyTop = 0;

  /* The bar's resting height comes from site.css, and its own padding carries
     the safe-area inset, so the two together are the band to stay clear of.
     Reading the resting height rather than the current one keeps the fit
     steady when the bar shrinks on scroll. */
  function band(){
    const bar = $("#nav");
    const rest = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--navh-rest"));
    const inset = bar ? parseFloat(getComputedStyle(bar).paddingTop) || 0 : 0;
    return (rest || 76) + inset;
  }

  /* --monolith-scale on the hero takes the tower down further, for when the
     fit is right but the block still wants to be smaller. */
  function fitBlock(){
    const scale = parseFloat(
      getComputedStyle(hero).getPropertyValue("--monolith-scale")) || 1;
    const top = band() + GAP;
    skyTop = top;
    const span = Math.max(160, H - GAP - top);
    fitted = Math.min(MAXH, span / (HEAD + FOOT)) * scale;
    centreY = top + (span - fitted * (HEAD + FOOT)) * 0.5 + HEAD * fitted;
  }

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
    fitBlock();
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
    const blockH = mobile ? 268 : fitted;
    const scl = blockH;
    const F = 3.4, D = 3.4;
    const halfW = scl * 0.40;                 // the grass counts as the block
    const cx = (mobile ? W * 0.52 : Math.max(W * 0.775, keep.x0 + halfW)) / S;
    const cyp = (mobile ? keep.y1 + blockH * 0.5 : centreY) / S;
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

    /* Nothing is drawn in the bar's band. The fit above keeps the tower clear
       of it on its own; this is what makes that structural rather than a
       matter of the constants staying right. */
    og.save();
    og.beginPath();
    og.rect(0, Math.max(0, (mobile ? keep.y1 - 8 : skyTop - GAP) / S), rw, rh);
    og.clip();

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
        const Y = Math.max(skyTop / S + R * 1.45, (0.165 + c.h * 0.085) * rh);
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
        const sp = sc * 0.036;                                  // half a span
        const Y = Math.max(skyTop / S + sp + rh * 0.014,
                           (0.135 + b.d) * rh + Math.sin(flock.t * 0.9 + b.ph) * rh * 0.014);
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


export { monolith };

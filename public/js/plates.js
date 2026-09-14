import { $, $$, STILL, FORCE_STAGE, clamp, lerp, easeIO, onTick, BAYER4 } from './runtime.js';
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
      const l = 0.07 + 0.92 * Math.max(0, nx * LX + ny * LY + nz * LZ);
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

  /* --------------------------------------------------------- marginalia
     Four small ones for the gutter. They are quiet on purpose: a figure
     beside the page should not compete with the page. */

  /* a lit body, turning under a lamp that swings */
  function orb(g, w, h, t, img){
    const d = img.data;
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.45;
    const a = Math.sin(t * 0.23) * 1.1;
    const lx = Math.cos(a) * 0.74, ly = 0.44;
    const lz = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly));
    for (let y = 0; y < h; y++){
      const py = (y - cy) / R;
      for (let x = 0; x < w; x++){
        const pxn = (x - cx) / R;
        const r2 = pxn * pxn + py * py;
        let v = 0;
        if (r2 <= 1){
          const pz = Math.sqrt(1 - r2);
          const u = Math.atan2(pz, pxn) + t * 0.38;      // it turns
          const la = Math.asin(clamp(-py, -1, 1));
          const land = 0.93 + 0.16 * (Math.sin(u * 2.7 + 1.3) * Math.sin(la * 3.1)
                                    + 0.6 * Math.sin(u * 5.3) * Math.cos(la * 2.2));
          let lum = pxn * lx + (-py) * ly + pz * lz;
          lum = (0.26 + 0.76 * Math.max(0, lum)) * land;
          v = clamp(1 - lum, 0, 1);
        }
        const on = v * 17 > BAYER4[(y & 3) * 4 + (x & 3)];
        const i = (y * w + x) * 4;
        d[i] = on ? 0 : 255; d[i + 1] = on ? 0 : 254; d[i + 2] = on ? 0 : 250;
        d[i + 3] = 255;
      }
    }
  }

  /* one solid, turning under the same lamp as the tower. It keeps its up,
     because a box that tumbles freely lands on orientations where all three
     visible faces take the same tone and the whole thing goes to mush. */
  function cube(g, w, h, t, tiles){
    const V = view(t * 0.42, 0.40 + 0.17 * Math.sin(t * 0.27), w, h, 0.92);
    V.box(g, tiles, { x: 0, y: 0, z: 0, w: 0.38, d: 0.38, h: 0.38, rot: null });
  }

  /* punched tape, running. Drawn the way tape is drawn on paper: the strip
     is the page, the holes are the ink. */
  function tape(g, w, h, t, img){
    const d = img.data;
    const CH = 4, PITCH = 6;
    const pad = 3.2;
    const step = (w - pad * 2) / CH;
    const sprocket = pad + step * 1.5;
    for (let y = 0; y < h; y++){
      const fy = y + t * 5.5;
      const row = Math.floor(fy / PITCH);
      const ry = fy - row * PITCH - PITCH / 2;
      for (let x = 0; x < w; x++){
        let on = x < 1 || x > w - 2;                    // the two edges of the tape
        const ch = Math.floor((x - pad) / step);
        if (ch >= 0 && ch < CH && hash(ch + 1, row) > 0.42){
          const dx = x - (pad + ch * step + step / 2);
          if (dx * dx + ry * ry * 1.35 < 2.6) on = true;
        }
        const sx = x - sprocket;
        if (sx * sx * 3.2 + ry * ry * 1.6 < 1.1) on = true;
        const i = (y * w + x) * 4;
        d[i] = on ? 0 : 255; d[i + 1] = on ? 0 : 254; d[i + 2] = on ? 0 : 250;
        d[i + 3] = 255;
      }
    }
  }

  /* something dropped in, and the rings leaving */
  function pulse(g, w, h, t, img){
    const d = img.data;
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.5;
    for (let y = 0; y < h; y++){
      const dy = y - cy;
      for (let x = 0; x < w; x++){
        const dx = x - cx;
        const r = Math.sqrt(dx * dx + dy * dy);
        let v = 0.5 + 0.5 * Math.cos(r * 0.95 - t * 2.6);
        v = v * v * 0.45 + v * 0.55;
        v *= clamp(1.5 - r / R * 1.5, 0, 1);
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
    moire:  { draw: moire,  raw: true },
    orb:    { draw: orb,    raw: true },
    cube:   { draw: cube },
    tape:   { draw: tape,   raw: true },
    pulse:  { draw: pulse,  raw: true }
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


export { swell, plates };

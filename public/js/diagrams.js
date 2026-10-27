import { $, $$, STILL, FORCE_STAGE, clamp, lerp, easeIO, onTick, BAYER4 } from './runtime.js';
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

  const task = $("#taskFig");
  if (task) flow(task, {
    id: "task", w: 392, h: 384,
    nodes: [
      { id: "pri", x: 122, y: 4,   w: 148, h: 40, label: "primary turn", kind: "boxn solid", size: 12, order: 0 },
      { id: "wa",  x: 4,   y: 96,  w: 116, h: 44, label: ["worktree", "child A"], size: 11, order: 1 },
      { id: "wb",  x: 138, y: 96,  w: 116, h: 44, label: ["worktree", "child B"], size: 11, order: 1 },
      { id: "wc",  x: 272, y: 96,  w: 116, h: 44, label: ["worktree", "child C"], size: 11, order: 1 },
      { id: "art", x: 60,  y: 190, w: 272, h: 46, label: ["engineering artifacts", "patch, checks, evidence"], size: 11, order: 3 },
      { id: "chk", x: 60,  y: 272, w: 272, h: 38, label: "check, then apply in order", size: 11, order: 4 },
      { id: "con", x: 122, y: 344, w: 148, h: 36, label: "turn continues", kind: "boxn solid", size: 12, order: 6 }
    ],
    edges: [
      { from: "pri", to: "wa", fromSide: "b", toSide: "t", order: 1 },
      { from: "pri", to: "wb", fromSide: "b", toSide: "t", order: 1, label: "task.run", lx: 230, ly: 70 },
      { from: "pri", to: "wc", fromSide: "b", toSide: "t", order: 1 },
      { from: "wa", to: "art", fromSide: "b", toSide: "t", order: 2 },
      { from: "wb", to: "art", fromSide: "b", toSide: "t", order: 2 },
      { from: "wc", to: "art", fromSide: "b", toSide: "t", order: 2 },
      { from: "art", to: "chk", fromSide: "b", toSide: "t", order: 4, label: "task.worktree", lx: 246, ly: 256 },
      { from: "chk", to: "con", fromSide: "b", toSide: "t", order: 5, dashed: true, label: "completion notice", lx: 252, ly: 330 }
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
function imagebox() {
  const box = $('#imagebox');
  if (!box) return;
  const cells = $$('i', box);
  let timer = null;
  let visible = false;
  function update() {
    clearInterval(timer);
    timer = null;
    if (visible && !STILL && !document.hidden) {
      timer = setInterval(() => {
        cells.forEach(cell => cell.classList.remove('lit'));
        cells[Math.floor(Math.random() * cells.length)].classList.add('lit');
      }, 900);
    }
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: .25 }).observe(box);
  document.addEventListener('visibilitychange', update);
}

/* ------------------------------------------------------ mission ledger
   The page renders the finished mission, so the figure reads without
   JavaScript. Armed, it starts empty and runs once: allowances fill with a
   reservation ahead of the spend, gates execute in order (a retried gate
   fails first), and the verdict lands last. */
function mission(){
  const host = $("#missionViz");
  if (!host || STILL) return;
  const budgets = $$(".budget", host).map(el => {
    const num = $("[data-count]", el);
    return { el, num, fill: parseFloat(el.dataset.fill), count: Number(num.dataset.count),
             text: num.textContent };
  });
  const gates = $$(".gate", host);
  const stamp = $(".mission__stamp", host);
  const format = n => n.toLocaleString("en-US");

  const events = [];
  let at = 500;
  for (const gate of gates){
    for (let k = 1; k < Number(gate.dataset.attempts || 1); k++){
      events.push([at, gate, "run"], [at + 650, gate, "fail"]);
      at += 950;
    }
    events.push([at, gate, "run"], [at + 650, gate, "pass"]);
    at += 950;
  }
  const total = at;

  const arm = () => {
    host.classList.add("armed");
    gates.forEach(g => g.classList.remove("run", "fail", "pass"));
    stamp.classList.remove("on");
    for (const b of budgets){
      b.el.style.setProperty("--now", "0%");
      b.el.style.setProperty("--res", "0%");
      b.num.textContent = "0";
    }
  };

  const play = () => {
    const t0 = performance.now();
    for (const [time, gate, state] of events){
      setTimeout(() => {
        gate.classList.remove("run", "fail", "pass");
        gate.classList.add(state);
      }, time);
    }
    setTimeout(() => stamp.classList.add("on"), total + 250);
    const frame = now => {
      const p = clamp((now - t0) / total, 0, 1);
      const e = 1 - Math.pow(1 - p, 2);
      for (const b of budgets){
        b.el.style.setProperty("--now", (b.fill * e).toFixed(2) + "%");
        b.el.style.setProperty("--res", p < 1 ? Math.min(9, 100 - b.fill * e).toFixed(2) + "%" : "0%");
        b.num.textContent = p < 1 ? format(Math.round(b.count * e)) : b.text;
      }
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  arm();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ play(); io.disconnect(); } }, { threshold: 0.35 });
  io.observe(host);
}

/* ----------------------------------------------------------- charts
   The page renders each chart finished. Armed, it empties, and it plays
   its CSS transitions once it is mostly on screen. */
function charts(){
  if (STILL) return;
  for (const chart of $$("[data-chart]")){
    chart.classList.add("armed");
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting){ chart.classList.add("play"); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(chart);
  }
}


/* ------------------------------------------------------ knowledge ledgers
   The page renders each ledger finished, so it reads without JavaScript.
   Armed, a ledger starts empty and plays once it is on screen: facts arrive
   and the rule derives the departure, then the meeting keeps moving and the
   departure follows it; three turns fold into a procedure that runs as one
   call; and probes rule hypotheses out until one cause is left. */
function knowledge(){
  if (STILL) return;

  // A timeline of steps; reveal() hides an element until its step.
  const ledger = (host, build) => {
    if (!host) return;
    const steps = [];
    let at = 400;
    const later = (fn, gap = 0) => { steps.push([at, fn]); at += gap; };
    const reveal = (el, gap = 480) => {
      el.dataset.step = "";
      later(() => el.classList.add("on"), gap);
    };
    const after = build({ reveal, later });
    host.classList.add("armed");
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      for (const [time, fn] of steps) setTimeout(fn, time);
      if (after) setTimeout(after, at);
    }, { threshold: 0.35 });
    io.observe(host);
  };

  // Replace a value the way a recomputation does: dither, then the new ink.
  const swap = (el, text) => {
    el.classList.add("busy");
    setTimeout(() => {
      el.textContent = text;
      el.classList.remove("busy");
      el.classList.add("fresh");
      setTimeout(() => el.classList.remove("fresh"), 900);
    }, 380);
  };

  const derive = $("#deriveViz");
  ledger(derive, ({ reveal, later }) => {
    const facts = $$(".kb__fact", derive);
    const start = $(".kb__val", facts[0]);
    const leave = $(".kb__derived .kb__val", derive);
    const stamp = $(".kb__stamp", derive);
    const moved = [start.textContent, leave.textContent];
    const first = [start.dataset.earlier, leave.dataset.earlier];
    start.textContent = first[0];
    leave.textContent = first[1];
    for (const fact of facts.slice(0, 3)) reveal(fact, 420);
    reveal($(".kb__rule", derive), 560);
    reveal($(".kb__derived", derive), 900);
    later(() => stamp.classList.add("on"));
    return () => {
      let shifted = false;
      const move = () => {
        shifted = !shifted;
        const [when, leaving] = shifted ? moved : first;
        stamp.classList.remove("on");
        swap(start, when);
        setTimeout(() => swap(leave, leaving), 700);
        setTimeout(() => stamp.classList.add("on"), 1500);
      };
      setTimeout(() => { move(); setInterval(move, 5600); }, 1800);
    };
  });

  const procedure = $("#procedureViz");
  ledger(procedure, ({ reveal, later }) => {
    const calls = row => $$(".kb__calls span", row).forEach(call => later(() => call.classList.add("on"), 190));
    for (const turn of $$(".kb__turn", procedure)){
      reveal(turn, 260);
      calls(turn);
      later(() => {}, 240);
    }
    later(() => $(".kb__turns", procedure).classList.add("folded"), 380);
    reveal($(".kb__learned", procedure), 1000);
    reveal($(".kb__next", procedure), 720);
    reveal($(".kb__fits", procedure), 620);
    reveal($(".kb__run", procedure), 380);
    calls($(".kb__run", procedure));
    later(() => $(".kb__stamp", procedure).classList.add("on"));
  });

  const diagnosis = $("#diagnosisViz");
  ledger(diagnosis, ({ reveal, later }) => {
    const chips = $$(".kb__hypotheses li", diagnosis);
    for (const chip of chips) reveal(chip, 220);
    later(() => {}, 420);
    for (const probe of $$(".kb__probe", diagnosis)){
      const ruled = chips.find(chip => chip.dataset.hypothesis === probe.dataset.rulesOut);
      reveal(probe, 120);
      later(() => probe.classList.add("run"), 820);
      later(() => { probe.classList.remove("run"); probe.classList.add("done"); }, 460);
      later(() => ruled && ruled.classList.add("out"), 640);
    }
    later(() => $(".kb__cause", diagnosis).classList.add("found"), 420);
    reveal($(".kb__verdict", diagnosis), 520);
    later(() => $(".kb__stamp", diagnosis).classList.add("on"));
  });
}

export { figures, rlm, imagebox, mission, charts, knowledge };

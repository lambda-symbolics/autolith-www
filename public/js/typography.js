import { $, $$, STILL, FORCE_STAGE, clamp, lerp, easeIO, onTick, BAYER4 } from './runtime.js';
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


export { splitAll, observeReveals };

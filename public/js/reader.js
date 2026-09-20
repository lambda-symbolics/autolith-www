import { $, $$, STILL, FORCE_STAGE, clamp, lerp, easeIO, onTick, BAYER4 } from './runtime.js';
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
    BODY = innerWidth < 700 ? "Hello Autolith!" : "Hello Autolith! What's your favorite rock?";
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


export { sugar, tryit };
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
      note.textContent = "Parenthesized input is left unchanged here. In Autolith, Lisp forms run in the active image.";
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

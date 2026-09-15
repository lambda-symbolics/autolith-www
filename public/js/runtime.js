const query = new URLSearchParams(location.search);
export const STILL = query.has('still');
export const FORCE_STAGE = /^[012]$/.test(query.get('stage')) ? Number(query.get('stage')) : null;
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const BAYER4 = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];

const ticks = [];
let frame = null;

function schedule() {
  if (frame === null && !STILL && !document.hidden) frame = requestAnimationFrame(tick);
}

function tick(now) {
  frame = null;
  if (STILL || document.hidden) return;
  for (const callback of ticks) callback(now);
  schedule();
}

export function onTick(callback) {
  ticks.push(callback);
  // Static pages still need a first drawing of scroll-dependent figures.
  callback(performance.now());
  schedule();
}

document.addEventListener('visibilitychange', schedule);

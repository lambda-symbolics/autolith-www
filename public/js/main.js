import { $$, STILL } from './runtime.js';
import { navSetup } from './navigation.js';
import { splitAll, observeReveals } from './typography.js';
import { monolith } from './monolith.js';
import { sugar, tryit } from './reader.js';
import { figures, rlm, imagebox } from './diagrams.js';
import { swell, plates } from './plates.js';
import { tabs, copy, casts } from './controls.js';

// Apply the enhanced layout before any canvas measures its visible bounds.
document.documentElement.classList.add('js');
document.documentElement.classList.toggle('still', STILL);
const features = [navSetup, tabs, copy, casts, tryit, monolith, sugar,
                  rlm, figures, swell, plates, imagebox];
for (const setup of features) {
  try { setup(); } catch (error) { console.error(`Site feature ${setup.name}:`, error); }
}
if (!STILL) {
  splitAll();
  observeReveals();
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(splitAll, 220);
  });
  document.fonts.ready.then(splitAll);
}
$$('[data-rv], [data-split]').forEach(element => element.classList.add('in'));

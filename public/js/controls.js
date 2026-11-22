import { $$ } from './runtime.js';

export function tabs() {
  $$('.tabgroup').forEach(group => {
    const buttons = $$('[data-tab]', group);
    const panels = $$('[data-tabpanel]', group);
    function select(button, focus = false) {
      buttons.forEach(item => {
        const selected = item === button;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.tabpanel !== button.dataset.tab; });
      if (focus) button.focus();
    }
    buttons.forEach((button, index) => {
      const panel = panels.find(item => item.dataset.tabpanel === button.dataset.tab);
      button.id = 'tab-' + button.dataset.tab;
      panel.id = 'panel-' + button.dataset.tab;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      button.setAttribute('aria-controls', panel.id);
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); select(buttons[next], true); }
      });
    });
    select(buttons.find(button => button.getAttribute('aria-selected') === 'true') || buttons[0]);
  });
}

export function copy() {
  $$('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const old = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = 'Copied';
      } catch { button.textContent = 'Select and copy the command'; }
      setTimeout(() => { button.textContent = old; }, 1800);
    });
  });
}

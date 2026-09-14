import { $, $$ } from './runtime.js';

export function navSetup() {
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#menu');
  const main = $('main');
  const footer = $('footer');
  const desktop = matchMedia('(min-width: 1041px)');
  const links = $$('#navLinks a');

  function setOpen(open, restoreFocus = false) {
    document.body.classList.toggle('menu-open', open);
    menu.inert = !open;
    main.inert = footer.inert = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) $('a', menu).focus();
    else if (restoreFocus) burger.focus();
  }
  burger.addEventListener('click', () => setOpen(menu.inert));
  $$('#menu a').forEach(link => link.addEventListener('click', () => {
    setOpen(false);
    const target = link.hash && link.origin === location.origin ? $(link.hash) : null;
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }));
  document.addEventListener('keydown', event => {
    if (menu.inert) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
    if (event.key === 'Tab') {
      const focusable = [burger, ...$$('a', menu)];
      const index = focusable.indexOf(document.activeElement);
      const next = (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      event.preventDefault();
      focusable[next].focus();
    }
  });
  desktop.addEventListener('change', () => { if (desktop.matches) setOpen(false); });

  function update() {
    nav.classList.toggle('is-stuck', scrollY > 24);
    nav.classList.toggle('is-ink', footer.getBoundingClientRect().top < nav.offsetHeight / 2);
    const current = $$('main section[id]').find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= innerHeight * .34 && bounds.bottom > innerHeight * .34;
    });
    links.forEach(link => {
      const active = link.hash === '#' + current?.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  setOpen(false);
  update();
}

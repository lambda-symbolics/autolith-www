import { $, $$ } from './runtime.js';

export function navSetup() {
  const nav = $('#nav');
  const footer = $('footer');
  const links = $$('#navLinks a');

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
  update();
}

import { setupLettering } from './lettering.js';
import { setupProfile } from './profile.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Navigation is usable by mouse, touch and keyboard.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close navigation');
      navigation.classList.add('is-open');
    }
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 881px)').addEventListener('change', closeMenu);
}

// Animate sections only after the observer is ready. Users without JS see all content.
const reveals = [...document.querySelectorAll('[data-reveal]')];
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -35px 0px', threshold: .08 });

  root.classList.add('js-enabled');
  for (const element of reveals) observer.observe(element);
} else {
  for (const element of reveals) element.classList.add('is-visible');
}

const progress = document.querySelector('#scroll-progress-bar');
if (progress) {
  let queued = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    queued = false;
  };
  const requestUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const letteringCanvas = document.querySelector('#gerwin-lettering');
if (letteringCanvas) setupLettering(letteringCanvas);

const profileCard = document.querySelector('[data-profile]');
if (profileCard) setupProfile(profileCard);

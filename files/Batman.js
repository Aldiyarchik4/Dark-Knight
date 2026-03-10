/* ===================================================
   THE DARK KNIGHT — Scroll Animation Engine
   =================================================== */

// ── Page navigation ──────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  document.querySelectorAll('#navLinks a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });

  window.scrollTo(0, 0);
  updateScrollProgress();
  setTimeout(() => {
    triggerReveal();
    animateCards();
  }, 80);
  return false;
}

// ── Lightbox ─────────────────────────────────────────
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  setTimeout(() => lb.style.backdropFilter = 'blur(8px)', 10);
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

// ── Reveal observer ───────────────────────────────────
function triggerReveal() {
  const page = document.querySelector('.page.active');
  if (!page) return;
  const els = page.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate');
  els.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 90);
  });
}

// ── IntersectionObserver for scroll-based reveals ────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.14 });

function observeRevealEls() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate')
    .forEach(el => revealObserver.observe(el));
}

// ── Card stagger animation (chars & gallery) ─────────
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const card = e.target;
      const siblings = Array.from(card.parentElement.children);
      const delay = siblings.indexOf(card) * 80;
      setTimeout(() => card.classList.add('card-visible'), delay);
      cardObserver.unobserve(card);
    }
  });
}, { threshold: 0.08 });

function animateCards() {
  document.querySelectorAll('.page.active .char-card, .page.active .gallery-item')
    .forEach(c => {
      c.classList.remove('card-visible');
      cardObserver.observe(c);
    });
}

// ── Scroll progress bar ───────────────────────────────
function updateScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  bar.style.width = pct + '%';

  const bsBtn = document.getElementById('batSignalTrack');
  if (bsBtn) bsBtn.classList.toggle('show', window.scrollY > 400);
}

// ── Parallax hero ────────────────────────────────────
function applyParallax() {
  const heroBg = document.querySelector('#page-home.active .hero-bg');
  if (heroBg) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
  }
}

// ── Tilt on hover ────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.ability-card, .actor-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
      card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Floating bats background ──────────────────────────
function spawnBats() {
  const container = document.getElementById('batsBg');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const bat = document.createElement('span');
    bat.className = 'mini-bat';
    bat.textContent = '🦇';
    bat.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dx: ${(Math.random() - 0.5) * 400}px;
      --dy: ${(Math.random() - 0.5) * 300}px;
      --rot: ${(Math.random() - 0.5) * 180}deg;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 6}s;
      font-size: ${10 + Math.random() * 16}px;
    `;
    container.appendChild(bat);
  }
}

// ── Rating counter animation ──────────────────────────
function animateRatings() {
  document.querySelectorAll('.rating-score').forEach(el => {
    const target = parseFloat(el.textContent.replace(',', '.'));
    const duration = 1200;
    const start = performance.now();
    const from = target * 0.3;
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (from + (target - from) * eased).toFixed(1).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ── Nav shrink on scroll ──────────────────────────────
function handleNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  nav.style.transition = 'height 0.4s ease, box-shadow 0.4s ease';
  if (window.scrollY > 60) {
    nav.style.height = '68px';
    nav.style.boxShadow = '0 4px 24px rgba(252,235,32,0.08)';
  } else {
    nav.style.height = '90px';
    nav.style.boxShadow = 'none';
  }
}

// ── Section observer for special effects ─────────────
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const title = e.target.querySelector('.section-title');
      if (title) title.classList.add('visible');
      if (e.target.classList.contains('section-about')) {
        setTimeout(animateRatings, 400);
      }
    }
  });
}, { threshold: 0.1 });

// ── Global scroll handler ─────────────────────────────
window.addEventListener('scroll', () => {
  updateScrollProgress();
  applyParallax();
  handleNavScroll();
}, { passive: true });

// ── Inject UI elements ────────────────────────────────
function injectScrollUI() {
  if (!document.getElementById('scrollProgress')) {
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    bar.className = 'scroll-progress';
    document.body.prepend(bar);
  }

  if (!document.getElementById('batSignalTrack')) {
    const tracker = document.createElement('div');
    tracker.id = 'batSignalTrack';
    tracker.className = 'bat-signal-track';
    tracker.innerHTML = `
      <div class="bat-signal-ring"></div>
      <button class="bat-signal-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Back to top">
        <svg viewBox="0 0 32 20" fill="black" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1C10 1 5 5 2 9c2-1.5 4-1 5.5-.5C8 6.5 10 5 12 5.5c-.5 1 .5 2.5 1.5 3C13 7.5 12 7 11.5 7.5c1 .5 3 1 4.5 2 1.5-1 3.5-1.5 4.5-2-.5-.5-1.5 0-2-1 1-.5 3 1 3.5 3C23 7 25 6.5 27 8c1.5-.5 3.5-1 5.5.5C29.5 5 24 1 16 1Z"/>
          <path d="M16 13 L11 20 L13 17 L9 18 L16 11 L23 18 L19 17 L21 20 Z"/>
        </svg>
      </button>
    `;
    document.body.appendChild(tracker);
  }

  if (!document.getElementById('batsBg')) {
    const bg = document.createElement('div');
    bg.id = 'batsBg';
    bg.className = 'bats-bg';
    document.body.prepend(bg);
  }
}

// ── Init ──────────────────────────────────────────────
function init() {
  injectScrollUI();
  observeRevealEls();
  animateCards();
  initTilt();
  spawnBats();
  document.querySelectorAll('.section-about, .section-abilities, .section-actors')
    .forEach(s => sectionObserver.observe(s));
  setTimeout(triggerReveal, 200);
}

document.addEventListener('DOMContentLoaded', init);

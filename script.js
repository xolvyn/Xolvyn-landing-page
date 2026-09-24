// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ===== MODAL SYSTEM =====
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function closeModalIfOverlay(event, id) {
  if (event.target.id === id) closeModal(id);
}

// Close any open modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ===== MOBILE MENU =====
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburgerBtn.classList.toggle('active');
  });

  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburgerBtn.classList.remove('active');
    });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== SCROLL-SPY: highlight the active nav link =====
const spyLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
if (spyLinks.length) {
  // Pair each nav link with its section (skip links whose target is missing).
  const spyPairs = spyLinks
    .map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter(pair => pair.section);

  const updateSpy = () => {
    const offset = 100; // just below the fixed navbar
    // Active = the last section whose top has scrolled past the offset line.
    // In the hero (no section past the line yet) nothing is active.
    let active = null;
    for (const { link, section } of spyPairs) {
      if (section.getBoundingClientRect().top <= offset) active = link;
    }
    spyLinks.forEach(a => a.classList.toggle('active', a === active));
  };

  let spyTicking = false;
  const onSpyScroll = () => {
    if (spyTicking) return;
    spyTicking = true;
    requestAnimationFrame(() => { updateSpy(); spyTicking = false; });
  };
  window.addEventListener('scroll', onSpyScroll, { passive: true });
  window.addEventListener('resize', onSpyScroll, { passive: true });
  updateSpy();
}

// ===== FADE UP ON SCROLL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach(q => {
  const toggle = () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      const other = i.querySelector('.faq-q');
      if (other) other.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      q.setAttribute('aria-expanded', 'true');
    }
  };
  q.addEventListener('click', toggle);
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

// ===== PRICING — MONTHLY / YEARLY TOGGLE =====
// Prices carry both values as data-monthly / data-yearly; the markup ships
// with the yearly ones so the page reads correctly without JS.
const billingButtons = document.querySelectorAll('.billing-toggle button[data-billing]');
billingButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const period = btn.dataset.billing;
    billingButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.billing === period)));
    document.querySelectorAll('[data-monthly][data-yearly]').forEach(el => {
      el.textContent = el.dataset[period];
    });
  });
});

// ===== TRY A PUBLIC REPO =====
// Accepts "https://github.com/owner/repo", "github.com/owner/repo" or
// "owner/repo" (assumed GitHub), normalizes it, and submits to the app.
const repoForm = document.getElementById('repo-form');
if (repoForm) {
  const repoInput = document.getElementById('repo-url');
  const repoError = document.getElementById('repo-error');

  const showRepoError = (msg) => {
    repoError.textContent = msg;
    repoError.hidden = false;
    repoInput.classList.add('input-error');
    repoInput.setAttribute('aria-invalid', 'true');
    repoInput.focus();
  };

  repoForm.addEventListener('submit', (e) => {
    let value = repoInput.value.trim().replace(/\/+$/, '').replace(/\.git$/, '');
    if (!value) {
      e.preventDefault();
      showRepoError('Paste a public GitHub or GitLab repository URL.');
      return;
    }
    if (/^[\w.-]+\/[\w.-]+$/.test(value)) value = 'github.com/' + value;
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
    value = value.replace(/^http:\/\//i, 'https://');
    if (!/^https:\/\/(www\.)?(github|gitlab)\.com\/[\w.-]+\/[\w.\/-]+$/i.test(value)) {
      e.preventDefault();
      showRepoError('That doesn\u2019t look like a GitHub or GitLab repository URL.');
      return;
    }
    repoInput.value = value;
  });

  repoInput.addEventListener('input', () => {
    repoInput.classList.remove('input-error');
    repoInput.removeAttribute('aria-invalid');
    repoError.hidden = true;
  });
}

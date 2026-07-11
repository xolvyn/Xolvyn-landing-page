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

// ===== WAITLIST FORM — TWO-STEP FLOW =====
// =====================================================================
// EMAIL STORAGE STRATEGY
// ---------------------------------------------------------------------
// Current: Web3Forms (free, up to 250 submissions/month)
//   → All submissions hit hello@xolvyn.com inbox
//
// MIGRATION CHECKLIST (do before/at launch):
//   [ ] STEP 1 — Setup Google Sheet as backup destination
//       1. Create new Google Sheet "Xolvyn Waitlist"
//       2. Tools → Apps Script → paste a doPost() webhook handler
//       3. Deploy as Web App → copy URL
//       4. Add a second fetch() call below with that URL (parallel save)
//
//   [ ] STEP 2 — At ~100 waitlist signups, migrate to ConvertKit/Mailchimp
//       1. Export Google Sheet as CSV
//       2. Import into ConvertKit (free up to 1,000 subscribers)
//       3. Replace WEB3FORMS_KEY below with ConvertKit form API endpoint
//       4. Test submission, success message, double opt-in email
//
//   [ ] STEP 3 — Setup automated email sequence
//       - Day 0: Welcome + what to expect
//       - Day 7: Behind-the-scenes update + ask for feedback
//       - Day 30: Reveal pricing + lock-in window for waitlist
//       - Launch day: Early access link
// =====================================================================
const WEB3FORMS_KEY = '8a8ee698-8c4b-42d6-974b-cdbbffcc7cc7';
let waitlistEmail = '';
let selectedPlan = ''; // Captures which pricing tile was clicked

// ===== PLAN CLAIM — from locked pricing tiles =====
function selectPlan(planName) {
  selectedPlan = planName;

  // Visual feedback — mark the chosen tile
  document.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('plan-selected'));
  const clickedCard = document.querySelector(`.pricing-card[data-plan="${planName}"]`);
  if (clickedCard) {
    clickedCard.classList.add('plan-selected');
    const btn = clickedCard.querySelector('.btn-plan-claim');
    if (btn) btn.innerHTML = '&#10003; Claimed — scroll down';
  }

  // Smooth scroll to waitlist
  const waitlistEl = document.getElementById('waitlist');
  if (waitlistEl) waitlistEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Focus the email input after scroll settles
  setTimeout(() => {
    const emailInput = document.getElementById('waitlist-email');
    if (emailInput) emailInput.focus();
  }, 700);

  // Show plan banner above the form
  showPlanBanner(planName);
}

function showPlanBanner(planName) {
  const planLabels = {
    free: 'Free Tier',
    pro: 'Pro Plan',
    business: 'Team Plan',
    enterprise: 'Enterprise'
  };
  const planColors = {
    free: '#22C55E',
    pro: '#3B82F6',
    business: '#22C55E',
    enterprise: '#A78BFA'
  };

  // Remove any existing banner
  const oldBanner = document.getElementById('plan-banner');
  if (oldBanner) oldBanner.remove();

  // Create banner
  const banner = document.createElement('div');
  banner.id = 'plan-banner';
  banner.className = 'plan-banner';
  banner.innerHTML = `
    <span class="plan-banner-dot" style="background:${planColors[planName]}"></span>
    <span class="plan-banner-text">Interested in <strong style="color:${planColors[planName]}">${planLabels[planName]}</strong> — claim it below</span>
    <button class="plan-banner-close" onclick="clearPlanSelection()" aria-label="Clear selection">&times;</button>
  `;

  const form = document.getElementById('waitlist-form-main');
  if (form && form.parentNode) form.parentNode.insertBefore(banner, form);
}

function clearPlanSelection() {
  selectedPlan = '';
  const banner = document.getElementById('plan-banner');
  if (banner) banner.remove();
  document.querySelectorAll('.pricing-card').forEach(c => {
    c.classList.remove('plan-selected');
    const btn = c.querySelector('.btn-plan-claim');
    if (btn) {
      const plan = c.dataset.plan;
      const labels = {
        free: 'Claim Free Tier &rarr;',
        pro: 'Claim Pro &rarr;',
        business: 'Claim Team &rarr;',
        enterprise: 'Talk to Founders &rarr;'
      };
      btn.innerHTML = labels[plan] || 'Claim &rarr;';
    }
  });
}

function handleWaitlistStep1() {
  const form = document.getElementById('waitlist-form-main');
  const input = document.getElementById('waitlist-email');
  const errorEl = document.getElementById('waitlist-error');
  const email = input.value.trim();

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = email ? 'That email address looks incomplete.' : 'Enter your work email to continue.';
      errorEl.hidden = false;
    }
    input.focus();
    return;
  }

  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  if (errorEl) errorEl.hidden = true;

  waitlistEmail = email;
  form.style.display = 'none';
  const note = document.getElementById('waitlist-note');
  if (note) note.style.display = 'none';
  document.getElementById('waitlist-step-2').style.display = 'block';
}

// Enable confirm button when a radio is selected
document.addEventListener('change', (e) => {
  if (e.target.name === 'involvement') {
    const btn = document.getElementById('waitlist-step2-btn');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  }
});

async function handleWaitlistStep2() {
  const involvement = document.querySelector('input[name="involvement"]:checked');
  if (!involvement || !waitlistEmail) return;

  const btn = document.getElementById('waitlist-step2-btn');
  const errorEl = document.getElementById('waitlist-error-2');
  const originalText = btn.innerHTML;
  if (errorEl) errorEl.hidden = true;
  btn.innerHTML = 'Sending&hellip;';
  btn.disabled = true;
  btn.style.opacity = '0.6';
  btn.style.cursor = 'wait';

  const intentLabels = {
    notify: 'Notify at launch',
    beta: 'Beta tester',
    founding: 'Founding access — ready to pay'
  };
  const planLabels = {
    free: 'Free Tier',
    pro: 'Pro Plan',
    business: 'Team Plan',
    enterprise: 'Enterprise'
  };

  // Include plan selection in subject and message
  const planSuffix = selectedPlan ? ` [${planLabels[selectedPlan]}]` : '';
  const subject = `New Xolvyn Waitlist Signup${planSuffix}`;

  let message = `Email: ${waitlistEmail}\nIntent: ${intentLabels[involvement.value]}`;
  if (selectedPlan) {
    message += `\nInterested Plan: ${planLabels[selectedPlan]}`;
  }
  message += `\nTimestamp: ${new Date().toISOString()}`;

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: subject,
        from_name: 'Xolvyn Waitlist',
        email: waitlistEmail,
        message: message
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('waitlist-step-2').style.display = 'none';
      const banner = document.getElementById('plan-banner');
      if (banner) banner.remove();
      const successEl = document.getElementById('waitlist-success');
      successEl.style.display = 'flex';

      const planText = selectedPlan ? ` for <strong>${planLabels[selectedPlan]}</strong>` : '';
      if (involvement.value === 'founding') {
        successEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg> <span>You're on the <strong>founding access</strong> list${planText}. A founder will reach out directly.</span>`;
      } else if (involvement.value === 'beta') {
        successEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg> <span>You're in the <strong>beta program</strong>${planText}. We'll reach out with early access soon.</span>`;
      } else {
        successEl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg> <span>You're on the list${planText}. We'll email you at launch.</span>`;
      }
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    if (errorEl) {
      errorEl.textContent = 'Something went wrong on our end. Please try again.';
      errorEl.hidden = false;
    }
  }
}

// ===== EMAIL INPUT — ENTER KEY =====
const emailInput = document.getElementById('waitlist-email');
if (emailInput) {
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleWaitlistStep1();
  });
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('input-error');
    emailInput.removeAttribute('aria-invalid');
    const errorEl = document.getElementById('waitlist-error');
    if (errorEl) errorEl.hidden = true;
  });
}

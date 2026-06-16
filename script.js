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
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
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
  const email = input.value.trim();

  if (!email || !email.includes('@') || !email.includes('.')) {
    input.style.borderColor = '#EF4444';
    input.setAttribute('placeholder', 'Please enter a valid email');
    setTimeout(() => {
      input.style.borderColor = '';
      input.setAttribute('placeholder', 'your@email.com');
    }, 2000);
    return;
  }

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
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sending...';
  btn.disabled = true;

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
  }
}

// ===== EMAIL INPUT — ENTER KEY =====
const emailInput = document.getElementById('waitlist-email');
if (emailInput) {
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleWaitlistStep1();
  });
}
/* ===== SCROLL HERO — pinned slide showcase (smoothed scroll engine) ===== */
(function () {
  var hero = document.querySelector('.scrollhero');
  if (!hero) return;
  var track = document.getElementById('scrollhero-track');
  var glow = document.getElementById('scrollhero-glow');
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.scrollhero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.progress-dot'));
  var N = slides.length;
  if (!track || N < 2) return;

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobile = window.matchMedia('(max-width: 768px)');
  var isStatic = false;
  var io = null;
  var slidesEl = hero.querySelector('.scrollhero-slides');
  var carouselBound = false;
  var carIdx = -1;

  function setDotsActive(active) {
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('is-active', d === active);
    }
  }

  /* -------------------------------------------------------------------
     CORE — smoothed scroll engine.
     One lerped value (`current`) chases the real scroll position
     (`target`) each frame: current += (target - current) * EASE.
     A single rAF loop drives EVERY transform from `current`; the loop
     parks itself when settled and is re-kicked by the scroll listener,
     so idle cost is zero. No layout reads in the frame loop — the
     track's offsets are cached in measure() and re-read only on resize.
     `velocity` (smoothed delta/frame) is computed here for the
     micro-motion layers that build on this engine.
     ------------------------------------------------------------------- */
  var EASE = 0.08;
  var trackTop = 0;
  var total = 1;
  var target = 0;      // real scroll progress 0..1
  var current = -1;    // smoothed progress (-1 = snap on first paint)
  var velocity = 0;    // smoothed progress delta per frame
  var rafId = null;
  var lastActive = -1;

  var DRIFT_VISUAL = 90; // px rise for the visual card
  var DRIFT_COPY = 46;   // px rise for the heading block
  var SCALE_FROM = 0.96; // visual enters slightly scaled down

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  // cache child refs once
  var parts = slides.map(function (s) {
    return { el: s, copy: s.querySelector('.slide-copy'), vis: s.querySelector('.slide-visual') };
  });

  function measure() {
    var rect = track.getBoundingClientRect();
    trackTop = rect.top + window.pageYOffset;
    total = Math.max(1, track.offsetHeight - window.innerHeight);
    readTarget();
  }

  function readTarget() {
    target = clamp((window.pageYOffset - trackTop) / total, 0, 1);
  }

  function setGlow(active) {
    if (active === lastActive) return;
    for (var i = 0; i < N; i++) hero.classList.toggle('glow-' + i, i === active);
    lastActive = active;
  }

  function setSlide(part, copyY, copyO, visY, visO, visScale, shown, currentSlide) {
    part.el.style.opacity = shown ? '1' : '0';
    part.el.style.visibility = shown ? 'visible' : 'hidden';
    part.el.classList.toggle('is-current', currentSlide);
    if (part.copy) {
      part.copy.style.transform = 'translate3d(0,' + copyY.toFixed(2) + 'px,0)';
      part.copy.style.opacity = copyO.toFixed(3);
    }
    if (part.vis) {
      part.vis.style.transform = 'translate3d(0,' + visY.toFixed(2) + 'px,0) scale(' + visScale.toFixed(4) + ')';
      part.vis.style.opacity = visO.toFixed(3);
    }
  }

  function clearSlide(part) {
    part.el.style.opacity = '';
    part.el.style.visibility = '';
    part.el.classList.remove('is-current');
    if (part.copy) { part.copy.style.transform = ''; part.copy.style.opacity = ''; }
    if (part.vis) { part.vis.style.transform = ''; part.vis.style.opacity = ''; }
  }

  /* paint() renders the whole hero from the smoothed `current` value.
     Layers 1-3 (scrub assembly, depth, micro-motion) plug in here. */
  function paint() {
    var p = current * (N - 1);
    var active = clamp(Math.round(p), 0, N - 1);

    // Each slide: fades/rises in over the half-segment before its center,
    // holds for the half-segment after, then rises out over the next half.
    for (var i = 0; i < N; i++) {
      var t = p - i;
      if (t >= 1 || t < -0.5) {
        setSlide(parts[i], 0, 0, 0, 0, 1, false, false);
        continue;
      }
      var copyY = 0, copyO = 1, visY = 0, visO = 1, scale = 1;
      if (t > 0.5) {
        // outgoing: translate up + fade out
        var k = easeOutCubic((t - 0.5) / 0.5);
        copyY = -DRIFT_COPY * k; copyO = 1 - k;
        visY = -DRIFT_VISUAL * k; visO = 1 - k;
      } else if (t < 0) {
        // incoming: rise from below + fade in + scale 0.96 -> 1
        var e = easeOutCubic((t + 0.5) / 0.5);
        copyY = DRIFT_COPY * (1 - e); copyO = e;
        visY = DRIFT_VISUAL * (1 - e); visO = e;
        scale = SCALE_FROM + (1 - SCALE_FROM) * e;
      }
      var shown = copyO > 0.01 || visO > 0.01;
      setSlide(parts[i], copyY, copyO, visY, visO, scale, shown, i === active);
    }

    // glow parallax from the smoothed value (preserves translateX centering)
    if (glow) glow.style.transform = 'translateX(-50%) translateY(' + (current * 48 - 24).toFixed(1) + 'px)';
    setGlow(active);
    setDotsActive(active);
  }

  function frame() {
    rafId = null;
    if (isStatic) return;
    if (current === -1) {
      // first paint after load/mode-switch: snap, no glide-in from 0
      current = target;
      velocity = 0;
      paint();
      rafId = requestAnimationFrame(frame);
      return;
    }
    var delta = target - current;
    if (Math.abs(delta) < 0.0001) {
      if (current !== target) { current = target; velocity = 0; paint(); }
      velocity = 0;
      return; // settled — park the loop; onScroll() re-kicks it
    }
    var prev = current;
    current = current + delta * EASE;
    velocity = current - prev;
    paint();
    rafId = requestAnimationFrame(frame);
  }

  function kick() {
    if (rafId === null && !isStatic) rafId = requestAnimationFrame(frame);
  }

  function onScroll() {
    readTarget();
    kick();
  }

  function onResize() {
    measure();
    kick();
    if (carouselBound) {
      carIdx = -1; // force re-measure of active slide height after the reflow
      onCarouselScroll();
    }
  }

  // progress rail: click a dot to scroll to that slide's position
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (isStatic) {
        // mobile swipe deck: page the carousel horizontally to slide i
        if (carouselBound && slidesEl) {
          slidesEl.scrollTo({ left: i * slidesEl.clientWidth, behavior: 'smooth' });
        }
        return;
      }
      window.scrollTo({ top: Math.round(trackTop + (i / (N - 1)) * total), behavior: 'smooth' });
    });
  });

  // mobile static mode: gentle per-slide reveals (skipped under reduced motion)
  function teardownIO() {
    if (io) { io.disconnect(); io = null; }
    slides.forEach(function (s) { s.classList.remove('io-pending', 'io-in'); });
  }

  /* adaptive height: size the deck to the current slide so sparse slides
     don't sit in a tall empty panel inherited from the dense ones */
  function setDeckHeight(idx) {
    if (!slidesEl || !slides[idx]) return;
    var h = slides[idx].offsetHeight;
    if (h) slidesEl.style.height = h + 'px';
  }

  /* mobile swipe deck: keep the dots, glow + deck height synced to the slide */
  function onCarouselScroll() {
    var w = slidesEl.clientWidth;
    if (!w) return;
    var idx = clamp(Math.round(slidesEl.scrollLeft / w), 0, N - 1);
    if (idx === carIdx) return;
    carIdx = idx;
    setDotsActive(idx);
    setGlow(idx);
    setDeckHeight(idx);
  }

  function bindCarousel() {
    if (carouselBound || !slidesEl) return;
    carIdx = 0;
    slidesEl.scrollLeft = 0;
    setDotsActive(0);
    setGlow(0);
    setDeckHeight(0);
    slidesEl.addEventListener('scroll', onCarouselScroll, { passive: true });
    carouselBound = true;
  }

  function unbindCarousel() {
    if (!carouselBound) return;
    slidesEl.removeEventListener('scroll', onCarouselScroll);
    slidesEl.style.height = '';
    carouselBound = false;
    carIdx = -1;
  }

  function setupIO() {
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('io-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    slides.forEach(function (s) { s.classList.add('io-pending'); io.observe(s); });
  }

  function applyMode() {
    isStatic = mqReduce.matches || mqMobile.matches;
    hero.classList.toggle('is-static', isStatic);
    // mobile gets the horizontal swipe deck; reduced-motion desktop stays stacked
    hero.classList.toggle('is-carousel', mqMobile.matches);
    teardownIO();
    unbindCarousel();
    if (isStatic) {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      parts.forEach(clearSlide);
      if (glow) glow.style.transform = '';
      setGlow(0);
      if (mqMobile.matches) {
        // swipe deck: dots act as the pager, synced to scroll position
        setDotsActive(0);
        bindCarousel();
      } else if (!mqReduce.matches) {
        setupIO();
      }
    } else {
      measure();
      current = -1; // snap to position, then glide from there
      kick();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize);
  if (mqReduce.addEventListener) {
    mqReduce.addEventListener('change', applyMode);
    mqMobile.addEventListener('change', applyMode);
  } else if (mqReduce.addListener) {
    mqReduce.addListener(applyMode);
    mqMobile.addListener(applyMode);
  }

  applyMode();
})();

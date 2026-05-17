// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
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
}, { threshold: 0.1 });
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
const WEB3FORMS_KEY = '8a8ee698-8c4b-42d6-974b-cdbbffcc7cc7'; // Get yours at https://web3forms.com

let waitlistEmail = '';

// Step 1: Validate email → show involvement options
function handleWaitlistStep1() {
  const form = document.getElementById('waitlist-form-main');
  const input = form.querySelector('input[type="email"]');
  const email = input.value.trim();

  // Validate
  if (!email || !email.includes('@') || !email.includes('.')) {
    input.style.borderColor = '#EF4444';
    input.setAttribute('placeholder', 'Please enter a valid email');
    setTimeout(() => {
      input.style.borderColor = '';
      input.setAttribute('placeholder', 'your@email.com');
    }, 2000);
    return;
  }

  // Store email for step 2
  waitlistEmail = email;

  // Hide form, show step 2
  form.style.display = 'none';
  document.getElementById('waitlist-note').style.display = 'none';
  document.getElementById('waitlist-step-2').style.display = 'block';
}

// Enable confirm button when a radio is selected
document.addEventListener('change', (e) => {
  if (e.target.name === 'involvement') {
    const btn = document.getElementById('waitlist-step2-btn');
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
});

// Step 2: Submit email + involvement intent
async function handleWaitlistStep2() {
  const involvement = document.querySelector('input[name="involvement"]:checked');
  if (!involvement || !waitlistEmail) return;

  const btn = document.getElementById('waitlist-step2-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sending...';
  btn.disabled = true;

  const intentLabels = {
    notify: '👀 Notify at launch',
    beta: '🧪 Beta tester',
    founding: '🚀 Founding access (ready to pay)'
  };

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: '🚀 New Xolvyn Waitlist Signup',
        from_name: 'Xolvyn Waitlist',
        email: waitlistEmail,
        message: `New waitlist signup: ${waitlistEmail}\nIntent: ${intentLabels[involvement.value] || involvement.value}\n\nTimestamp: ${new Date().toISOString()}`
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('waitlist-step-2').style.display = 'none';
      const successEl = document.getElementById('waitlist-success');
      successEl.style.display = 'block';

      // Customize success message based on intent
      if (involvement.value === 'founding') {
        successEl.innerHTML = '&#10003; You\'re on the <strong>founding access</strong> list. A founder will reach out personally.';
      } else if (involvement.value === 'beta') {
        successEl.innerHTML = '&#10003; You\'re in the <strong>beta program</strong>. We\'ll reach out soon with early access.';
      } else {
        successEl.innerHTML = '&#10003; You\'re on the list. We\'ll email you at launch.';
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

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + Math.floor(current) + suffix;
    }, 30);
  });
}
const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      metricsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
const metricsSection = document.querySelector('.metrics-grid');
if (metricsSection) metricsObserver.observe(metricsSection);

// ===== DEPENDENCY GRAPH SVG LINES =====
function drawLines() {
  const svg = document.getElementById('graph-lines');
  if (!svg) return;
  const graph = document.querySelector('.dep-graph');
  const nodes = document.querySelectorAll('.graph-node');
  const connections = [
    [0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[0,7],[7,8],[3,8]
  ];
  svg.innerHTML = '';
  const gRect = graph.getBoundingClientRect();
  connections.forEach(([a,b]) => {
    const na = nodes[a], nb = nodes[b];
    if (!na || !nb) return;
    const ra = na.getBoundingClientRect();
    const rb = nb.getBoundingClientRect();
    const x1 = ra.left + ra.width/2 - gRect.left;
    const y1 = ra.top + ra.height/2 - gRect.top;
    const x2 = rb.left + rb.width/2 - gRect.left;
    const y2 = rb.top + rb.height/2 - gRect.top;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1);line.setAttribute('y1',y1);
    line.setAttribute('x2',x2);line.setAttribute('y2',y2);
    line.setAttribute('stroke','#3B82F6');
    svg.appendChild(line);
  });
}
window.addEventListener('load', () => setTimeout(drawLines, 600));
window.addEventListener('resize', drawLines);

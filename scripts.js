// Mobile Navbar
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Theme toggle (sun / moon) - persiste em localStorage and respects system preference
const themeToggleBtn = document.getElementById('theme-toggle');
function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  localStorage.setItem('theme', theme);
  if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', theme === 'dark');
}

// initialize theme
const initialTheme = getPreferredTheme();
applyTheme(initialTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// Close nav on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => { navLinks.classList.remove('open'); });
});

// Scroll-in Animations
// Use IntersectionObserver for performant scroll-in animations and stagger
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const fadeEls = document.querySelectorAll('.anim-fade-in');
  // assign delays per group (so cards in a grid stagger)
  const groups = ['.projeto-card'];
  groups.forEach(selector => {
    const els = Array.from(document.querySelectorAll(selector));
    els.forEach((el, i) => el.dataset.delay = (i * 0.12).toFixed(2));
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || '0';
        el.style.animationDelay = delay + 's';
        el.classList.add('in-view');
        // ensure animation runs even if CSS doesn't set play-state
        el.style.animationPlayState = 'running';
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.anim-fade-in').forEach(el => {
    // keep them paused until observed
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// FAQ Expand/Collapse
document.querySelectorAll('.faq-question').forEach(btn => {
  const handleClick = function () {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    // Respect reduced motion: simple toggle
    if (prefersReduced) {
      item.classList.toggle('open');
      btn.setAttribute('aria-expanded', item.classList.contains('open'));
      return;
    }

    if (isOpen) {
      // collapse
      answer.style.maxHeight = answer.scrollHeight + 'px';
      // force repaint then set to 0 to animate
      requestAnimationFrame(() => {
        answer.style.transition = 'max-height 0.35s ease, padding-bottom 0.35s ease';
        answer.style.maxHeight = '0';
      });
      item.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      // expand
      item.classList.add('open');
      // set to measured height to trigger transition
      const h = answer.scrollHeight;
      answer.style.transition = 'max-height 0.45s cubic-bezier(.2,.9,.2,1), padding-bottom 0.35s ease';
      answer.style.maxHeight = h + 'px';
      btn.setAttribute('aria-expanded', 'true');

      // after transition ends, clear maxHeight so content can resize naturally
      const onEnd = (e) => {
        if (e.propertyName === 'max-height') {
          answer.style.maxHeight = 'none';
          answer.removeEventListener('transitionend', onEnd);
        }
      };
      answer.addEventListener('transitionend', onEnd);
    }
  };

  btn.addEventListener('click', handleClick);
});

// Contact Form Submission (Formspree)
const contactForm = document.getElementById('contato-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');

    // UI Loading state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Enviando...';
    submitBtn.disabled = true;
    formStatus.style.display = 'none';
    formStatus.className = '';

    try {
      const response = await fetch(this.action, {
        method: this.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        formStatus.innerText = "Mensagem enviada com sucesso! Entraremos em contato em breve.";
        formStatus.style.color = "var(--primary)";
        formStatus.style.display = 'block';
        contactForm.reset();
      } else {
        // Error from server
        const data = await response.json();
        if (Object.hasOwnProperty.call(data, 'errors')) {
          const errorMessages = data.errors.map(error => error.message).join(", ");
          formStatus.innerText = `Erro: ${errorMessages}`;
        } else {
          formStatus.innerText = "Ops! Ocorreu um problema ao enviar. Tente novamente.";
        }
        formStatus.style.color = "#dc3545"; // Red color for error
        formStatus.style.display = 'block';
      }
    } catch (error) {
      // Network error
      formStatus.innerText = "Erro de conexão. Verifique sua internet e tente novamente.";
      formStatus.style.color = "#dc3545";
      formStatus.style.display = 'block';
    } finally {
      // Reset button
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}
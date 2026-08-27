/**
 * ASTRAL CRUISER 5000 - Core Interactive System
 * Starfield Engine, Web Audio HUD FX, Telemetry Sim, Lightbox, Pass Generator & Smooth Motion
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initAudioSystem();
  initNavigation();
  initTelemetryClock();
  initScrollAnimations();
  initCounters();
  initTextScramble();
  initLightbox();
  initBookingSimulator();
  initFaqAccordion();
  initSubsystemInspector();
});

/* ==========================================================================
   1. CANVAS STARFIELD & SOLAR PARTICLES
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let stars = [];
  let solarSparks = [];
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    stars = [];
    solarSparks = [];
    const starCount = Math.floor((width * height) / 3200);
    const sparkCount = Math.floor(width / 35);

    // Deep space stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.2 + 0.05,
        color: Math.random() > 0.8 ? '#FFB74D' : (Math.random() > 0.6 ? '#64D2FF' : '#FFFFFF')
      });
    }

    // Floating golden coronal sparks
    for (let i = 0; i < sparkCount; i++) {
      solarSparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4 + 0.3,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        life: Math.random() * 100,
        maxLife: Math.random() * 120 + 80,
        color: Math.random() > 0.5 ? 'rgba(255, 179, 0, ' : 'rgba(255, 94, 0, '
      });
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) * 0.025;
    targetMouseY = (e.clientY - height / 2) * 0.025;
  });

  resize();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse parallax easing
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Draw background nebula aura
    const gradient = ctx.createRadialGradient(
      width * 0.8 + mouseX * 2, height * 0.2 + mouseY * 2, 50,
      width * 0.8 + mouseX * 2, height * 0.2 + mouseY * 2, width * 0.7
    );
    gradient.addColorStop(0, 'rgba(255, 110, 0, 0.07)');
    gradient.addColorStop(0.5, 'rgba(0, 180, 255, 0.03)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Render stars
    for (let star of stars) {
      star.twinklePhase += star.twinkleSpeed;
      const currentAlpha = star.alpha + Math.sin(star.twinklePhase) * 0.25;
      const clampedAlpha = Math.max(0.1, Math.min(1, currentAlpha));

      const drawX = star.x - mouseX * (star.radius * 0.8);
      const drawY = star.y - mouseY * (star.radius * 0.8);

      ctx.fillStyle = star.color;
      ctx.globalAlpha = clampedAlpha;
      ctx.beginPath();
      ctx.arc(
        (drawX + width) % width,
        (drawY + height) % height,
        star.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Render golden solar sparks
    for (let spark of solarSparks) {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life++;

      if (spark.life > spark.maxLife || spark.x > width || spark.x < 0 || spark.y < 0 || spark.y > height) {
        spark.x = Math.random() * width * 0.3;
        spark.y = Math.random() * height;
        spark.life = 0;
      }

      const opacity = Math.sin((spark.life / spark.maxLife) * Math.PI) * 0.6;
      ctx.fillStyle = spark.color + opacity + ')';
      ctx.beginPath();
      ctx.arc(spark.x - mouseX * 1.5, spark.y - mouseY * 1.5, spark.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. SYNTHESIZED WEB AUDIO HUD SOUNDS
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioSystem() {
  const soundBtn = document.getElementById('sound-toggle');
  if (!soundBtn) return;

  function toggleAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('active', soundEnabled);
    soundBtn.setAttribute('aria-pressed', soundEnabled);
    soundBtn.querySelector('.sound-label').textContent = soundEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';

    if (soundEnabled) {
      playSciFiBeep(880, 0.08, 'sine');
      setTimeout(() => playSciFiBeep(1320, 0.12, 'sine'), 80);
    }
  }

  soundBtn.addEventListener('click', toggleAudio);

  // Add click sounds to interactive items
  document.querySelectorAll('a, button, .interactive-item, .filter-btn, .tab-btn').forEach(el => {
    el.addEventListener('click', () => {
      if (soundEnabled) {
        playSciFiBeep(1200, 0.05, 'triangle');
      }
    });
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) {
        playSciFiBeep(600, 0.03, 'sine', 0.03);
      }
    });
  });
}

function playSciFiBeep(frequency = 800, duration = 0.08, type = 'sine', volume = 0.08) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    // Audio fail safe
  }
}

/* ==========================================================================
   3. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const nav = document.querySelector('.navbar');
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-links');

  // Navbar scroll glass effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close when clicking link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active page link highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   4. LIVE TELEMETRY CLOCK & HUD VALUES
   ========================================================================== */
function initTelemetryClock() {
  const clockEl = document.getElementById('hud-utc-time');
  const missionDayEl = document.getElementById('hud-mission-day');
  const fluxValEl = document.getElementById('hud-flux-val');
  const shieldValEl = document.getElementById('hud-shield-val');

  function updateClock() {
    const now = new Date();
    const utcString = now.toUTCString().replace('GMT', 'UTC');
    if (clockEl) clockEl.textContent = utcString;

    // Subtle realistic fluctuation for live telemetry
    if (fluxValEl) {
      const baseFlux = 1420;
      const jitter = Math.floor(Math.sin(Date.now() / 1500) * 14 + (Math.random() * 4));
      fluxValEl.textContent = `${baseFlux + jitter} W/m²`;
    }
    if (shieldValEl) {
      const baseShield = 99.84;
      const shieldJitter = (Math.sin(Date.now() / 2000) * 0.04).toFixed(2);
      shieldValEl.textContent = `${(baseShield + parseFloat(shieldJitter)).toFixed(2)}%`;
    }
  }

  setInterval(updateClock, 1000);
  updateClock();
}

/* ==========================================================================
   5. SCROLL TRIGGERED REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .glass-card, .stat-box, .timeline-item').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   6. INTERACTIVE NUMBER COUNTERS
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.getAttribute('data-target'));
        const suffix = entry.target.getAttribute('data-suffix') || '';
        const decimals = parseInt(entry.target.getAttribute('data-decimals') || '0', 10);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = (target * easeOut).toFixed(decimals);

          entry.target.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            entry.target.textContent = target.toFixed(decimals) + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => counterObserver.observe(c));
}

/* ==========================================================================
   7. SCI-FI HUD TEXT SCRAMBLE EFFECT
   ========================================================================== */
function initTextScramble() {
  const scrambleElements = document.querySelectorAll('[data-scramble]');
  const chars = 'ABCDEF0123456789§∆∑Ω#%&*<>[]{}';

  scrambleElements.forEach(el => {
    const originalText = el.textContent.trim();
    let isRunning = false;

    function scramble() {
      if (isRunning) return;
      isRunning = true;
      let iteration = 0;
      const maxIterations = originalText.length * 3;

      const interval = setInterval(() => {
        el.textContent = originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 3) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        iteration++;

        if (iteration >= maxIterations) {
          clearInterval(interval);
          el.textContent = originalText;
          isRunning = false;
        }
      }, 25);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(el);
  });
}

/* ==========================================================================
   8. LIGHTBOX MODAL & GALLERY FILTER
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const titleEl = lightbox.querySelector('.lightbox-title');
  const descEl = lightbox.querySelector('.lightbox-desc');
  const metaAU = lightbox.querySelector('.meta-au');
  const metaRadiation = lightbox.querySelector('.meta-radiation');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentItems = [];
  let currentIndex = 0;

  function updateItems() {
    currentItems = Array.from(document.querySelectorAll('.gallery-card:not(.hidden)'));
  }

  function openLightbox(index) {
    updateItems();
    if (index < 0 || index >= currentItems.length) return;
    currentIndex = index;
    const card = currentItems[currentIndex];
    const img = card.querySelector('img');

    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
    if (titleEl) titleEl.textContent = card.getAttribute('data-title') || img.alt;
    if (descEl) descEl.textContent = card.getAttribute('data-desc') || 'Solar Observation Mission Capture';
    if (metaAU) metaAU.textContent = card.getAttribute('data-au') || '0.046 AU';
    if (metaRadiation) metaRadiation.textContent = card.getAttribute('data-radiation') || 'Nominal (Class-5 Deflection)';

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (soundEnabled) playSciFiBeep(1000, 0.08, 'sine');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function nextImage() {
    if (currentItems.length === 0) return;
    currentIndex = (currentIndex + 1) % currentItems.length;
    openLightbox(currentIndex);
  }

  function prevImage() {
    if (currentItems.length === 0) return;
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    openLightbox(currentIndex);
  }

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      updateItems();
      const index = currentItems.indexOf(card);
      if (index !== -1) openLightbox(index);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', nextImage);
  prevBtn?.addEventListener('click', prevImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Category filters
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('.gallery-card').forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.display = 'block';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
      updateItems();
    });
  });
}

/* ==========================================================================
   9. INTERACTIVE FLIGHT BOOKING & BOARDING PASS GENERATOR
   ========================================================================== */
function initBookingSimulator() {
  const form = document.getElementById('booking-form');
  const passContainer = document.getElementById('boarding-pass-result');
  if (!form) return;

  const tierPrices = {
    'observation': 450000,
    'research': 850000,
    'vip-quantum': 1600000
  };

  const tierNames = {
    'observation': 'Orbital Observer Suite',
    'research': 'Solar Research Specialist Pod',
    'vip-quantum': 'Commander VIP Quantum Quarters'
  };

  function calculatePrice() {
    const tier = form.querySelector('input[name="tier"]:checked')?.value || 'observation';
    const travelers = parseInt(form.querySelector('#travelers')?.value || '1', 10);
    const duration = parseInt(form.querySelector('#mission-duration')?.value || '30', 10);

    const baseCost = tierPrices[tier] * travelers;
    const durationMultiplier = 1 + ((duration - 30) / 60) * 0.4;
    const total = Math.round(baseCost * durationMultiplier);

    const priceDisplay = document.getElementById('live-calculated-price');
    if (priceDisplay) {
      priceDisplay.textContent = `₡ ${total.toLocaleString()} CR`;
    }
  }

  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', calculatePrice);
    input.addEventListener('input', calculatePrice);
  });
  calculatePrice();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#passenger-name')?.value || 'Astronaut Explorer';
    const email = form.querySelector('#passenger-email')?.value || 'cadet@solarcruiser.space';
    const tier = form.querySelector('input[name="tier"]:checked')?.value || 'observation';
    const departure = form.querySelector('#launch-window')?.value || '2026-11-14';
    const seatId = `AC5-${Math.floor(Math.random() * 89 + 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;
    const barcodeNum = `779-0500-${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (passContainer) {
      passContainer.innerHTML = `
        <div class="boarding-pass glass-card animated-pass">
          <div class="pass-header">
            <div class="pass-brand">
              <span class="pass-logo-badge">✦</span>
              <div>
                <h4>ASTRAL CRUISER 5000</h4>
                <p class="sub">SOLAR EXPEDITION BOARDING CLEARANCE</p>
              </div>
            </div>
            <div class="pass-flight-badge">FLIGHT AC-5000</div>
          </div>
          <div class="pass-body">
            <div class="pass-col">
              <span class="lbl">PASSENGER NAME</span>
              <span class="val highlight">${escapeHtml(name)}</span>
            </div>
            <div class="pass-col">
              <span class="lbl">CABIN TIER</span>
              <span class="val">${tierNames[tier]}</span>
            </div>
            <div class="pass-col">
              <span class="lbl">LAUNCH WINDOW</span>
              <span class="val">${departure} • 06:00 UTC</span>
            </div>
            <div class="pass-col">
              <span class="lbl">SEAT / POD</span>
              <span class="val glow-cyan">${seatId}</span>
            </div>
            <div class="pass-col">
              <span class="lbl">GATEWAY STATION</span>
              <span class="val">LEO Orbital Station Dock 7</span>
            </div>
            <div class="pass-col">
              <span class="lbl">MAX G-RATING</span>
              <span class="val">2.8 G (Anti-G Ring Enabled)</span>
            </div>
          </div>
          <div class="pass-footer">
            <div class="barcode-graphic">
              <div class="bars"></div>
              <span>${barcodeNum}</span>
            </div>
            <div class="pass-actions">
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.print()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                PRINT HUD PASS
              </button>
            </div>
          </div>
        </div>
      `;
      passContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (soundEnabled) {
        playSciFiBeep(880, 0.1, 'sine');
        setTimeout(() => playSciFiBeep(1760, 0.15, 'sine'), 100);
      }
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/* ==========================================================================
   10. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   11. FLEET SUBSYSTEM INSPECTOR
   ========================================================================== */
function initSubsystemInspector() {
  const hotSpots = document.querySelectorAll('.blueprint-spot');
  const detailsPanel = document.getElementById('subsystem-details');
  if (!hotSpots.length || !detailsPanel) return;

  const data = {
    'thermal': {
      title: 'Solar Flare Heat Deflector Shield',
      specs: 'Multilayer carbon-aerogel & gold-refraction tile array. Max thermal dissipation 5.5 Million °C at 0.038 AU perihelion. Self-regenerating magnetic plasma field active.',
      status: 'OPTIMAL (100% Structural Integrity)'
    },
    'engine': {
      title: 'Quantum Ion Fusion Drive',
      specs: 'Dual-phase antimatter catalyzed plasma pulse thruster generating 4.8 million Newtons of continuous thrust with specific impulse of 28,000 seconds.',
      status: 'SYNCHRONIZED (Delta-V 142 km/s)'
    },
    'hab': {
      title: 'Centrifugal Artificial Gravity Habitation Ring',
      specs: 'Continuous 1.0 Earth-G rotational ring equipped with electromagnetic radiation shelters, luxury suites, hydroponic bio-gardens, and solar observatory lounge.',
      status: 'PRESSURIZED (101.3 kPa / 21% O₂)'
    },
    'harvest': {
      title: 'Coronal Plasma Energy Harvester',
      specs: 'Magnetic funnel collection array that siphons solar wind protons and electrons directly into the main capacitor storage banks during close solar passes.',
      status: 'CHARGING (9.4 Terawatt Capacity)'
    }
  };

  hotSpots.forEach(spot => {
    spot.addEventListener('click', () => {
      hotSpots.forEach(s => s.classList.remove('active'));
      spot.classList.add('active');

      const sysKey = spot.getAttribute('data-system');
      const sys = data[sysKey];
      if (sys) {
        detailsPanel.innerHTML = `
          <div class="subsystem-card glass-card reveal is-visible">
            <div class="badge-status online">${sys.status}</div>
            <h3 class="glow-title">${sys.title}</h3>
            <p>${sys.specs}</p>
          </div>
        `;
        if (soundEnabled) playSciFiBeep(1400, 0.08, 'sine');
      }
    });
  });
}

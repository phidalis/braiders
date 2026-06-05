/* ============================================
   ANI BRAIDS — index.js
   Main website JavaScript
   ============================================ */

// =================== HAIRSTYLE DATA ===================
let hairstyles = [];



const livePopups = [
  { name: "Amara S.", style: "Goddess Box Braids", time: "2 min ago" },
  { name: "Faith K.", style: "Knotless Braids", time: "5 min ago" },
  { name: "Destiny M.", style: "Boho Braids", time: "8 min ago" },
  { name: "Grace N.", style: "Butterfly Locs", time: "12 min ago" },
  { name: "Purity W.", style: "Bridal Crown Braids", time: "just now" },
  { name: "Joy A.", style: "Fulani Braids", time: "3 min ago" },
];

// =================== STATE ===================
let currentCategory = "trending";
let visibleCount = 10;
let likedCards = new Set(); // session-only for unauthenticated visitors
let heroSlideIndex = 0;
let activeHairTypeFilter = 'all'; // hair type filter state

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  loadHeroFromFirestore(); // loads slides & content from Firestore, then starts slider
  initCategories();
  initBookingForm();
  initModals();
  initBookingStepsModal();
  initLivePopups();
  initOfferTimer();
  initScrollReveal();
  initNewsletter();
  setMinBookingDate();
});

// =================== NAVBAR ===================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  document.querySelectorAll('.nav-mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// =================== HERO — FIRESTORE POWERED ===================
async function loadHeroFromFirestore() {
  // Wait for Firebase to be ready
  let tries = 0;
  while (!window._fbGetDoc && tries < 20) { await new Promise(r => setTimeout(r, 300)); tries++; }
  if (!window._fbGetDoc) { initHeroSlider(); return; } // fallback

  const getDoc = window._fbGetDoc;
  const docRef = window._fbDoc;
  const db = window.firebaseDb;

  // ---- Load Hero Slides ----
  try {
    const snap = await getDoc(docRef(db, 'settings', 'heroSlides'));
    if (snap.exists()) {
      const list = (snap.data().list || []).sort((a,b) => (a.order||0)-(b.order||0));
      if (list.length) {
        buildHeroSlides(list);
      }
    }
  } catch(e) { /* keep default static slides */ }

  // ---- Load Hero Content ----
  try {
    const snap = await getDoc(docRef(db, 'settings', 'heroContent'));
    if (snap.exists()) {
      applyHeroContent(snap.data());
    }
  } catch(e) { /* keep default static content */ }

  initHeroSlider();
}

function buildHeroSlides(slides) {
  const slider = document.getElementById('heroSlider');
  const dotsContainer = document.querySelector('.slider-dots');
  if (!slider) return;

  slider.innerHTML = slides.map((slide, i) => {
    const bgStyle = slide.gradient || 'linear-gradient(135deg, #1a0a0f 0%, #3d0a2a 40%, #1a0a0f 100%)';
    const activeClass = i === 0 ? ' active' : '';
    if (slide.imageUrl) {
      // Full-bleed image slide — image sits below hero-overlay so text remains readable
      return `<div class="hero-slide${activeClass}" style="background:${bgStyle};overflow:hidden;">
        <img src="${slide.imageUrl}" alt="Hero slide ${i+1}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.72;z-index:0;"/>
      </div>`;
    } else {
      // Gradient-only slide with decorative braid art
      return `<div class="hero-slide${activeClass}" style="background:${bgStyle};">
        <div class="slide-visual">
          <div class="slide-img-placeholder">
            <div class="braid-art">
              <div class="braid-circle c1"></div>
              <div class="braid-circle c2"></div>
              <div class="braid-circle c3"></div>
            </div>
          </div>
        </div>
      </div>`;
    }
  }).join('');

  // Rebuild dots to match new slide count
  if (dotsContainer) {
    dotsContainer.innerHTML = slides.map((_, i) =>
      `<button class="dot${i===0?' active':''}" data-slide="${i}"></button>`
    ).join('');
  }
  heroSlideIndex = 0;
}

function applyHeroContent(d) {
  // Title
  if (typeof d.showTitle !== 'undefined' && !d.showTitle) {
    const titleEl = document.querySelector('.hero-title');
    if (titleEl) titleEl.style.display = 'none';
  } else {
    const line1 = document.querySelector('.hero-title .title-line:first-child');
    const line2 = document.querySelector('.hero-title .title-line.accent');
    if (line1 && d.titleLine1) line1.textContent = d.titleLine1;
    if (line2 && d.titleLine2) line2.textContent = d.titleLine2;
  }

  // Subtitle
  const subtitleEl = document.querySelector('.hero-subtitle');
  if (subtitleEl) {
    if (typeof d.showSubtitle !== 'undefined' && !d.showSubtitle) {
      subtitleEl.style.display = 'none';
    } else if (d.subtitle) {
      subtitleEl.textContent = d.subtitle;
    }
  }

  // Badge
  const badgeEl = document.querySelector('.hero-badge');
  if (badgeEl) {
    if (typeof d.showBadge !== 'undefined' && !d.showBadge) {
      badgeEl.style.display = 'none';
    } else {
      const badgeTxt = badgeEl.querySelector('span:last-child');
      if (badgeTxt && d.badgeText) badgeTxt.textContent = d.badgeText;
    }
  }

  // Buttons
  const ctaEl = document.querySelector('.hero-cta');
  if (ctaEl) {
    const btn1 = ctaEl.querySelector('.btn-hero-primary');
    const btn2 = ctaEl.querySelector('.btn-hero-secondary');

    if (btn1) {
      if (typeof d.showBtn1 !== 'undefined' && !d.showBtn1) {
        btn1.style.display = 'none';
      } else {
        // btn1 structure: <i class icon></i> TEXT <span class shimmer></span>
        // safely update only the text node between icon and shimmer
        if (d.btn1Label) {
          const iconEl = btn1.querySelector('i');
          const shimmerEl = btn1.querySelector('.btn-shimmer');
          btn1.innerHTML = '';
          if (iconEl) btn1.appendChild(iconEl);
          btn1.appendChild(document.createTextNode(' ' + d.btn1Label + ' '));
          if (shimmerEl) btn1.appendChild(shimmerEl);
          else btn1.insertAdjacentHTML('beforeend', '<span class="btn-shimmer"></span>');
        }
        if (d.btn1Link) btn1.href = d.btn1Link;
      }
    }
    if (btn2) {
      if (typeof d.showBtn2 !== 'undefined' && !d.showBtn2) {
        btn2.style.display = 'none';
      } else {
        // btn2 structure: TEXT <i class arrow></i>
        if (d.btn2Label) {
          const iconEl = btn2.querySelector('i');
          btn2.innerHTML = '';
          btn2.appendChild(document.createTextNode(d.btn2Label + ' '));
          if (iconEl) btn2.appendChild(iconEl);
          else btn2.insertAdjacentHTML('beforeend', '<i class="fas fa-arrow-right"></i>');
        }
        if (d.btn2Link) btn2.href = d.btn2Link;
      }
    }
  }

  // Stats
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    if (typeof d.showStats !== 'undefined' && !d.showStats) {
      statsEl.style.display = 'none';
    } else {
      const nums = statsEl.querySelectorAll('.stat-num');
      const labels = statsEl.querySelectorAll('.stat-label');
      if (nums[0] && d.stat1Num) nums[0].textContent = d.stat1Num;
      if (labels[0] && d.stat1Label) labels[0].textContent = d.stat1Label;
      if (nums[1] && d.stat2Num) nums[1].textContent = d.stat2Num;
      if (labels[1] && d.stat2Label) labels[1].textContent = d.stat2Label;
      if (nums[2] && d.stat3Num) nums[2].textContent = d.stat3Num;
      if (labels[2] && d.stat3Label) labels[2].textContent = d.stat3Label;
    }
  }
}

// =================== HERO SLIDER ===================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  function goToSlide(index) {
    if (!slides[heroSlideIndex] || !slides[index]) return;
    slides[heroSlideIndex].classList.remove('active');
    if (dots[heroSlideIndex]) dots[heroSlideIndex].classList.remove('active');
    heroSlideIndex = index;
    slides[heroSlideIndex].classList.add('active');
    if (dots[heroSlideIndex]) dots[heroSlideIndex].classList.add('active');
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  setInterval(() => {
    goToSlide((heroSlideIndex + 1) % slides.length);
  }, 5000);
}
function initCategories() {
  // Category nav clicking is handled inside renderStyles after catalog is built
}

// =================== HAIR TYPE FILTER ===================
function filterByHairType(ht, btn) {
  activeHairTypeFilter = ht;
  document.querySelectorAll('.ht-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStyles();
}

function buildHairTypeFilterBar(types) {
  const bar = document.getElementById('hairTypeFilterBar');
  if (!bar) return;
  bar.innerHTML = `<button class="ht-filter-btn ${activeHairTypeFilter==='all'?'active':''}" data-ht="all" onclick="filterByHairType('all',this)">All</button>` +
    types.map(ht => `<button class="ht-filter-btn ${activeHairTypeFilter===ht?'active':''}" data-ht="${ht}" onclick="filterByHairType('${ht}',this)">${ht}</button>`).join('');
}

// =================== CATEGORY SECTION DEFINITIONS ===================
const catalogSections = [
  {
    key: 'trending',
    icon: '🔥',
    eyebrow: 'Hot Right Now',
    title: 'Trending This Week',
    subtitle: 'The styles everyone is booking right now',
    theme: 'theme-rose',
    accentColor: '#c2637a',
    showTimer: true,
  },
  {
    key: 'new',
    icon: '✨',
    eyebrow: 'Just Dropped',
    title: 'New Arrivals',
    subtitle: 'Fresh styles added to our collection',
    theme: 'theme-mauve',
    accentColor: '#9b6b9e',
    showTimer: false,
  },
  {
    key: 'most-booked',
    icon: '👑',
    eyebrow: 'Client Favourites',
    title: 'Most Booked',
    subtitle: 'The styles our clients keep coming back for',
    theme: 'theme-gold',
    accentColor: '#b8945a',
    showTimer: false,
  },
  {
    key: 'luxury',
    icon: '💎',
    eyebrow: 'Premium Collection',
    title: 'Luxury Styles',
    subtitle: 'Elevated artistry for the woman who wants the best',
    theme: 'theme-plum',
    accentColor: '#7c3a6e',
    showTimer: false,
  },
  {
    key: 'budget',
    icon: '💸',
    eyebrow: 'Great Value',
    title: 'Budget Friendly',
    subtitle: 'Beautiful braids that don\'t break the bank',
    theme: 'theme-teal',
    accentColor: '#4a8fa0',
    showTimer: false,
  },
  {
    key: 'bridal',
    icon: '💍',
    eyebrow: 'Special Occasions',
    title: 'Bridal & Events',
    subtitle: 'Your big day deserves a crown-worthy look',
    theme: 'theme-blush',
    accentColor: '#c2637a',
    showTimer: false,
  },
  {
    key: 'kids',
    icon: '🎀',
    eyebrow: 'Little Queens',
    title: 'Kids Styles',
    subtitle: 'Gentle, fun braids made for little royalty',
    theme: 'theme-lavender',
    accentColor: '#8b6abf',
    showTimer: false,
  },
  {
    key: 'mens',
    icon: '✂️',
    eyebrow: 'Sharp & Clean',
    title: "Men's Braids",
    subtitle: 'Geometric designs for men who mean business',
    theme: 'theme-slate',
    accentColor: '#4a6080',
    showTimer: false,
  },
  {
    key: 'quick',
    icon: '⚡',
    eyebrow: 'In & Out',
    title: 'Quick Styles',
    subtitle: 'Stunning looks done in under 4 hours',
    theme: 'theme-amber',
    accentColor: '#c08040',
    showTimer: false,
  },
  {
    key: 'transformations',
    icon: '🪄',
    eyebrow: 'Before & After',
    title: 'Transformations',
    subtitle: 'Complete hair journeys from consultation to crown',
    theme: 'theme-forest',
    accentColor: '#4a8060',
    showTimer: false,
  },
];

// =================== RENDER ALL CATALOG SECTIONS ===================
function renderStyles() {
  const container = document.getElementById('catalogContainer');
  if (!container) return;
  container.innerHTML = '';

  catalogSections.forEach((sec, secIdx) => {
    let styles = hairstyles.filter(h => h.category.includes(sec.key));
    // Apply hair type filter
    if (activeHairTypeFilter !== 'all') {
      styles = styles.filter(h => h.hairType === activeHairTypeFilter || h.hairType === 'All types');
    }
    if (!styles.length) return;

    const section = document.createElement('section');
    section.className = `cat-section ${sec.theme}`;
    section.id = `cat-${sec.key}`;

    const timerHTML = sec.showTimer ? `
      <div class="offer-timer">
        <i class="fas fa-clock"></i>
        <span>Offer ends in:</span>
        <div class="timer-display" id="offerTimer">
          <span id="t-h">--</span>:<span id="t-m">--</span>:<span id="t-s">--</span>
        </div>
      </div>` : '';

    section.innerHTML = `
      <div class="cat-section-inner">
        <div class="cat-section-header">
          <div class="cat-section-header-left">
            <div class="cat-section-badge">
              <span class="cat-section-icon">${sec.icon}</span>
              <span class="cat-section-eyebrow">${sec.eyebrow}</span>
            </div>
            <h2 class="cat-section-title">
              <span class="title-underline">${sec.title}</span>
            </h2>
            <p class="cat-section-subtitle">${sec.subtitle}</p>
          </div>
          <div class="cat-section-header-right">
            ${timerHTML}
            <div class="cat-section-count">${styles.length} style${styles.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="cat-section-divider">
          <span class="divider-line"></span>
          <span class="divider-gem">${sec.icon}</span>
          <span class="divider-line"></span>
        </div>
        <div class="styles-grid cat-grid-${sec.key}" id="grid-${sec.key}">
          ${styles.map(style => createCardHTML(style, sec.theme)).join('')}
        </div>
      </div>
    `;

    container.appendChild(section);
  });

  // Bind all card events across all grids
  bindCardEvents(container);

  // Scroll reveal for cards
  setTimeout(() => {
    container.querySelectorAll('.style-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `opacity 0.5s ease ${(i % 10) * 0.06}s, transform 0.5s ease ${(i % 10) * 0.06}s`;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(card);
    });
  }, 50);

  // Update category nav — clicking cat-card scrolls to section
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.cat;
      const target = key === 'all'
        ? document.getElementById('catalogContainer')
        : document.getElementById(`cat-${key}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Start timer if present
  initOfferTimer();
}

function bindCardEvents(container) {
  container.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-like')) return;
      const id = parseInt(card.dataset.id);
      openStyleModal(id);
    });
  });

  container.querySelectorAll('.card-like').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    if (likedCards.has(id)) btn.classList.add('liked');
    btn.innerHTML = likedCards.has(id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(id, btn);
    });
  });

  container.querySelectorAll('.btn-card-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const styleName = btn.dataset.style;
      const bookSelect = document.getElementById('bookStyle');
      if (bookSelect) {
        for (let opt of bookSelect.options) {
          if (opt.text === styleName) { bookSelect.value = opt.value; break; }
        }
      }
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`${styleName} selected! Complete your booking below 👑`, 'gold');
    });
  });
}

function createCardHTML(style, theme = '') {
  const stars = '★'.repeat(Math.floor(style.rating)) + (style.rating % 1 >= 0.5 ? '½' : '');
  const badgeClass = style.badge === 'Luxury' || style.badge === 'Premium' ? 'gold' :
                     style.badge === 'New' ? 'new' :
                     style.badge === 'On Offer' ? 'offer' :
                     style.badge === 'Kids' ? 'kids' :
                     style.badge === "Men's" ? 'mens' : '';
  const badgeHTML = style.badge ? `<div class="card-badge badge-${badgeClass}">${style.badge}</div>` : '';
  const priceHTML = (() => {
    const fmt = n => '$' + Number(n).toLocaleString();
    if (style.priceMode === 'range' && style.priceMax)
      return `<div class="card-price">${fmt(style.price)}–${fmt(style.priceMax)}</div>`;
    if (style.priceMode === 'promo' && style.originalPrice)
      return `<div class="card-price">${fmt(style.price)} <span class="original">${fmt(style.originalPrice)}</span></div>`;
    return `<div class="card-price">${fmt(style.price)}</div>`;
  })();

  const imgHTML = style.imageUrl
    ? `<img src="${style.imageUrl}" alt="${style.name}" class="card-img" loading="lazy">`
    : `<div class="card-img-no-image"><i class="fas fa-camera"></i><span>Image Coming Soon</span></div>`;

  return `
    <div class="style-card" data-id="${style.id}">
      <div class="card-img-wrap">
        ${imgHTML}
        ${badgeHTML}
        <button class="card-like" data-id="${style.id}" aria-label="Like">
          <i class="${likedCards.has(style.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="card-duration"><i class="fas fa-clock"></i> ${style.duration}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${style.name}</div>
        <button class="btn-card-book" data-style="${style.name}">
          <i class="fas fa-calendar-check"></i> Book Now
        </button>
      </div>
    </div>
  `;
}

function toggleLike(id, btn) {
  if (likedCards.has(id)) {
    likedCards.delete(id);
    btn.classList.remove('liked');
    btn.innerHTML = '<i class="far fa-heart"></i>';
    showToast('Removed from favorites', '');
  } else {
    likedCards.add(id);
    btn.classList.add('liked');
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    showToast('Added to favorites! 💕', 'success');
  }
  // likes are session-only for unauthenticated visitors; persisted in Firestore for signed-in users via client-dashboard
}

// =================== STYLE MODAL ===================
function openStyleModal(id) {
  const style = hairstyles.find(h => h.id === id);
  if (!style) return;

  const modal = document.getElementById('styleModal');
  const body  = document.getElementById('modalBody');

  // Collect all images (imageUrls array or single imageUrl)
  const images = Array.isArray(style.imageUrls) && style.imageUrls.length
    ? style.imageUrls
    : style.imageUrl ? [style.imageUrl] : [];

  // Update top bar title
  const topbarTitle = document.getElementById('modalTopbarTitle');
  if (topbarTitle) topbarTitle.textContent = style.name;

  // Gallery slides HTML
  let galleryInnerHTML = '';
  if (images.length) {
    images.forEach(url => {
      galleryInnerHTML += `<div class="modal-gallery-slide"><img src="${url}" alt="${style.name}" loading="lazy"></div>`;
    });
  } else {
    galleryInnerHTML = `<div class="modal-gallery-slide"><span class="gallery-emoji-placeholder">${style.emoji || '💇'}</span></div>`;
  }

  const showArrows = images.length > 1;
  const showDots   = images.length > 1;

  const relatedStyles = hairstyles
    .filter(h => h.id !== id && h.category.some(c => style.category.includes(c)))
    .slice(0, 3);

  body.innerHTML = `
    <div class="modal-gallery" id="modalGallery">
      <div class="modal-gallery-track" id="modalGalleryTrack">
        ${galleryInnerHTML}
      </div>
      ${showArrows ? `
        <button class="modal-gallery-arrow prev" id="galleryPrev"><i class="fas fa-chevron-left"></i></button>
        <button class="modal-gallery-arrow next" id="galleryNext"><i class="fas fa-chevron-right"></i></button>
      ` : ''}
      ${showDots ? `
        <div class="modal-gallery-dots" id="galleryDots">
          ${images.map((_, i) => `<div class="modal-gallery-dot ${i===0?'active':''}" data-idx="${i}"></div>`).join('')}
        </div>
      ` : ''}
      ${images.length > 1 ? `<div class="modal-img-count" id="galleryCount">1 / ${images.length}</div>` : ''}
    </div>
    <div class="modal-details">
      <h2>${style.name}</h2>
      <div class="modal-price">${(() => { const fmt = n => '$' + Number(n).toLocaleString(); if (style.priceMode === 'range' && style.priceMax) return `${fmt(style.price)}–${fmt(style.priceMax)}`; if (style.priceMode === 'promo' && style.originalPrice) return `${fmt(style.price)} <span style="text-decoration:line-through;color:#9ca3af;font-size:1rem">${fmt(style.originalPrice)}</span>`; return fmt(style.price); })()}</div>
      <div class="modal-tags">
        ${style.category.map(c => `<span class="modal-tag">${c}</span>`).join('')}
      </div>
      <p class="modal-desc">${style.description}</p>
      <div class="modal-info-grid">
        <div class="modal-info-item"><label>Duration</label><span>${style.duration}</span></div>
        <div class="modal-info-item"><label>Hair Type</label><span>${style.hairType}</span></div>
        <div class="modal-info-item"><label>Length</label><span>${style.hairLength}</span></div>
        <div class="modal-info-item"><label>Rating</label><span>${style.rating} ★ (${style.reviews} reviews)</span></div>
      </div>
      <div style="background:#fce8ef;border-radius:10px;padding:12px;margin-bottom:20px;font-size:0.82rem;color:#c0394d;font-weight:500;">
        🔥 ${style.bookings} people have booked this style
      </div>
      <button class="btn-modal-book" onclick="bookFromModal('${style.name}')">
        <i class="fas fa-calendar-check"></i> Book This Style
      </button>
      ${relatedStyles.length ? `
        <div style="margin-top:28px;margin-bottom:24px;">
          <p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-bottom:14px;">You May Also Like</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${relatedStyles.map(r => `
              <div onclick="openStyleModal(${r.id})" style="background:#fdf9fb;border:1px solid #f4b8c8;border-radius:10px;padding:10px 14px;cursor:pointer;font-size:0.82rem;font-weight:500;display:flex;align-items:center;gap:8px;transition:all 0.2s;">
                <span>${r.emoji || ''}</span> ${r.name}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Init carousel
  let currentSlide = 0;
  const track = document.getElementById('modalGalleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dots = document.querySelectorAll('.modal-gallery-dot');
  const countEl = document.getElementById('galleryCount');
  const total = images.length;

  function goToSlide(idx) {
    if (idx < 0 || idx >= total) return;
    currentSlide = idx;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    if (countEl) countEl.textContent = `${currentSlide + 1} / ${total}`;
    if (prevBtn) prevBtn.classList.toggle('hidden', currentSlide === 0);
    if (nextBtn) nextBtn.classList.toggle('hidden', currentSlide === total - 1);
  }

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach(d => d.addEventListener('click', () => goToSlide(+d.dataset.idx)));

  // Init arrow visibility
  if (prevBtn) prevBtn.classList.add('hidden');
  if (nextBtn && total <= 1) nextBtn.classList.add('hidden');

  // Touch swipe support for gallery
  let touchStartX = 0;
  const galleryEl = document.getElementById('modalGallery');
  galleryEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  galleryEl?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

window.bookFromModal = function(styleName) {
  openBookingStepsModal(styleName);
};

// =================== BOOKING STEPS MODAL ===================
let bsmCurrentStep = 1;
let bsmStyleName   = '';

function openBookingStepsModal(styleName) {
  bsmStyleName   = styleName;
  bsmCurrentStep = 1;

  // Set title
  document.getElementById('bsmTopbarTitle').textContent = styleName;

  // Reset to step 1
  goToBsmStep(1);

  // Set min date
  const dateInput = document.getElementById('bsmDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = '';
  }
  document.getElementById('bsmTime').value   = '';
  document.getElementById('bsmStylist').value = 'any';
  document.getElementById('bsmName').value   = '';
  document.getElementById('bsmPhone').value  = '';
  if (document.getElementById('bsmNotes')) document.getElementById('bsmNotes').value = '';

  document.getElementById('bookingStepsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBsmModal() {
  document.getElementById('bookingStepsModal').classList.remove('open');
  document.body.style.overflow = '';
}

function goToBsmStep(step) {
  bsmCurrentStep = step;

  // Panels
  document.querySelectorAll('.bsm-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === step);
  });

  // Step indicators
  document.querySelectorAll('.bsm-step').forEach((s, i) => {
    const n = i + 1;
    s.classList.remove('active', 'done');
    if (n === step) s.classList.add('active');
    else if (n < step) s.classList.add('done');
  });

  // Step lines
  document.querySelectorAll('.bsm-step-line').forEach((l, i) => {
    l.classList.toggle('done', i + 1 < step);
  });

  // Back button — hide on step 1
  const backBtn = document.getElementById('bsmBack');
  if (backBtn) backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

  // If step 3, build review card
  if (step === 3) buildBsmReview();
}

function buildBsmReview() {
  const date = document.getElementById('bsmDate').value;
  const time = document.getElementById('bsmTime').value;
  const stylist = document.getElementById('bsmStylist').value;
  const name = document.getElementById('bsmName').value;
  const phone = document.getElementById('bsmPhone').value;
  const notes = document.getElementById('bsmNotes')?.value || '';

  const matchedService = SERVICES.find(s => s.name === bsmStyleName);
  const priceStr = matchedService ? `$${matchedService.price.toLocaleString()}` : '';

  const rows = [
    { icon: 'fas fa-scissors', label: 'Style', value: `${matchedService?.emoji || '✨'} ${bsmStyleName}${priceStr ? ' — ' + priceStr : ''}` },
    { icon: 'fas fa-calendar', label: 'Date', value: formatDate(date) || date },
    { icon: 'fas fa-clock', label: 'Time', value: time },
    { icon: 'fas fa-user-tie', label: 'Stylist', value: stylist === 'any' ? 'Any Available Stylist' : stylist },
    { icon: 'fas fa-user', label: 'Name', value: name },
    { icon: 'fab fa-whatsapp', label: 'WhatsApp', value: phone },
    ...(notes ? [{ icon: 'fas fa-comment', label: 'Notes', value: notes }] : []),
  ];

  document.getElementById('bsmReviewCard').innerHTML = rows.map(r => `
    <div class="bsm-review-row">
      <div class="bsm-review-icon"><i class="${r.icon}"></i></div>
      <div>
        <div class="bsm-review-label">${r.label}</div>
        <div class="bsm-review-value">${r.value}</div>
      </div>
    </div>
  `).join('');
}

function initBookingStepsModal() {
  // Close / back
  document.getElementById('bsmClose')?.addEventListener('click', closeBsmModal);
  document.getElementById('bsmOverlay')?.addEventListener('click', closeBsmModal);
  document.getElementById('bsmBack')?.addEventListener('click', () => {
    if (bsmCurrentStep > 1) goToBsmStep(bsmCurrentStep - 1);
  });

  // Step 1 → 2
  document.getElementById('bsmNext1')?.addEventListener('click', () => {
    const date = document.getElementById('bsmDate').value;
    const time = document.getElementById('bsmTime').value;
    if (!date) { showToast('Please choose a date 📅', 'error'); return; }
    if (!time) { showToast('Please choose a time ⏰', 'error'); return; }
    goToBsmStep(2);
  });

  // Step 2 → 3
  document.getElementById('bsmNext2')?.addEventListener('click', () => {
    const name  = document.getElementById('bsmName').value.trim();
    const phone = document.getElementById('bsmPhone').value.trim();
    if (!name)  { showToast('Please enter your name 👤', 'error'); return; }
    if (!phone) { showToast('Please enter your WhatsApp number 📱', 'error'); return; }
    goToBsmStep(3);
  });

  // Confirm → submit
  document.getElementById('bsmConfirmBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('bsmConfirmBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming…';
    btn.disabled  = true;

    const selectedStyle  = bsmStyleName;
    const matchedService = SERVICES.find(s => s.name === selectedStyle);
    const bookingRef     = 'BK' + Date.now();
    const date  = document.getElementById('bsmDate').value;
    const time  = document.getElementById('bsmTime').value;
    const stylist = document.getElementById('bsmStylist').value;
    const name  = document.getElementById('bsmName').value;
    const phone = document.getElementById('bsmPhone').value;

    // Sync style to main booking select so other page logic stays in sync
    const bookSelect = document.getElementById('bookStyle');
    if (bookSelect) {
      for (let opt of bookSelect.options) {
        if (opt.text === selectedStyle) { bookSelect.value = opt.value; break; }
      }
    }

    // Wait for Firebase
    let waited = 0;
    while ((!window.firebaseDb || !window.fsCollection || !window.fsAddDoc || !window.currentUser) && waited < 8000) {
      await sleep(200); waited += 200;
    }

    if (!window.firebaseDb || !window.fsCollection || !window.fsAddDoc) {
      btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>';
      btn.disabled  = false;
      showToast('Could not connect. Please refresh and try again.', 'error');
      return;
    }
    if (!window.currentUser) {
      btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>';
      btn.disabled  = false;
      showToast('Authentication not ready. Please refresh and try again.', 'error');
      return;
    }

    try {
      await window.fsAddDoc(window.fsCollection(window.firebaseDb, 'bookings'), {
        style: selectedStyle,
        date, time, stylist, name, phone,
        status:   'pending',
        emoji:    matchedService?.emoji || '✨',
        price:    matchedService?.price || null,
        bookingRef,
        userId:   window.currentUser.uid,
        createdAt: window.fsServerTimestamp ? window.fsServerTimestamp() : new Date().toISOString(),
      });
    } catch (err) {
      console.error('Firestore booking save failed:', err.code, err.message);
      btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>';
      btn.disabled  = false;
      showToast(`Booking failed (${err.code || err.message}). Please try again.`, 'error');
      return;
    }

    // Success — close steps modal, show confirm modal
    closeBsmModal();
    btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>';
    btn.disabled  = false;

    const confirmModal = document.getElementById('confirmModal');
    const confirmMsg   = document.getElementById('confirmMsg');
    if (confirmMsg) confirmMsg.textContent = `Your ${selectedStyle} appointment on ${formatDate(date)} at ${time} has been confirmed! We'll WhatsApp you at ${phone} shortly.`;
    confirmModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
    showToast('Booking confirmed! 🎉', 'success');
  });
}

function initModals() {
  const modal = document.getElementById('styleModal');
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  const confirmModal = document.getElementById('confirmModal');
  const confirmClose = document.getElementById('confirmClose');
  const continueBrowsing = document.getElementById('btnContinueBrowsing');

  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  continueBrowsing?.addEventListener('click', closeModal);
  confirmClose?.addEventListener('click', () => {
    confirmModal.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      confirmModal?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

function closeModal() {
  const modal = document.getElementById('styleModal');
  modal?.classList.remove('open');
  document.body.style.overflow = '';
}

// =================== BOOKING FORM ===================
function setMinBookingDate() {
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
}

// Services list used to enrich bookings with emoji/price.
// Mirrors the default list in admin-dashboard.js; admin saves to Firestore/settings/services
// which loadLiveDataFromFirestore() reads to keep this in sync at runtime.
const SERVICES = [
  {name:"Goddess Box Braids",emoji:"👑",price:4500},
  {name:"Knotless Braids",emoji:"✨",price:3800},
  {name:"Fulani Braids",emoji:"🌟",price:4200},
  {name:"Boho Braids",emoji:"🌺",price:5200},
  {name:"Butterfly Locs",emoji:"🦋",price:4800},
  {name:"Bridal Crown Braids",emoji:"💍",price:8500},
  {name:"Lemonade Braids",emoji:"🍋",price:2800},
  {name:"Faux Locs",emoji:"🔮",price:4000},
  {name:"Senegalese Twists",emoji:"🌾",price:2500},
  {name:"Ghana Braids",emoji:"🌍",price:2200},
  {name:"Kids Princess Braids",emoji:"🎀",price:1500},
  {name:"Men's Cornrow Designs",emoji:"✂️",price:1800},
  {name:"Client Transformation",emoji:"🪄",price:3500},
  {name:"Celebrity Braid Crown",emoji:"⭐",price:7200},
  {name:"Passion Twists",emoji:"💕",price:3600},
];

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-book-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming…';
    btn.disabled = true;

    const selectedStyle = document.getElementById('bookStyle').value;
    const matchedService = SERVICES.find(s => s.name === selectedStyle);
    const bookingRef = 'BK' + Date.now();

    // Wait for Firebase globals AND auth to be ready (anonymous sign-in may be in progress)
    let waited = 0;
    while ((!window.firebaseDb || !window.fsCollection || !window.fsAddDoc || !window.currentUser) && waited < 8000) {
      await sleep(200);
      waited += 200;
    }

    if (!window.firebaseDb || !window.fsCollection || !window.fsAddDoc) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Could not connect to Firebase. Please refresh and try again.', 'error');
      return;
    }

    if (!window.currentUser) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Authentication not ready. Please refresh and try again.', 'error');
      return;
    }

    try {
      await window.fsAddDoc(window.fsCollection(window.firebaseDb, 'bookings'), {
        style: selectedStyle,
        date: document.getElementById('bookDate').value,
        time: document.getElementById('bookTime').value,
        stylist: document.getElementById('bookStylist').value,
        name: document.getElementById('bookName').value,
        phone: document.getElementById('bookPhone').value,
        status: 'pending',
        emoji: matchedService?.emoji || '✨',
        price: matchedService?.price || null,
        bookingRef,
        userId: window.currentUser.uid,
        createdAt: window.fsServerTimestamp ? window.fsServerTimestamp() : new Date().toISOString(),
      });
    } catch (err) {
      console.error('Firestore booking save failed:', err.code, err.message);
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast(`Booking failed (${err.code || err.message}). Please try again.`, 'error');
      return;
    }

    // Success
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    const phone = document.getElementById('bookPhone').value;
    btn.innerHTML = originalText;
    btn.disabled = false;
    form.reset();

    const confirmModal = document.getElementById('confirmModal');
    const confirmMsg = document.getElementById('confirmMsg');
    if (confirmMsg) confirmMsg.textContent = `Your ${selectedStyle} appointment on ${formatDate(date)} at ${time} has been confirmed! We'll WhatsApp you at ${phone} shortly.`;
    confirmModal?.classList.add('open');
    document.body.style.overflow = 'hidden';

    showToast('Booking confirmed! 🎉', 'success');
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// =================== LIVE POPUPS ===================
function initLivePopups() {
  const popup = document.getElementById('livePopup');
  if (!popup) return;

  let popupIndex = 0;

  function showNextPopup() {
    const p = livePopups[popupIndex % livePopups.length];
    popup.innerHTML = `
      <div class="popup-avatar">👑</div>
      <div class="popup-text">
        <strong>${p.name}</strong> just booked ${p.style}
        <span class="popup-time">${p.time}</span>
      </div>
    `;
    popup.style.opacity = '1';
    popup.style.transform = 'translateX(0)';

    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transform = 'translateX(-20px)';
    }, 4000);

    popupIndex++;
  }

  popup.style.transition = 'all 0.5s ease';
  popup.style.opacity = '0';
  showNextPopup();
  setInterval(showNextPopup, 6000);
}

// =================== OFFER TIMER ===================
function initOfferTimer() {
  const hEl = document.getElementById('t-h');
  const mEl = document.getElementById('t-m');
  const sEl = document.getElementById('t-s');
  if (!hEl) return;

  // Timer ends at midnight
  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 0);
    const diff = midnight - now;

    if (diff <= 0) return;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// =================== SCROLL REVEAL ===================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .contact-card, .about-num, .perk, .cat-card, .review-card').forEach(el => {
    observer.observe(el);
  });
}

// =================== NEWSLETTER ===================
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    const btn = form.querySelector('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    await sleep(1200);

    try {
      if (window.firebaseDb && window.fsCollection && window.fsAddDoc && window.currentUser) {
        await window.fsAddDoc(window.fsCollection(window.firebaseDb, 'newsletter'), {
          email,
          date: new Date().toISOString(),
          userId: window.currentUser.uid,
        });
      } else if (!window.currentUser) {
        throw { code: 'unauthenticated', message: 'Not signed in' };
      }
    } catch (err) {
      console.error('Firestore newsletter save failed:', err.code, err.message);
      btn.innerHTML = orig;
      btn.disabled = false;
      showToast(`Subscribe failed (${err.code || err.message}). Please try again.`, 'error');
      return;
    }

    btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
    showToast('Welcome to the club! 💕 Check your email for a surprise.', 'success');
    form.reset();
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3000);
  });
}

// =================== TOAST ===================
function showToast(message, type = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'gold' ? 'crown' : 'bell'}"></i>
    ${message}
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.4s ease reverse';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// =================== UTILITY ===================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Expose for HTML onclick
window.openStyleModal = openStyleModal;
window.showToast = showToast;

// =================== FIRESTORE LIVE DATA ===================
// Reads settings saved by admin and updates homepage booking select + announcements.
// Falls back silently — original hardcoded data stays if Firestore is unavailable.
async function loadLiveDataFromFirestore() {
  try {
    const db     = window.firebaseDb;
    const getDoc = window._fbGetDoc;
    const docFn  = window._fbDoc;
    if (!db || !getDoc || !docFn) return;

    // ---- Services: load from admin Firestore, render catalog ----
    const svcSnap = await getDoc(docFn(db, 'settings', 'services'));
    if (svcSnap.exists()) {
      const list = svcSnap.data().list;
      if (Array.isArray(list) && list.length) {
        hairstyles = list.map((s, i) => ({
          id:            s.id || (i + 1),
          name:          s.name,
          imageUrl:      s.imageUrl || '',
          imageUrls:     Array.isArray(s.imageUrls) && s.imageUrls.length ? s.imageUrls : (s.imageUrl ? [s.imageUrl] : []),
          category:      Array.isArray(s.category) ? s.category : ['all'],
          price:         +s.price || 0,
          originalPrice: s.originalPrice ? +s.originalPrice : null,
          duration:      s.duration || '—',
          rating:        s.rating  || 5.0,
          reviews:       s.reviews || 0,
          bookings:      s.bookings || 0,
          badge:         s.badge   || null,
          hairType:      s.hairType   || 'All types',
          hairLength:    s.hairLength || '—',
          description:   s.description || '',
        }));
        renderStyles();

        // Booking select
        const sel = document.getElementById('bookStyle');
        if (sel) {
          sel.innerHTML = '<option value="">Choose a style…</option>' +
            list.map(s => `<option value="${s.name}">${s.name} — $${(+s.price).toLocaleString()}</option>`).join('');
        }
      }
    }

    // ---- Announcements ----
    const annSnap = await getDoc(docFn(db, 'settings', 'announcements'));
    if (annSnap.exists()) {
      const list = annSnap.data().list;
      if (Array.isArray(list) && list.length) {
        const track = document.querySelector('.announcement-track');
        if (track) {
          const doubled = [...list, ...list];
          track.innerHTML = doubled.map(a => `<span>${a}</span>`).join('');
        }
      }
    }

    // ---- Hair types filter bar ----
    const htSnap = await getDoc(docFn(db, 'settings', 'hairTypes'));
    if (htSnap.exists()) {
      const list = htSnap.data().list;
      if (Array.isArray(list) && list.length) buildHairTypeFilterBar(list);
    }
  } catch(e) { /* Firebase unavailable — catalog stays empty until retry */ }
}

// Run once Firebase globals are ready (set by the inline module in index.html)
(function waitAndLoad() {
  if (window.firebaseDb && window._fbGetDoc && window._fbDoc) { loadLiveDataFromFirestore(); }
  else { setTimeout(waitAndLoad, 200); }
})();

// =================== REVIEWS (lxb- namespaced, no conflicts) ===================
(function () {
  'use strict';

  const starLabels = ['', 'Poor', 'Not Great', 'Okay', 'Good', 'Absolutely Amazing! 🌟'];
  let pickedRating = 0;

  // Wait until Firebase globals are ready
  function onFirebase(cb) {
    if (window.firebaseDb) cb();
    else setTimeout(() => onFirebase(cb), 300);
  }

  // ---- BUILD A REVIEW CARD using existing CSS classes ----
  function buildCard(r) {
    const initials = (r.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const fullStars = Math.round(r.rating || 5);
    const starsHtml = '★'.repeat(fullStars) + (fullStars < 5 ? '☆'.repeat(5 - fullStars) : '');
    const preview = (r.text || '').length > 120 ? r.text.slice(0, 117) + '…' : r.text;

    const div = document.createElement('div');
    div.className = 'review-card';
    div.dataset.rid = r.id;
    div.innerHTML = `
      <div class="review-stars">${starsHtml}</div>
      <div class="review-text">"${preview}"</div>
      <div class="review-author">
        <div class="review-avatar">${initials}</div>
        <div>
          <div class="review-name">${r.name || 'Anonymous'}</div>
          <div class="review-style">${r.style || 'Verified Client'}</div>
        </div>
        <span class="verified-badge">✓ Verified</span>
      </div>
      <div class="review-card-tap">Tap to read ›</div>
    `;
    div.addEventListener('click', () => openDetail(r));
    return div;
  }

  // ---- LOAD APPROVED REVIEWS ----
  async function loadReviews() {
    const loading = document.getElementById('lxbReviewsLoading');
    const wrap    = document.getElementById('lxbReviewsWrap');
    const track   = document.getElementById('lxbReviewsTrack');
    const empty   = document.getElementById('lxbReviewsEmpty');
    const avgNum  = document.getElementById('reviewsAvgNum');
    const avgLbl  = document.getElementById('reviewsAvgLabel');
    if (!track) return;

    try {
      const { collection, query, where, orderBy, limit, getDocs } =
        await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const q = query(
        collection(window.firebaseDb, 'reviews'),
        where('status', '==', 'published'),
        limit(20)
      );
      const snap = await getDocs(q);
      const reviews = [];
      snap.forEach(d => reviews.push({ id: d.id, ...d.data() }));
      // Sort by createdAt descending in JS (avoids needing a composite Firestore index)
      reviews.sort((a, b) => {
        const toMs = v => v?.seconds ? v.seconds * 1000 : (v ? new Date(v).getTime() : 0);
        return toMs(b.createdAt) - toMs(a.createdAt);
      });

      loading.style.display = 'none';

      if (!reviews.length) { empty.style.display = 'block'; return; }

      // Update average
      const avg = (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1);
      if (avgNum) avgNum.textContent = avg;
      if (avgLbl) avgLbl.textContent = `Based on ${reviews.length} verified review${reviews.length !== 1 ? 's' : ''}`;

      // Render cards (no duplication needed — manual scroll)
      reviews.forEach(r => track.appendChild(buildCard(r)));
      wrap.style.display = 'block';
      initReviewsScroll();

    } catch (e) {
      loading.style.display = 'none';
      if (empty) empty.style.display = 'block';
    }
  }

  // ---- REVIEWS SCROLL CONTROLS ----
  function initReviewsScroll() {
    const track = document.getElementById('lxbReviewsTrack');
    const prev  = document.getElementById('reviewsPrev');
    const next  = document.getElementById('reviewsNext');
    if (!track || !prev || !next) return;

    const SCROLL_AMOUNT = 360;

    function updateButtons() {
      prev.classList.toggle('hidden', track.scrollLeft <= 10);
      next.classList.toggle('hidden', track.scrollLeft + track.clientWidth >= track.scrollWidth - 10);
    }

    prev.addEventListener('click', () => { track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' }); });
    next.addEventListener('click', () => { track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' }); });
    track.addEventListener('scroll', updateButtons);
    updateButtons();

    // Drag-to-scroll (mouse)
    let isDown = false, startX, scrollLeftStart;
    track.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeftStart = track.scrollLeft;
    });
    document.addEventListener('mouseup', () => { isDown = false; });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeftStart - (x - startX);
    });
  }

  // ---- DETAIL MODAL ----
  function openDetail(r) {
    const modal = document.getElementById('lxbDetailModal');
    const box   = document.getElementById('lxbDetailBox');
    const initials = (r.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const fullStars = Math.round(r.rating || 5);
    let dateStr = '';
    try { dateStr = r.createdAt?.toDate?.().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) || ''; } catch (e) {}

    box.innerHTML = `
      <button class="lxb-modal-close" id="lxbDetailClose"><i class="fas fa-times"></i></button>
      <div class="lxb-detail-avatar">${initials}</div>
      <div class="lxb-detail-name">${r.name || 'Anonymous'}</div>
      <div class="lxb-detail-stars">
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}${'<i class="far fa-star"></i>'.repeat(5 - fullStars)}
      </div>
      <div class="lxb-detail-text">${r.text || ''}</div>
      ${dateStr ? `<div class="lxb-detail-date">${dateStr}</div>` : ''}
    `;
    modal.classList.add('lxb-open');
    document.getElementById('lxbDetailClose').onclick = () => modal.classList.remove('lxb-open');
    document.getElementById('lxbDetailOverlay').onclick = () => modal.classList.remove('lxb-open');
  }

  // ---- WRITE REVIEW MODAL ----
  function initWriteModal() {
    const openBtn  = document.getElementById('btnWriteReview');
    const modal    = document.getElementById('lxbWriteModal');
    const overlay  = document.getElementById('lxbWriteOverlay');
    const closeBtn = document.getElementById('lxbWriteClose');
    const submitBtn= document.getElementById('lxbSubmitBtn');
    const textarea = document.getElementById('lxbRvText');
    const charEl   = document.getElementById('lxbChar');
    const hint     = document.getElementById('lxbStarHint');
    if (!openBtn || !modal) return;

    function openModal() {
      pickedRating = 0;
      document.querySelectorAll('.lxb-star').forEach(s => s.classList.remove('on'));
      if (hint) hint.textContent = 'Tap to rate';
      const nameF = document.getElementById('lxbRvName');
      if (nameF) nameF.value = window.currentUser?.displayName || '';
      if (textarea) textarea.value = '';
      if (charEl) charEl.textContent = '0 / 500';
      document.getElementById('lxbWriteForm').style.display = 'block';
      document.getElementById('lxbWriteSuccess').style.display = 'none';
      const submitEl = document.getElementById('lxbSubmitBtn');
      if (submitEl) { submitEl.disabled = false; submitEl.innerHTML = '<i class="fas fa-heart"></i> Submit Review<span class="btn-shimmer"></span>'; }
      modal.classList.add('lxb-open');
    }

    openBtn.addEventListener('click', openModal);
    overlay.addEventListener('click', () => modal.classList.remove('lxb-open'));
    closeBtn.addEventListener('click', () => modal.classList.remove('lxb-open'));

    // Stars
    const starBtns = document.querySelectorAll('.lxb-star');
    starBtns.forEach(s => {
      s.addEventListener('click', () => {
        pickedRating = +s.dataset.v;
        starBtns.forEach((b, i) => b.classList.toggle('on', i < pickedRating));
        if (hint) hint.textContent = starLabels[pickedRating];
      });
      s.addEventListener('mouseenter', () => {
        const v = +s.dataset.v;
        starBtns.forEach((b, i) => b.classList.toggle('on', i < v));
      });
    });
    document.getElementById('lxbStarPicker')?.addEventListener('mouseleave', () => {
      starBtns.forEach((b, i) => b.classList.toggle('on', i < pickedRating));
    });

    // Char count
    textarea?.addEventListener('input', () => {
      if (charEl) charEl.textContent = `${textarea.value.length} / 500`;
    });

    // Submit
    submitBtn?.addEventListener('click', async () => {
      const name = document.getElementById('lxbRvName')?.value.trim();
      const text = textarea?.value.trim();
      if (!pickedRating)        { showToast('Please select a star rating.', 'error'); return; }
      if (!name)                { showToast('Please enter your name.', 'error'); return; }
      if (!text || text.length < 10) { showToast('Please write at least 10 characters.', 'error'); return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

      try {
        const { collection, addDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await addDoc(collection(window.firebaseDb, 'reviews'), {
          userId:    window.currentUser?.uid || null,
          name,
          rating:    pickedRating,
          text,
          status:    'pending',
          createdAt: serverTimestamp()
        });
      } catch (e) { /* submit silently */ }

      document.getElementById('lxbWriteForm').style.display = 'none';
      document.getElementById('lxbWriteSuccess').style.display = 'block';
    });
  }

  // Boot
  onFirebase(() => {
    loadReviews();
    initWriteModal();
  });
})();

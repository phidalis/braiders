/* ============================================
   LUXEBRAIDS — index.js
   Main website JavaScript
   ============================================ */

// =================== HAIRSTYLE DATA ===================
let hairstyles = [];

const reviews = [
  { name: "Amara N.", style: "Goddess Box Braids", text: "Zara literally made me cry — in the best way. I've never felt so beautiful. My braids lasted 3 months and still looked fresh.", rating: 5, initial: "A" },
  { name: "Destiny K.", style: "Boho Braids", text: "The attention to detail is insane. My bridal braids had everyone at the wedding asking for the studio's contact. Worth every shilling!", rating: 5, initial: "D" },
  { name: "Faith W.", style: "Knotless Braids", text: "Zero tension, zero headache. I slept in perfect comfort from day one. The team is so professional and caring.", rating: 5, initial: "F" },
  { name: "Grace M.", style: "Butterfly Locs", text: "I've been to so many studios in Nairobi and LuxeBraids is unmatched. The ambiance, the skill, the results. All 10s.", rating: 5, initial: "G" },
  { name: "Purity A.", style: "Fulani Braids", text: "My Fulani braids got so many compliments at work. The gold cuffs were chef's kiss. I'm never going anywhere else.", rating: 5, initial: "P" },
  { name: "Joy S.", style: "Lemonade Braids", text: "Super fast, super clean, super affordable. I was in and out in under 5 hours looking like a queen. Highly recommend!", rating: 5, initial: "J" },
  { name: "Naomi T.", style: "Faux Locs", text: "I asked for the distressed look and they nailed it perfectly. My locs have texture, bounce, and everyone thinks they're real.", rating: 5, initial: "N" },
  { name: "Sharon O.", style: "Bridal Crown Braids", text: "My wedding hairstyle was beyond anything I'd imagined. Destiny at LuxeBraids is a true artist. I sobbed seeing myself.", rating: 5, initial: "S" },
  { name: "Amara N.", style: "Goddess Box Braids", text: "Zara literally made me cry — in the best way. I've never felt so beautiful. My braids lasted 3 months and still looked fresh.", rating: 5, initial: "A" },
  { name: "Destiny K.", style: "Boho Braids", text: "The attention to detail is insane. My bridal braids had everyone at the wedding asking for the studio's contact. Worth every shilling!", rating: 5, initial: "D" },
];

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
  initHeroSlider();
  initCategories();
  renderReviews();
  initBookingForm();
  initModals();
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

// =================== HERO SLIDER ===================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  function goToSlide(index) {
    slides[heroSlideIndex].classList.remove('active');
    dots[heroSlideIndex].classList.remove('active');
    heroSlideIndex = index;
    slides[heroSlideIndex].classList.add('active');
    dots[heroSlideIndex].classList.add('active');
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  setInterval(() => {
    goToSlide((heroSlideIndex + 1) % slides.length);
  }, 5000);
}

// =================== CATEGORIES ===================
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
  const priceHTML = style.originalPrice
    ? `<div class="card-price">KSh ${style.price.toLocaleString()} <span class="original">KSh ${style.originalPrice.toLocaleString()}</span></div>`
    : `<div class="card-price">KSh ${style.price.toLocaleString()}</div>`;

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
        <div class="card-meta">
          <div class="card-rating">${stars} <span class="review-count">(${style.reviews})</span></div>
          <div class="card-bookings">🔥 ${style.bookings} booked</div>
        </div>
        ${priceHTML}
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

// =================== REVIEWS ===================
function renderReviews() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  // Duplicate for infinite scroll
  const allReviews = [...reviews, ...reviews];
  track.innerHTML = allReviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">${r.initial}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-style">${r.style}</div>
        </div>
        <div class="verified-badge">✓ Verified</div>
      </div>
    </div>
  `).join('');
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
      <div class="modal-price">KSh ${style.price.toLocaleString()}${style.originalPrice ? ` <span style="text-decoration:line-through;color:#9ca3af;font-size:1rem">KSh ${style.originalPrice.toLocaleString()}</span>` : ''}</div>
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
  closeModal();
  const bookSelect = document.getElementById('bookStyle');
  if (bookSelect) {
    for (let opt of bookSelect.options) {
      if (opt.text === styleName) { bookSelect.value = opt.value; break; }
    }
  }
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => showToast(`${styleName} selected! 👑`, 'gold'), 600);
};

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
            list.map(s => `<option value="${s.name}">${s.name} — KSh ${(+s.price).toLocaleString()}</option>`).join('');
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

/* ============================================
   LUXEBRAIDS — index.js
   Main website JavaScript
   ============================================ */

// =================== HAIRSTYLE DATA ===================
const hairstyles = [
  { id: 1, name: "Goddess Box Braids", category: ["trending","most-booked","luxury","all"], price: 4500, originalPrice: 5500, duration: "6–8 hrs", emoji: "👑", rating: 4.9, reviews: 142, bookings: 89, badge: "Trending", hairType: "All types", hairLength: "Medium–Long", description: "Elegant goddess box braids with subtle curled ends. Perfect for queens who want length, volume, and timeless beauty. Includes free edge treatment." },
  { id: 2, name: "Knotless Braids", category: ["trending","most-booked","all","new"], price: 3800, originalPrice: null, duration: "5–7 hrs", emoji: "✨", rating: 4.8, reviews: 218, bookings: 156, badge: "Most Booked", hairType: "All types", hairLength: "Any", description: "Knotless braids start from your roots with zero tension. More natural look, less stress on your scalp. Our most popular style." },
  { id: 3, name: "Fulani Braids", category: ["trending","new","all"], price: 4200, originalPrice: null, duration: "5–6 hrs", emoji: "🌟", rating: 4.9, reviews: 97, bookings: 63, badge: "New", hairType: "Natural", hairLength: "Short–Long", description: "Inspired by West African Fulani women. Features a central cornrow, side braids, and gold cuffs for a regal, cultural look." },
  { id: 4, name: "Boho Braids", category: ["trending","luxury","all"], price: 5200, originalPrice: 6000, duration: "7–9 hrs", emoji: "🌺", rating: 5.0, reviews: 74, bookings: 48, badge: "Hot 🔥", hairType: "All types", hairLength: "Long", description: "Romantic boho braids with loose wavy ends and floral accessories. Dreamy, feminine, and absolutely unforgettable." },
  { id: 5, name: "Butterfly Locs", category: ["most-booked","new","all"], price: 4800, originalPrice: 5500, duration: "6–8 hrs", emoji: "🦋", rating: 4.7, reviews: 105, bookings: 72, badge: "On Offer", hairType: "All types", hairLength: "Medium–Long", description: "Distressed locs with a whimsical, butterfly-wing texture. Bold, artistic, and deeply personal." },
  { id: 6, name: "Bridal Crown Braids", category: ["bridal","luxury","all"], price: 8500, originalPrice: null, duration: "8–10 hrs", emoji: "💍", rating: 5.0, reviews: 38, bookings: 22, badge: "Premium", hairType: "All types", hairLength: "Long", description: "Intricate bridal braided crown with gold cuffs, floral pins, and cascading twists. Your wedding day deserves perfection." },
  { id: 7, name: "Lemonade Braids", category: ["trending","budget","all"], price: 2800, originalPrice: null, duration: "4–5 hrs", emoji: "🍋", rating: 4.6, reviews: 183, bookings: 134, badge: null, hairType: "Natural", hairLength: "Any", description: "Side-swept cornrow braids inspired by Beyoncé. Sleek, stylish, and ultra-modern. Quick and affordable." },
  { id: 8, name: "Faux Locs", category: ["most-booked","all"], price: 4000, originalPrice: 4800, duration: "6–8 hrs", emoji: "🔮", rating: 4.8, reviews: 129, bookings: 91, badge: "On Offer", hairType: "All types", hairLength: "Medium–Long", description: "Natural-looking faux locs wrapped in soft hair for a distressed, earthy, goddess look that lasts months." },
  { id: 9, name: "Senegalese Twists", category: ["budget","all","quick"], price: 2500, originalPrice: null, duration: "3–4 hrs", emoji: "🌾", rating: 4.5, reviews: 95, bookings: 78, badge: null, hairType: "All types", hairLength: "Medium", description: "Slim, silky Senegalese twists using high-quality kanekalon hair. Low maintenance and incredibly versatile." },
  { id: 10, name: "Ghana Braids", category: ["most-booked","all"], price: 2200, originalPrice: null, duration: "3–4 hrs", emoji: "🌍", rating: 4.7, reviews: 167, bookings: 112, badge: null, hairType: "Natural", hairLength: "Any", description: "Bold straight-back cornrow braids inspired by Ghanaian heritage. Classic, clean, and regal." },
  { id: 11, name: "Kids Princess Braids", category: ["kids","all","quick"], price: 1500, originalPrice: null, duration: "2–3 hrs", emoji: "🎀", rating: 4.9, reviews: 54, bookings: 41, badge: "Kids", hairType: "All types", hairLength: "Any", description: "Gentle, fun braids for little queens. Uses only soft, child-safe hair. Beads and bows available." },
  { id: 12, name: "Men's Cornrow Designs", category: ["mens","all"], price: 1800, originalPrice: null, duration: "2–3 hrs", emoji: "✂️", rating: 4.6, reviews: 43, bookings: 38, badge: "Men's", hairType: "Natural", hairLength: "Short–Med", description: "Sharp, geometric cornrow designs for men who take their hair seriously. From simple straight-backs to intricate patterns." },
  { id: 13, name: "Client Transformation", category: ["transformations","all"], price: 3500, originalPrice: null, duration: "Varies", emoji: "🪄", rating: 4.8, reviews: 29, bookings: 19, badge: "Before & After", hairType: "All types", hairLength: "Consultation", description: "Complete hair transformation package. Share your inspiration photo and our stylists will create your dream look." },
  { id: 14, name: "Celebrity Braid Crown", category: ["luxury","all"], price: 7200, originalPrice: 9000, duration: "7–10 hrs", emoji: "⭐", rating: 5.0, reviews: 17, bookings: 11, badge: "Luxury", hairType: "All types", hairLength: "Long", description: "A-list worthy braid crown inspired by celebrity red carpet looks. Includes custom accessories and a finish consultation." },
  { id: 15, name: "Passion Twists", category: ["new","trending","all"], price: 3600, originalPrice: null, duration: "5–6 hrs", emoji: "💕", rating: 4.7, reviews: 62, bookings: 44, badge: "New", hairType: "All types", hairLength: "Medium–Long", description: "Soft, curly passion twists with a romantic, effortless feel. Using water wave hair for a natural texture." },
];

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
let likedCards = new Set(JSON.parse(localStorage.getItem('lb_likes') || '[]'));
let heroSlideIndex = 0;

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initCategories();
  renderStyles();
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
    const styles = hairstyles.filter(h => h.category.includes(sec.key));
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

  return `
    <div class="style-card" data-id="${style.id}">
      <div class="card-img-wrap">
        <div class="card-img-placeholder">${style.emoji}</div>
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
  localStorage.setItem('lb_likes', JSON.stringify([...likedCards]));
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
  const body = document.getElementById('modalBody');

  const relatedStyles = hairstyles
    .filter(h => h.id !== id && h.category.some(c => style.category.includes(c)))
    .slice(0, 3);

  body.innerHTML = `
    <div class="modal-gallery">${style.emoji}</div>
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
        <div style="margin-top:28px;">
          <p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-bottom:14px;">You May Also Like</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${relatedStyles.map(r => `
              <div onclick="openStyleModal(${r.id})" style="background:#fdf9fb;border:1px solid #f4b8c8;border-radius:10px;padding:10px 14px;cursor:pointer;font-size:0.82rem;font-weight:500;display:flex;align-items:center;gap:8px;transition:all 0.2s;">
                <span>${r.emoji}</span> ${r.name}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

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

  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
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

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-book-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming…';
    btn.disabled = true;

    const bookingData = {
      style: document.getElementById('bookStyle').value,
      date: document.getElementById('bookDate').value,
      time: document.getElementById('bookTime').value,
      stylist: document.getElementById('bookStylist').value,
      name: document.getElementById('bookName').value,
      phone: document.getElementById('bookPhone').value,
      status: 'pending',
      createdAt: new Date().toISOString(),
      id: 'BK' + Date.now(),
    };

    // Try Firebase save — use globals exposed by index.html module script
    try {
      if (window.firebaseDb && window.fsCollection && window.fsAddDoc) {
        await window.fsAddDoc(window.fsCollection(window.firebaseDb, 'bookings'), bookingData);
      }
    } catch (err) {
      console.warn('Firestore booking save failed, saving locally:', err.code, err.message);
      const existing = JSON.parse(localStorage.getItem('lb_bookings') || '[]');
      existing.push(bookingData);
      localStorage.setItem('lb_bookings', JSON.stringify(existing));
    }

    await sleep(1500);

    btn.innerHTML = originalText;
    btn.disabled = false;
    form.reset();

    const confirmModal = document.getElementById('confirmModal');
    const confirmMsg = document.getElementById('confirmMsg');
    if (confirmMsg) confirmMsg.textContent = `Your ${bookingData.style} appointment on ${formatDate(bookingData.date)} at ${bookingData.time} has been confirmed! We'll WhatsApp you at ${bookingData.phone} shortly.`;
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
      if (window.firebaseDb && window.fsCollection && window.fsAddDoc) {
        await window.fsAddDoc(window.fsCollection(window.firebaseDb, 'newsletter'), { email, date: new Date().toISOString() });
      }
    } catch (err) {
      console.warn('Firestore newsletter save failed, saving locally:', err.code, err.message);
      const subs = JSON.parse(localStorage.getItem('lb_subs') || '[]');
      subs.push({ email, date: new Date().toISOString() });
      localStorage.setItem('lb_subs', JSON.stringify(subs));
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

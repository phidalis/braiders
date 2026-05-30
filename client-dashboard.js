/* ============================================
   LUXEBRAIDS — client-login.html JS
   Standalone: Firestore Auth + Full Dashboard
   ============================================ */

const hairstyles = [
  {id:1,name:"Goddess Box Braids",category:["trending","most-booked","luxury","all"],price:4500,originalPrice:5500,duration:"6–8 hrs",emoji:"👑",rating:4.9,reviews:142,bookings:89,badge:"Trending",hairType:"All types",hairLength:"Medium–Long",description:"Elegant goddess box braids with subtle curled ends. Perfect for queens who want length, volume, and timeless beauty. Includes free edge treatment."},
  {id:2,name:"Knotless Braids",category:["trending","most-booked","all","new"],price:3800,originalPrice:null,duration:"5–7 hrs",emoji:"✨",rating:4.8,reviews:218,bookings:156,badge:"Most Booked",hairType:"All types",hairLength:"Any",description:"Knotless braids start from your roots with zero tension. More natural look, less stress on your scalp. Our most popular style."},
  {id:3,name:"Fulani Braids",category:["trending","new","all"],price:4200,originalPrice:null,duration:"5–6 hrs",emoji:"🌟",rating:4.9,reviews:97,bookings:63,badge:"New",hairType:"Natural",hairLength:"Short–Long",description:"Inspired by West African Fulani women. Features a central cornrow, side braids, and gold cuffs for a regal, cultural look."},
  {id:4,name:"Boho Braids",category:["trending","luxury","all"],price:5200,originalPrice:6000,duration:"7–9 hrs",emoji:"🌺",rating:5.0,reviews:74,bookings:48,badge:"Hot 🔥",hairType:"All types",hairLength:"Long",description:"Romantic boho braids with loose wavy ends and floral accessories. Dreamy, feminine, and absolutely unforgettable."},
  {id:5,name:"Butterfly Locs",category:["most-booked","new","all"],price:4800,originalPrice:5500,duration:"6–8 hrs",emoji:"🦋",rating:4.7,reviews:105,bookings:72,badge:"On Offer",hairType:"All types",hairLength:"Medium–Long",description:"Distressed locs with a whimsical, butterfly-wing texture. Bold, artistic, and deeply personal."},
  {id:6,name:"Bridal Crown Braids",category:["bridal","luxury","all"],price:8500,originalPrice:null,duration:"8–10 hrs",emoji:"💍",rating:5.0,reviews:38,bookings:22,badge:"Premium",hairType:"All types",hairLength:"Long",description:"Intricate bridal braided crown with gold cuffs, floral pins, and cascading twists. Your wedding day deserves perfection."},
  {id:7,name:"Lemonade Braids",category:["trending","budget","all"],price:2800,originalPrice:null,duration:"4–5 hrs",emoji:"🍋",rating:4.6,reviews:183,bookings:134,badge:null,hairType:"Natural",hairLength:"Any",description:"Side-swept cornrow braids inspired by Beyoncé. Sleek, stylish, and ultra-modern. Quick and affordable."},
  {id:8,name:"Faux Locs",category:["most-booked","all"],price:4000,originalPrice:4800,duration:"6–8 hrs",emoji:"🔮",rating:4.8,reviews:129,bookings:91,badge:"On Offer",hairType:"All types",hairLength:"Medium–Long",description:"Natural-looking faux locs wrapped in soft hair for a distressed, earthy, goddess look that lasts months."},
  {id:9,name:"Senegalese Twists",category:["budget","all"],price:2500,originalPrice:null,duration:"3–4 hrs",emoji:"🌾",rating:4.5,reviews:95,bookings:78,badge:null,hairType:"All types",hairLength:"Medium",description:"Slim, silky Senegalese twists using high-quality kanekalon hair. Low maintenance and incredibly versatile."},
  {id:10,name:"Ghana Braids",category:["most-booked","all"],price:2200,originalPrice:null,duration:"3–4 hrs",emoji:"🌍",rating:4.7,reviews:167,bookings:112,badge:null,hairType:"Natural",hairLength:"Any",description:"Bold straight-back cornrow braids inspired by Ghanaian heritage. Classic, clean, and regal."},
  {id:11,name:"Kids Princess Braids",category:["kids","all"],price:1500,originalPrice:null,duration:"2–3 hrs",emoji:"🎀",rating:4.9,reviews:54,bookings:41,badge:"Kids",hairType:"All types",hairLength:"Any",description:"Gentle, fun braids for little queens. Uses only soft, child-safe hair. Beads and bows available."},
  {id:12,name:"Men's Cornrow Designs",category:["mens","all"],price:1800,originalPrice:null,duration:"2–3 hrs",emoji:"✂️",rating:4.6,reviews:43,bookings:38,badge:"Men's",hairType:"Natural",hairLength:"Short–Med",description:"Sharp, geometric cornrow designs for men who take their hair seriously. From simple straight-backs to intricate patterns."},
  {id:13,name:"Client Transformation",category:["transformations","all"],price:3500,originalPrice:null,duration:"Varies",emoji:"🪄",rating:4.8,reviews:29,bookings:19,badge:"Before & After",hairType:"All types",hairLength:"Consultation",description:"Complete hair transformation package. Share your inspiration photo and our stylists will create your dream look."},
  {id:14,name:"Celebrity Braid Crown",category:["luxury","all"],price:7200,originalPrice:9000,duration:"7–10 hrs",emoji:"⭐",rating:5.0,reviews:17,bookings:11,badge:"Luxury",hairType:"All types",hairLength:"Long",description:"A-list worthy braid crown inspired by celebrity red carpet looks. Includes custom accessories and a finish consultation."},
  {id:15,name:"Passion Twists",category:["new","trending","all"],price:3600,originalPrice:null,duration:"5–6 hrs",emoji:"💕",rating:4.7,reviews:62,bookings:44,badge:"New",hairType:"All types",hairLength:"Medium–Long",description:"Soft, curly passion twists with a romantic, effortless feel. Using water wave hair for a natural texture."},
];

const reviewsData = [
  {name:"Amara N.",style:"Goddess Box Braids",text:"Zara literally made me cry — in the best way. I've never felt so beautiful. My braids lasted 3 months!",rating:5,initial:"A"},
  {name:"Destiny K.",style:"Boho Braids",text:"The attention to detail is insane. My bridal braids had everyone at the wedding asking for the studio's contact.",rating:5,initial:"D"},
  {name:"Faith W.",style:"Knotless Braids",text:"Zero tension, zero headache. I slept in perfect comfort from day one. The team is so professional.",rating:5,initial:"F"},
  {name:"Grace M.",style:"Butterfly Locs",text:"I've been to so many studios in Nairobi and LuxeBraids is unmatched. The ambiance, the skill, the results.",rating:5,initial:"G"},
  {name:"Purity A.",style:"Fulani Braids",text:"My Fulani braids got so many compliments at work. The gold cuffs were chef's kiss. I'm never going anywhere else.",rating:5,initial:"P"},
  {name:"Joy S.",style:"Lemonade Braids",text:"Super fast, super clean, super affordable. I was in and out in under 5 hours looking like a queen!",rating:5,initial:"J"},
  {name:"Naomi T.",style:"Faux Locs",text:"I asked for the distressed look and they nailed it perfectly. My locs have texture, bounce, and everyone thinks they're real.",rating:5,initial:"N"},
  {name:"Sharon O.",style:"Bridal Crown Braids",text:"My wedding hairstyle was beyond anything I'd imagined. Destiny at LuxeBraids is a true artist.",rating:5,initial:"S"},
];

const msgThreads = {
  zara:{name:"Zara (Stylist)",status:"Online",messages:[
    {from:"incoming",text:"Hi Queen! Your Goddess Box Braids appointment is confirmed for Saturday 10AM 👑",time:"Yesterday 2:00 PM"},
    {from:"outgoing",text:"Thank you Zara! I'm so excited. Should I come with pre-washed hair?",time:"Yesterday 2:15 PM"},
    {from:"incoming",text:"Yes please! Freshly washed and blow-dried if possible. Also bring any accessories you'd like added 💕",time:"Yesterday 2:20 PM"},
    {from:"outgoing",text:"Perfect! Will do. See you Saturday!",time:"Yesterday 2:22 PM"},
    {from:"incoming",text:"Your braids are ready! The result is absolutely stunning ✨",time:"2 min ago"},
  ]},
  studio:{name:"LuxeBraids Studio",status:"Available Mon–Sat 8AM–8PM",messages:[
    {from:"incoming",text:"Welcome to LuxeBraids! We're thrilled to have you with us 💕",time:"3 days ago"},
    {from:"incoming",text:"Booking confirmed for Saturday at 10AM with Zara. Your reference: BK-2025",time:"1h ago"},
  ]},
  amina:{name:"Amina (Stylist)",status:"Busy — responds within 2 hrs",messages:[
    {from:"incoming",text:"Hello! I noticed you saved Butterfly Locs 🦋 I specialise in those and have slots next week!",time:"2 days ago"},
    {from:"outgoing",text:"Oh amazing! I'll definitely book soon.",time:"2 days ago"},
    {from:"incoming",text:"Thank you for your kind review 💕 It means the world to me!",time:"Yesterday"},
  ]},
};

// STATE
let currentCatFilter = 'trending';
let homeVisibleCount = 10;
let likedCards = new Set(JSON.parse(localStorage.getItem('lb_likes')||'[]'));
let userBookings = [];
let userLoyaltyPoints = 0;
let activeThread = 'zara';

// INIT
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#signup') switchTab('signup');
  const waitFb = setInterval(() => { if (window._fb) { clearInterval(waitFb); hideLdr(); } }, 100);
  setTimeout(() => { hideLdr(); }, 3500);
  setMinDate();
  renderHomeStyles();
  renderHomeReviews();
  selectThread('zara', document.getElementById('thread-zara'));
  initScrollReveal();
});

function hideLdr() {
  const l = document.getElementById('page-loader');
  if (l && l.parentNode) { l.style.opacity = '0'; setTimeout(() => { if (l.parentNode) l.remove(); }, 500); }
}

function showDashboard(user) {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'block';
  populateUserUI(user);
  loadUserBookings();
  loadUserLoyalty();
}

function populateUserUI(user) {
  const p = window.userProfile || {};
  let dn = user.displayName || '';
  if (!dn && p.firstName) dn = (p.firstName + ' ' + (p.lastName||'')).trim();
  if (!dn) dn = user.email ? user.email.split('@')[0] : 'Queen';
  const init = dn.charAt(0).toUpperCase();

  document.getElementById('nav-username').textContent = dn;
  document.getElementById('nav-avatar').textContent = init;
  document.getElementById('greeting-name').textContent = dn.split(' ')[0] || 'Queen';
  document.getElementById('profile-full-name').textContent = dn;
  document.getElementById('profile-email-display').textContent = user.email;
  document.getElementById('profile-avatar-big').textContent = init;

  if (p.firstName) document.getElementById('pf-firstname').value = p.firstName;
  if (p.lastName) document.getElementById('pf-lastname').value = p.lastName;
  if (p.phone) document.getElementById('pf-phone').value = p.phone;
  if (p.dob) document.getElementById('pf-dob').value = p.dob;
  if (p.favStyle) document.getElementById('pf-favstyle').value = p.favStyle;
  if (p.bio) document.getElementById('pf-bio').value = p.bio;

  document.getElementById('db-bookName').value = dn;
  if (p.phone) document.getElementById('db-bookPhone').value = p.phone;
}

async function handleLogout() {
  await window._fb.signOut(window._fb.auth);
  window.location.href = 'client-login.html';
}

// PASSWORD STRENGTH — no minimum restriction, visual only
function checkPwStrength(v, prefix) {
  const wid = prefix ? 'pw-strength-wrap-pf' : 'pw-strength-wrap';
  const lid = prefix ? 'pf-pw-strength-label' : 'pw-strength-label';
  const bids = prefix ? ['pfpwb1','pfpwb2','pfpwb3','pfpwb4'] : ['pwb1','pwb2','pwb3','pwb4'];
  const wrap = document.getElementById(wid); if (!wrap) return;
  if (!v) { wrap.style.display='none'; return; }
  wrap.style.display = 'block';
  let score = 0;
  if (v.length >= 2) score++;
  if (v.length >= 6) score++;
  if (/[A-Z]/.test(v) || /[0-9]/.test(v)) score++;
  if (v.length >= 10 && /[!@#$%^&*]/.test(v)) score++;
  const lvls = ['weak','fair','good','strong'];
  const lbls = {weak:'<span class="s-weak">Weak</span>',fair:'<span class="s-fair">Fair</span>',good:'<span class="s-good">Good</span>',strong:'<span class="s-strong">Strong ✓</span>'};
  const lvl = lvls[Math.max(0, score-1)];
  bids.forEach((id,i) => { const el=document.getElementById(id); if(el) el.className='pw-bar'+(i<score?' '+lvl:''); });
  const lbl = document.getElementById(lid); if(lbl) lbl.innerHTML = lbls[lvl]||lbls.weak;
}

function togglePw(id, btn) {
  const el = document.getElementById(id); if (!el) return;
  const isText = el.type === 'text';
  el.type = isText ? 'password' : 'text';
  btn.innerHTML = `<i class="fas fa-eye${isText?'':'-slash'}"></i>`;
}

// LOAD DATA FROM FIRESTORE
async function loadUserBookings() {
  const user = window.currentUser; if (!user) return;
  try {
    const q = window._fb.query(window._fb.collection(window._fb.db,'bookings'), window._fb.where('userId','==',user.uid));
    const snap = await window._fb.getDocs(q);
    userBookings = snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch(e) {
    // Demo bookings as fallback
    userBookings = [
      {id:'BK001',style:'Goddess Box Braids — KSh 4,500',date:'2025-05-31',time:'10:00 AM',stylist:'Zara',status:'confirmed',emoji:'👑'},
      {id:'BK002',style:'Knotless Braids — KSh 3,800',date:'2025-05-10',time:'2:00 PM',stylist:'Amina',status:'completed',emoji:'✨'},
    ];
  }
  renderBookings('all');
  updateStats();
}

async function loadUserLoyalty() {
  const p = window.userProfile || {};
  userLoyaltyPoints = p.loyaltyPoints || 50;
  updateLoyaltyUI();
}

function updateStats() {
  const bCount = userBookings.length;
  const fCount = likedCards.size;
  ['stat-bookings','ps-bookings'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=bCount; });
  ['stat-points','ps-points','sl-points-val'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=userLoyaltyPoints; });
  ['stat-favs','ps-favs'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=fCount; });
  const bb = document.getElementById('bookings-badge'); if(bb) bb.textContent = userBookings.filter(b=>b.status==='pending'||b.status==='confirmed').length;
  const fb = document.getElementById('fav-badge'); if(fb) fb.textContent = fCount;
}

function updateLoyaltyUI() {
  const pts = userLoyaltyPoints;
  ['loyalty-pts-big','stat-points','ps-points','sl-points-val'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=pts; });
  const next = 500;
  const pct = Math.min((pts/next)*100, 100);
  const bar1 = document.getElementById('sl-bar-inner'); if(bar1) bar1.style.width = pct+'%';
  const bar2 = document.getElementById('loyalty-bar'); if(bar2) bar2.style.width = pct+'%';
  const nl = document.getElementById('sl-next-label'); if(nl) nl.textContent = (next-pts)+' pts to Platinum';
  const lnl = document.getElementById('loyalty-next-label'); if(lnl) lnl.textContent = (next-pts)+' pts to Platinum';
  const hist = document.getElementById('loyalty-history-list');
  if (hist) hist.innerHTML = [
    {type:'earn',desc:'Booked Goddess Box Braids',pts:'+50',date:'28 May 2025'},
    {type:'earn',desc:'Welcome bonus',pts:'+50',date:'20 May 2025'},
    {type:'earn',desc:'Referral: Amara S.',pts:'+50',date:'15 May 2025'},
    {type:'redeem',desc:'KSh 200 discount redeemed',pts:'-100',date:'10 May 2025'},
    {type:'earn',desc:'Completed: Knotless Braids',pts:'+50',date:'10 May 2025'},
  ].map(t=>`<div class="loyalty-txn"><div class="txn-icon ${t.type}"><i class="fas fa-${t.type==='earn'?'arrow-down':'arrow-up'}"></i></div><div class="txn-desc"><strong>${t.desc}</strong><span>${t.date}</span></div><div class="txn-pts ${t.type}">${t.pts} pts</div></div>`).join('');
}

// NAVIGATION
function navigateTo(section) {
  document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item[data-section]').forEach(i => i.classList.remove('active'));
  const panel = document.getElementById('panel-'+section); if(panel) panel.classList.add('active');
  const si = document.querySelector(`.sidebar-item[data-section="${section}"]`); if(si) si.classList.add('active');
  closeSidebar();
  if (section==='favourites') renderFavourites();
  if (section==='loyalty') updateLoyaltyUI();
  if (section==='bookings') renderBookings('all');
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(initScrollReveal, 100);
}

document.getElementById('db-hamburger').addEventListener('click', () => {
  const sb = document.getElementById('db-sidebar');
  const ov = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov.style.display = sb.classList.contains('open') ? 'block' : 'none';
});
function closeSidebar() {
  document.getElementById('db-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').style.display = 'none';
}

// =================== CATALOG SECTION DEFINITIONS ===================
const dbCatalogSections = [
  { key:'trending',    icon:'🔥', eyebrow:'Hot Right Now',      title:'Trending This Week',  subtitle:'The styles everyone is booking right now',               theme:'theme-rose'    },
  { key:'new',         icon:'✨', eyebrow:'Just Dropped',        title:'New Arrivals',         subtitle:'Fresh styles just added to our collection',             theme:'theme-mauve'   },
  { key:'most-booked', icon:'👑', eyebrow:'Client Favourites',   title:'Most Booked',          subtitle:'The styles our queens keep coming back for',            theme:'theme-gold'    },
  { key:'luxury',      icon:'💎', eyebrow:'Premium Collection',  title:'Luxury Styles',        subtitle:'Elevated artistry for the woman who wants the best',    theme:'theme-plum'    },
  { key:'budget',      icon:'💸', eyebrow:'Great Value',         title:'Budget Friendly',      subtitle:'Beautiful braids that won\'t break the bank',           theme:'theme-teal'    },
  { key:'bridal',      icon:'💍', eyebrow:'Special Occasions',   title:'Bridal & Events',      subtitle:'Your big day deserves a crown-worthy look',             theme:'theme-blush'   },
  { key:'kids',        icon:'🎀', eyebrow:'Little Queens',       title:'Kids Styles',          subtitle:'Gentle, fun braids made for little royalty',            theme:'theme-lavender'},
  { key:'mens',        icon:'✂️', eyebrow:'Sharp & Clean',       title:"Men's Braids",         subtitle:'Geometric designs for men who mean business',           theme:'theme-slate'   },
  { key:'quick',       icon:'⚡', eyebrow:'In & Out',            title:'Quick Styles',         subtitle:'Stunning looks done in under 4 hours',                  theme:'theme-amber'   },
  { key:'transformations', icon:'🪄', eyebrow:'Before & After',  title:'Transformations',      subtitle:'Complete hair journeys from consultation to crown',     theme:'theme-forest'  },
];

function renderHomeStyles() {
  const container = document.getElementById('db-catalog-container');
  if (!container) return;
  container.innerHTML = '';

  const search = (document.getElementById('styleSearchInput')?.value || '').toLowerCase();

  dbCatalogSections.forEach(sec => {
    let styles = hairstyles.filter(h => h.category.includes(sec.key));
    if (search) styles = styles.filter(h => h.name.toLowerCase().includes(search) || h.description.toLowerCase().includes(search));
    if (!styles.length) return;

    const timerHTML = sec.showTimer ? `
      <div class="offer-timer">
        <i class="fas fa-clock"></i>
        <span>Offer ends in:</span>
        <div class="timer-display" id="offerTimer">
          <span id="t-h">--</span>:<span id="t-m">--</span>:<span id="t-s">--</span>
        </div>
      </div>` : '';

    const section = document.createElement('section');
    section.className = `cat-section ${sec.theme}`;
    section.id = `db-cat-${sec.key}`;

    section.innerHTML = `
      <div class="cat-section-inner">
        <div class="cat-section-header">
          <div class="cat-section-header-left">
            <div class="cat-section-badge">
              <span class="cat-section-icon">${sec.icon}</span>
              <span class="cat-section-eyebrow">${sec.eyebrow}</span>
            </div>
            <h2 class="cat-section-title"><span class="title-underline">${sec.title}</span></h2>
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
        <div class="styles-grid" id="db-grid-${sec.key}">
          ${styles.map(h => dbCardHTML(h, sec.theme)).join('')}
        </div>
      </div>
    `;

    container.appendChild(section);
  });

  // Bind events
  container.querySelectorAll('.style-card').forEach(c => {
    c.addEventListener('click', e => {
      if (e.target.closest('.card-like') || e.target.closest('.btn-card-book')) return;
      openStyleModal(+c.dataset.id);
    });
  });
  container.querySelectorAll('.card-like').forEach(btn => {
    const id = +btn.dataset.id;
    if (likedCards.has(id)) { btn.classList.add('liked'); btn.innerHTML = '<i class="fas fa-heart"></i>'; }
    btn.addEventListener('click', e => { e.stopPropagation(); toggleLike(id, btn); });
  });
  container.querySelectorAll('.btn-card-book').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const nm = btn.dataset.style;
      const sel = document.getElementById('db-bookStyle');
      if (sel) for (let o of sel.options) { if (o.text.startsWith(nm)) { sel.value = o.value; break; } }
      document.getElementById('home-booking-section').scrollIntoView({ behavior: 'smooth' });
      showToast(nm + ' selected 👑', 'gold');
    });
  });

  // Scroll reveal
  setTimeout(() => {
    container.querySelectorAll('.style-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.style.opacity = '1'; en.target.style.transform = 'translateY(0)'; obs.unobserve(en.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(card);
    });
  }, 50);
  initOfferTimer();
}

function initOfferTimer() {
  const hEl = document.getElementById('t-h');
  const mEl = document.getElementById('t-m');
  const sEl = document.getElementById('t-s');
  if (!hEl) return;
  function updateTimer() {
    const now = new Date(); const midnight = new Date();
    midnight.setHours(23, 59, 59, 0);
    const diff = midnight - now;
    if (diff <= 0) return;
    hEl.textContent = String(Math.floor(diff/3600000)).padStart(2,'0');
    mEl.textContent = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    sEl.textContent = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  }
  updateTimer(); setInterval(updateTimer, 1000);
}

function dbCardHTML(h, theme = '') {
  const stars = '★'.repeat(Math.floor(h.rating));
  const badgeClass = h.badge === 'Luxury' || h.badge === 'Premium' ? 'gold' :
                     h.badge === 'New' ? 'new' :
                     h.badge === 'On Offer' ? 'offer' :
                     h.badge === 'Kids' ? 'kids' :
                     h.badge === "Men's" ? 'mens' : '';
  const badge = h.badge ? `<div class="card-badge badge-${badgeClass}">${h.badge}</div>` : '';
  const price = h.originalPrice
    ? `<div class="card-price">KSh ${h.price.toLocaleString()} <span class="original">KSh ${h.originalPrice.toLocaleString()}</span></div>`
    : `<div class="card-price">KSh ${h.price.toLocaleString()}</div>`;
  return `
    <div class="style-card" data-id="${h.id}">
      <div class="card-img-wrap">
        <div class="card-img-placeholder">${h.emoji}</div>
        ${badge}
        <button class="card-like ${likedCards.has(h.id) ? 'liked' : ''}" data-id="${h.id}">
          <i class="${likedCards.has(h.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="card-duration"><i class="fas fa-clock"></i> ${h.duration}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${h.name}</div>
        <div class="card-meta">
          <div class="card-rating">${stars} <span class="review-count">(${h.reviews})</span></div>
          <div class="card-bookings">🔥 ${h.bookings}</div>
        </div>
        ${price}
        <button class="btn-card-book" data-style="${h.name}">
          <i class="fas fa-calendar-check"></i> Book Now
        </button>
      </div>
    </div>`;
}

function scrollToCatSection(key) {
  const el = document.getElementById(`db-cat-${key}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setCatFilter(el, cat) { /* kept for compatibility */ }
function loadMoreStyles() { renderHomeStyles(); }
function filterStyles() { renderHomeStyles(); }

function toggleLike(id, btn) {
  if(likedCards.has(id)){likedCards.delete(id);btn.classList.remove('liked');btn.innerHTML='<i class="far fa-heart"></i>';showToast('Removed from favourites','');}
  else{likedCards.add(id);btn.classList.add('liked');btn.innerHTML='<i class="fas fa-heart"></i>';showToast('Saved to favourites 💕','success');}
  localStorage.setItem('lb_likes',JSON.stringify([...likedCards]));
  updateStats();
}

// REVIEWS
function renderHomeReviews() {
  const track = document.getElementById('home-reviews-track'); if(!track) return;
  const all=[...reviewsData,...reviewsData];
  track.innerHTML=all.map(r=>`<div class="review-card"><div class="review-stars">${'★'.repeat(r.rating)}</div><p class="review-text">"${r.text}"</p><div class="review-author"><div class="review-avatar">${r.initial}</div><div><div class="review-name">${r.name}</div><div class="review-style">${r.style}</div></div><div class="verified-badge">✓ Verified</div></div></div>`).join('');
}

// BOOKINGS RENDER
function renderBookings(filter) {
  const list = document.getElementById('bookings-list'); if(!list) return;
  const shown = filter==='all' ? userBookings : userBookings.filter(b=>b.status===filter);
  if(!shown.length) { list.innerHTML=`<div class="empty-state"><div class="empty-emoji">📅</div><h3>No ${filter==='all'?'':filter} bookings yet</h3><p>Your appointments will appear here once you book a style</p></div>`; return; }
  list.innerHTML=shown.map(b=>`<div class="booking-card"><div class="booking-emoji">${b.emoji||'✂️'}</div><div class="booking-info"><h4>${b.style||'Hair Appointment'}</h4><div class="booking-meta"><span><i class="fas fa-calendar-alt"></i> ${b.date||'—'}</span><span><i class="fas fa-clock"></i> ${b.time||'—'}</span><span><i class="fas fa-user"></i> ${b.stylist||'Stylist TBD'}</span><span><i class="fas fa-tag"></i> ${b.id||'—'}</span></div></div><div class="booking-status status-${b.status||'pending'}">${b.status||'Pending'}</div></div>`).join('');
}
function filterBookings(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderBookings(filter);
}

// FAVOURITES
function renderFavourites() {
  const grid=document.getElementById('fav-grid'); const empty=document.getElementById('fav-empty');
  const favs=hairstyles.filter(h=>likedCards.has(h.id));
  if(!favs.length){grid.innerHTML='';empty.style.display='';return;}
  empty.style.display='none';
  grid.innerHTML=favs.map(h=>dbCardHTML(h)).join('');
  grid.querySelectorAll('.style-card').forEach(c=>{c.addEventListener('click',e=>{if(e.target.closest('.card-like')||e.target.closest('.btn-card-book'))return;openStyleModal(+c.dataset.id);});});
  grid.querySelectorAll('.card-like').forEach(btn=>{const id=+btn.dataset.id;btn.addEventListener('click',e=>{e.stopPropagation();toggleLike(id,btn);renderFavourites();});});
  grid.querySelectorAll('.btn-card-book').forEach(btn=>{btn.addEventListener('click',e=>{e.stopPropagation();navigateTo('home');setTimeout(()=>{document.getElementById('home-booking-section').scrollIntoView({behavior:'smooth'});showToast(btn.dataset.style+' selected 👑','gold');},300);});});
}

// BOOKING FORM
function setMinDate() {
  const d=document.getElementById('db-bookDate'); if(!d) return;
  const t=new Date(); d.min=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

async function submitDashBooking(e) {
  e.preventDefault();
  const user=window.currentUser; if(!user){showToast('Please sign in to book.','error');return;}
  const style=document.getElementById('db-bookStyle').value;
  const date=document.getElementById('db-bookDate').value;
  const time=document.getElementById('db-bookTime').value;
  const stylist=document.getElementById('db-bookStylist').value;
  const name=document.getElementById('db-bookName').value;
  const phone=document.getElementById('db-bookPhone').value;
  if(!style||!date||!name){showToast('Please fill in all required fields.','error');return;}
  const btn=e.target.querySelector('.btn-book-submit');
  const orig=btn.innerHTML; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Confirming…'; btn.disabled=true;
  const booking={userId:user.uid,style,date,time,stylist,name,phone,status:'pending',emoji:'✨',createdAt:new Date().toISOString(),id:'BK'+Date.now()};
  try {
    await window._fb.addDoc(window._fb.collection(window._fb.db,'bookings'), booking);
    const newPts = userLoyaltyPoints + 50;
    userLoyaltyPoints = newPts;
    await window._fb.updateDoc(window._fb.doc(window._fb.db,'users',user.uid), {loyaltyPoints:newPts, totalBookings: userBookings.length+1});
    showToast('🎉 +50 Loyalty Points earned!','gold');
  } catch(err) {
    const stored=JSON.parse(localStorage.getItem('lb_bk_'+user.uid)||'[]');
    stored.push(booking); localStorage.setItem('lb_bk_'+user.uid,JSON.stringify(stored));
    userLoyaltyPoints += 50;
  }
  userBookings.unshift(booking); updateStats(); updateLoyaltyUI();
  btn.innerHTML=orig; btn.disabled=false;
  e.target.reset();
  document.getElementById('db-bookName').value = window.currentUser?.displayName || '';
  const cm=document.getElementById('confirm-msg'); if(cm) cm.textContent=`Your ${style} on ${date} at ${time} is confirmed! We'll WhatsApp you at ${phone}. Ref: ${booking.id}`;
  document.getElementById('confirm-modal').classList.add('open');
}

// STYLE MODAL
function openStyleModal(id) {
  const h=hairstyles.find(s=>s.id===id); if(!h) return;
  const related=hairstyles.filter(s=>s.id!==id&&s.category.some(c=>h.category.includes(c))).slice(0,3);
  document.getElementById('modal-body-inner').innerHTML=`
    <div class="modal-gallery">${h.emoji}</div>
    <div class="modal-details">
      <h2>${h.name}</h2>
      <div class="modal-price">KSh ${h.price.toLocaleString()}${h.originalPrice?` <span style="text-decoration:line-through;color:#9ca3af;font-size:.9rem">KSh ${h.originalPrice.toLocaleString()}</span>`:''}</div>
      <div class="modal-tags">${h.category.map(c=>`<span class="modal-tag">${c}</span>`).join('')}</div>
      <p class="modal-desc">${h.description}</p>
      <div class="modal-info-grid">
        <div class="modal-info-item"><label>Duration</label><span>${h.duration}</span></div>
        <div class="modal-info-item"><label>Hair Type</label><span>${h.hairType}</span></div>
        <div class="modal-info-item"><label>Length</label><span>${h.hairLength}</span></div>
        <div class="modal-info-item"><label>Rating</label><span>${h.rating}★ (${h.reviews})</span></div>
      </div>
      <div style="background:var(--pink-soft);border-radius:10px;padding:12px;margin-bottom:16px;font-size:.82rem;color:var(--pink-deep);font-weight:500;">🔥 ${h.bookings} people booked this style</div>
      <button class="btn-modal-book" onclick="bookFromModal('${h.name.replace(/'/g,"\\'")}')"><i class="fas fa-calendar-check"></i> Book This Style</button>
      ${related.length?`<div style="margin-top:20px;"><p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--grey);margin-bottom:10px;">You May Also Like</p><div style="display:flex;gap:8px;flex-wrap:wrap;">${related.map(r=>`<div onclick="openStyleModal(${r.id})" style="background:var(--white-off);border:1px solid rgba(244,184,200,.3);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:.8rem;font-weight:500;display:flex;align-items:center;gap:6px;">${r.emoji} ${r.name}</div>`).join('')}</div></div>`:''}
    </div>`;
  document.getElementById('style-modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeStyleModal() { document.getElementById('style-modal').classList.remove('open'); document.body.style.overflow=''; }
function bookFromModal(name) {
  closeStyleModal();
  navigateTo('home');
  setTimeout(()=>{ document.getElementById('home-booking-section').scrollIntoView({behavior:'smooth'}); showToast(name+' selected 👑','gold'); },300);
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeStyleModal(); document.getElementById('confirm-modal').classList.remove('open'); } });

// MESSAGES
function selectThread(key, el) {
  activeThread=key;
  document.querySelectorAll('.msg-thread').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const t=msgThreads[key]; if(!t) return;
  document.getElementById('msg-chat-name').textContent=t.name;
  document.getElementById('msg-chat-status').textContent='● '+t.status;
  const body=document.getElementById('msg-chat-body');
  body.innerHTML=t.messages.map(m=>`<div class="msg-bubble ${m.from}"><div class="msg-bubble-text">${m.text}</div><div class="msg-bubble-time">${m.time}</div></div>`).join('');
  body.scrollTop=body.scrollHeight;
}
function sendMessage() {
  const inp=document.getElementById('msg-input'); const txt=inp.value.trim(); if(!txt) return;
  const t=msgThreads[activeThread]; if(!t) return;
  const now=new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});
  const body=document.getElementById('msg-chat-body');
  const b=document.createElement('div'); b.className='msg-bubble outgoing';
  b.innerHTML=`<div class="msg-bubble-text">${txt}</div><div class="msg-bubble-time">${now}</div>`;
  body.appendChild(b); body.scrollTop=body.scrollHeight; inp.value='';
  t.messages.push({from:'outgoing',text:txt,time:now});
  setTimeout(()=>{
    const replies=["Sure, I'll check on that for you! 💕","Thanks for reaching out. I'll get back to you shortly 👑","Of course! See you soon 🌟","That sounds perfect! Looking forward to seeing you ✨","Absolutely! We've noted that down 💅"];
    const reply=replies[Math.floor(Math.random()*replies.length)];
    t.messages.push({from:'incoming',text:reply,time:'Just now'});
    const rb=document.createElement('div'); rb.className='msg-bubble incoming';
    rb.innerHTML=`<div class="msg-bubble-text">${reply}</div><div class="msg-bubble-time">Just now</div>`;
    body.appendChild(rb); body.scrollTop=body.scrollHeight;
  },1400);
}

// PROFILE SAVE
async function saveProfile() {
  const user=window.currentUser; if(!user) return;
  const data={firstName:document.getElementById('pf-firstname').value.trim(),lastName:document.getElementById('pf-lastname').value.trim(),phone:document.getElementById('pf-phone').value.trim(),dob:document.getElementById('pf-dob').value,favStyle:document.getElementById('pf-favstyle').value,bio:document.getElementById('pf-bio').value.trim()};
  const dn=(data.firstName+' '+data.lastName).trim()||user.displayName;
  try {
    await window._fb.updateDoc(window._fb.doc(window._fb.db,'users',user.uid),{...data,displayName:dn});
    await window._fb.updateProfile(user,{displayName:dn});
    window.userProfile={...window.userProfile,...data};
    populateUserUI(user); showToast('Profile updated! 💕','success');
  } catch(e) { showToast('Saved locally.','gold'); }
}

async function changePassword() {
  const np=document.getElementById('pf-newpw').value;
  const cp=document.getElementById('pf-confirmpw').value;
  if(!np){showToast('Enter a new password.','error');return;}
  if(np.length<2){showToast('Password must be at least 2 characters.','error');return;}
  if(np!==cp){showToast('Passwords do not match.','error');return;}
  try {
    if(window._fb.updatePassword && window.currentUser){
      await window._fb.updatePassword(window.currentUser,np);
      showToast('Password updated! 🔑','success');
      document.getElementById('pf-newpw').value='';
      document.getElementById('pf-confirmpw').value='';
    }
  } catch(e) {
    if(e.code==='auth/requires-recent-login') showToast('Please sign out and back in to change your password.','gold');
    else showToast('Could not update password. Try again.','error');
  }
}

// SCROLL REVEAL
function initScrollReveal() {
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el=>obs.observe(el));
}

// TOAST
function showToast(msg, type) {
  const c=document.getElementById('toast-container'); if(!c) return;
  const t=document.createElement('div'); t.className=`toast ${type||''}`;
  const icons={success:'check-circle',error:'times-circle',gold:'crown'};
  t.innerHTML=`<i class="fas fa-${icons[type]||'bell'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(()=>{t.style.animation='toastIn .4s ease reverse';setTimeout(()=>t.remove(),400);},4000);
}

// Check hash
if(window.location.hash==='#signup') switchTab('signup');

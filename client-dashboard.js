/* ============================================
   LUXEBRAIDS — client-login.html JS
   Standalone: Firestore Auth + Full Dashboard
   ============================================ */

// Hairstyles loaded from Firestore (same source as index.js)
let hairstyles = [];


// Real-time messaging state
let msgUnsubscribe = null;
let clientMessages = [];
let unreadMsgCount = 0;

// STATE
let currentCatFilter = 'trending';
let homeVisibleCount = 10;
let likedCards = new Set(JSON.parse(localStorage.getItem('lb_likes')||'[]'));
let userBookings = [];
let userLoyaltyPoints = 0;

// =================== FIRESTORE LIVE DATA ===================
// Reads services from Firestore settings/services — same document index.js uses
async function loadLiveServicesFromFirestore() {
  try {
    const fb = window._fb;
    if (!fb || !fb.db || !fb.getDoc || !fb.doc) return;
    const svcSnap = await fb.getDoc(fb.doc(fb.db, 'settings', 'services'));
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
          rating:        s.rating   || 5.0,
          reviews:       s.reviews  || 0,
          bookings:      s.bookings || 0,
          badge:         s.badge    || null,
          emoji:         s.emoji    || '✨',
          hairType:      s.hairType   || 'All types',
          hairLength:    s.hairLength || '—',
          description:   s.description || '',
        }));
        const overviewPanel = document.getElementById('panel-overview');
        if (overviewPanel && overviewPanel.classList.contains('active')) renderHomeStyles();
        updateBookingStyleSelect();
      }
    }
    // Announcements
    const annSnap = await fb.getDoc(fb.doc(fb.db, 'settings', 'announcements'));
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
  } catch(e) { console.warn('Firestore load failed, using empty catalog', e); }
}

function updateBookingStyleSelect() {
  // Update the dashboard booking form select
  const sel = document.getElementById('db-bookStyle');
  if (sel && hairstyles.length) {
    sel.innerHTML = '<option value="">Choose a style…</option>' +
      hairstyles.map(s => `<option value="${s.name}">${s.name} — USD ${(+s.price).toLocaleString()}</option>`).join('');
  }
  // Also update BSM stylist select if modal is present
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#signup') switchTab('signup');
  const waitFb = setInterval(() => {
    if (window._fb) {
      clearInterval(waitFb);
      hideLdr();
      loadLiveServicesFromFirestore();
    }
  }, 100);
  setTimeout(() => { hideLdr(); }, 3500);
  setMinDate();
  initScrollReveal();
  initDbBookingStepsModal();
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
  startMsgPolling();
  // Initial unread count check
  setTimeout(() => {
    const fb = window._fb; if (!fb || !user) return;
    const convId = getConversationId(user.uid);
    fb.getDocs(fb.query(
      fb.collection(fb.db, 'conversations', convId, 'messages'),
      fb.where('senderRole', '==', 'admin'),
      fb.where('readByClient', '==', false)
    )).then(snap => {
      const count = snap.size;
      const badge = document.getElementById('notif-badge');
      const msgBadge = document.getElementById('msg-badge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
      if (msgBadge) { msgBadge.textContent = count; msgBadge.style.display = count > 0 ? 'flex' : 'none'; }
    }).catch(() => {});
  }, 2000);
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
  window.location.href = 'index.html';
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
      {id:'BK001',style:'Goddess Box Braids — USD 4,500',date:'2025-05-31',time:'10:00 AM',stylist:'Zara',status:'confirmed',emoji:'👑'},
      {id:'BK002',style:'Knotless Braids — USD 3,800',date:'2025-05-10',time:'2:00 PM',stylist:'Amina',status:'completed',emoji:'✨'},
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
    {type:'redeem',desc:'USD 200 discount redeemed',pts:'-100',date:'10 May 2025'},
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
  if (section==='overview') { renderHomeStyles(); }
  if (section==='favourites') renderFavourites();
  if (section==='loyalty') updateLoyaltyUI();
  if (section==='bookings') renderBookings('all');
  if (section==='messages') { loadAdminMessages(false); markMessagesRead(); }
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
      openDbBookingStepsModal(nm);
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
  const badgeClass = h.badge === 'Luxury' || h.badge === 'Premium' ? 'gold' :
                     h.badge === 'New' ? 'new' :
                     h.badge === 'On Offer' ? 'offer' :
                     h.badge === 'Kids' ? 'kids' :
                     h.badge === "Men's" ? 'mens' : '';
  const badge = h.badge ? `<div class="card-badge badge-${badgeClass}">${h.badge}</div>` : '';
  const imgHTML = h.imageUrl
    ? `<img src="${h.imageUrl}" alt="${h.name}" class="card-img" loading="lazy">`
    : `<div class="card-img-no-image"><i class="fas fa-camera"></i><span>Image Coming Soon</span></div>`;
  return `
    <div class="style-card" data-id="${h.id}">
      <div class="card-img-wrap">
        ${imgHTML}
        ${badge}
        <button class="card-like ${likedCards.has(h.id) ? 'liked' : ''}" data-id="${h.id}">
          <i class="${likedCards.has(h.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="card-duration"><i class="fas fa-clock"></i> ${h.duration}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${h.name}</div>
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

// BOOKINGS RENDER
function renderBookings(filter) {
  const list = document.getElementById('bookings-list'); if(!list) return;
  const shown = filter==='all' ? userBookings : userBookings.filter(b=>b.status===filter);
  if(!shown.length) {
    list.innerHTML=`<div class="empty-state"><div class="empty-emoji">📅</div><h3>No ${filter==='all'?'':filter+' '}bookings yet</h3><p>Your appointments will appear here once you book a style</p><button class="btn-dash-primary" onclick="navigateTo('overview')" style="margin-top:16px;"><i class="fas fa-plus"></i> Book a Style</button></div>`;
    return;
  }
  const statusConfig = {
    pending:   { icon:'fas fa-clock',       color:'#f59e0b', label:'Pending'   },
    confirmed: { icon:'fas fa-check-circle',color:'#10b981', label:'Confirmed' },
    completed: { icon:'fas fa-star',         color:'#8b5cf6', label:'Completed' },
    cancelled: { icon:'fas fa-times-circle', color:'#ef4444', label:'Cancelled' },
  };
  list.innerHTML = shown.map(b => {
    const s = statusConfig[b.status] || statusConfig.pending;
    const formattedDate = b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-KE', {weekday:'short',day:'numeric',month:'short',year:'numeric'}) : '—';
    const canCancel = b.status === 'pending' || b.status === 'confirmed';
    return `
    <div class="booking-card" data-status="${b.status||'pending'}">
      <div class="booking-emoji">${b.emoji||'✂️'}</div>
      <div class="booking-info">
        <h4>${b.style||'Hair Appointment'}</h4>
        <div class="booking-meta">
          <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
          <span><i class="fas fa-clock"></i> ${b.time||'—'}</span>
          <span><i class="fas fa-user"></i> ${b.stylist||'Stylist TBD'}</span>
          <span><i class="fas fa-hashtag"></i> ${b.id||'—'}</span>
          ${b.price ? `<span><i class="fas fa-tag"></i> USD ${Number(b.price).toLocaleString()}</span>` : ''}
        </div>
        ${b.notes ? `<div class="booking-notes"><i class="fas fa-comment"></i> ${b.notes}</div>` : ''}
      </div>
      <div class="booking-right">
        <div class="booking-status status-${b.status||'pending'}">
          <i class="${s.icon}"></i> ${s.label}
        </div>
        ${canCancel ? `<button class="btn-cancel-booking" onclick="cancelBooking('${b.id}',this)" title="Cancel booking"><i class="fas fa-times"></i> Cancel</button>` : ''}
        ${b.status==='completed' ? `<button class="btn-rebook" onclick="navigateTo('overview')" title="Book again"><i class="fas fa-redo"></i> Book Again</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
function filterBookings(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderBookings(filter);
}

async function cancelBooking(id, btn) {
  if (!confirm('Cancel this booking?')) return;
  const bk = userBookings.find(b => b.id === id); if (!bk) return;
  const orig = btn.innerHTML; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true;
  bk.status = 'cancelled';
  try {
    if (window._fb && id && !id.startsWith('BK')) {
      await window._fb.updateDoc(window._fb.doc(window._fb.db, 'bookings', id), { status: 'cancelled' });
    }
    showToast('Booking cancelled.', 'error');
  } catch(e) { showToast('Cancelled locally.', 'gold'); }
  renderBookings('all');
  updateStats();
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
  grid.querySelectorAll('.btn-card-book').forEach(btn=>{btn.addEventListener('click',e=>{e.stopPropagation();openDbBookingStepsModal(btn.dataset.style);});});
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

// STYLE MODAL — matches index.js layout (fullscreen, image gallery, BSM booking)
function openStyleModal(id) {
  const style = hairstyles.find(s => s.id === id); if (!style) return;

  const modal = document.getElementById('style-modal');
  const body  = document.getElementById('modal-body-inner');

  // Images
  const images = Array.isArray(style.imageUrls) && style.imageUrls.length
    ? style.imageUrls
    : style.imageUrl ? [style.imageUrl] : [];

  // Update topbar title
  const topbarTitle = document.getElementById('db-modal-topbar-title');
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
    <div class="modal-gallery" id="db-modalGallery">
      <div class="modal-gallery-track" id="db-modalGalleryTrack">
        ${galleryInnerHTML}
      </div>
      ${showArrows ? `
        <button class="modal-gallery-arrow prev" id="db-galleryPrev"><i class="fas fa-chevron-left"></i></button>
        <button class="modal-gallery-arrow next" id="db-galleryNext"><i class="fas fa-chevron-right"></i></button>
      ` : ''}
      ${showDots ? `
        <div class="modal-gallery-dots" id="db-galleryDots">
          ${images.map((_, i) => `<div class="modal-gallery-dot ${i===0?'active':''}" data-idx="${i}"></div>`).join('')}
        </div>
      ` : ''}
      ${images.length > 1 ? `<div class="modal-img-count" id="db-galleryCount">1 / ${images.length}</div>` : ''}
    </div>
    <div class="modal-details">
      <h2>${style.name}</h2>
      <div class="modal-price">USD ${style.price.toLocaleString()}${style.originalPrice ? ` <span style="text-decoration:line-through;color:#9ca3af;font-size:1rem">USD ${style.originalPrice.toLocaleString()}</span>` : ''}</div>
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
      <button class="btn-modal-book" onclick="dbBookFromModal('${style.name.replace(/'/g,"\\'")}')">
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
  const track   = document.getElementById('db-modalGalleryTrack');
  const prevBtn = document.getElementById('db-galleryPrev');
  const nextBtn = document.getElementById('db-galleryNext');
  const dots    = document.querySelectorAll('#db-galleryDots .modal-gallery-dot');
  const countEl = document.getElementById('db-galleryCount');
  const total   = images.length;

  function goToSlide(idx) {
    if (idx < 0 || idx >= total) return;
    currentSlide = idx;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    if (countEl) countEl.textContent = `${currentSlide + 1} / ${total}`;
    if (prevBtn) prevBtn.classList.toggle('hidden', currentSlide === 0);
    if (nextBtn) nextBtn.classList.toggle('hidden', currentSlide === total - 1);
  }

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach(d => d.addEventListener('click', () => goToSlide(+d.dataset.idx)));

  if (prevBtn) prevBtn.classList.add('hidden');
  if (nextBtn && total <= 1) nextBtn.classList.add('hidden');

  // Touch swipe
  let touchStartX = 0;
  const galleryEl = document.getElementById('db-modalGallery');
  galleryEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  galleryEl?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeStyleModal() {
  document.getElementById('style-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function dbBookFromModal(name) {
  closeStyleModal();
  openDbBookingStepsModal(name);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeStyleModal();
    closeDbBsmModal();
    document.getElementById('confirm-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
});

// =================== DB BOOKING STEPS MODAL ===================
let dbBsmCurrentStep = 1;
let dbBsmStyleName   = '';

function openDbBookingStepsModal(styleName) {
  dbBsmStyleName   = styleName;
  dbBsmCurrentStep = 1;

  const modal = document.getElementById('db-booking-steps-modal');
  if (!modal) return;

  document.getElementById('db-bsm-topbar-title').textContent = styleName;
  goToDbBsmStep(1);

  // Reset fields
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  const dateInput = document.getElementById('db-bsmDate');
  if (dateInput) { dateInput.min = `${yyyy}-${mm}-${dd}`; dateInput.value = ''; }
  const timeEl = document.getElementById('db-bsmTime'); if (timeEl) timeEl.value = '';
  const stylistEl = document.getElementById('db-bsmStylist'); if (stylistEl) stylistEl.value = 'any';
  const nameEl = document.getElementById('db-bsmName');
  if (nameEl) nameEl.value = window.currentUser?.displayName || (window.userProfile?.firstName ? (window.userProfile.firstName+' '+(window.userProfile.lastName||'')).trim() : '');
  const phoneEl = document.getElementById('db-bsmPhone');
  if (phoneEl) phoneEl.value = window.userProfile?.phone || '';
  const notesEl = document.getElementById('db-bsmNotes'); if (notesEl) notesEl.value = '';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDbBsmModal() {
  const modal = document.getElementById('db-booking-steps-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function goToDbBsmStep(step) {
  dbBsmCurrentStep = step;
  document.querySelectorAll('#db-booking-steps-modal .bsm-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('#db-booking-steps-modal .bsm-step').forEach((s, i) => {
    const n = i + 1;
    s.classList.remove('active', 'done');
    if (n === step) s.classList.add('active');
    else if (n < step) s.classList.add('done');
  });
  document.querySelectorAll('#db-booking-steps-modal .bsm-step-line').forEach((l, i) => {
    l.classList.toggle('done', i + 1 < step);
  });
  const backBtn = document.getElementById('db-bsmBack');
  if (backBtn) backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  if (step === 3) buildDbBsmReview();
}

function buildDbBsmReview() {
  const date    = document.getElementById('db-bsmDate').value;
  const time    = document.getElementById('db-bsmTime').value;
  const stylist = document.getElementById('db-bsmStylist').value;
  const name    = document.getElementById('db-bsmName').value;
  const phone   = document.getElementById('db-bsmPhone').value;
  const notes   = document.getElementById('db-bsmNotes')?.value || '';

  const matched = hairstyles.find(s => s.name === dbBsmStyleName);
  const priceStr = matched ? `USD ${matched.price.toLocaleString()}` : '';

  const rows = [
    { icon: 'fas fa-scissors',  label: 'Style',    value: `${matched?.emoji || '✨'} ${dbBsmStyleName}${priceStr ? ' — ' + priceStr : ''}` },
    { icon: 'fas fa-calendar',  label: 'Date',     value: formatDate(date) || date },
    { icon: 'fas fa-clock',     label: 'Time',     value: time },
    { icon: 'fas fa-user-tie',  label: 'Stylist',  value: stylist === 'any' ? 'Any Available Stylist' : stylist },
    { icon: 'fas fa-user',      label: 'Name',     value: name },
    { icon: 'fab fa-whatsapp',  label: 'WhatsApp', value: phone },
    ...(notes ? [{ icon: 'fas fa-comment', label: 'Notes', value: notes }] : []),
  ];

  document.getElementById('db-bsmReviewCard').innerHTML = rows.map(r => `
    <div class="bsm-review-row">
      <div class="bsm-review-icon"><i class="${r.icon}"></i></div>
      <div><div class="bsm-review-label">${r.label}</div><div class="bsm-review-value">${r.value}</div></div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function initDbBookingStepsModal() {
  document.getElementById('db-bsmClose')?.addEventListener('click', closeDbBsmModal);
  document.getElementById('db-bsmOverlay')?.addEventListener('click', closeDbBsmModal);
  document.getElementById('db-bsmBack')?.addEventListener('click', () => {
    if (dbBsmCurrentStep > 1) goToDbBsmStep(dbBsmCurrentStep - 1);
  });

  document.getElementById('db-bsmNext1')?.addEventListener('click', () => {
    const date = document.getElementById('db-bsmDate').value;
    const time = document.getElementById('db-bsmTime').value;
    if (!date) { showToast('Please choose a date 📅', 'error'); return; }
    if (!time) { showToast('Please choose a time ⏰', 'error'); return; }
    goToDbBsmStep(2);
  });

  document.getElementById('db-bsmNext2')?.addEventListener('click', () => {
    const name  = document.getElementById('db-bsmName').value.trim();
    const phone = document.getElementById('db-bsmPhone').value.trim();
    if (!name)  { showToast('Please enter your name 👤', 'error'); return; }
    if (!phone) { showToast('Please enter your WhatsApp number 📱', 'error'); return; }
    goToDbBsmStep(3);
  });

  document.getElementById('db-bsmConfirmBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('db-bsmConfirmBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming…';
    btn.disabled = true;

    const user = window.currentUser;
    if (!user) { showToast('Please sign in to book.', 'error'); btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>'; btn.disabled = false; return; }

    const date    = document.getElementById('db-bsmDate').value;
    const time    = document.getElementById('db-bsmTime').value;
    const stylist = document.getElementById('db-bsmStylist').value;
    const name    = document.getElementById('db-bsmName').value;
    const phone   = document.getElementById('db-bsmPhone').value;
    const notes   = document.getElementById('db-bsmNotes')?.value || '';
    const matched = hairstyles.find(s => s.name === dbBsmStyleName);
    const bookingRef = 'BK' + Date.now();

    const booking = {
      userId: user.uid, style: dbBsmStyleName, date, time, stylist, name, phone, notes,
      status: 'confirmed', emoji: matched?.emoji || '✨', price: matched?.price || null,
      bookingRef, createdAt: new Date().toISOString(), id: bookingRef,
    };

    try {
      await window._fb.addDoc(window._fb.collection(window._fb.db, 'bookings'), booking);
      const newPts = userLoyaltyPoints + 50;
      userLoyaltyPoints = newPts;
      await window._fb.updateDoc(window._fb.doc(window._fb.db, 'users', user.uid), { loyaltyPoints: newPts, totalBookings: userBookings.length + 1 });
      showToast('🎉 +50 Loyalty Points earned!', 'gold');
    } catch(err) {
      const stored = JSON.parse(localStorage.getItem('lb_bk_' + user.uid) || '[]');
      stored.push(booking); localStorage.setItem('lb_bk_' + user.uid, JSON.stringify(stored));
      userLoyaltyPoints += 50;
    }

    userBookings.unshift(booking); updateStats(); updateLoyaltyUI();
    btn.innerHTML = '<i class="fas fa-crown"></i> Confirm Booking<span class="btn-shimmer"></span>';
    btn.disabled = false;

    closeDbBsmModal();

    const cm = document.getElementById('confirm-msg');
    if (cm) cm.textContent = `Your ${dbBsmStyleName} on ${formatDate(date)} at ${time} is confirmed! We'll WhatsApp you at ${phone}. Ref: ${bookingRef}`;
    document.getElementById('confirm-modal').classList.add('open');
  });
}

// =================== REAL FIRESTORE MESSAGES ===================
function getConversationId(userId) {
  return `conv_${userId}`;
}

async function loadAdminMessages(showRefreshToast) {
  const user = window.currentUser; if (!user) return;
  const fb = window._fb; if (!fb) return;
  const convId = getConversationId(user.uid);
  const body = document.getElementById('msg-chat-body');
  if (!body) return;

  // Show loading only on first open
  const loadingEl = document.getElementById('msg-loading');
  if (loadingEl) loadingEl.style.display = 'block';

  // Unsubscribe previous listener
  if (msgUnsubscribe) { msgUnsubscribe(); msgUnsubscribe = null; }

  try {
    const msgsRef = fb.collection(fb.db, 'conversations', convId, 'messages');
    const q = fb.query(msgsRef, fb.orderBy('createdAt', 'asc'));

    msgUnsubscribe = fb.onSnapshot(q, (snap) => {
      clientMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderAdminMessages();
      updateUnreadCount();
      if (showRefreshToast) showToast('Messages refreshed! 🔄', 'success');
    });
  } catch(e) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (body) body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--grey);font-size:.85rem;"><i class="fas fa-comment-dots" style="font-size:2rem;display:block;margin-bottom:12px;opacity:.4;"></i>Start a conversation with LuxeBraids below 💬</div>';
  }
}

function renderAdminMessages() {
  const body = document.getElementById('msg-chat-body');
  const loadingEl = document.getElementById('msg-loading');
  if (!body) return;
  if (loadingEl) loadingEl.style.display = 'none';

  const user = window.currentUser;
  if (!clientMessages.length) {
    body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--grey);font-size:.85rem;">
      <i class="fas fa-comment-dots" style="font-size:2rem;display:block;margin-bottom:12px;opacity:.4;"></i>
      No messages yet. Say hello! 👋
    </div>`;
    updateThreadPreview('Start a conversation\u2026', null);
    return;
  }

  let html = '';
  let lastDateLabel = '';

  clientMessages.forEach((m, idx) => {
    // true  = message sent by THIS client (YOU) → right / outgoing
    // false = message sent by admin/studio      → left  / incoming
    const isMe = m.senderRole === 'client' ||
                 (m.senderRole !== 'admin' && m.senderId === user?.uid);
    const side = isMe ? 'outgoing' : 'incoming';

    const msgDate = m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000) : new Date();
    const time = msgDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });

    // ── Date separator ──
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    let dateLabel;
    if (msgDate.toDateString() === today.toDateString()) dateLabel = 'Today';
    else if (msgDate.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
    else dateLabel = msgDate.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });

    if (dateLabel !== lastDateLabel) {
      html += `<div class="msg-date-separator"><span>${dateLabel}</span></div>`;
      lastDateLabel = dateLabel;
    }

    // ── Read receipt (outgoing only) ──
    const receipt = isMe
      ? (m.readByAdmin
          ? `<span class="msg-read-receipt read"><i class="fas fa-check-double"></i> Seen</span>`
          : `<span class="msg-read-receipt sent"><i class="fas fa-check"></i> Sent</span>`)
      : '';

    // ── Sender label: show "LuxeBraids Studio" at the top of each incoming group ──
    const prevMsg  = idx > 0 ? clientMessages[idx - 1] : null;
    const prevIsMe = prevMsg
      ? (prevMsg.senderRole === 'client' || (prevMsg.senderRole !== 'admin' && prevMsg.senderId === user?.uid))
      : true;
    const showLabel = !isMe && prevIsMe === true;
    const labelHtml = showLabel
      ? `<div class="msg-sender-label"><i class="fas fa-crown" style="font-size:.6rem;"></i> LuxeBraids Studio</div>`
      : '';

    html += `
      <div class="msg-bubble-wrap ${side}">
        ${labelHtml}
        <div class="msg-bubble">
          <div class="msg-bubble-text">${escapeHtml(m.text)}</div>
        </div>
        <div class="msg-bubble-meta">
          <span class="msg-bubble-time">${isMe ? 'You' : (m.senderName || 'LuxeBraids')} · ${time}</span>
          ${receipt}
        </div>
      </div>`;
  });

  body.innerHTML = html;
  body.scrollTop = body.scrollHeight;

  // Update thread preview with latest message
  const last = clientMessages[clientMessages.length - 1];
  const lastTime = last.createdAt?.seconds
    ? timeAgo(new Date(last.createdAt.seconds * 1000))
    : 'Just now';
  updateThreadPreview(last.text, lastTime);
}

function updateThreadPreview(text, time) {
  const preview = document.getElementById('admin-thread-preview-text');
  const timeEl = document.getElementById('admin-thread-time');
  if (preview) preview.textContent = text.length > 35 ? text.slice(0, 35) + '…' : text;
  if (timeEl && time) timeEl.textContent = time;
}

function updateUnreadCount() {
  const user = window.currentUser;
  if (!user) return;
  // Count messages from admin (senderRole === 'admin') that are unread
  const unread = clientMessages.filter(m => m.senderRole === 'admin' && !m.readByClient).length;
  unreadMsgCount = unread;

  // Update notification badge
  const badge = document.getElementById('notif-badge');
  const msgBadge = document.getElementById('msg-badge');
  const unreadDot = document.getElementById('admin-unread-dot');

  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }
  if (msgBadge) { msgBadge.textContent = unread; msgBadge.style.display = unread > 0 ? 'flex' : 'none'; }
  if (unreadDot) unreadDot.style.display = unread > 0 ? 'inline-block' : 'none';
}

async function markMessagesRead() {
  const user = window.currentUser; if (!user) return;
  const fb = window._fb; if (!fb) return;
  const convId = getConversationId(user.uid);
  // Mark all admin messages as read
  const unreadMsgs = clientMessages.filter(m => m.senderRole === 'admin' && !m.readByClient);
  for (const m of unreadMsgs) {
    try {
      await fb.updateDoc(fb.doc(fb.db, 'conversations', convId, 'messages', m.id), { readByClient: true });
    } catch(e) {}
  }
  unreadMsgCount = 0;
  const badge = document.getElementById('notif-badge');
  const msgBadge = document.getElementById('msg-badge');
  const unreadDot = document.getElementById('admin-unread-dot');
  if (badge) badge.style.display = 'none';
  if (msgBadge) msgBadge.style.display = 'none';
  if (unreadDot) unreadDot.style.display = 'none';
}

async function sendAdminMessage() {
  const inp = document.getElementById('msg-input');
  const txt = inp?.value.trim(); if (!txt) return;
  const user = window.currentUser; if (!user) { showToast('Please sign in to message.', 'error'); return; }
  const fb = window._fb; if (!fb) { showToast('Still connecting — try again in a moment.', 'error'); return; }

  const btn = document.getElementById('btn-msg-send');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  // FIX: Do NOT clear input before the save succeeds — clear only on success so message isn't lost on error

  const convId = getConversationId(user.uid);
  const userName = window.userProfile?.firstName
    ? (window.userProfile.firstName + ' ' + (window.userProfile.lastName || '')).trim()
    : (user.displayName || user.email?.split('@')[0] || 'Client');

  const msgData = {
    text: txt,
    senderId: user.uid,
    senderName: userName,
    senderRole: 'client',
    createdAt: fb.serverTimestamp(),
    readByAdmin: false,
    readByClient: true,
  };

  try {
    // Ensure conversation doc exists
    await fb.setDoc(fb.doc(fb.db, 'conversations', convId), {
      clientId: user.uid,
      clientName: userName,
      clientEmail: user.email || '',
      updatedAt: fb.serverTimestamp(),
      lastMessage: txt,
    }, { merge: true });

    await fb.addDoc(fb.collection(fb.db, 'conversations', convId, 'messages'), msgData);

    // FIX: Only clear input after confirmed save to Firestore
    inp.value = '';
  } catch(e) {
    // FIX: Log the real error so it's visible in DevTools console
    console.error('[LuxeBraids] Message save failed:', e?.code, e?.message, e);

    // FIX: Show the actual error code in the toast so it's diagnosable
    const reason = e?.code === 'permission-denied'
      ? 'Permission denied — check Firestore rules.'
      : e?.code === 'unavailable'
      ? 'No connection — check your internet.'
      : e?.code
      ? `Error: ${e.code}`
      : 'Could not send message. Try again.';
    showToast(reason, 'error');

    // Re-enable button and restore input so user can retry
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
    return;
  }

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
}

function selectAdminThread(el) {
  document.querySelectorAll('.msg-thread').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  loadAdminMessages(false);
  markMessagesRead();
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
}

// Poll for unread messages every 30 seconds (even when not on messages tab)
function startMsgPolling() {
  setInterval(async () => {
    const user = window.currentUser; if (!user) return;
    const fb = window._fb; if (!fb) return;
    // Only count unread from Firestore without loading full chat
    try {
      const convId = getConversationId(user.uid);
      const snap = await fb.getDocs(fb.query(
        fb.collection(fb.db, 'conversations', convId, 'messages'),
        fb.where('senderRole', '==', 'admin'),
        fb.where('readByClient', '==', false)
      ));
      const count = snap.size;
      unreadMsgCount = count;
      const badge = document.getElementById('notif-badge');
      const msgBadge = document.getElementById('msg-badge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
      if (msgBadge) { msgBadge.textContent = count; msgBadge.style.display = count > 0 ? 'flex' : 'none'; }
    } catch(e) {}
  }, 30000);
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
// =================== DASHBOARD REVIEW PROMPT (lxb- namespaced) ===================
(function () {
  'use strict';
  let dbRating = 0;
  const starLabels = ['', 'Poor', 'Not Great', 'Okay', 'Good', 'Absolutely Amazing! 🌟'];

  function openDbModal() {
    dbRating = 0;
    document.querySelectorAll('#lxbDbStars .lxb-star').forEach(s => s.classList.remove('on'));
    const hint = document.getElementById('lxbDbHint');
    if (hint) hint.textContent = 'Tap to rate';
    const ta = document.getElementById('lxbDbText');
    if (ta) ta.value = '';
    const sub = document.getElementById('lxbDbSubmit');
    if (sub) { sub.disabled = false; sub.innerHTML = '<i class="fas fa-heart"></i> Submit Review'; }
    document.getElementById('lxbDbFormWrap').style.display = 'block';
    document.getElementById('lxbDbSuccess').style.display = 'none';
    document.getElementById('lxbDbModal').classList.add('lxb-open');
  }

  function initDbModal() {
    document.getElementById('lxbRpBtn')?.addEventListener('click', openDbModal);
    document.getElementById('lxbDbOverlay')?.addEventListener('click', () => document.getElementById('lxbDbModal').classList.remove('lxb-open'));
    document.getElementById('lxbDbClose')?.addEventListener('click', () => document.getElementById('lxbDbModal').classList.remove('lxb-open'));

    const stars = document.querySelectorAll('#lxbDbStars .lxb-star');
    const hint  = document.getElementById('lxbDbHint');
    stars.forEach(s => {
      s.addEventListener('click', () => {
        dbRating = +s.dataset.v;
        stars.forEach((b, i) => b.classList.toggle('on', i < dbRating));
        if (hint) hint.textContent = starLabels[dbRating];
      });
      s.addEventListener('mouseenter', () => stars.forEach((b, i) => b.classList.toggle('on', i < +s.dataset.v)));
    });
    document.getElementById('lxbDbStars')?.addEventListener('mouseleave', () => {
      stars.forEach((b, i) => b.classList.toggle('on', i < dbRating));
    });

    document.getElementById('lxbDbSubmit')?.addEventListener('click', async () => {
      const text = document.getElementById('lxbDbText')?.value.trim();
      if (!dbRating)             { showToast('Please select a star rating.', 'error'); return; }
      if (!text || text.length < 10) { showToast('Please write at least 10 characters.', 'error'); return; }

      const sub = document.getElementById('lxbDbSubmit');
      sub.disabled = true;
      sub.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

      try {
        const { collection, addDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const db   = window._fb?.db || window.firebaseDb;
        const user = window.currentUser;
        const name = window.userProfile?.firstName
          ? `${window.userProfile.firstName} ${(window.userProfile.lastName || '')[0] || ''}`.trim()
          : (user?.displayName || 'Verified Client');

        await addDoc(collection(db, 'reviews'), {
          userId:    user?.uid || null,
          name,
          rating:    dbRating,
          text,
          status:    'pending',
          createdAt: serverTimestamp()
        });
      } catch (e) { /* submit silently */ }

      document.getElementById('lxbDbFormWrap').style.display = 'none';
      document.getElementById('lxbDbSuccess').style.display = 'block';
    });
  }

  // Show review prompt when completed bookings are detected.
  // Hooks into the existing renderBookings function without overwriting it.
  const _origRender = window.renderBookings;
  window.renderBookings = function (filter) {
    if (typeof _origRender === 'function') _origRender(filter);
    // Check if any bookings in the list have status "completed"
    const hasCompleted = Array.isArray(window.userBookings) &&
      window.userBookings.some(b => (b.status || '').toLowerCase() === 'completed');
    const card = document.getElementById('lxbRpCard');
    if (card) card.style.display = hasCompleted ? 'flex' : 'none';
  };

  initDbModal();
})();

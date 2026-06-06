/* ============================================
   ANI BRAIDS — Admin Dashboard JS
   ============================================ */

// =========== PRICE HELPERS ===========
function formatPriceDisplay(s, plain = false) {
  const fmt = n => '$' + Number(n).toLocaleString();
  if (s.priceMode === 'range' && s.priceMax) {
    return plain ? `${fmt(s.price)}–${fmt(s.priceMax)}` : `${fmt(s.price)}–${fmt(s.priceMax)}`;
  }
  if (s.priceMode === 'promo' && s.originalPrice) {
    return plain
      ? `${fmt(s.price)} (was ${fmt(s.originalPrice)})`
      : `${fmt(s.price)} <del style="color:rgba(255,255,255,.3);font-size:.75rem;">${fmt(s.originalPrice)}</del>`;
  }
  return fmt(s.price);
}

function onPriceModeChange(mode) {
  document.getElementById('price-single-row').style.display = mode === 'single' ? '' : 'none';
  document.getElementById('price-range-row').style.display  = mode === 'range'  ? '' : 'none';
  document.getElementById('price-promo-row').style.display  = mode === 'promo'  ? '' : 'none';
}

const SERVICES = [
  {id:1,name:"Goddess Box Braids",emoji:"👑",price:4500,originalPrice:5500,duration:"6–8 hrs",badge:"Trending",hairType:"All types",hairLength:"Medium–Long",description:"Elegant goddess box braids with subtle curled ends. Perfect for queens who want length, volume, and timeless beauty.",bookings:89,rating:4.9},
  {id:2,name:"Knotless Braids",emoji:"✨",price:3800,originalPrice:null,duration:"5–7 hrs",badge:"Most Booked",hairType:"All types",hairLength:"Any",description:"Knotless braids start from your roots with zero tension. More natural look, less stress on your scalp.",bookings:156,rating:4.8},
  {id:3,name:"Fulani Braids",emoji:"🌟",price:4200,originalPrice:null,duration:"5–6 hrs",badge:"New",hairType:"Natural",hairLength:"Short–Long",description:"Inspired by West African Fulani women. Features a central cornrow, side braids, and gold cuffs for a regal, cultural look.",bookings:63,rating:4.9},
  {id:4,name:"Boho Braids",emoji:"🌺",price:5200,originalPrice:6000,duration:"7–9 hrs",badge:"Hot 🔥",hairType:"All types",hairLength:"Long",description:"Romantic boho braids with loose wavy ends and floral accessories. Dreamy, feminine, and absolutely unforgettable.",bookings:48,rating:5.0},
  {id:5,name:"Butterfly Locs",emoji:"🦋",price:4800,originalPrice:5500,duration:"6–8 hrs",badge:"On Offer",hairType:"All types",hairLength:"Medium–Long",description:"Distressed locs with a whimsical, butterfly-wing texture. Bold, artistic, and deeply personal.",bookings:72,rating:4.7},
  {id:6,name:"Bridal Crown Braids",emoji:"💍",price:8500,originalPrice:null,duration:"8–10 hrs",badge:"Premium",hairType:"All types",hairLength:"Long",description:"Intricate bridal braided crown with gold cuffs, floral pins, and cascading twists. Your wedding day deserves perfection.",bookings:22,rating:5.0},
  {id:7,name:"Lemonade Braids",emoji:"🍋",price:2800,originalPrice:null,duration:"4–5 hrs",badge:null,hairType:"Natural",hairLength:"Any",description:"Side-swept cornrow braids inspired by Beyoncé. Sleek, stylish, and ultra-modern. Quick and affordable.",bookings:134,rating:4.6},
  {id:8,name:"Faux Locs",emoji:"🔮",price:4000,originalPrice:4800,duration:"6–8 hrs",badge:"On Offer",hairType:"All types",hairLength:"Medium–Long",description:"Natural-looking faux locs wrapped in soft hair for a distressed, earthy, goddess look that lasts months.",bookings:91,rating:4.8},
  {id:9,name:"Senegalese Twists",emoji:"🌾",price:2500,originalPrice:null,duration:"3–4 hrs",badge:null,hairType:"All types",hairLength:"Medium",description:"Slim, silky Senegalese twists using high-quality kanekalon hair.",bookings:78,rating:4.5},
  {id:10,name:"Ghana Braids",emoji:"🌍",price:2200,originalPrice:null,duration:"3–4 hrs",badge:null,hairType:"Natural",hairLength:"Any",description:"Bold straight-back cornrow braids inspired by Ghanaian heritage.",bookings:112,rating:4.7},
  {id:11,name:"Kids Princess Braids",emoji:"🎀",price:1500,originalPrice:null,duration:"2–3 hrs",badge:"Kids",hairType:"All types",hairLength:"Any",description:"Gentle, fun braids for little queens. Uses only soft, child-safe hair.",bookings:41,rating:4.9},
  {id:12,name:"Men's Cornrow Designs",emoji:"✂️",price:1800,originalPrice:null,duration:"2–3 hrs",badge:"Men's",hairType:"Natural",hairLength:"Short–Med",description:"Sharp, geometric cornrow designs for men who take their hair seriously.",bookings:38,rating:4.6},
  {id:13,name:"Passion Twists",emoji:"💕",price:3600,originalPrice:null,duration:"5–6 hrs",badge:"New",hairType:"All types",hairLength:"Medium–Long",description:"Soft, curly passion twists with a romantic, effortless feel.",bookings:44,rating:4.7},
  {id:14,name:"Celebrity Braid Crown",emoji:"⭐",price:7200,originalPrice:9000,duration:"7–10 hrs",badge:"Luxury",hairType:"All types",hairLength:"Long",description:"A-list worthy braid crown inspired by celebrity red carpet looks.",bookings:11,rating:5.0},
];

// Reviews loaded from Firestore (no hardcoded data)

let announcements = [
  "✨ Today's booking is on offer — 20% off all braids",
  "👑 Weekend braid discounts live now",
  "🔥 Only 3 slots remaining for today",
  "💅 Trending styles being booked as you browse",
  "💍 Luxury bridal collection now available",
  "⚡ Flash braid sale ends tonight at midnight",
  "🌟 29 clients booked Boho Braids this week",
];

// STATE
let allBookings = [];
let allClients = [];
let allNewsletter = [];
let allReviews = [];
let filteredBookings = [];
let currentBookingFilter = 'all';
let editingServiceId = null;

// =========== INIT ===========
function initDashboard() {
  const user = window.adminUser;
  if (user) {
    const name = user.displayName || user.email?.split('@')[0] || 'Admin';
    document.getElementById('greeting-name').textContent = name.split(' ')[0];
    document.getElementById('admin-name').textContent = name;
    document.getElementById('admin-initial').textContent = name.charAt(0).toUpperCase();
    document.getElementById('set-admin-email').value = user.email || '';
    document.getElementById('set-admin-name').value = user.displayName || '';
  }
  loadAllData();
  loadSiteSettings();
  loadPaymentMethods();
  renderServices();
  renderHairTypeTags();
  renderAnnouncements();
  populateStyleSelect();
  loadStylists();
  setMinDate();
  startAdminMsgPolling();
  loadHeroData();
}

function setMinDate() {
  const d = new Date(); d.setDate(d.getDate()+1);
  const el = document.getElementById('bk-date');
  if (el) el.min = d.toISOString().split('T')[0];
}

// =========== NAVIGATION ===========
const panels = { overview:'Dashboard', analytics:'Analytics', bookings:'Bookings', clients:'Clients', services:'Services', stylists:'Stylists', hero:'Hero Section', announcements:'Announcements', reviews:'Reviews', newsletter:'Newsletter', messages:'Client Messages', settings:'Settings' };
function navigateTo(key) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById('panel-'+key);
  if (panel) panel.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => { if (n.textContent.trim().toLowerCase().includes(key.toLowerCase()) || n.getAttribute('onclick')?.includes(key)) n.classList.add('active'); });
  document.getElementById('topbar-title').textContent = panels[key] || key;
  if (window.innerWidth <= 900) closeSidebar();
  if (key === 'messages') loadAdminConversations();
  if (key === 'hero') loadHeroData();
  if (key === 'settings') loadPaymentMethods();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

// =========== LOAD DATA ===========
async function loadAllData() {
  if (!window._fb) { setTimeout(loadAllData, 500); return; }
  const { db, collection, getDocs, query, orderBy, doc, getDoc } = window._fb;

  // Services from Firestore (synced from admin saves)
  try {
    const svcSnap = await getDoc(doc(db, 'settings', 'services'));
    if (svcSnap.exists()) {
      const list = svcSnap.data().list;
      if (Array.isArray(list) && list.length) {
        localServices = list;
        renderServices();
        populateStyleSelect();
      }
    }
  } catch(e) { /* keep default localServices */ }

  // Hair types from Firestore
  try {
    const htSnap = await getDoc(doc(db, 'settings', 'hairTypes'));
    if (htSnap.exists()) {
      const list = htSnap.data().list;
      if (Array.isArray(list) && list.length) {
        localHairTypes = list;
      }
    }
  } catch(e) {}
  renderHairTypeTags();
  populateHairTypeSelect();

  // Announcements from Firestore
  try {
    const annSnap = await getDoc(doc(db, 'settings', 'announcements'));
    if (annSnap.exists()) {
      const list = annSnap.data().list;
      if (Array.isArray(list) && list.length) {
        announcements = list;
        renderAnnouncements();
        // Update admin bar
        const track = document.getElementById('adminAnnTrack');
        if (track) {
          const doubled = [...announcements, ...announcements];
          track.innerHTML = doubled.map(a => `<span>${a}</span>`).join('');
        }
      }
    }
  } catch(e) { /* keep defaults */ }

  // Bookings — fetch all then sort in JS to handle mixed createdAt types
  // (ISO strings from homepage/client-dashboard vs Firestore Timestamps from admin manual entries)
  try {
    const snap = await getDocs(collection(db,'bookings'));
    allBookings = snap.docs
      .map(d => ({ id:d.id, ...d.data() }))
      .sort((a, b) => {
        const toSecs = v => v?.seconds ?? (v ? new Date(v).getTime() / 1000 : 0);
        return toSecs(b.createdAt) - toSecs(a.createdAt);
      });
  } catch(e) {
    console.error('Bookings fetch failed:', e);
    allBookings = getSampleBookings();
  }

  // Clients (users)
  try {
    const snap = await getDocs(collection(db,'users'));
    allClients = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch(e) { allClients = []; }

  // Newsletter
  try {
    const snap = await getDocs(collection(db,'newsletter'));
    allNewsletter = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch(e) { allNewsletter = []; }

  // Reviews
  try {
    const snap = await getDocs(collection(db,'reviews'));
    allReviews = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch(e) { allReviews = []; }

  updateStats();
  renderBookingsTable(allBookings);
  renderClientsTable(allClients);
  renderNewsletterTable(allNewsletter);
  renderReviews();
  renderAnalytics();
  addActivity('Data loaded', 'All Ani Braids data fetched successfully', 'green');
}

function getSampleBookings() {
  return [
    {id:'bk1',name:'Amara Njeru',phone:'+254712345678',style:'Goddess Box Braids',stylist:'Zara — Box Braids',date:'2025-06-01',status:'confirmed',createdAt:{seconds:Date.now()/1000}},
    {id:'bk2',name:'Faith Wanjiru',phone:'+254798765432',style:'Knotless Braids',stylist:'Amina — Locs & Twists',date:'2025-06-02',status:'pending',createdAt:{seconds:Date.now()/1000-3600}},
    {id:'bk3',name:'Grace Mwangi',phone:'+254711223344',style:'Boho Braids',stylist:'Zara — Box Braids',date:'2025-05-30',status:'completed',createdAt:{seconds:Date.now()/1000-86400}},
    {id:'bk4',name:'Destiny Kamau',phone:'+254722334455',style:'Bridal Crown Braids',stylist:'Destiny — Bridal Styles',date:'2025-06-05',status:'pending',createdAt:{seconds:Date.now()/1000-7200}},
    {id:'bk5',name:'Joy Achieng',phone:'+254733445566',style:'Butterfly Locs',stylist:'Amina — Locs & Twists',date:'2025-05-28',status:'cancelled',createdAt:{seconds:Date.now()/1000-172800}},
    {id:'bk6',name:'Naomi Otieno',phone:'+254744556677',style:'Fulani Braids',stylist:'Zara — Box Braids',date:'2025-06-03',status:'confirmed',createdAt:{seconds:Date.now()/1000-1800}},
  ];
}

// =========== STATS ===========
function updateStats() {
  const pending = allBookings.filter(b => b.status === 'pending').length;
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
  const completed = allBookings.filter(b => b.status === 'completed').length;

  // Estimate revenue from completed bookings
  let revenue = 0;
  allBookings.filter(b=>b.status==='completed'||b.status==='confirmed').forEach(b => {
    const svc = SERVICES.find(s => s.name === b.style);
    if (svc) revenue += svc.price;
  });

  document.getElementById('stat-bookings').textContent = allBookings.length;
  document.getElementById('stat-clients').textContent = allClients.length || '—';
  document.getElementById('stat-revenue').textContent = '$'+revenue.toLocaleString();
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-subs').textContent = allNewsletter.length;

  // Pending badge
  const badge = document.getElementById('pending-count');
  if (badge) badge.textContent = pending;
  if (pending > 0) {
    document.getElementById('notif-dot').style.display = 'block';
  }

  // Sub count
  document.getElementById('sub-count').textContent = allNewsletter.length;

  // Pending reviews badge
  const pendingReviews = allReviews.filter(r => r.status === 'pending').length;
  let reviewBadge = document.getElementById('reviews-pending-count');
  if (!reviewBadge) {
    // Create badge next to Reviews nav item if not exists
    const reviewsNav = [...document.querySelectorAll('.nav-item')].find(el => el.textContent.includes('Reviews'));
    if (reviewsNav && pendingReviews > 0) {
      reviewsNav.innerHTML = `<i class="fas fa-star"></i> Reviews <span class="nav-badge" id="reviews-pending-count">${pendingReviews}</span>`;
    }
  } else {
    reviewBadge.textContent = pendingReviews;
    reviewBadge.style.display = pendingReviews > 0 ? 'inline-flex' : 'none';
  }

  // Recent bookings
  renderRecentBookings(allBookings.slice(0,5));
}

// =========== RECENT BOOKINGS ===========
function renderRecentBookings(bks) {
  const tbody = document.getElementById('recent-bookings-tbody');
  if (!tbody) return;
  if (!bks.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:rgba(255,255,255,.3)">No bookings yet</td></tr>'; return; }
  tbody.innerHTML = bks.map(b => `
    <tr>
      <td>${b.name||'—'}</td>
      <td>${b.style||'—'}</td>
      <td>${b.date ? formatDate(b.date) : '—'}</td>
      <td><span class="status-badge ${b.status||'pending'}">${cap(b.status||'pending')}</span></td>
    </tr>
  `).join('');
}

// =========== BOOKINGS TABLE ===========
function renderBookingsTable(bks) {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;
  filteredBookings = bks;
  if (!bks.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:rgba(255,255,255,.3)">No bookings found</td></tr>'; return; }
  tbody.innerHTML = bks.map((b,i) => `
    <tr>
      <td style="color:rgba(255,255,255,.4);font-size:.75rem;">${i+1}</td>
      <td><strong>${b.name||'—'}</strong></td>
      <td>${b.style||'—'}</td>
      <td>${b.stylist?.split('—')[0]?.trim()||'—'}</td>
      <td>${b.date ? formatDate(b.date) : '—'}</td>
      <td style="font-family:monospace;font-size:.78rem;">${b.phone||'—'}</td>
      <td>
        <select class="form-control" style="padding:4px 8px;font-size:.75rem;border-radius:6px;width:auto;"
          onchange="updateBookingStatus('${b.id}',this.value)">
          <option value="pending" ${b.status==='pending'?'selected':''}>Pending</option>
          <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Confirmed</option>
          <option value="completed" ${b.status==='completed'?'selected':''}>Completed</option>
          <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="btn-icon btn-secondary" title="View details" onclick="viewBookingDetail('${b.id}')"><i class="fas fa-eye"></i></button>
        <button class="btn-icon btn-danger" title="Delete" onclick="deleteBooking('${b.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterBookings(status, btn) {
  document.querySelectorAll('#panel-bookings .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentBookingFilter = status;
  const filtered = status === 'all' ? allBookings : allBookings.filter(b => b.status === status);
  renderBookingsTable(filtered);
}

function searchBookings(q) {
  q = q.toLowerCase();
  const base = currentBookingFilter === 'all' ? allBookings : allBookings.filter(b => b.status === currentBookingFilter);
  const res = base.filter(b =>
    (b.name||'').toLowerCase().includes(q) ||
    (b.style||'').toLowerCase().includes(q) ||
    (b.phone||'').includes(q)
  );
  renderBookingsTable(res);
}

async function updateBookingStatus(id, status) {
  const bk = allBookings.find(b => b.id === id);
  if (!bk) return;
  bk.status = status;
  if (window._fb) {
    try {
      await window._fb.updateDoc(window._fb.doc(window._fb.db,'bookings',id), {status});
    } catch(e) {}
  }
  showToast(`Booking ${status}! 👑`, 'success');
  updateStats();
  addActivity('Status updated', `${bk.name}'s booking → ${status}`, status==='confirmed'?'green':status==='cancelled'?'red':'gold');
}

async function updatePaymentStatus(id, paymentStatus) {
  const bk = allBookings.find(b => b.id === id);
  if (!bk) return;
  bk.paymentStatus = paymentStatus;
  if (window._fb) {
    try {
      await window._fb.updateDoc(window._fb.doc(window._fb.db,'bookings',id), {paymentStatus});
    } catch(e) {}
  }
  const label = paymentStatus === 'verified' ? 'Payment verified ✅' : 'Payment rejected ❌';
  showToast(label, paymentStatus === 'verified' ? 'success' : 'error');
  addActivity('Payment updated', `${bk.name} — ${label}`, paymentStatus === 'verified' ? 'green' : 'red');
  // Refresh the detail modal with the updated data
  closeModal('modal-booking-detail');
  setTimeout(() => viewBookingDetail(id), 150);
}

async function deleteBooking(id) {
  if (!confirm('Delete this booking permanently?')) return;
  allBookings = allBookings.filter(b => b.id !== id);
  if (window._fb) {
    try { await window._fb.deleteDoc(window._fb.doc(window._fb.db,'bookings',id)); } catch(e) {}
  }
  filterBookings(currentBookingFilter, document.querySelector('#panel-bookings .tab-btn.active'));
  updateStats(); showToast('Booking deleted.', 'error');
}

function viewBookingDetail(id) {
  const b = allBookings.find(x => x.id === id);
  if (!b) return;

  // Payment badge block
  const methodLabel = b.paymentMethod === 'zelle' ? 'Zelle' : b.paymentMethod === 'cashapp' ? 'Cash App' : null;
  const payStatusMap = {
    awaiting_verification: { label: 'Awaiting Verification', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' },
    verified:              { label: 'Payment Verified',       color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.3)' },
    rejected:              { label: 'Payment Rejected',       color: '#ef4444', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)' },
  };
  const ps = payStatusMap[b.paymentStatus] || null;

  const paymentBlock = methodLabel ? `
    <div style="margin-top:20px;padding:16px 18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:12px;">💳 Payment Details</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:4px;">Method</div>
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:1rem;">
            ${b.paymentMethod === 'zelle'
              ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#6D1ED4;"><svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M14 16h14.5L14 32h20M33 16v16" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Zelle`
              : `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#00D632;"><svg width="14" height="14" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="8" stroke="#fff" stroke-width="3"/><path d="M24 12v4M24 32v4" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg></span>Cash App`
            }
          </div>
        </div>
        <div>
          <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:4px;">${b.paymentMethod === 'cashapp' ? '$Cashtag / Name' : 'Zelle Name / Email'}</div>
          <div style="font-weight:600;">${b.paymentHandle || '—'}</div>
        </div>
      </div>
      ${ps ? `<div style="margin-top:12px;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.06em;background:${ps.bg};border:1px solid ${ps.border};color:${ps.color};">${ps.label}</span></div>` : ''}
      ${b.paymentStatus === 'awaiting_verification' ? `
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-success" style="font-size:.8rem;padding:7px 14px;" onclick="updatePaymentStatus('${b.id}','verified')"><i class="fas fa-check-circle"></i> Mark Verified</button>
          <button class="btn-danger" style="font-size:.8rem;padding:7px 14px;" onclick="updatePaymentStatus('${b.id}','rejected')"><i class="fas fa-times-circle"></i> Reject Payment</button>
        </div>` : ''}
    </div>` : `
    <div style="margin-top:20px;padding:12px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;">
      <div style="font-size:.7rem;color:rgba(255,255,255,.3);"><i class="fas fa-info-circle"></i> No payment info recorded for this booking.</div>
    </div>`;

  // Build WhatsApp message
  const rawPhone = (b.phone||'').replace(/\D/g,'');
  const waMsg = encodeURIComponent(
    `Hi ${b.name||'there'} 👋, this is Ani Braids!\n\nWe received your booking:\n` +
    `📅 Date: ${b.date ? formatDate(b.date) : '—'}\n` +
    `💇 Style: ${b.style||'—'}\n` +
    `👩 Stylist: ${b.stylist||'—'}\n\n` +
    `We'd like to confirm your appointment. Please reply to this message to confirm. Thank you! 🌟`
  );
  const waLink = rawPhone ? `https://wa.me/${rawPhone}?text=${waMsg}` : '#';

  // Build submitted-at date
  const submittedAt = b.createdAt
    ? (b.createdAt.seconds
        ? new Date(b.createdAt.seconds * 1000).toLocaleString('en-KE', {weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
        : new Date(b.createdAt).toLocaleString('en-KE'))
    : '—';

  function detailRow(label, value) {
    return `<div>
      <div style="font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:4px;">${label}</div>
      <div style="font-weight:600;font-size:.92rem;">${value||'—'}</div>
    </div>`;
  }

  document.getElementById('booking-detail-body').innerHTML = `
    <!-- Client Info -->
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 18px;margin-bottom:14px;">
      <div style="font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:12px;">👤 Client Information</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        ${detailRow('Full Name', b.name)}
        ${detailRow('Phone', b.phone ? `<a href="tel:${b.phone}" style="color:inherit;text-decoration:none;">${b.phone}</a>` : '—')}
        ${b.email ? detailRow('Email', `<a href="mailto:${b.email}" style="color:rgba(255,200,80,.85);text-decoration:none;">${b.email}</a>`) : ''}
        ${b.hairType ? detailRow('Hair Type', b.hairType) : ''}
        ${b.hairLength ? detailRow('Hair Length', b.hairLength) : ''}
      </div>
    </div>

    <!-- Booking Info -->
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 18px;margin-bottom:14px;">
      <div style="font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:12px;">📅 Booking Details</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        ${detailRow('Style', b.style)}
        ${detailRow('Stylist', b.stylist)}
        ${detailRow('Appointment Date', b.date ? formatDate(b.date) : '—')}
        ${b.time ? detailRow('Time', b.time) : ''}
        ${detailRow('Submitted', submittedAt)}
        <div>
          <div style="font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:4px;">Status</div>
          <span class="status-badge ${b.status||'pending'}">${cap(b.status||'pending')}</span>
        </div>
      </div>
      ${b.notes ? `<div style="margin-top:14px;">${detailRow('Client Notes', `<span style="color:rgba(255,255,255,.7);font-weight:400;">${b.notes}</span>`)}</div>` : ''}
    </div>

    ${paymentBlock}

    <!-- Action Buttons -->
    <div style="margin-top:18px;">
      <div style="font-size:.63rem;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:10px;">⚡ Actions</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${b.status !== 'confirmed' && b.status !== 'completed' ? `<button class="btn-success" onclick="updateBookingStatus('${b.id}','confirmed');closeModal('modal-booking-detail')"><i class="fas fa-check"></i> Approve</button>` : ''}
        ${b.status !== 'completed' ? `<button class="btn-success" style="background:rgba(74,144,217,.12);border-color:rgba(74,144,217,.3);color:#4a90d9;" onclick="updateBookingStatus('${b.id}','completed');closeModal('modal-booking-detail')"><i class="fas fa-flag-checkered"></i> Complete</button>` : ''}
        ${b.status !== 'cancelled' ? `<button class="btn-danger" onclick="updateBookingStatus('${b.id}','cancelled');closeModal('modal-booking-detail')"><i class="fas fa-times"></i> Cancel</button>` : ''}
        ${rawPhone ? `<a href="${waLink}" target="_blank" class="btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#25d366,#128c7e);border:none;"><i class="fab fa-whatsapp"></i> WhatsApp Client</a>` : ''}
      </div>
    </div>
  `;
  document.getElementById('modal-booking-detail').classList.add('open');
}

async function saveBooking() {
  const name = document.getElementById('bk-name').value.trim();
  const phone = document.getElementById('bk-phone').value.trim();
  const style = document.getElementById('bk-style').value;
  const stylist = document.getElementById('bk-stylist').value;
  const date = document.getElementById('bk-date').value;
  const status = document.getElementById('bk-status').value;

  if (!name || !style || !date) { showToast('Please fill all required fields.','error'); return; }

  const booking = { name, phone, style, stylist, date, status, createdAt: {seconds: Date.now()/1000} };
  if (window._fb) {
    try {
      const ref = await window._fb.addDoc(window._fb.collection(window._fb.db,'bookings'), { ...booking, createdAt: window._fb.serverTimestamp() });
      booking.id = ref.id;
    } catch(e) { booking.id = 'bk'+Date.now(); }
  } else { booking.id = 'bk'+Date.now(); }

  allBookings.unshift(booking);
  updateStats();
  renderBookingsTable(allBookings);
  closeModal('modal-add-booking');
  showToast('Booking added! 📅', 'success');
  addActivity('Booking created', `${name} booked ${style}`, 'gold');
  document.getElementById('bk-name').value=''; document.getElementById('bk-phone').value=''; document.getElementById('bk-date').value='';
}

// =========== CLIENTS ===========
function renderClientsTable(clients) {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  if (!clients.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:rgba(255,255,255,.3)">No registered clients yet</td></tr>'; return; }
  tbody.innerHTML = clients.map(c => {
    const name = c.displayName || ((c.firstName||'')+(c.lastName?' '+c.lastName:'')).trim() || c.email?.split('@')[0] || 'Client';
    const init = name.charAt(0).toUpperCase();
    const joined = c.createdAt ? new Date(c.createdAt.seconds*1000).toLocaleDateString('en-KE') : '—';
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px;"><div class="user-row-avatar">${init}</div><div><div style="font-weight:600;">${name}</div></div></div></td>
      <td style="font-size:.8rem;">${c.email||'—'}</td>
      <td style="font-size:.8rem;">${c.phone||'—'}</td>
      <td>${allBookings.filter(b=>b.phone===c.phone).length || 0}</td>
      <td><span style="color:var(--gold);font-weight:600;">${c.loyaltyPoints||0} pts</span></td>
      <td style="font-size:.78rem;">${joined}</td>
      <td>
        <a href="https://wa.me/${(c.phone||'').replace(/\D/g,'')}" target="_blank" class="btn-icon btn-success" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
      </td>
    </tr>`;
  }).join('');
}

function searchClients(q) {
  q = q.toLowerCase();
  const res = allClients.filter(c =>
    (c.displayName||'').toLowerCase().includes(q) ||
    (c.firstName||'').toLowerCase().includes(q) ||
    (c.email||'').toLowerCase().includes(q)
  );
  renderClientsTable(res);
}

// =========== SERVICES ===========
let localServices = JSON.parse(JSON.stringify(SERVICES));

// =========== HAIR TYPES ===========
let localHairTypes = ['Natural', 'Relaxed', 'Transitioning', 'Loc\'d', 'Color-treated', 'All types'];

function renderHairTypeTags() {
  const wrap = document.getElementById('hair-types-wrap');
  if (!wrap) return;
  wrap.innerHTML = localHairTypes.map((h, i) => `
    <div class="hair-type-tag" style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,159,0,.1);border:1px solid rgba(255,159,0,.25);color:var(--gold);border-radius:20px;padding:4px 12px;font-size:.78rem;margin:4px;">
      <span>${h}</span>
      <button onclick="removeHairType(${i})" style="background:none;border:none;color:rgba(255,159,0,.6);cursor:pointer;padding:0;font-size:.85rem;line-height:1;">✕</button>
    </div>
  `).join('');
  populateHairTypeSelect();
}

function addHairType() {
  const inp = document.getElementById('new-hair-type');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) { showToast('Enter a hair type name.', 'error'); return; }
  if (localHairTypes.includes(val)) { showToast('Hair type already exists.', 'error'); return; }
  localHairTypes.push(val);
  inp.value = '';
  renderHairTypeTags();
  showToast('Hair type added! ✂️', 'success');
}

function removeHairType(i) {
  localHairTypes.splice(i, 1);
  renderHairTypeTags();
}

async function saveHairTypes() {
  if (window._fb) {
    try {
      await window._fb.setDoc(window._fb.doc(window._fb.db, 'settings', 'hairTypes'), { list: localHairTypes });
    } catch(e) {}
  }
  showToast('Hair types saved! 💅', 'success');
  addActivity('Hair types updated', `${localHairTypes.length} types saved`, 'gold');
}

function populateHairTypeSelect() {
  const sel = document.getElementById('svc-hairtype');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = localHairTypes.map(h => `<option value="${h}" ${cur===h?'selected':''}>${h}</option>`).join('');
}

function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = localServices.map(s => `
    <div class="service-card">
      ${s.imageUrl
        ? `<img src="${s.imageUrl}" alt="${s.name}" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px;display:block;">`
        : `<div style="width:100%;height:160px;border-radius:10px;margin-bottom:10px;background:rgba(255,255,255,.04);border:1.5px dashed rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:rgba(255,255,255,.25);font-size:.72rem;"><i class="fas fa-camera" style="font-size:1.6rem;opacity:.3;"></i><span>No image uploaded</span></div>`}
      <div class="service-name">${s.name}</div>
      <div class="service-price">${formatPriceDisplay(s)}</div>
      <div class="service-meta">
        <span><i class="fas fa-clock"></i> ${s.duration}</span>
        <span><i class="fas fa-star"></i> ${s.rating}</span>
        <span><i class="fas fa-calendar-check"></i> ${s.bookings} bkd</span>
      </div>
      ${s.badge?`<span style="position:absolute;top:12px;left:12px;background:rgba(255,159,0,.15);border:1px solid rgba(255,159,0,.3);color:var(--gold);border-radius:20px;padding:3px 8px;font-size:.65rem;font-weight:700;">${s.badge}</span>`:''}
      <div class="service-actions">
        <button class="btn-icon btn-secondary" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function editService(id) {
  const s = localServices.find(x => x.id === id);
  if (!s) return;
  editingServiceId = id;
  document.getElementById('svc-name').value = s.name;
  document.getElementById('svc-price').value = s.price;
  document.getElementById('svc-oprice').value = s.originalPrice || '';
  // Restore price mode
  const mode = s.priceMode || (s.originalPrice ? 'promo' : (s.priceMax ? 'range' : 'single'));
  const radioEl = document.querySelector(`input[name="price-mode"][value="${mode}"]`);
  if (radioEl) { radioEl.checked = true; onPriceModeChange(mode); }
  if (mode === 'range') {
    document.getElementById('svc-price-min').value = s.price || '';
    document.getElementById('svc-price-max').value = s.priceMax || '';
  }
  document.getElementById('svc-duration').value = s.duration;
  document.getElementById('svc-badge').value = s.badge || '';
  document.getElementById('svc-desc').value = s.description;
  document.getElementById('svc-hairtype').value = s.hairType;
  document.getElementById('svc-hairlen').value = s.hairLength;

  // Populate multi-image slots from existing data
  const existingUrls = Array.isArray(s.imageUrls) && s.imageUrls.length
    ? s.imageUrls
    : s.imageUrl ? [s.imageUrl] : [];
  pendingImages = existingUrls.map(url => ({ file: null, url }));
  renderMultiImgGrid();

  // Restore category checkboxes
  const cats = s.category || [];
  document.querySelectorAll('#svc-categories-wrap input[type=checkbox]').forEach(cb => {
    cb.checked = cats.includes(cb.value);
  });

  // Restore hair type select
  populateHairTypeSelect();
  if (s.hairType) document.getElementById('svc-hairtype').value = s.hairType;

  document.querySelector('#modal-add-service .modal-header h3').textContent = '✂️ Edit Service';
  openModal('modal-add-service');
}

// =========== CLOUDINARY IMAGE UPLOAD (MULTI — up to 5) ===========
const CLOUDINARY_CLOUD = 'dwbtsp1kg';
const CLOUDINARY_PRESET = 'braids_uploads';

// Holds {file, previewUrl, uploadedUrl} for each slot (max 5)
let pendingImages = []; // {file: File|null, url: string}

function renderMultiImgGrid() {
  const grid = document.getElementById('svc-multi-img-grid');
  if (!grid) return;
  grid.innerHTML = '';
  pendingImages.forEach((img, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1.5px solid rgba(255,159,0,.3);background:rgba(255,255,255,.04);';
    div.innerHTML = `
      <img src="${img.url}" alt="img ${idx+1}" style="width:100%;height:100%;object-fit:cover;display:block;">
      <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.55);text-align:center;font-size:.62rem;color:#fff;padding:3px 2px;font-weight:500;">
        ${idx === 0 ? '⭐ Main' : `#${idx+1}`}
      </div>
      <button onclick="removeImgSlot(${idx})" title="Remove" style="position:absolute;top:4px;right:4px;width:22px;height:22px;background:rgba(220,30,60,.75);border:none;border-radius:50%;color:#fff;font-size:.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-times"></i></button>
    `;
    grid.appendChild(div);
  });

  // Update the add-label visibility (hide when 5 slots filled)
  const addLabel = document.getElementById('svc-add-img-label');
  if (addLabel) addLabel.style.display = pendingImages.length >= 5 ? 'none' : 'inline-flex';

  // Sync hidden url fields
  document.getElementById('svc-image-url').value = pendingImages[0]?.url || '';
  document.getElementById('svc-image-urls-json').value = JSON.stringify(pendingImages.map(i => i.url));
}

window.removeImgSlot = function(idx) {
  pendingImages.splice(idx, 1);
  renderMultiImgGrid();
};

// Called when admin picks files from the file input
function handleMultiImageSelect(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const remaining = 5 - pendingImages.length;
  const toAdd = files.slice(0, remaining);
  toAdd.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      pendingImages.push({ file, url: e.target.result }); // local preview URL initially
      renderMultiImgGrid();
    };
    reader.readAsDataURL(file);
  });
  input.value = ''; // allow re-selecting
}

// Legacy single-image preview (kept for backward compat)
function previewServiceImage(input) {
  handleMultiImageSelect(input);
}

async function uploadToCloudinary(file, folder) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  if (folder) fd.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:'POST', body:fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function saveService() {
  const name = document.getElementById('svc-name').value.trim();
  const priceMode = document.querySelector('input[name="price-mode"]:checked')?.value || 'single';
  let price = 0, oprice = null, priceMax = null;
  if (priceMode === 'range') {
    price  = parseInt(document.getElementById('svc-price-min').value) || 0;
    priceMax = parseInt(document.getElementById('svc-price-max').value) || null;
  } else if (priceMode === 'promo') {
    oprice = parseInt(document.getElementById('svc-oprice').value) || null;
    price  = parseInt(document.getElementById('svc-price').value) || 0;
  } else {
    price  = parseInt(document.getElementById('svc-price').value) || 0;
  }
  const duration = document.getElementById('svc-duration').value.trim();
  const badge = document.getElementById('svc-badge').value.trim() || null;
  const description = document.getElementById('svc-desc').value.trim();
  const hairType = document.getElementById('svc-hairtype').value;
  const hairLength = document.getElementById('svc-hairlen').value.trim();

  // Collect checked categories; always include 'all'
  const checkedCats = [...document.querySelectorAll('#svc-categories-wrap input[type=checkbox]:checked')].map(cb => cb.value);
  const category = checkedCats.length ? [...checkedCats, 'all'] : ['all'];

  if (!name || !price) { showToast('Name and price are required.', 'error'); return; }

  // Upload any pending File objects to Cloudinary
  const saveBtn = document.querySelector('#modal-add-service .btn-primary');
  const origText = saveBtn.innerHTML;
  const filesToUpload = pendingImages.filter(img => img.file instanceof File);

  if (filesToUpload.length) {
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${filesToUpload.length} image${filesToUpload.length>1?'s':''}…`;
    saveBtn.disabled = true;
    try {
      for (const imgObj of pendingImages) {
        if (imgObj.file instanceof File) {
          imgObj.url = await uploadToCloudinary(imgObj.file);
          imgObj.file = null; // clear file reference after upload
        }
      }
      renderMultiImgGrid();
    } catch(e) {
      showToast('Image upload failed. Please try again.', 'error');
      saveBtn.innerHTML = origText; saveBtn.disabled = false;
      return;
    }
    saveBtn.innerHTML = origText; saveBtn.disabled = false;
  }

  const imageUrls = pendingImages.map(i => i.url).filter(Boolean);
  const imageUrl = imageUrls[0] || '';

  if (editingServiceId) {
    const idx = localServices.findIndex(s => s.id === editingServiceId);
    if (idx !== -1) localServices[idx] = {...localServices[idx], name, imageUrl, imageUrls, category, price, priceMax, priceMode, originalPrice:oprice, duration, badge, description, hairType, hairLength};
    editingServiceId = null;
    document.querySelector('#modal-add-service .modal-header h3').textContent = '✂️ Add/Edit Service';
  } else {
    localServices.push({ id: Date.now(), name, imageUrl, imageUrls, category, price, priceMax, priceMode, originalPrice:oprice, duration, badge, description, hairType, hairLength, bookings:0, rating:5.0 });
  }

  if (window._fb) {
    window._fb.setDoc(window._fb.doc(window._fb.db,'settings','services'), { list: localServices }).catch(()=>{});
  }

  renderServices();
  populateStyleSelect();
  closeModal('modal-add-service');
  // Reset multi-image state
  pendingImages = [];
  renderMultiImgGrid();
  document.getElementById('svc-image-file').value = '';
  document.getElementById('svc-image-url').value = '';
  document.getElementById('svc-image-urls-json').value = '[]';
  document.querySelectorAll('#svc-categories-wrap input[type=checkbox]').forEach(cb => cb.checked = false);
  showToast('Service saved! ✂️', 'success');
  addActivity('Service updated', name+' saved to menu', 'pink');
}

function deleteService(id) {
  if (!confirm('Remove this service from the menu?')) return;
  localServices = localServices.filter(s => s.id !== id);
  // Persist deletion to Firestore so client & index pages stay in sync
  if (window._fb) {
    window._fb.setDoc(window._fb.doc(window._fb.db,'settings','services'), { list: localServices }).catch(()=>{});
  }
  renderServices();
  populateStyleSelect();
  showToast('Service removed.', 'error');
  addActivity('Service deleted', 'Service removed from menu & synced', 'red');
}

function populateStyleSelect() {
  const sel = document.getElementById('bk-style');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select style…</option>' +
    localServices.map(s => `<option value="${s.name}">${s.emoji||'✂️'} ${s.name} — ${formatPriceDisplay(s, true)}</option>`).join('');
}

// =========== STYLISTS ===========
let localStylists = [];

async function loadStylists() {
  const tbody = document.getElementById('stylists-tbody');
  if (!tbody) return;
  if (!window._fb) { setTimeout(loadStylists, 500); return; }
  const { db, collection, getDocs } = window._fb;
  try {
    const snap = await getDocs(collection(db, 'stylists'));
    localStylists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderStylistsTable();
    populateStylistSelect();
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:rgba(255,71,87,.5);">Failed to load stylists</td></tr>`;
  }
}

function renderStylistsTable() {
  const tbody = document.getElementById('stylists-tbody');
  if (!tbody) return;
  if (!localStylists.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:rgba(255,255,255,.3);">No stylists yet — add your first team member</td></tr>`;
    return;
  }
  tbody.innerHTML = localStylists.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.specialty||'—'}</td>
      <td>${s.bookings||0}</td>
      <td>★ ${s.rating||'5.0'}</td>
      <td>${s.availability||'TBD'}</td>
      <td><span class="status-badge ${s.status==='inactive'?'cancelled':'confirmed'}">${s.status==='inactive'?'Inactive':'Active'}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn-secondary btn-sm" onclick="openEditStylist('${s.id}')"><i class="fas fa-pen" style="font-size:.7rem;"></i> Edit</button>
        <button class="btn-danger btn-sm" onclick="deleteStylist('${s.id}','${s.name}')"><i class="fas fa-trash" style="font-size:.7rem;"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

function populateStylistSelect() {
  const sel = document.getElementById('bk-stylist');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Select stylist…</option>' +
    localStylists.filter(s => s.status !== 'inactive').map(s =>
      `<option value="${s.name} — ${s.specialty||'General'}">${s.name} — ${s.specialty||'General'}</option>`
    ).join('');
  if (current) sel.value = current;
}

function openEditStylist(id) {
  const s = localStylists.find(x => x.id === id);
  if (!s) return;
  document.getElementById('stl-id').value = s.id;
  document.getElementById('stl-name').value = s.name || '';
  document.getElementById('stl-spec').value = s.specialty || '';
  document.getElementById('stl-phone').value = s.phone || '';
  document.getElementById('stl-avail').value = s.availability || '';
  document.getElementById('stl-bio').value = s.bio || '';
  document.getElementById('stylist-modal-title').textContent = '✏️ Edit Stylist';
  openModal('add-stylist');
}

function resetStylistModal() {
  document.getElementById('stl-id').value = '';
  document.getElementById('stl-name').value = '';
  document.getElementById('stl-spec').value = '';
  document.getElementById('stl-phone').value = '';
  document.getElementById('stl-avail').value = '';
  document.getElementById('stl-bio').value = '';
  document.getElementById('stylist-modal-title').textContent = '💅 Add Stylist';
}

async function saveStylist() {
  const name = document.getElementById('stl-name').value.trim();
  if (!name) { showToast('Name is required.', 'error'); return; }
  if (!window._fb) { showToast('Firebase not ready', 'error'); return; }
  const { db, collection, addDoc, setDoc, doc, serverTimestamp } = window._fb;

  const editId = document.getElementById('stl-id').value.trim();
  const data = {
    name,
    specialty: document.getElementById('stl-spec').value.trim() || '—',
    phone: document.getElementById('stl-phone').value.trim() || '',
    availability: document.getElementById('stl-avail').value.trim() || 'TBD',
    bio: document.getElementById('stl-bio').value.trim() || '',
    status: 'active',
    bookings: 0,
    rating: '5.0',
  };

  try {
    if (editId) {
      // Edit existing
      const existing = localStylists.find(x => x.id === editId);
      data.bookings = existing?.bookings || 0;
      data.rating = existing?.rating || '5.0';
      await setDoc(doc(db, 'stylists', editId), data);
      showToast('Stylist updated! ✅', 'success');
    } else {
      // Add new
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'stylists'), data);
      showToast('Stylist added! 💅', 'success');
    }
    closeModal('modal-add-stylist');
    // Reset modal for next add
    document.getElementById('stl-id').value = '';
    document.getElementById('stylist-modal-title').textContent = '💅 Add Stylist';
    await loadStylists();
  } catch(e) {
    showToast('Error saving stylist: ' + e.message, 'error');
  }
}

async function deleteStylist(id, name) {
  if (!confirm(`Delete stylist "${name}"? This cannot be undone.`)) return;
  if (!window._fb) { showToast('Firebase not ready', 'error'); return; }
  const { db, deleteDoc, doc } = window._fb;
  try {
    await deleteDoc(doc(db, 'stylists', id));
    showToast(`${name} removed from the team.`, 'success');
    await loadStylists();
  } catch(e) {
    showToast('Error deleting stylist: ' + e.message, 'error');
  }
}


// =========== ANNOUNCEMENTS ===========
function renderAnnouncements() {
  const list = document.getElementById('ann-list');
  if (!list) return;
  list.innerHTML = announcements.map((a,i) => `
    <div class="ann-item" id="ann-item-${i}">
      <span class="ann-item-handle"><i class="fas fa-grip-vertical"></i></span>
      <input type="text" value="${a}" class="form-control" style="font-size:.83rem;padding:8px 12px;" oninput="announcements[${i}]=this.value;updateAnnPreview()"/>
      <div class="ann-item-actions">
        <button class="btn-icon btn-danger" onclick="removeAnnouncement(${i})"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');
  updateAnnPreview();
}

function addAnnouncement() {
  announcements.push('🌟 New announcement text here');
  renderAnnouncements();
}

function removeAnnouncement(i) {
  announcements.splice(i, 1);
  renderAnnouncements(); showToast('Announcement removed.', 'error');
}

function updateAnnPreview() {
  const track = document.getElementById('ann-preview-track');
  if (!track) return;
  track.textContent = announcements.join('  ·  ');
}

async function saveAnnouncements() {
  // Sync values from inputs
  document.querySelectorAll('#ann-list .ann-item input').forEach((inp,i) => {
    announcements[i] = inp.value;
  });
  if (window._fb) {
    try {
      await window._fb.setDoc(window._fb.doc(window._fb.db,'settings','announcements'), { list: announcements });
    } catch(e) {}
  }
  // Update the admin announcement bar
  const track = document.getElementById('adminAnnTrack');
  const doubled = [...announcements, ...announcements];
  track.innerHTML = doubled.map(a => `<span>${a}</span>`).join('');
  showToast('Announcements saved & published! 📢', 'success');
  addActivity('Announcements updated', `${announcements.length} messages published`, 'gold');
}

// =========== REVIEWS ===========
function renderReviews() {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;
  if (!allReviews.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:rgba(255,255,255,.3)"><i class="fas fa-star" style="margin-right:8px;"></i> No reviews yet — they will appear here when clients submit them.</td></tr>';
    return;
  }
  // Sort: pending first, then by newest
  const sorted = [...allReviews].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    const toMs = v => v?.seconds ? v.seconds * 1000 : (v ? new Date(v).getTime() : 0);
    return toMs(b.createdAt) - toMs(a.createdAt);
  });
  tbody.innerHTML = sorted.map(r => {
    const initial = (r.name || '?').charAt(0).toUpperCase();
    const stars = '★'.repeat(Math.min(5, parseInt(r.rating) || 5));
    const isPending  = r.status === 'pending';
    const isApproved = r.status === 'approved';
    const text = (r.text || r.review || '').substring(0, 90);
    const styleName = r.styleName || r.style || '—';
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="user-row-avatar" style="background:linear-gradient(135deg,var(--pink-deep),var(--purple));">${initial}</div>
          <div>
            <strong>${r.name || 'Anonymous'}</strong>
            ${r.email ? `<div style="font-size:.72rem;color:rgba(255,255,255,.4);">${r.email}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="font-size:.78rem;max-width:160px;color:rgba(255,255,255,.7);">${styleName}</td>
      <td style="font-size:.78rem;max-width:200px;color:rgba(255,255,255,.75);">${text}${text.length >= 90 ? '…' : ''}</td>
      <td style="color:#f9c74f;letter-spacing:2px;">${stars}</td>
      <td>
        <span class="status-badge ${isApproved ? 'confirmed' : isPending ? 'pending' : 'cancelled'}">
          ${isPending ? '⏳ Pending' : isApproved ? '✅ Approved' : '🚫 Hidden'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${isPending ? `
            <button class="btn-primary btn-sm" style="padding:5px 10px;font-size:.72rem;" onclick="approveReview('${r.id}')" title="Approve & Publish">
              <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn-icon btn-danger" onclick="rejectReview('${r.id}')" title="Reject / Hide">
              <i class="fas fa-times"></i>
            </button>
          ` : isApproved ? `
            <button class="btn-secondary btn-sm" style="padding:5px 10px;font-size:.72rem;" onclick="unpublishReview('${r.id}')" title="Hide">
              <i class="fas fa-eye-slash"></i> Hide
            </button>
          ` : `
            <button class="btn-primary btn-sm" style="padding:5px 10px;font-size:.72rem;" onclick="approveReview('${r.id}')" title="Re-approve">
              <i class="fas fa-eye"></i> Approve
            </button>
          `}
          <button class="btn-icon btn-danger" onclick="deleteReview('${r.id}')" title="Delete permanently">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function updateReviewStatus(id, status) {
  try {
    const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const db = window._fb?.db;
    if (!db) throw new Error('Firestore not ready');
    await updateDoc(doc(db, 'reviews', id), { status });
    return true;
  } catch(e) {
    console.error('Review update failed:', e);
    showToast('Failed to save — check your connection.', 'error');
    return false;
  }
}

async function approveReview(id) {
  const ok = await updateReviewStatus(id, 'approved');
  if (ok) {
    allReviews = allReviews.map(r => r.id === id ? { ...r, status: 'approved' } : r);
    renderReviews();
    showToast('Review approved & published! ✅', 'success');
    // Recalculate and update the service's rating in Firestore
    await recalcServiceRating(id);
  }
}

async function unpublishReview(id) {
  const ok = await updateReviewStatus(id, 'hidden');
  if (ok) {
    allReviews = allReviews.map(r => r.id === id ? { ...r, status: 'hidden' } : r);
    renderReviews();
    showToast('Review hidden from website.', 'gold');
    await recalcServiceRating(id);
  }
}

async function rejectReview(id) {
  const ok = await updateReviewStatus(id, 'hidden');
  if (ok) {
    allReviews = allReviews.map(r => r.id === id ? { ...r, status: 'hidden' } : r);
    renderReviews();
    showToast('Review rejected & hidden.', 'gold');
    // Also recalc rating (removed one approved review)
    await recalcServiceRating(id);
  }
}

// Recalculate a service's average rating from all approved reviews and save to Firestore
async function recalcServiceRating(reviewId) {
  try {
    const review = allReviews.find(r => r.id === reviewId);
    const styleId = review?.styleId;
    if (!styleId) return;

    const { collection, query, where, getDocs, getDoc, doc, updateDoc } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const db = window._fb?.db;
    if (!db) return;

    // Get all approved reviews for this styleId
    const snap = await getDocs(query(
      collection(db, 'reviews'),
      where('styleId', '==', styleId),
      where('status', '==', 'approved')
    ));
    const approved = snap.docs.map(d => d.data());
    const count = approved.length;
    const avg = count > 0
      ? Math.round((approved.reduce((s, r) => s + (r.rating || 0), 0) / count) * 10) / 10
      : 0;

    // Update the services list doc in Firestore
    const svcSnap = await getDoc(doc(db, 'settings', 'services'));
    if (!svcSnap.exists()) return;
    const list = svcSnap.data().list || [];
    const updated = list.map(s => s.id === styleId ? { ...s, rating: avg, reviews: count } : s);
    await updateDoc(doc(db, 'settings', 'services'), { list: updated });

    // Update local services array too
    localServices = localServices.map(s => s.id === styleId ? { ...s, rating: avg, reviews: count } : s);
    renderServices();
  } catch(e) {
    console.warn('Rating recalc failed:', e);
  }
}

async function deleteReview(id) {
  if (!confirm('Permanently delete this review? This cannot be undone.')) return;
  try {
    const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const db = window._fb?.db;
    if (!db) throw new Error('Firestore not ready');
    await deleteDoc(doc(db, 'reviews', id));
    allReviews = allReviews.filter(r => r.id !== id);
    renderReviews();
    showToast('Review deleted.', 'error');
  } catch(e) {
    console.error('Review delete failed:', e);
    showToast('Failed to delete — check your connection.', 'error');
  }
}

// =========== NEWSLETTER ===========
function renderNewsletterTable(subs) {
  const tbody = document.getElementById('newsletter-tbody');
  if (!tbody) return;
  document.getElementById('nl-total').textContent = subs.length;
  const weekAgo = Date.now() - 7*24*3600*1000;
  const recent = subs.filter(s => s.date && new Date(s.date).getTime() > weekAgo).length;
  document.getElementById('nl-week').textContent = recent;
  if (!subs.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:rgba(255,255,255,.3)">No subscribers yet</td></tr>'; return; }
  tbody.innerHTML = subs.map((s,i) => `
    <tr>
      <td style="color:rgba(255,255,255,.4);font-size:.75rem;">${i+1}</td>
      <td>${s.email||'—'}</td>
      <td style="font-size:.78rem;">${s.date ? new Date(s.date).toLocaleDateString('en-KE') : '—'}</td>
      <td><button class="btn-icon btn-danger btn-sm" onclick="deleteSubscriber('${s.id}')"><i class="fas fa-trash"></i></button></td>
    </tr>
  `).join('');
}

function searchNewsletter(q) {
  q = q.toLowerCase();
  renderNewsletterTable(allNewsletter.filter(s => (s.email||'').toLowerCase().includes(q)));
}

async function deleteSubscriber(id) {
  allNewsletter = allNewsletter.filter(s => s.id !== id);
  if (window._fb) { try { await window._fb.deleteDoc(window._fb.doc(window._fb.db,'newsletter',id)); } catch(e) {} }
  renderNewsletterTable(allNewsletter); showToast('Subscriber removed.','error');
}

function exportNewsletter() {
  const csv = 'Email,Date\n' + allNewsletter.map(s => `${s.email||''},${s.date||''}`).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'anibraids_subscribers.csv'; a.click();
  showToast('CSV exported! 📊', 'success');
}

// =========== ANALYTICS ===========
function renderAnalytics() {
  const total = allBookings.length;
  const confirmed = allBookings.filter(b=>b.status==='confirmed').length;
  const completed = allBookings.filter(b=>b.status==='completed').length;
  let rev = 0;
  allBookings.filter(b=>b.status==='completed'||b.status==='confirmed').forEach(b=>{
    const s = localServices.find(x=>x.name===b.style);
    if (s) rev += s.price;
  });

  document.getElementById('an-bookings').textContent = total;
  document.getElementById('an-revenue').textContent = '$' + rev.toLocaleString();
  document.getElementById('an-clients').textContent = allClients.length || (total > 0 ? total : '—');
  document.getElementById('an-confirm').textContent = (total > 0 ? Math.round((confirmed + completed) / total * 100) : 0) + '%';

  // --- Revenue bar chart: real monthly data from allBookings ---
  const now = new Date();
  const monthlyRevenue = {};
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleString('en-KE', { month: 'short' });
    monthLabels.push({ key, label });
    monthlyRevenue[key] = 0;
  }

  allBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').forEach(b => {
    let dateStr = b.date || b.createdAt;
    if (b.createdAt?.seconds) dateStr = new Date(b.createdAt.seconds * 1000).toISOString();
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (key in monthlyRevenue) {
      const s = localServices.find(x => x.name === b.style);
      if (s) monthlyRevenue[key] += s.price;
    }
  });

  const vals = monthLabels.map(m => monthlyRevenue[m.key]);
  const months = monthLabels.map(m => m.label);
  const max = Math.max(...vals, 1);
  const chart = document.getElementById('rev-chart');
  if (chart) {
    chart.innerHTML = vals.map((v, i) => `
      <div class="rev-bar-wrap">
        <div class="rev-bar" style="height:${(v/max*100)}%;" title="$${v.toLocaleString()}">
          <span class="rev-bar-tooltip">$${v.toLocaleString()}</span>
        </div>
        <div class="rev-label">${months[i]}</div>
      </div>
    `).join('');
  }

  // --- Bookings by Style: real counts from allBookings ---
  const styleCounts = {};
  allBookings.forEach(b => {
    if (b.style) styleCounts[b.style] = (styleCounts[b.style] || 0) + 1;
  });
  // Fall back to service.bookings if no real booking data yet
  const hasRealData = Object.keys(styleCounts).length > 0;
  const breakEl = document.getElementById('style-breakdown');
  if (breakEl) {
    let topStyles;
    if (hasRealData) {
      topStyles = localServices
        .map(s => ({ ...s, realBookings: styleCounts[s.name] || 0 }))
        .sort((a, b) => b.realBookings - a.realBookings)
        .slice(0, 6);
      const maxBk = topStyles[0]?.realBookings || 1;
      breakEl.innerHTML = topStyles.map(s => `
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:.78rem;">
            <span>${s.emoji||'✂️'} ${s.name}</span>
            <span style="color:var(--gold);">${s.realBookings} booking${s.realBookings!==1?'s':''}</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;">
            <div style="height:100%;width:${maxBk>0?s.realBookings/maxBk*100:0}%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:3px;"></div>
          </div>
        </div>
      `).join('');
    } else {
      // No bookings yet — show a friendly empty state
      breakEl.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);font-size:.85rem;"><i class="fas fa-chart-bar" style="font-size:2rem;margin-bottom:10px;display:block;"></i>No bookings recorded yet</div>`;
    }
  }

  // --- Stylist Performance: real counts derived from allBookings ---
  const stylistStats = {};
  allBookings.forEach(b => {
    if (!b.stylist) return;
    const name = b.stylist.split('—')[0].trim();
    if (!name) return;
    if (!stylistStats[name]) stylistStats[name] = { name, specialty: b.stylist.split('—')[1]?.trim() || '—', bookings: 0, statuses: [] };
    stylistStats[name].bookings++;
    stylistStats[name].statuses.push(b.status);
  });

  const stylistTbody = document.querySelector('#panel-analytics .data-table tbody');
  if (stylistTbody) {
    const stylistList = Object.values(stylistStats).sort((a, b) => b.bookings - a.bookings);
    if (stylistList.length > 0) {
      stylistTbody.innerHTML = stylistList.map(st => {
        const completedCount = st.statuses.filter(s => s === 'completed').length;
        const rate = st.bookings > 0 ? Math.round(completedCount / st.bookings * 100) : 0;
        return `
          <tr>
            <td><strong>${st.name}</strong></td>
            <td>${st.specialty}</td>
            <td style="color:var(--gold);font-weight:600;">${st.bookings}</td>
            <td>
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="height:4px;flex:1;background:rgba(255,255,255,.08);border-radius:2px;">
                  <div style="height:100%;width:${rate}%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:2px;"></div>
                </div>
                <span style="font-size:.75rem;color:rgba(255,255,255,.5);">${rate}%</span>
              </div>
            </td>
            <td><span class="status-badge confirmed">Active</span></td>
          </tr>
        `;
      }).join('');
    } else {
      stylistTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:rgba(255,255,255,.3);">No stylist data yet — add bookings with stylist names</td></tr>`;
    }
  }
}

// =========== SETTINGS ===========
async function loadSiteSettings() {
  if (!window._fb) return;
  const { db, doc, getDoc } = window._fb;
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    if (!snap.exists()) return;
    const d = snap.data();
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    const setChk = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.checked = val; };
    set('set-studio-name', d.studioName);
    set('set-tagline',     d.tagline);
    set('set-phone',       d.phone);
    set('set-email',       d.email);
    set('set-location',    d.location);
    set('set-hours-wk',    d.hoursWeekday);
    set('set-hours-wknd',  d.hoursWeekend);
    setChk('toggle-bookings',   d.toggleBookings);
    setChk('toggle-newsletter', d.toggleNewsletter);
  } catch(e) { /* keep HTML defaults */ }
}

function saveSettings() {
  const data = {
    studioName: document.getElementById('set-studio-name')?.value,
    tagline: document.getElementById('set-tagline')?.value,
    phone: document.getElementById('set-phone')?.value,
    email: document.getElementById('set-email')?.value,
    location: document.getElementById('set-location')?.value,
    hoursWeekday: document.getElementById('set-hours-wk')?.value,
    hoursWeekend: document.getElementById('set-hours-wknd')?.value,
    toggleBookings: document.getElementById('toggle-bookings')?.checked,
    toggleNewsletter: document.getElementById('toggle-newsletter')?.checked,
  };
  if (window._fb) {
    window._fb.setDoc(window._fb.doc(window._fb.db,'settings','site'), data).catch(()=>{});
  }
  showToast('Settings saved! ⚙️', 'success');
  addActivity('Settings updated', 'Site configuration saved', 'gold');
}

// =========== MODALS ===========
function openModal(id) {
  document.getElementById('modal-'+id)?.classList.add('open');
}

function openAddServiceModal() {
  // Reset state for a fresh new-service form
  editingServiceId = null;
  pendingImages = [];
  renderMultiImgGrid();
  document.getElementById('svc-name').value = '';
  document.getElementById('svc-price').value = '';
  document.getElementById('svc-oprice').value = '';
  document.getElementById('svc-price-min').value = '';
  document.getElementById('svc-price-max').value = '';
  // Reset price mode to single
  const singleRadio = document.querySelector('input[name="price-mode"][value="single"]');
  if (singleRadio) { singleRadio.checked = true; onPriceModeChange('single'); }
  document.getElementById('svc-duration').value = '';
  document.getElementById('svc-badge').value = '';
  document.getElementById('svc-desc').value = '';
  document.getElementById('svc-image-file').value = '';
  document.getElementById('svc-image-url').value = '';
  document.getElementById('svc-image-urls-json').value = '[]';
  document.querySelectorAll('#svc-categories-wrap input[type=checkbox]').forEach(cb => cb.checked = false);
  document.querySelector('#modal-add-service .modal-header h3').textContent = '✂️ Add/Edit Service';
  openModal('add-service');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

// =========== ADMIN MESSAGING ===========
let adminConversations = [];
let activeConvId = null;
let adminMsgUnsubscribe = null;
let adminConvUnsubscribe = null; // FIX: real-time listener for conversation list

// FIX: Lightweight badge-only update — used inside onSnapshot to avoid recursive loop
async function updateAdminUnreadBadge() {
  const fb = window._fb; if (!fb) return;
  try {
    const snap = await fb.getDocs(fb.collection(fb.db, 'conversations'));
    let total = 0;
    await Promise.all(snap.docs.map(async convDoc => {
      try {
        const unread = await fb.getDocs(fb.query(
          fb.collection(fb.db, 'conversations', convDoc.id, 'messages'),
          fb.where('senderRole', '==', 'client'),
          fb.where('readByAdmin', '==', false)
        ));
        total += unread.size;
      } catch(e) {}
    }));
    const badge = document.getElementById('admin-unread-count');
    if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline-flex' : 'none'; }
  } catch(e) {}
}

// FIX: Render conversation list without re-opening active conv (avoids recursive trigger)
function renderAdminConvList() {
  const listEl = document.getElementById('admin-conv-list'); if (!listEl) return;
  if (!adminConversations.length) {
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,.25);font-size:.82rem;"><i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;opacity:.3;"></i>No client messages yet</div>';
    return;
  }
  listEl.innerHTML = adminConversations.map(conv => `
    <div onclick="openAdminConversation('${conv.id}')" id="conv-item-${conv.id}"
      style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .2s;${activeConvId===conv.id?'background:rgba(255,159,0,.08);':''}"
      onmouseover="if('${conv.id}'!==activeConvId)this.style.background='rgba(255,255,255,.03)'"
      onmouseout="if('${conv.id}'!==activeConvId)this.style.background=''">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:600;font-size:.86rem;color:rgba(255,255,255,.9);">${conv.clientName || 'Client'}</span>
        ${(conv.unreadCount || 0) > 0 ? `<span style="background:var(--gold);color:#1a0a2e;border-radius:50%;width:18px;height:18px;font-size:.65rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${conv.unreadCount}</span>` : ''}
      </div>
      <div style="font-size:.75rem;color:rgba(255,255,255,.35);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${conv.lastMessage || 'No messages'}</div>
      <div style="font-size:.68rem;color:rgba(255,255,255,.2);margin-top:3px;">${conv.clientEmail || ''}</div>
    </div>
  `).join('');
}

// FIX: Uses onSnapshot for real-time conversation list updates
async function loadAdminConversations() {
  const fb = window._fb; if (!fb) return;
  const listEl = document.getElementById('admin-conv-list'); if (!listEl) return;

  // Only set up the real-time listener once
  if (adminConvUnsubscribe) {
    // Already listening — just re-render with current data (e.g. after navigating back)
    renderAdminConvList();
    if (activeConvId) {
      const el = document.getElementById(`conv-item-${activeConvId}`);
      if (el) el.style.background = 'rgba(255,159,0,.08)';
    }
    return;
  }

  listEl.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);font-size:.82rem;"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';

  try {
    // FIX: onSnapshot on conversations collection for live updates
    adminConvUnsubscribe = fb.onSnapshot(fb.collection(fb.db, 'conversations'), async (snap) => {
      adminConversations = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Count unread per conversation
      await Promise.all(adminConversations.map(async conv => {
        try {
          const msgSnap = await fb.getDocs(fb.query(
            fb.collection(fb.db, 'conversations', conv.id, 'messages'),
            fb.where('senderRole', '==', 'client'),
            fb.where('readByAdmin', '==', false)
          ));
          conv.unreadCount = msgSnap.size;
        } catch(e) { conv.unreadCount = 0; }
      }));

      const totalUnread = adminConversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
      const badge = document.getElementById('admin-unread-count');
      if (badge) { badge.textContent = totalUnread; badge.style.display = totalUnread > 0 ? 'inline-flex' : 'none'; }

      renderAdminConvList();

      // Restore active conversation highlight
      if (activeConvId) {
        const el = document.getElementById(`conv-item-${activeConvId}`);
        if (el) el.style.background = 'rgba(255,159,0,.08)';
      }
    });
  } catch(e) {
    listEl.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);font-size:.82rem;">Could not load conversations</div>';
  }
}

function adminCloseChat() {
  var layout = document.getElementById('admin-messages-layout');
  if (layout) layout.classList.remove('conv-open');
}

function openAdminConversation(convId) {
  activeConvId = convId;
  const conv = adminConversations.find(c => c.id === convId);
  if (!conv) return;

  // On mobile: hide conv list, show full chat
  var layout = document.getElementById('admin-messages-layout');
  if (layout) layout.classList.add('conv-open');

  // Highlight selected
  document.querySelectorAll('[id^="conv-item-"]').forEach(el => el.style.background = '');
  const el = document.getElementById(`conv-item-${convId}`);
  if (el) el.style.background = 'rgba(255,159,0,.08)';

  // Update chat header
  const nameEl = document.getElementById('admin-chat-name');
  const subEl = document.getElementById('admin-chat-sub');
  const avatarEl = document.getElementById('admin-chat-avatar');
  if (nameEl) nameEl.textContent = conv.clientName || 'Client';
  if (subEl) subEl.textContent = conv.clientEmail || conv.clientId || '';
  if (avatarEl) avatarEl.textContent = (conv.clientName || 'C').charAt(0).toUpperCase();

  // Unsubscribe previous message listener
  if (adminMsgUnsubscribe) { adminMsgUnsubscribe(); adminMsgUnsubscribe = null; }

  const fb = window._fb; if (!fb) return;
  const body = document.getElementById('admin-chat-body');
  if (body) body.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);font-size:.82rem;"><i class="fas fa-spinner fa-spin"></i></div>';

  const msgsRef = fb.collection(fb.db, 'conversations', convId, 'messages');
  const q = fb.query(msgsRef, fb.orderBy('createdAt', 'asc'));

  adminMsgUnsubscribe = fb.onSnapshot(q, async (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAdminChatMessages(messages, convId);

    // Mark unread client messages as read
    const unread = messages.filter(m => m.senderRole === 'client' && !m.readByAdmin);
    for (const m of unread) {
      try {
        await fb.updateDoc(fb.doc(fb.db, 'conversations', convId, 'messages', m.id), { readByAdmin: true });
      } catch(e) {}
    }

    // FIX: Only update badge — do NOT call loadAdminConversations() here (avoids recursive loop)
    if (unread.length > 0) updateAdminUnreadBadge();
  });
}

function renderAdminChatMessages(messages, convId) {
  const body = document.getElementById('admin-chat-body'); if (!body) return;
  if (!messages.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,.25);font-size:.85rem;">No messages yet — say hello! 👋</div>';
    return;
  }

  let html = '';
  let lastDateLabel = '';

  messages.forEach((m, idx) => {
    const isAdmin = m.senderRole === 'admin';
    const side = isAdmin ? 'adm-out' : 'adm-in';

    const msgDate = m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000) : new Date();
    const time = msgDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Date separator
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    let dateLabel;
    if (msgDate.toDateString() === today.toDateString()) dateLabel = 'Today';
    else if (msgDate.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
    else dateLabel = msgDate.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });

    if (dateLabel !== lastDateLabel) {
      html += `<div class="adm-date-sep"><span>${dateLabel}</span></div>`;
      lastDateLabel = dateLabel;
    }

    // Sender label: show client name above first bubble in each incoming group
    const prevMsg = idx > 0 ? messages[idx - 1] : null;
    const prevIsAdmin = prevMsg ? prevMsg.senderRole === 'admin' : true;
    const showLabel = !isAdmin && prevIsAdmin;
    const labelHtml = showLabel
      ? `<div class="adm-sender-label">${escapeAdminHtml(m.senderName || 'Client')}</div>`
      : '';

    html += `
      <div class="adm-bubble-wrap ${side}">
        ${labelHtml}
        <div class="adm-bubble-text">${escapeAdminHtml(m.text)}</div>
        <div class="adm-bubble-meta">${isAdmin ? 'You' : escapeAdminHtml(m.senderName || 'Client')} · ${time}</div>
      </div>`;
  });

  body.innerHTML = html;
  body.scrollTop = body.scrollHeight;
}


async function sendAdminReply() {
  const inp = document.getElementById('admin-msg-input');
  const txt = inp?.value.trim(); if (!txt) return;
  if (!activeConvId) { showToast('Select a conversation first.', 'error'); return; }

  const btn = document.getElementById('btn-admin-send');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  inp.value = '';

  const fb = window._fb; if (!fb) return;
  const adminUser = window.adminUser;
  const adminName = adminUser?.displayName || adminUser?.email?.split('@')[0] || 'Ani Braids Admin';

  const msgData = {
    text: txt,
    senderId: adminUser?.uid || 'admin',
    senderName: adminName,
    senderRole: 'admin',
    createdAt: fb.serverTimestamp(),
    readByAdmin: true,
    readByClient: false,
  };

  try {
    await fb.addDoc(fb.collection(fb.db, 'conversations', activeConvId, 'messages'), msgData);
    // Update conversation last message
    await fb.setDoc(fb.doc(fb.db, 'conversations', activeConvId), {
      lastMessage: txt,
      updatedAt: fb.serverTimestamp(),
    }, { merge: true });
    addActivity('Message sent', `Reply sent to ${adminConversations.find(c=>c.id===activeConvId)?.clientName||'client'}`, 'gold');
  } catch(e) {
    showToast('Failed to send message. Try again.', 'error');
  }

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
}

function escapeAdminHtml(text) {
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// FIX: Poll for unread badge every 60s AND run immediately on login
// (onSnapshot on conversations handles live updates when messages panel is open;
//  this polling covers the badge when admin is on other panels)
function startAdminMsgPolling() {
  updateAdminUnreadBadge(); // FIX: run immediately so badge shows on login, not after 60s
  setInterval(updateAdminUnreadBadge, 60000);
}

// =========== HERO SECTION MANAGEMENT ===========

let heroSlides = [];

async function loadHeroData() {
  if (!window._fb) { setTimeout(loadHeroData, 600); return; }
  const { db, doc, getDoc } = window._fb;

  // Load slides
  try {
    const snap = await getDoc(doc(db, 'settings', 'heroSlides'));
    if (snap.exists()) {
      heroSlides = snap.data().list || [];
    } else {
      heroSlides = [];
    }
  } catch(e) { heroSlides = []; }
  renderHeroSlidesList();

  // Load content (title, subtitle, buttons, stats)
  try {
    const snap = await getDoc(doc(db, 'settings', 'heroContent'));
    if (snap.exists()) {
      const d = snap.data();
      if (d.titleLine1) document.getElementById('hero-title-line1').value = d.titleLine1;
      if (d.titleLine2) document.getElementById('hero-title-line2').value = d.titleLine2;
      if (d.subtitle) document.getElementById('hero-subtitle').value = d.subtitle;
      if (d.badgeText) document.getElementById('hero-badge-text').value = d.badgeText;
      if (d.btn1Label) document.getElementById('hero-btn1-label').value = d.btn1Label;
      if (d.btn1Link) document.getElementById('hero-btn1-link').value = d.btn1Link;
      if (d.btn2Label) document.getElementById('hero-btn2-label').value = d.btn2Label;
      if (d.btn2Link) document.getElementById('hero-btn2-link').value = d.btn2Link;
      if (d.stat1Num) document.getElementById('hero-stat1-num').value = d.stat1Num;
      if (d.stat1Label) document.getElementById('hero-stat1-label').value = d.stat1Label;
      if (d.stat2Num) document.getElementById('hero-stat2-num').value = d.stat2Num;
      if (d.stat2Label) document.getElementById('hero-stat2-label').value = d.stat2Label;
      if (d.stat3Num) document.getElementById('hero-stat3-num').value = d.stat3Num;
      if (d.stat3Label) document.getElementById('hero-stat3-label').value = d.stat3Label;

      // Toggles
      if (typeof d.showTitle !== 'undefined') document.getElementById('hero-show-title').checked = d.showTitle;
      if (typeof d.showSubtitle !== 'undefined') document.getElementById('hero-show-subtitle').checked = d.showSubtitle;
      if (typeof d.showBadge !== 'undefined') document.getElementById('hero-show-badge').checked = d.showBadge;
      if (typeof d.showBtn1 !== 'undefined') document.getElementById('hero-show-btn1').checked = d.showBtn1;
      if (typeof d.showBtn2 !== 'undefined') document.getElementById('hero-show-btn2').checked = d.showBtn2;
      if (typeof d.showStats !== 'undefined') document.getElementById('hero-show-stats').checked = d.showStats;
    }
  } catch(e) {}
}

function renderHeroSlidesList() {
  const list = document.getElementById('hero-slides-list');
  if (!list) return;
  if (!heroSlides.length) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);">No slides yet — add your first hero slide above.</div>';
    return;
  }
  list.innerHTML = heroSlides
    .sort((a,b) => (a.order||0) - (b.order||0))
    .map((slide, i) => {
      const imgPreview = slide.imageUrl
        ? `<img src="${slide.imageUrl}" style="width:80px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>`
        : `<div style="width:80px;height:56px;background:rgba(255,255,255,.07);border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.3);font-size:.7rem;">No img</div>`;
      return `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;">
          ${imgPreview}
          <div style="flex:1;min-width:0;">
            <div style="font-size:.8rem;font-weight:600;color:rgba(255,255,255,.85);">Slide ${i+1}${slide.imageUrl ? ' — has image' : ' — gradient only'}</div>
            <div style="font-size:.7rem;color:rgba(255,255,255,.35);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${slide.gradient || 'No gradient set'}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;">
            <button class="btn-icon btn-secondary" onclick="editHeroSlide(${i})" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-icon btn-danger" onclick="deleteHeroSlide(${i})" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
    }).join('');
}

function openHeroSlideModal(index) {
  document.getElementById('hero-slide-index').value = (index !== undefined) ? index : -1;
  document.getElementById('hero-slide-file').value = '';
  document.getElementById('hero-slide-img-url').value = '';
  document.getElementById('hero-slide-gradient').value = '';
  document.getElementById('hero-slide-order').value = heroSlides.length;
  document.getElementById('hero-slide-upload-status').textContent = '';
  // Reset preview
  const preview = document.getElementById('hero-slide-img-preview');
  preview.innerHTML = '<span style="color:rgba(255,255,255,.25);font-size:.82rem;" id="hero-img-placeholder-text"><i class="fas fa-image" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No image yet</span>';
  openModal('hero-slide');
}

function editHeroSlide(index) {
  const slide = heroSlides[index];
  if (!slide) return;
  document.getElementById('hero-slide-index').value = index;
  document.getElementById('hero-slide-img-url').value = slide.imageUrl || '';
  document.getElementById('hero-slide-gradient').value = slide.gradient || '';
  document.getElementById('hero-slide-order').value = slide.order !== undefined ? slide.order : index;
  document.getElementById('hero-slide-upload-status').textContent = slide.imageUrl ? '✓ Image saved' : '';
  // Show current image in preview
  const preview = document.getElementById('hero-slide-img-preview');
  if (slide.imageUrl) {
    preview.innerHTML = `<img src="${slide.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;"/>`;
  } else {
    preview.innerHTML = '<span style="color:rgba(255,255,255,.25);font-size:.82rem;" id="hero-img-placeholder-text"><i class="fas fa-image" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No image yet</span>';
  }
  openModal('hero-slide');
}

function deleteHeroSlide(index) {
  if (!confirm('Delete this slide?')) return;
  heroSlides.splice(index, 1);
  renderHeroSlidesList();
  showToast('Slide removed. Click "Save & Publish" to apply.', 'gold');
}

async function handleHeroSlideImageSelect(input) {
  const file = input.files[0];
  if (!file) return;
  const status = document.getElementById('hero-slide-upload-status');
  const preview = document.getElementById('hero-slide-img-preview');

  status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Cloudinary…';
  preview.innerHTML = '<div style="color:rgba(255,255,255,.3);font-size:.8rem;"><i class="fas fa-spinner fa-spin"></i> Uploading…</div>';

  try {
    const url = await uploadToCloudinary(file, 'anibraids/hero');
    document.getElementById('hero-slide-img-url').value = url;
    status.innerHTML = '<span style="color:#4caf50;">✓ Uploaded successfully</span>';
    preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;"/>`;
    showToast('Image uploaded to Cloudinary! 🎉', 'success');
  } catch(e) {
    status.innerHTML = `<span style="color:#f44336;">✗ Upload failed: ${e.message}</span>`;
    preview.innerHTML = '<span style="color:rgba(255,255,255,.25);font-size:.82rem;" id="hero-img-placeholder-text"><i class="fas fa-image" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Upload failed</span>';
    showToast('Cloudinary upload failed. Check cloud name & preset.', 'error');
  }
}

async function saveHeroSlide() {
  const indexVal = parseInt(document.getElementById('hero-slide-index').value);
  const imageUrl = document.getElementById('hero-slide-img-url').value.trim();
  const gradient = document.getElementById('hero-slide-gradient').value.trim();
  const order = parseInt(document.getElementById('hero-slide-order').value) || 0;

  if (!imageUrl && !gradient) {
    showToast('Please upload an image or set a background gradient.', 'error');
    return;
  }

  const slideData = { imageUrl: imageUrl || null, gradient: gradient || null, order };

  if (indexVal === -1) {
    heroSlides.push(slideData);
  } else {
    heroSlides[indexVal] = slideData;
  }

  renderHeroSlidesList();
  closeModal('modal-hero-slide');

  // Auto-save to Firestore immediately so the slide persists and shows on homepage
  if (!window._fb) { showToast('Slide saved locally — Firebase not ready to publish yet.', 'success'); return; }
  const { db, doc, setDoc } = window._fb;
  try {
    await setDoc(doc(db, 'settings', 'heroSlides'), { list: heroSlides });
    showToast(indexVal === -1 ? 'Slide added & published! 🚀' : 'Slide updated & published! 🚀', 'success');
    addActivity('Hero slides updated', `${heroSlides.length} slides now live`, 'gold');
  } catch(e) {
    showToast('Slide saved locally but failed to publish: ' + e.message, 'error');
  }
}

async function saveHeroSlides() {
  if (!window._fb) { showToast('Firebase not ready', 'error'); return; }
  const { db, doc, setDoc } = window._fb;
  try {
    await setDoc(doc(db, 'settings', 'heroSlides'), { list: heroSlides });
    showToast('Hero slides saved & published! 🚀', 'success');
    addActivity('Hero slides updated', `${heroSlides.length} slides now live`, 'gold');
  } catch(e) {
    showToast('Failed to save slides: ' + e.message, 'error');
  }
}

async function saveHeroContent() {
  if (!window._fb) { showToast('Firebase not ready', 'error'); return; }
  const { db, doc, setDoc } = window._fb;

  const content = {
    titleLine1: document.getElementById('hero-title-line1').value.trim(),
    titleLine2: document.getElementById('hero-title-line2').value.trim(),
    subtitle: document.getElementById('hero-subtitle').value.trim(),
    badgeText: document.getElementById('hero-badge-text').value.trim(),
    showTitle: document.getElementById('hero-show-title').checked,
    showSubtitle: document.getElementById('hero-show-subtitle').checked,
    showBadge: document.getElementById('hero-show-badge').checked,
    btn1Label: document.getElementById('hero-btn1-label').value.trim(),
    btn1Link: document.getElementById('hero-btn1-link').value.trim(),
    showBtn1: document.getElementById('hero-show-btn1').checked,
    btn2Label: document.getElementById('hero-btn2-label').value.trim(),
    btn2Link: document.getElementById('hero-btn2-link').value.trim(),
    showBtn2: document.getElementById('hero-show-btn2').checked,
    stat1Num: document.getElementById('hero-stat1-num').value.trim(),
    stat1Label: document.getElementById('hero-stat1-label').value.trim(),
    stat2Num: document.getElementById('hero-stat2-num').value.trim(),
    stat2Label: document.getElementById('hero-stat2-label').value.trim(),
    stat3Num: document.getElementById('hero-stat3-num').value.trim(),
    stat3Label: document.getElementById('hero-stat3-label').value.trim(),
    showStats: document.getElementById('hero-show-stats').checked,
  };

  try {
    await setDoc(doc(db, 'settings', 'heroContent'), content);
    showToast('Hero content saved & published! ✨', 'success');
    addActivity('Hero content updated', 'Title, buttons & stats refreshed', 'gold');
  } catch(e) {
    showToast('Failed to save hero content: ' + e.message, 'error');
  }
}

// =========== LOGOUT ===========
async function handleLogout() {
  if (!confirm('Sign out of admin panel?')) return;
  if (window._fb) await window._fb.signOut(window._fb.auth);
  window.location.href = 'admin-login.html';
}

// =========== ACTIVITY FEED ===========
function addActivity(title, desc, color='gold') {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  const now = new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `<div class="activity-dot ${color}"></div><div class="activity-text"><strong>${title}</strong><p>${desc}</p></div><div class="activity-time">${now}</div>`;
  feed.insertBefore(item, feed.firstChild);
  // Keep max 10
  while (feed.children.length > 10) feed.removeChild(feed.lastChild);
}

// =========== REFRESH ===========
function refreshData() {
  const icon = document.getElementById('refresh-icon');
  icon.style.animation = 'spin .6s linear infinite';
  loadAllData();
  setTimeout(()=>{ icon.style.animation=''; showToast('Data refreshed! 🔄','success'); }, 1500);
}

// =========== UTILS ===========
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-KE',{weekday:'short',month:'short',day:'numeric'});
}
function cap(s) { return s.charAt(0).toUpperCase()+s.slice(1); }
function showToast(msg, type) {
  const c = document.getElementById('toast-container'); if (!c) return;
  const t = document.createElement('div'); t.className = `toast ${type||''}`;
  const icons = {success:'check-circle',error:'times-circle',gold:'crown'};
  t.innerHTML = `<i class="fas fa-${icons[type]||'bell'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.animation='toastIn .4s ease reverse'; setTimeout(()=>t.remove(),400); }, 4000);
}

// =========== PAYMENT METHODS ===========
let localPaymentMethods = [];

async function loadPaymentMethods() {
  if (!window._fb) return;
  const { db, doc, getDoc } = window._fb;
  try {
    const snap = await getDoc(doc(db, 'settings', 'paymentMethods'));
    localPaymentMethods = snap.exists() ? (snap.data().list || []) : [];
  } catch(e) { localPaymentMethods = []; }
  renderPaymentMethodsList();
}

function renderPaymentMethodsList() {
  const el = document.getElementById('payment-methods-list');
  if (!el) return;
  if (!localPaymentMethods.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:rgba(255,255,255,.3);font-size:.85rem;"><i class="fas fa-credit-card" style="font-size:2rem;display:block;margin-bottom:8px;opacity:.3;"></i>No payment methods yet. Add one above.</div>`;
    return;
  }
  el.innerHTML = localPaymentMethods.map((pm, i) => `
    <div class="pm-row" style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07);" data-index="${i}">
      <div class="pm-icon-circle" style="width:44px;height:44px;border-radius:50%;background:${pm.iconColor||'#6D1ED4'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="fas ${pm.iconSymbol||'fa-credit-card'}" style="color:#fff;font-size:1.1rem;"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:.9rem;">${escHtml(pm.name)}</div>
        <div style="font-size:.76rem;color:rgba(255,255,255,.5);margin-top:2px;">${escHtml(pm.description||'')} &nbsp;·&nbsp; <span style="color:rgba(255,200,80,.8);">${escHtml(pm.value||'')}</span></div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button class="btn-secondary btn-sm" onclick="editPaymentMethod(${i})"><i class="fas fa-edit"></i></button>
        <button class="btn-danger btn-sm" onclick="deletePaymentMethod(${i})" style="padding:6px 10px;font-size:.75rem;"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

window.openAddPaymentMethodModal = function() {
  document.getElementById('pm-edit-id').value = '';
  document.getElementById('pm-modal-title').textContent = '💳 Add Payment Method';
  ['pm-name','pm-desc','pm-value','pm-hint','pm-input-label','pm-input-placeholder','pm-note'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('pm-icon-color').value = '#6D1ED4';
  document.getElementById('pm-icon-symbol').value = 'fa-credit-card';
  document.getElementById('modal-payment-method')?.classList.add('open');
};

window.editPaymentMethod = function(index) {
  const pm = localPaymentMethods[index];
  if (!pm) return;
  document.getElementById('pm-edit-id').value = String(index);
  document.getElementById('pm-modal-title').textContent = '✏️ Edit Payment Method';
  document.getElementById('pm-name').value = pm.name || '';
  document.getElementById('pm-desc').value = pm.description || '';
  document.getElementById('pm-value').value = pm.value || '';
  document.getElementById('pm-hint').value = pm.hint || '';
  document.getElementById('pm-input-label').value = pm.inputLabel || '';
  document.getElementById('pm-input-placeholder').value = pm.inputPlaceholder || '';
  document.getElementById('pm-note').value = pm.note || '';
  document.getElementById('pm-icon-color').value = pm.iconColor || '#6D1ED4';
  document.getElementById('pm-icon-symbol').value = pm.iconSymbol || 'fa-credit-card';
  document.getElementById('modal-payment-method')?.classList.add('open');
};

window.deletePaymentMethod = async function(index) {
  if (!confirm('Delete this payment method?')) return;
  localPaymentMethods.splice(index, 1);
  await persistPaymentMethods();
  renderPaymentMethodsList();
  showToast('Payment method removed', 'success');
};

window.savePaymentMethod = async function() {
  const name = document.getElementById('pm-name')?.value.trim();
  if (!name) { showToast('Method name is required', 'error'); return; }
  const pm = {
    name,
    description: document.getElementById('pm-desc')?.value.trim() || '',
    value: document.getElementById('pm-value')?.value.trim() || '',
    hint: document.getElementById('pm-hint')?.value.trim() || '',
    inputLabel: document.getElementById('pm-input-label')?.value.trim() || '',
    inputPlaceholder: document.getElementById('pm-input-placeholder')?.value.trim() || '',
    note: document.getElementById('pm-note')?.value.trim() || '',
    iconColor: document.getElementById('pm-icon-color')?.value || '#6D1ED4',
    iconSymbol: document.getElementById('pm-icon-symbol')?.value || 'fa-credit-card',
  };
  const editId = document.getElementById('pm-edit-id')?.value;
  if (editId !== '') {
    localPaymentMethods[parseInt(editId)] = pm;
  } else {
    localPaymentMethods.push(pm);
  }
  await persistPaymentMethods();
  renderPaymentMethodsList();
  closeModal('modal-payment-method');
  showToast('Payment method saved! 💳', 'success');
};

async function persistPaymentMethods() {
  if (!window._fb) return;
  try {
    await window._fb.setDoc(window._fb.doc(window._fb.db, 'settings', 'paymentMethods'), { list: localPaymentMethods });
  } catch(e) { showToast('Error saving payment methods', 'error'); }
}

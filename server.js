const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── CORS middleware ───
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ─── Firebase Admin init (server-side Firestore access) ───
// Reads a base64-encoded service account JSON from the FIREBASE_SERVICE_ACCOUNT_BASE64
// env var so the server can read/write Firestore directly, independent of any browser.
function initFirebaseAdmin() {
  if (admin.apps.length) return admin.app();
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) {
    console.error('FIREBASE_SERVICE_ACCOUNT_BASE64 not set — automatic booking-email listener is DISABLED.');
    return null;
  }
  try {
    const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
    return null;
  }
}
const firebaseApp = initFirebaseAdmin();
const db = firebaseApp ? admin.firestore() : null;

// ─── Default templates (used if none saved in Firestore) ───
const DEFAULT_CLIENT_TEMPLATE = `Hi {{name}},

Your appointment has been received! Here's a summary:

  Style:      {{style}}
  Date:       {{date}}
  Time:       {{time}}
  Stylist:    {{stylist}}
  Reference:  {{bookingRef}}

Your booking is pending payment verification. We'll notify you via WhatsApp once confirmed.

Questions? Contact us at {{email}}.

Best regards,
{{businessName}}`;

const DEFAULT_ADMIN_TEMPLATE = `New Booking from {{name}}!

  Client:     {{name}}
  Phone:      {{phone}}
  Email:      {{email}}
  Style:      {{style}}
  Date:       {{date}}
  Time:       {{time}}
  Stylist:    {{stylist}}
  Notes:      {{notes}}
  Reference:  {{bookingRef}}
  Payment:    {{paymentMethod}} - {{paymentHandle}}

Payment status: awaiting verification. Check the admin dashboard to update.

Visit the admin dashboard to manage this booking.

{{businessName}} - Admin Notification`;

// ─── Core email-sending logic, shared by the manual HTTP endpoint AND the
//     automatic Firestore listener below. Returns an array of error strings. ───
async function sendBookingEmailsCore(booking, emailConfig, forceType) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const vars = {
    '{{name}}': booking.name || '',
    '{{phone}}': booking.phone || '',
    '{{email}}': booking.email || '',
    '{{style}}': booking.style || booking.service || '',
    '{{date}}': booking.date || '',
    '{{time}}': booking.time || '',
    '{{stylist}}': booking.stylist === 'any' ? 'Any Available Stylist' : (booking.stylist || ''),
    '{{notes}}': booking.notes || '',
    '{{bookingRef}}': booking.bookingRef || '',
    '{{paymentMethod}}': booking.paymentMethod || '',
    '{{paymentHandle}}': booking.paymentHandle || '',
    '{{businessName}}': emailConfig.businessName || booking.businessName || 'Ani Braids',
  };

  const render = (text) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars['{{' + key + '}}'] || '{{' + key + '}}');
  };

  const isHtml = (text) => /<[a-z][\s\S]*>/i.test(text);

  const sendEmail = async (to, subject, content) => {
    const from = (emailConfig.fromName || 'Ani Braids') + ' <' + (emailConfig.fromEmail || 'bookings@anibraids.com') + '>';
    const renderedSubject = render(subject);
    const renderedContent = render(content);
    const body = {
      from,
      to,
      subject: renderedSubject,
    };
    if (isHtml(renderedContent)) {
      body.html = renderedContent;
    } else {
      body.text = renderedContent;
      body.html = renderedContent.replace(/\n/g, '<br>\n');
    }
    console.log('Sending email to:', to, 'subject:', renderedSubject);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('Resend API error:', resp.status, err);
      throw new Error(err.substring(0, 200));
    }
    console.log('Email sent successfully to:', to);
    return resp.json();
  };

  const errors = [];

  if (!forceType || forceType === 'client') {
    if (emailConfig.clientEnabled !== false && booking.email) {
      try {
        await sendEmail(
          booking.email,
          emailConfig.clientSubject || 'Booking Confirmation - {{businessName}}',
          emailConfig.clientTemplate || DEFAULT_CLIENT_TEMPLATE
        );
      } catch (e) {
        errors.push('client:' + e.message);
      }
    }
  }

  if (!forceType || forceType === 'admin') {
    if (emailConfig.adminEnabled !== false && emailConfig.adminEmail) {
      try {
        await sendEmail(
          emailConfig.adminEmail,
          emailConfig.adminSubject || 'New Booking: {{name}} - {{style}}',
          emailConfig.adminTemplate || DEFAULT_ADMIN_TEMPLATE
        );
      } catch (e) {
        errors.push('admin:' + e.message);
      }
    }
  }

  return errors;
}

// ─── Booking reference generator (mirrors the old client-side logic in appointment.html) ───
// Format: [year digits→letters][month digits][day digits→letters][daily order 001-999]
// Each digit 0-9 maps to a letter A-J (A=0 ... J=9). Order resets to 001 each new day,
// tracked via a `bookingCounters/{YYYY-MM-DD}` doc, updated inside a transaction so
// concurrent bookings never collide.
function digitToLetter(d) { return String.fromCharCode(65 + Number(d)); }
function digitsToLetters(numStr) { return numStr.split('').map(digitToLetter).join(''); }

async function generateBookingRef() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${now.getFullYear()}-${mm}-${dd}`;
  const yearLetters = digitsToLetters(yy);
  const dayLetters = digitsToLetters(dd);

  let orderNum = 1;
  try {
    const counterRef = db.collection('bookingCounters').doc(dateKey);
    orderNum = await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const current = snap.exists ? (snap.data().count || 0) : 0;
      const next = current + 1;
      tx.set(counterRef, { count: next, date: dateKey }, { merge: true });
      return next;
    });
  } catch (err) {
    console.warn('Booking counter transaction failed, using fallback order number:', err.message);
    orderNum = Number(String(Date.now()).slice(-3)) || 1;
  }

  const orderStr = String(orderNum).padStart(3, '0');
  return `${yearLetters}${mm}${dayLetters}${orderStr}`;
}

// ─── POST /api/booking/create ───
// Creates a booking entirely server-side using the Firebase Admin SDK, so it no
// longer depends on the visitor's browser being able to complete Firebase
// Anonymous Auth first. This is what appointment.html now calls instead of
// writing to Firestore directly from the client — it fixes bookings failing
// for visitors whose browser/network blocks identitytoolkit.googleapis.com
// (common with ad blockers, privacy extensions, or restrictive networks).
app.post('/api/booking/create', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Server database not configured. Contact support.' });
  }

  const { style, service, date, time, stylist, name, phone, email, notes, paymentMethod, paymentHandle } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    const bookingRef = await generateBookingRef();

    const booking = {
      style: style || service || '',
      service: service || style || '',
      date: date || '',
      time: time || '',
      stylist: stylist || '',
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email || '',
      userEmail: email || '',
      notes: notes || '',
      status: 'pending',
      bookingRef,
      paymentMethod: paymentMethod || '',
      paymentHandle: paymentHandle || '',
      paymentStatus: 'awaiting_verification',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailAutoSent: false, // the listener below will pick this up and email it out automatically
    };

    const docRef = await db.collection('bookings').add(booking);

    res.status(200).json({ success: true, id: docRef.id, bookingRef });
  } catch (e) {
    console.error('booking/create failed:', e.message);
    res.status(500).json({ error: 'Could not save booking. Please try again.' });
  }
});

// ─── POST /api/send-booking-email (manual trigger, e.g. "Send Client Email" button in admin) ───
app.post('/api/send-booking-email', async (req, res) => {
  const { booking, emailConfig } = req.body;

  if (!booking || !emailConfig) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const errors = await sendBookingEmailsCore(booking, emailConfig, req.body.forceType);
    console.log('Email processing complete. Errors:', errors.length ? errors : 'none');
    res.status(200).json({ success: true, errors: errors.length ? errors : undefined });
  } catch (e) {
    console.error('send-booking-email failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Automatic booking-email listener ───
// Watches the `bookings` collection directly in Firestore. Every new booking
// document is created with `emailAutoSent: false` (see appointment.html). As soon
// as such a document appears, this server sends the client + admin emails itself —
// no browser, login, or manual click required. The flag is flipped to `true`
// immediately (before sending) so a restart/reconnect never double-sends.
function startBookingListener() {
  if (!db) return;

  db.collection('bookings')
    .where('emailAutoSent', '==', false)
    .onSnapshot(
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type !== 'added') continue;

          const docRef = change.doc.ref;
          const booking = change.doc.data();

          try {
            // Flip the flag first so a duplicate snapshot event / restart can't resend.
            await docRef.update({
              emailAutoSent: true,
              emailAutoSentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const settingsSnap = await db.collection('settings').doc('siteConfig').get();
            const settings = settingsSnap.exists ? settingsSnap.data() : {};
            const emailConfig = settings.emailConfig || {};
            const bizName = settings.businessName || 'Ani Braids';

            const payload = {
              name: booking.name || '',
              phone: booking.phone || '',
              email: booking.email || booking.userEmail || '',
              style: booking.style || booking.service || '',
              date: booking.date || '',
              time: booking.time || '',
              stylist: booking.stylist || '',
              notes: booking.notes || '',
              bookingRef: booking.bookingRef || '',
              paymentMethod: booking.paymentMethod || '',
              paymentHandle: booking.paymentHandle || '',
              businessName: bizName,
            };

            const errors = await sendBookingEmailsCore(payload, { ...emailConfig, businessName: bizName });
            if (errors.length) {
              console.error(`Auto-email errors for booking ${docRef.id} (${booking.bookingRef || ''}):`, errors);
            } else {
              console.log(`Auto-sent booking emails for ${docRef.id} (${booking.bookingRef || ''})`);
            }
          } catch (e) {
            console.error(`Failed to auto-send emails for booking ${docRef.id}:`, e.message);
          }
        }
      },
      (err) => {
        console.error('Booking listener error (will keep running, Firestore SDK auto-reconnects):', err.message);
      }
    );

  console.log('Listening for new bookings in Firestore (auto email enabled)...');
}
startBookingListener();

// ─── Serve static files ───
app.use(express.static(path.join(__dirname)));

// ─── Start ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

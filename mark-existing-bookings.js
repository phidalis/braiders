/**
 * ONE-TIME MIGRATION — run this locally BEFORE you deploy the new server.js.
 *
 * Why: the new server listens for bookings where emailAutoSent == false and
 * emails them automatically. Your existing bookings don't have that field yet.
 * This script stamps emailAutoSent: true on every booking that already exists,
 * so the listener treats them as "already handled" and only fires for genuinely
 * new bookings going forward. Without this, the very first deploy would try to
 * (re)send emails for every booking you've ever received.
 *
 * Usage:
 *   1. npm install firebase-admin   (in this same folder, or wherever you run it)
 *   2. Put your service account JSON at ./serviceAccountKey.json (same file
 *      you'll base64-encode for Render — see deployment steps).
 *   3. node mark-existing-bookings.js
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function run() {
  const snap = await db.collection('bookings').get();
  console.log(`Found ${snap.size} existing bookings.`);

  if (snap.empty) {
    console.log('Nothing to migrate.');
    return;
  }

  let batch = db.batch();
  let count = 0;
  let total = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.emailAutoSent === true) continue; // already marked, skip

    batch.update(doc.ref, { emailAutoSent: true });
    count++;
    total++;

    // Firestore batches max out at 500 writes
    if (count === 450) {
      await batch.commit();
      console.log(`Committed ${count} updates...`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Committed final ${count} updates.`);
  }

  console.log(`Done. Marked ${total} existing bookings as emailAutoSent: true.`);
}

run().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

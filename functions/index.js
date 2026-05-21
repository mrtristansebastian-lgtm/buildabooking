const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');

admin.initializeApp();

const db = admin.firestore();
const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

const cleanString = (value, max = 240) => (
  String(value || '').trim().slice(0, max)
);

const requireString = (value, label, max = 240) => {
  const next = cleanString(value, max);
  if (!next) throw new HttpsError('invalid-argument', `${label} is required.`);
  return next;
};

const safeLockId = (dateKey, time) => (
  `${cleanString(dateKey, 32)}_${cleanString(time, 32)}`
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 120)
);

exports.createPublicBookingRequest = onCall({ region: 'us-central1' }, async (request) => {
  const appId = requireString(request.data?.appId, 'App ID', 120);
  const workspaceSlug = requireString(request.data?.workspaceSlug, 'Workspace slug', 120).toLowerCase();
  const incoming = request.data?.booking || {};

  const clientName = requireString(incoming.clientName, 'Client name', 120);
  const clientPhone = cleanString(incoming.clientPhone, 60);
  const clientEmail = cleanString(incoming.clientEmail, 160).toLowerCase();
  const clientBirthday = cleanString(incoming.clientBirthday, 80);
  const clientNote = cleanString(incoming.clientNote, 1000);
  const date = requireString(incoming.date, 'Booking date', 120);
  const dateKey = cleanString(incoming.dateKey, 32);
  const time = requireString(incoming.time, 'Booking time', 80);
  const allowedStatuses = new Set(['pending', 'confirmed', 'waitlist']);
  const status = allowedStatuses.has(incoming.status) ? incoming.status : 'pending';
  const clientWhatsappOptIn = Boolean(incoming.clientWhatsappOptIn && clientPhone);
  const notificationChannels = {
    email: Boolean(clientEmail),
    whatsapp: clientWhatsappOptIn
  };

  const workspaceRef = db
    .collection('artifacts').doc(appId)
    .collection('public').doc('data')
    .collection('workspaces').doc(workspaceSlug);

  const workspaceSnap = await workspaceRef.get();
  if (!workspaceSnap.exists) {
    throw new HttpsError('not-found', 'This booking page is not published yet.');
  }

  const workspace = workspaceSnap.data() || {};
  const ownerId = workspace.ownerId;
  if (!ownerId) {
    throw new HttpsError('failed-precondition', 'This booking page is missing an owner.');
  }

  const bookingRef = db
    .collection('artifacts').doc(appId)
    .collection('users').doc(ownerId)
    .collection('bookings').doc();
  const publicSubmissionRef = workspaceRef.collection('bookingSubmissions').doc(bookingRef.id);
  const notificationRef = db
    .collection('artifacts').doc(appId)
    .collection('notificationJobs').doc();
  const shouldLockSlot = status !== 'waitlist' && dateKey && time !== 'Waitlist';
  const slotLockRef = shouldLockSlot ? workspaceRef.collection('slotLocks').doc(safeLockId(dateKey, time)) : null;

  const bookingRecord = {
    ownerId,
    clientName,
    clientPhone,
    clientEmail,
    clientBirthday,
    clientNote,
    clientWhatsappOptIn,
    clientWhatsappNumber: clientWhatsappOptIn ? clientPhone : '',
    notificationChannels,
    date,
    dateKey: dateKey || null,
    time,
    status,
    source: 'public-booking-page',
    workspaceSlug,
    workspaceName: workspace.workspaceName || workspace.brandName || '',
    timestamp: Date.now(),
    createdAt: serverTimestamp()
  };

  await db.runTransaction(async (transaction) => {
    if (slotLockRef) {
      const lockSnap = await transaction.get(slotLockRef);
      if (lockSnap.exists) {
        throw new HttpsError('already-exists', 'That time was just requested. Pick another slot.');
      }
      transaction.set(slotLockRef, {
        bookingId: bookingRef.id,
        ownerId,
        dateKey,
        time,
        status,
        createdAt: serverTimestamp()
      });
    }

    transaction.set(bookingRef, bookingRecord);
    transaction.set(publicSubmissionRef, bookingRecord);
    transaction.set(notificationRef, {
      appId,
      ownerId,
      bookingId: bookingRef.id,
      workspaceSlug,
      type: 'new-booking-request',
      status: 'queued',
      channels: notificationChannels,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  return { ok: true, bookingId: bookingRef.id };
});

exports.processNotificationJob = onDocumentCreated({
  region: 'us-central1',
  document: 'artifacts/{appId}/notificationJobs/{jobId}'
}, async (event) => {
  const snap = event.data;
  if (!snap) return;

  const job = snap.data() || {};
  const hasEmailProvider = Boolean(process.env.RESEND_API_KEY);
  const hasWhatsAppProvider = Boolean(process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  await snap.ref.set({
    status: (hasEmailProvider || hasWhatsAppProvider) ? 'ready-for-provider' : 'waiting-for-provider-setup',
    providerState: {
      email: hasEmailProvider ? 'configured' : 'missing',
      whatsapp: hasWhatsAppProvider ? 'configured' : 'missing'
    },
    lastNote: job.type === 'new-booking-request'
      ? 'Booking notification queued. Connect provider secrets to enable sending.'
      : 'Notification queued.',
    updatedAt: serverTimestamp()
  }, { merge: true });
});

exports.createCheckoutSession = onCall({ region: 'us-central1' }, async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new HttpsError('failed-precondition', 'Stripe is not configured yet.');
  }
  throw new HttpsError('unimplemented', 'Checkout wiring is ready for your Stripe price IDs.');
});

exports.createBillingPortalSession = onCall({ region: 'us-central1' }, async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new HttpsError('failed-precondition', 'Stripe is not configured yet.');
  }
  throw new HttpsError('unimplemented', 'Billing portal wiring is ready for your Stripe customer IDs.');
});

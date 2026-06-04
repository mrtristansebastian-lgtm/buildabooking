const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');

admin.initializeApp();

const db = admin.firestore();
const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
const DEFAULT_APP_ID = process.env.BUILD_A_BOOKING_APP_ID || 'build-a-booking-v2';
const REMINDER_UTC_OFFSET = process.env.BOOKING_REMINDER_UTC_OFFSET || '+02:00';
const REMINDER_TIME_ZONE = process.env.BOOKING_REMINDER_TIME_ZONE || 'Africa/Johannesburg';
const REMINDER_WINDOW_BEHIND_MS = 30 * 60 * 1000;
const REMINDER_WINDOW_AHEAD_MS = 15 * 60 * 1000;

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

const safeDocumentId = (value, max = 180) => (
  cleanString(value, max)
    .replace(/[^a-zA-Z0-9@._:-]/g, '-')
    .slice(0, max) || `id-${Date.now()}`
);

const safeThreadId = (ownerId, bookingId) => (
  `${cleanString(ownerId, 80)}_${cleanString(bookingId, 80)}`
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 160)
);

const normalizeEmail = (email = '') => cleanString(email, 180).toLowerCase();

const dateKeyInTimeZone = (date = new Date(), timeZone = REMINDER_TIME_ZONE) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00${REMINDER_UTC_OFFSET}`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const bookingStartMs = (booking = {}) => {
  const dateKey = cleanString(booking.dateKey, 32);
  const match = cleanString(booking.time, 80).match(/(\d{1,2}):(\d{2})/);
  if (!dateKey || !match) return 0;
  const hour = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, '0');
  const minute = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, '0');
  const parsed = Date.parse(`${dateKey}T${hour}:${minute}:00${REMINDER_UTC_OFFSET}`);
  return Number.isFinite(parsed) ? parsed : 0;
};

const reminderIsDue = ({ booking, nowMs, offsetMs }) => {
  const targetMs = bookingStartMs(booking) - offsetMs;
  return targetMs > 0 &&
    targetMs >= nowMs - REMINDER_WINDOW_BEHIND_MS &&
    targetMs <= nowMs + REMINDER_WINDOW_AHEAD_MS;
};

const sendClientReminder = async ({
  appId,
  bookingDoc,
  booking,
  ownerId,
  reminderKey,
  title,
  body
}) => {
  const clientEmail = normalizeEmail(booking.clientEmail);
  if (!clientEmail) return false;
  const fieldKey = reminderKey === '24h' ? 'client24h' : 'client2h';
  const reminderDocId = `reminder-${reminderKey}-${bookingDoc.id}`;
  const notificationRef = db
    .collection('artifacts').doc(appId)
    .collection('clientAccess').doc(clientEmail)
    .collection('notifications').doc(reminderDocId);

  let created = false;
  await db.runTransaction(async (transaction) => {
    const [freshBookingSnap, notificationSnap] = await Promise.all([
      transaction.get(bookingDoc.ref),
      transaction.get(notificationRef)
    ]);
    const freshBooking = freshBookingSnap.data() || {};
    if (notificationSnap.exists || freshBooking.remindersSent?.[fieldKey]) return;
    if (freshBooking.status !== 'confirmed') return;

    transaction.set(notificationRef, {
      audience: 'client',
      type: 'booking_reminder',
      title,
      body,
      ownerId,
      bookingId: bookingDoc.id,
      threadId: freshBooking.threadId || booking.threadId || '',
      clientName: freshBooking.clientName || booking.clientName || '',
      clientEmail,
      workspaceName: freshBooking.workspaceName || booking.workspaceName || '',
      view: 'bookings',
      priority: reminderKey === '2h' ? 'high' : 'normal',
      read: false,
      createdAtMs: Date.now(),
      metadata: {
        reminderKey,
        dateKey: freshBooking.dateKey || booking.dateKey || '',
        time: freshBooking.time || booking.time || '',
        serviceName: freshBooking.serviceName || booking.serviceName || ''
      },
      createdAt: serverTimestamp()
    });
    transaction.update(bookingDoc.ref, {
      [`remindersSent.${fieldKey}`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    created = true;
  });
  return created;
};

exports.createPublicBookingRequest = onCall({ region: 'us-central1' }, async (request) => {
  const appId = requireString(request.data?.appId, 'App ID', 120);
  const workspaceSlug = requireString(request.data?.workspaceSlug, 'Workspace slug', 120).toLowerCase();
  const incoming = request.data?.booking || {};
  const idempotencyKey = cleanString(request.data?.idempotencyKey || incoming.idempotencyKey, 180);

  const clientName = requireString(incoming.clientName, 'Client name', 120);
  const clientPhone = cleanString(incoming.clientPhone, 60);
  const clientEmail = cleanString(incoming.clientEmail, 160).toLowerCase();
  const clientEmailOptIn = Boolean(incoming.clientEmailOptIn && clientEmail);
  const clientBirthday = cleanString(incoming.clientBirthday, 80);
  const clientNote = cleanString(incoming.clientNote, 1000);
  const serviceId = cleanString(incoming.serviceId, 120);
  const serviceName = cleanString(incoming.serviceName, 180);
  const serviceDescription = cleanString(incoming.serviceDescription, 700);
  const servicePrice = cleanString(incoming.servicePrice, 80);
  const servicePriceType = cleanString(incoming.servicePriceType, 40);
  const serviceDuration = cleanString(incoming.serviceDuration, 80);
  const serviceCategory = cleanString(incoming.serviceCategory, 120);
  const date = requireString(incoming.date, 'Booking date', 120);
  const dateKey = cleanString(incoming.dateKey, 32);
  const time = requireString(incoming.time, 'Booking time', 80);
  const allowedStatuses = new Set(['pending', 'confirmed', 'waitlist']);
  const status = allowedStatuses.has(incoming.status) ? incoming.status : 'pending';
  const paymentMethod = cleanString(incoming.paymentMethod, 60).toLowerCase();
  const paymentGateway = cleanString(incoming.paymentGateway || paymentMethod, 60).toLowerCase();
  const paymentProviderName = cleanString(incoming.paymentProviderName, 120);
  const isManualPayment = ['manual_eft', 'cash'].includes(paymentMethod) || ['manual_eft', 'cash'].includes(paymentGateway);
  const paymentStatus = isManualPayment ? 'manual_pending' : 'unpaid';
  const notificationChannels = {
    email: clientEmailOptIn,
    portal: Boolean(clientEmail)
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
  const ownerNotificationRef = db
    .collection('artifacts').doc(appId)
    .collection('users').doc(ownerId)
    .collection('notifications').doc();
  const threadId = safeThreadId(ownerId, bookingRef.id);
  const threadRef = db
    .collection('artifacts').doc(appId)
    .collection('clientThreads').doc(threadId);
  const initialMessageRef = threadRef.collection('messages').doc();
  const clientAccessRef = clientEmail
    ? db
      .collection('artifacts').doc(appId)
      .collection('clientAccess').doc(clientEmail)
      .collection('bookings').doc(bookingRef.id)
    : null;
  const clientNotificationRef = clientEmail
    ? db
      .collection('artifacts').doc(appId)
      .collection('clientAccess').doc(clientEmail)
      .collection('notifications').doc()
    : null;
  const shouldLockSlot = status !== 'waitlist' && dateKey && time !== 'Waitlist';
  const slotLockRef = shouldLockSlot ? workspaceRef.collection('slotLocks').doc(safeLockId(dateKey, time)) : null;
  const idempotencyRef = idempotencyKey
    ? db
      .collection('artifacts').doc(appId)
      .collection('users').doc(ownerId)
      .collection('idempotencyKeys').doc(safeDocumentId(idempotencyKey))
    : null;

  const bookingRecord = {
    ownerId,
    clientName,
    clientPhone,
    clientEmail,
    clientEmailOptIn,
    clientBirthday,
    clientNote,
    serviceId,
    serviceName,
    serviceDescription,
    servicePrice,
    servicePriceType,
    serviceDuration,
    serviceCategory,
    notificationChannels,
    date,
    dateKey: dateKey || null,
    time,
    status,
    source: 'public-booking-page',
    paymentMethod,
    paymentGateway,
    paymentProviderName,
    paymentStatus,
    paymentReference: isManualPayment ? bookingRef.id : '',
    workspaceSlug,
    workspaceName: workspace.workspaceName || workspace.brandName || '',
    workspaceLogo: workspace.logo || workspace.businessLogo || '',
    threadId,
    timestamp: Date.now(),
    createdAt: serverTimestamp()
  };

  let transactionResult = null;
  await db.runTransaction(async (transaction) => {
    if (idempotencyRef) {
      const idempotencySnap = await transaction.get(idempotencyRef);
      if (idempotencySnap.exists) {
        const stored = idempotencySnap.data() || {};
        transactionResult = stored.result || { ok: true, bookingId: stored.bookingId, reused: true };
        return;
      }
    }

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
    if (clientAccessRef) {
      transaction.set(clientAccessRef, {
        bookingId: bookingRef.id,
        threadId,
        ownerId,
        clientEmail,
        clientName,
        workspaceSlug,
        workspaceName: bookingRecord.workspaceName,
        workspaceLogo: bookingRecord.workspaceLogo,
        date,
        dateKey: dateKey || null,
        time,
        serviceId,
        serviceName,
        serviceDescription,
        servicePrice,
        servicePriceType,
        serviceDuration,
        serviceCategory,
        paymentMethod,
        paymentGateway,
        paymentProviderName,
        paymentStatus,
        paymentReference: isManualPayment ? bookingRef.id : '',
        status,
        timestamp: bookingRecord.timestamp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    transaction.set(threadRef, {
      ownerId,
      clientEmail,
      clientName,
      bookingId: bookingRef.id,
      workspaceSlug,
      workspaceName: bookingRecord.workspaceName,
      workspaceLogo: bookingRecord.workspaceLogo,
      serviceId,
      serviceName,
      paymentMethod,
      paymentGateway,
      paymentProviderName,
      paymentStatus,
      paymentReference: isManualPayment ? bookingRef.id : '',
      bookingStatus: status,
      status: 'open',
      lastMessage: `Booking request received${serviceName ? ` for ${serviceName}` : ''} on ${date} at ${time}.`,
      lastMessageAt: serverTimestamp(),
      ownerUnread: 1,
      clientUnread: 0,
      rescheduleStatus: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    transaction.set(ownerNotificationRef, {
      audience: 'owner',
      type: 'booking_request',
      title: `New booking request from ${clientName}`,
      body: `${serviceName ? `${serviceName} / ` : ''}${date} at ${time}. Review, confirm, waitlist, or reply from My Bookings.`,
      ownerId,
      bookingId: bookingRef.id,
      threadId,
      clientName,
      clientEmail,
      workspaceSlug,
      tab: 'bookings',
      priority: 'high',
      read: false,
      createdAtMs: bookingRecord.timestamp,
      createdAt: serverTimestamp()
    });
    if (clientNotificationRef) {
      transaction.set(clientNotificationRef, {
        audience: 'client',
        type: 'booking_received',
        title: 'Your booking request was sent',
        body: `${bookingRecord.workspaceName || 'The business'} received your request${serviceName ? ` for ${serviceName}` : ''} on ${date} at ${time}. Track it in your client portal.`,
        ownerId,
        bookingId: bookingRef.id,
        threadId,
        clientName,
        clientEmail,
        workspaceSlug,
        workspaceName: bookingRecord.workspaceName,
        view: 'bookings',
        priority: 'normal',
        read: false,
        createdAtMs: bookingRecord.timestamp,
        createdAt: serverTimestamp()
      });
    }
    transaction.set(initialMessageRef, {
      text: `Booking request received${serviceName ? ` for ${serviceName}` : ''} on ${date} at ${time}. The business can confirm, reply, or help you reschedule here.`,
      kind: 'booking-created',
      bookingId: bookingRef.id,
      senderId: 'system',
      senderName: 'Build A Booking',
      senderRole: 'system',
      createdAt: serverTimestamp()
    });
    transaction.set(notificationRef, {
      appId,
      ownerId,
      bookingId: bookingRef.id,
      workspaceSlug,
      threadId,
      type: 'new-booking-request',
      status: 'queued',
      channels: notificationChannels,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    transactionResult = { ok: true, bookingId: bookingRef.id, paymentReference: bookingRecord.paymentReference || '', reused: false };
    if (idempotencyRef) {
      transaction.set(idempotencyRef, {
        key: idempotencyKey,
        bookingId: bookingRef.id,
        ownerId,
        workspaceSlug,
        result: transactionResult,
        createdAtMs: bookingRecord.timestamp,
        createdAt: serverTimestamp()
      });
    }
  });

  return transactionResult || { ok: true, bookingId: bookingRef.id };
});

exports.processNotificationJob = onDocumentCreated({
  region: 'us-central1',
  document: 'artifacts/{appId}/notificationJobs/{jobId}'
}, async (event) => {
  const snap = event.data;
  if (!snap) return;

  const job = snap.data() || {};
  const hasEmailProvider = Boolean(process.env.RESEND_API_KEY);

  await snap.ref.set({
    status: hasEmailProvider ? 'ready-for-provider' : 'waiting-for-provider-setup',
    providerState: {
      email: hasEmailProvider ? 'configured' : 'missing',
      clientPortal: 'active'
    },
    lastNote: job.type === 'new-booking-request'
      ? 'Booking notification queued. Connect provider secrets to enable sending.'
      : 'Notification queued.',
    updatedAt: serverTimestamp()
  }, { merge: true });
});

exports.sendBookingReminderNotifications = onSchedule({
  region: 'us-central1',
  schedule: 'every 15 minutes',
  timeZone: REMINDER_TIME_ZONE
}, async () => {
  const appId = DEFAULT_APP_ID;
  const nowMs = Date.now();
  const todayKey = dateKeyInTimeZone(new Date(nowMs));
  const tomorrowKey = addDaysToDateKey(todayKey, 1);
  const ownerSettings = new Map();
  const bookingsSnap = await db.collectionGroup('bookings')
    .where('dateKey', '>=', todayKey)
    .where('dateKey', '<=', tomorrowKey)
    .get();
  let createdCount = 0;

  for (const bookingDoc of bookingsSnap.docs) {
    const pathSegments = bookingDoc.ref.path.split('/');
    if (pathSegments[0] !== 'artifacts' || pathSegments[1] !== appId || pathSegments[2] !== 'users') continue;
    const ownerId = pathSegments[3];
    if (!ownerId) continue;
    const booking = bookingDoc.data() || {};
    if (booking.status !== 'confirmed') continue;
    if (!normalizeEmail(booking.clientEmail) || !booking.dateKey || !booking.time) continue;

    if (!ownerSettings.has(ownerId)) {
      const settingsSnap = await db
        .collection('artifacts').doc(appId)
        .collection('users').doc(ownerId)
        .collection('config').doc('settings')
        .get();
      ownerSettings.set(ownerId, settingsSnap.exists ? (settingsSnap.data() || {}) : {});
    }
    const settings = ownerSettings.get(ownerId) || {};
    const reminders = {
      enabled: true,
      client24h: true,
      client2h: true,
      ...(settings.reminders || {})
    };
    if (reminders.enabled === false || (!reminders.client24h && !reminders.client2h)) continue;

    const workspaceName = booking.workspaceName || settings.brandName || 'The business';
    const serviceText = booking.serviceName ? ` for ${booking.serviceName}` : '';
    const timeText = `${booking.date || booking.dateKey} at ${booking.time}`;

    if (reminders.client24h && reminderIsDue({ booking, nowMs, offsetMs: 24 * 60 * 60 * 1000 })) {
      const created = await sendClientReminder({
        appId,
        bookingDoc,
        booking,
        ownerId,
        reminderKey: '24h',
        title: 'Your booking is tomorrow',
        body: `${workspaceName} has your booking${serviceText} tomorrow at ${booking.time}. Open your portal for details.`
      });
      if (created) createdCount += 1;
    }

    if (reminders.client2h && reminderIsDue({ booking, nowMs, offsetMs: 2 * 60 * 60 * 1000 })) {
      const created = await sendClientReminder({
        appId,
        bookingDoc,
        booking,
        ownerId,
        reminderKey: '2h',
        title: 'Your booking is coming up soon',
        body: `${workspaceName} has your booking${serviceText} coming up at ${timeText}. Open your portal if you need to message or reschedule.`
      });
      if (created) createdCount += 1;
    }
  }

  console.log(`Booking reminder notifications created: ${createdCount}`);
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

const paymentFunctions = require('./payments');
Object.assign(exports, paymentFunctions);

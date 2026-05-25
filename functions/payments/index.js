const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { PAYMENT_SETTINGS_ENCRYPTION_KEY, encryptJson } = require('./crypto');
const { createGatewayPayment } = require('./gatewayFactory');
const {
  assertSafeCents,
  assertWorkspaceAdmin,
  cleanCredentials,
  cleanString,
  getFunctionBaseUrl,
  getGatewayConfig,
  normalizeCurrency,
  normalizeGatewayType,
  pathRefs,
  publicGatewayDoc,
  requireAppId,
  requireBusinessId
} = require('./shared');
const webhooks = require('./webhooks');

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

const savePaymentGatewaySettings = onCall({
  region: 'us-central1',
  secrets: [PAYMENT_SETTINGS_ENCRYPTION_KEY]
}, async (request) => {
  try {
    const appId = requireAppId(request.data?.appId);
    const businessId = requireBusinessId(request.data?.businessId);
    const gatewayType = normalizeGatewayType(request.data?.gatewayType);
    const enabled = Boolean(request.data?.enabled);
    const mode = cleanString(request.data?.mode, 12) === 'live' ? 'live' : 'test';

    await assertWorkspaceAdmin({ appId, businessId, auth: request.auth });

    const credentials = cleanCredentials(gatewayType, request.data?.credentials || {});
    const refs = pathRefs(appId, businessId, gatewayType);
    const batch = admin.firestore().batch();

    if (Object.keys(credentials).length) {
      batch.set(refs.secretGatewayRef, {
        gatewayType,
        encryptedCredentials: encryptJson(credentials),
        credentialFields: Object.keys(credentials),
        updatedBy: request.auth.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    const hasCredentials = Object.keys(credentials).length > 0;
    batch.set(refs.publicGatewayRef, {
      gatewayType,
      enabled,
      mode,
      providerName: request.data?.providerName || gatewayType,
      ...(hasCredentials ? publicGatewayDoc(credentials) : {}),
      ...(hasCredentials ? { configured: true } : {}),
      updatedBy: request.auth.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return { ok: true, gatewayType, enabled, mode };
  } catch (error) {
    console.error('savePaymentGatewaySettings failed', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error?.message || 'Payment settings could not be saved.');
  }
});

const initiatePayment = onCall({
  region: 'us-central1',
  secrets: [PAYMENT_SETTINGS_ENCRYPTION_KEY]
}, async (request) => {
  try {
    const appId = requireAppId(request.data?.appId);
    const businessId = requireBusinessId(request.data?.businessId);
    const gatewayType = normalizeGatewayType(request.data?.gatewayType);
    const amountInCents = assertSafeCents(request.data?.amountInCents);
    const currency = normalizeCurrency(request.data?.currency || 'ZAR');
    const bookingId = cleanString(request.data?.bookingId, 180);
    const description = cleanString(request.data?.description, 240) || 'Build A Booking payment';
    const customerEmail = cleanString(request.data?.customerEmail, 220).toLowerCase();
    const customerName = cleanString(request.data?.customerName, 160);

    if (!request.auth?.uid && !bookingId) {
      throw new HttpsError('unauthenticated', 'Sign in or provide a booking reference before starting checkout.');
    }

    const { publicConfig, credentials } = await getGatewayConfig({ appId, businessId, gatewayType });
    const refs = pathRefs(appId, businessId, gatewayType);
    const paymentAttemptRef = refs.userRef.collection('payment_attempts').doc();
    const paymentId = paymentAttemptRef.id;
    const baseUrl = getFunctionBaseUrl(request);
    const successUrl = cleanString(request.data?.successUrl, 1000) ||
      `https://build-a-booking.web.app/#/dashboard/bookings?payment=${encodeURIComponent(paymentId)}&status=success`;
    const cancelUrl = cleanString(request.data?.cancelUrl, 1000) ||
      `https://build-a-booking.web.app/#/dashboard/bookings?payment=${encodeURIComponent(paymentId)}&status=cancelled`;

    const metadata = {
      appId,
      businessId,
      bookingId,
      paymentId,
      amountInCents: String(amountInCents),
      currency
    };

    await paymentAttemptRef.set({
      appId,
      businessId,
      gatewayType,
      bookingId,
      amountInCents,
      currency,
      description,
      customerEmail,
      customerName,
      status: 'initiated',
      mode: publicConfig.mode || 'test',
      createdBy: request.auth?.uid || 'public-booking-page',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const checkout = await createGatewayPayment({
      gatewayType,
      credentials,
      request,
      payment: {
        appId,
        businessId,
        bookingId,
        paymentId,
        amountInCents,
        currency,
        description,
        customerEmail,
        customerName,
        mode: publicConfig.mode || 'test',
        successUrl,
        cancelUrl,
        baseUrl,
        metadata
      }
    });

    await paymentAttemptRef.set({
      status: 'checkout_ready',
      checkoutUrl: checkout.checkoutUrl,
      providerReference: checkout.providerReference || '',
      rawProviderResponse: checkout.rawProviderResponse || {},
      updatedAt: serverTimestamp()
    }, { merge: true });

    return {
      ok: true,
      paymentId,
      gatewayType,
      checkoutUrl: checkout.checkoutUrl,
      providerReference: checkout.providerReference || ''
    };
  } catch (error) {
    console.error('initiatePayment failed', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error?.message || 'Payment could not be started.');
  }
});

module.exports = {
  initiatePayment,
  savePaymentGatewaySettings,
  ...webhooks
};

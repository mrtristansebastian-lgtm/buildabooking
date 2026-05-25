const Stripe = require('stripe');
const { HttpsError } = require('firebase-functions/v2/https');
const { hashHex } = require('./crypto');
const {
  centsToDecimal,
  cleanString,
  getFunctionBaseUrl,
  webhookUrl
} = require('./shared');

const requireCredential = (credentials, field, gatewayName) => {
  const value = cleanString(credentials?.[field], 2000);
  if (!value) {
    throw new HttpsError('failed-precondition', `${gatewayName} is missing ${field}.`);
  }
  return value;
};

const queryString = (fields) => (
  Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`)
    .join('&')
);

const payfastSignature = (fields, passphrase = '') => {
  const signatureFields = Object.keys(fields)
    .filter((key) => key !== 'signature' && fields[key] !== undefined && fields[key] !== null && String(fields[key]) !== '')
    .sort()
    .reduce((acc, key) => {
      acc[key] = fields[key];
      return acc;
    }, {});
  const base = queryString(signatureFields);
  return hashHex('md5', passphrase ? `${base}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : base);
};

const ozowHash = (fields, privateKey) => {
  const order = [
    'SiteCode',
    'CountryCode',
    'CurrencyCode',
    'Amount',
    'TransactionReference',
    'BankReference',
    'Optional1',
    'Optional2',
    'Optional3',
    'Optional4',
    'Optional5',
    'Customer',
    'CancelUrl',
    'ErrorUrl',
    'SuccessUrl',
    'NotifyUrl',
    'IsTest'
  ];
  const raw = `${order.map((key) => cleanString(fields[key], 1000)).join('')}${privateKey}`;
  return hashHex('sha512', raw.toLowerCase());
};

const makeCheckoutUrls = ({ data, paymentId, baseUrl }) => {
  const fallbackSuccess = `https://build-a-booking.web.app/#/dashboard/bookings?payment=${encodeURIComponent(paymentId)}&status=success`;
  const fallbackCancel = `https://build-a-booking.web.app/#/dashboard/bookings?payment=${encodeURIComponent(paymentId)}&status=cancelled`;
  return {
    successUrl: cleanString(data.successUrl, 1000) || fallbackSuccess,
    cancelUrl: cleanString(data.cancelUrl, 1000) || fallbackCancel,
    baseUrl
  };
};

const gatewayHandlers = {
  stripe: async ({ credentials, payment, request }) => {
    const secretKey = requireCredential(credentials, 'secretKey', 'Stripe');
    const stripe = new Stripe(secretKey);
    const urls = makeCheckoutUrls({
      data: payment,
      paymentId: payment.paymentId,
      baseUrl: getFunctionBaseUrl(request)
    });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: payment.paymentId,
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
      customer_email: payment.customerEmail || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: payment.currency.toLowerCase(),
          unit_amount: payment.amountInCents,
          product_data: {
            name: payment.description || 'Build A Booking payment'
          }
        }
      }],
      payment_intent_data: {
        metadata: payment.metadata
      },
      metadata: payment.metadata
    }, { idempotencyKey: payment.paymentId });

    return {
      checkoutUrl: session.url,
      providerReference: session.id,
      rawProviderResponse: { id: session.id, payment_status: session.payment_status }
    };
  },

  paystack: async ({ credentials, payment }) => {
    const secretKey = requireCredential(credentials, 'secretKey', 'Paystack');
    if (!payment.customerEmail) {
      throw new HttpsError('invalid-argument', 'Paystack requires customerEmail.');
    }
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: payment.customerEmail,
        amount: payment.amountInCents,
        currency: payment.currency,
        reference: payment.paymentId,
        callback_url: payment.successUrl,
        metadata: payment.metadata
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.status) {
      throw new HttpsError('internal', body.message || 'Paystack could not create a checkout.');
    }
    return {
      checkoutUrl: body.data?.authorization_url,
      providerReference: body.data?.reference || payment.paymentId,
      rawProviderResponse: body.data || {}
    };
  },

  payfast: async ({ credentials, payment, request }) => {
    const merchantId = requireCredential(credentials, 'merchantId', 'Payfast');
    const merchantKey = requireCredential(credentials, 'merchantKey', 'Payfast');
    const passphrase = cleanString(credentials.passphrase, 500);
    const baseUrl = getFunctionBaseUrl(request);
    const urls = makeCheckoutUrls({ data: payment, paymentId: payment.paymentId, baseUrl });
    const fields = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
      notify_url: webhookUrl({ baseUrl, endpoint: 'payfastWebhook', appId: payment.appId, businessId: payment.businessId }),
      name_first: cleanString(payment.customerName, 80),
      email_address: cleanString(payment.customerEmail, 160),
      m_payment_id: payment.paymentId,
      amount: centsToDecimal(payment.amountInCents),
      item_name: payment.description || 'Build A Booking payment',
      custom_str1: payment.appId,
      custom_str2: payment.businessId,
      custom_str3: payment.bookingId || ''
    };
    fields.signature = payfastSignature(fields, passphrase);
    const host = payment.mode === 'test' ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
    return {
      checkoutUrl: `${host}?${queryString(fields)}`,
      providerReference: payment.paymentId,
      rawProviderResponse: { host }
    };
  },

  yoco: async ({ credentials, payment }) => {
    const secretKey = requireCredential(credentials, 'secretKey', 'Yoco');
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: payment.amountInCents,
        currency: payment.currency,
        successUrl: payment.successUrl,
        cancelUrl: payment.cancelUrl,
        failureUrl: payment.cancelUrl,
        metadata: payment.metadata
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new HttpsError('internal', body.message || body.error || 'Yoco could not create a checkout.');
    }
    return {
      checkoutUrl: body.redirectUrl || body.url || body.checkoutUrl,
      providerReference: body.id || payment.paymentId,
      rawProviderResponse: body
    };
  },

  ozow: async ({ credentials, payment, request }) => {
    const siteCode = requireCredential(credentials, 'siteCode', 'Ozow');
    const privateKey = requireCredential(credentials, 'privateKey', 'Ozow');
    const baseUrl = getFunctionBaseUrl(request);
    const urls = makeCheckoutUrls({ data: payment, paymentId: payment.paymentId, baseUrl });
    const fields = {
      SiteCode: siteCode,
      CountryCode: 'ZA',
      CurrencyCode: payment.currency,
      Amount: centsToDecimal(payment.amountInCents),
      TransactionReference: payment.paymentId,
      BankReference: cleanString(payment.description, 20) || 'BuildABooking',
      Optional1: payment.appId,
      Optional2: payment.businessId,
      Optional3: payment.bookingId || '',
      Optional4: '',
      Optional5: '',
      Customer: cleanString(payment.customerEmail || payment.customerName, 100),
      CancelUrl: urls.cancelUrl,
      ErrorUrl: urls.cancelUrl,
      SuccessUrl: urls.successUrl,
      NotifyUrl: webhookUrl({ baseUrl, endpoint: 'ozowWebhook', appId: payment.appId, businessId: payment.businessId }),
      IsTest: payment.mode === 'live' ? 'false' : 'true'
    };
    fields.HashCheck = ozowHash(fields, privateKey);
    return {
      checkoutUrl: `https://pay.ozow.com/?${queryString(fields)}`,
      providerReference: payment.paymentId,
      rawProviderResponse: { siteCode }
    };
  },

  peach: async ({ credentials, payment }) => {
    const entityId = requireCredential(credentials, 'entityId', 'Peach Payments');
    const accessToken = cleanString(credentials.accessToken || credentials.secretKey, 2000);
    if (!accessToken) throw new HttpsError('failed-precondition', 'Peach Payments is missing accessToken or secretKey.');
    const endpoint = cleanString(credentials.checkoutEndpoint, 1000) || 'https://eu-prod.oppwa.com/v1/checkouts';
    const params = new URLSearchParams({
      entityId,
      amount: centsToDecimal(payment.amountInCents),
      currency: payment.currency,
      paymentType: 'DB',
      merchantTransactionId: payment.paymentId,
      'customParameters[appId]': payment.appId,
      'customParameters[businessId]': payment.businessId,
      'customParameters[bookingId]': payment.bookingId || ''
    });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.id) {
      throw new HttpsError('internal', body.result?.description || 'Peach Payments could not create a checkout.');
    }
    const checkoutBase = endpoint.includes('/v1/checkouts')
      ? endpoint.replace('/v1/checkouts', '/v1/paymentWidgets.js')
      : 'https://eu-prod.oppwa.com/v1/paymentWidgets.js';
    return {
      checkoutUrl: `${checkoutBase}?checkoutId=${encodeURIComponent(body.id)}`,
      providerReference: body.id,
      rawProviderResponse: body
    };
  }
};

const createGatewayPayment = async ({ gatewayType, credentials, payment, request }) => {
  const handler = gatewayHandlers[gatewayType];
  if (!handler) throw new HttpsError('invalid-argument', 'Unsupported payment gateway.');
  const result = await handler({ credentials, payment, request });
  if (!result.checkoutUrl) {
    throw new HttpsError('internal', `${gatewayType} did not return a checkout URL.`);
  }
  return result;
};

module.exports = {
  createGatewayPayment,
  ozowHash,
  payfastSignature,
  queryString
};

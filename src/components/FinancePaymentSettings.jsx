import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CreditCard,
  Download,
  KeyRound,
  Landmark,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
  X,
  Zap
} from 'lucide-react';
import * as FirebaseSDK from '../services/firebase';
import { db, functions, isFirebaseConfigured } from '../services/firebase';

const gatewayCards = [
  {
    id: 'stripe',
    name: 'Stripe',
    region: 'International',
    icon: CreditCard,
    note: 'Global cards, Apple Pay, Google Pay, and checkout sessions.',
    fields: [
      { key: 'publishableKey', label: 'Publishable key', type: 'text' },
      { key: 'secretKey', label: 'Secret key', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook signing secret', type: 'password' }
    ]
  },
  {
    id: 'payfast',
    name: 'Payfast',
    region: 'South Africa',
    icon: Zap,
    note: 'Fast local checkout for cards, EFT, and popular South African payment flows.',
    fields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text' },
      { key: 'merchantKey', label: 'Merchant key', type: 'password' },
      { key: 'passphrase', label: 'Passphrase', type: 'password' }
    ]
  },
  {
    id: 'peach',
    name: 'Peach Payments',
    region: 'South Africa',
    icon: Landmark,
    note: 'Enterprise-ready checkout for card processing and Peach-hosted flows.',
    fields: [
      { key: 'entityId', label: 'Entity ID', type: 'text' },
      { key: 'accessToken', label: 'Access token', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook secret', type: 'password' },
      { key: 'checkoutEndpoint', label: 'Checkout endpoint', type: 'url' }
    ]
  },
  {
    id: 'yoco',
    name: 'Yoco',
    region: 'South Africa',
    icon: CreditCard,
    note: 'Local card checkout with clean hosted payment links.',
    fields: [
      { key: 'publicKey', label: 'Public key', type: 'text' },
      { key: 'secretKey', label: 'Secret key', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook secret', type: 'password' }
    ]
  },
  {
    id: 'ozow',
    name: 'Ozow',
    region: 'South Africa',
    icon: Landmark,
    note: 'Instant EFT-style bank payments with signed payment URLs.',
    fields: [
      { key: 'siteCode', label: 'Site code', type: 'text' },
      { key: 'privateKey', label: 'Private key', type: 'password' },
      { key: 'apiKey', label: 'API key', type: 'password' }
    ]
  },
  {
    id: 'paystack',
    name: 'Paystack',
    region: 'Africa',
    icon: ShieldCheck,
    note: 'Reliable card payments with clean initialization and webhooks.',
    fields: [
      { key: 'publicKey', label: 'Public key', type: 'text' },
      { key: 'secretKey', label: 'Secret key', type: 'password' }
    ]
  }
];

const gatewayById = gatewayCards.reduce((acc, gateway) => {
  acc[gateway.id] = gateway;
  return acc;
}, {});

const emptyDrafts = gatewayCards.reduce((acc, gateway) => {
  acc[gateway.id] = {
    enabled: false,
    mode: 'test',
    credentials: gateway.fields.reduce((fields, field) => {
      fields[field.key] = '';
      return fields;
    }, {})
  };
  return acc;
}, {});

const exampleTransactions = [
  {
    id: 'example-paid-1',
    isExample: true,
    gatewayType: 'payfast',
    status: 'paid',
    amountInCents: 85000,
    currency: 'ZAR',
    customerName: 'Example Client',
    description: 'Consultation deposit',
    bookingId: 'preview-booking',
    updatedAtMs: Date.now() - 1000 * 60 * 45
  },
  {
    id: 'example-ready-1',
    isExample: true,
    gatewayType: 'stripe',
    status: 'checkout_ready',
    amountInCents: 120000,
    currency: 'ZAR',
    customerName: 'Preview Booking',
    description: 'Service package',
    bookingId: 'preview-checkout',
    updatedAtMs: Date.now() - 1000 * 60 * 60 * 6
  }
];

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getWeekStart = (date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const dateToMs = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatMoney = (amountInCents = 0, currency = 'ZAR') => {
  const amount = Math.max(0, Math.round(Number(amountInCents) || 0)) / 100;
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 ? 2 : 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(amount % 1 ? 2 : 0)}`;
  }
};

const formatDateTime = (ms) => {
  if (!ms) return 'Not dated';
  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(ms));
};

const normalizeAttempt = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    gatewayType: data.gatewayType || 'stripe',
    status: data.status || 'initiated',
    amountInCents: Number(data.amountInCents || data.amountPaidInCents || 0),
    currency: data.currency || 'ZAR',
    customerName: data.customerName || data.clientName || 'Client',
    customerEmail: data.customerEmail || '',
    description: data.description || 'Booking payment',
    bookingId: data.bookingId || '',
    providerReference: data.providerReference || '',
    checkoutUrl: data.checkoutUrl || '',
    updatedAtMs: dateToMs(data.paidAt || data.updatedAt || data.createdAt)
  };
};

const getPeriodRange = (period, customRange) => {
  const now = new Date();
  if (period === 'day') {
    const start = startOfDay(now);
    return { start, end: addDays(start, 1), label: 'Today' };
  }
  if (period === 'week') {
    const start = getWeekStart(now);
    return { start, end: addDays(start, 7), label: 'This week' };
  }
  if (period === 'custom' && customRange.from && customRange.to) {
    const start = startOfDay(new Date(`${customRange.from}T00:00:00`));
    const end = addDays(startOfDay(new Date(`${customRange.to}T00:00:00`)), 1);
    return { start, end, label: 'Custom range' };
  }
  const start = getMonthStart(now);
  return { start, end: new Date(now.getFullYear(), now.getMonth() + 1, 1), label: now.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }) };
};

const buildChartBuckets = (records, period, range) => {
  if (period === 'day') {
    const slots = ['06', '09', '12', '15', '18', '21'].map((hour) => ({ label: `${hour}:00`, value: 0 }));
    records.forEach((record) => {
      const hour = new Date(record.updatedAtMs || Date.now()).getHours();
      const index = Math.min(slots.length - 1, Math.max(0, Math.floor((hour - 6) / 3)));
      slots[index].value += record.status === 'paid' ? record.amountInCents : 0;
    });
    return slots;
  }

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(range.start, index);
      const dayStart = day.getTime();
      const dayEnd = addDays(day, 1).getTime();
      return {
        label: day.toLocaleDateString('en-ZA', { weekday: 'short' }),
        value: records
          .filter((record) => record.status === 'paid' && record.updatedAtMs >= dayStart && record.updatedAtMs < dayEnd)
          .reduce((sum, record) => sum + record.amountInCents, 0)
      };
    });
  }

  const totalDays = Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000));
  const bucketCount = period === 'custom' ? Math.min(8, Math.max(3, Math.ceil(totalDays / 7))) : 5;
  const bucketSize = Math.ceil(totalDays / bucketCount);
  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = addDays(range.start, index * bucketSize);
    const bucketEnd = addDays(bucketStart, bucketSize);
    return {
      label: bucketStart.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' }),
      value: records
        .filter((record) => record.status === 'paid' && record.updatedAtMs >= bucketStart.getTime() && record.updatedAtMs < bucketEnd.getTime())
        .reduce((sum, record) => sum + record.amountInCents, 0)
    };
  });
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`finance-toggle ${checked ? 'is-on' : ''}`}
    aria-pressed={checked}
  >
    <span />
  </button>
);

const StatusPill = ({ status }) => {
  const clean = String(status || 'initiated').toLowerCase();
  const label = clean.replace(/_/g, ' ');
  const tone = clean === 'paid'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : clean.includes('ready')
      ? 'bg-blue-50 text-blue-700 border-blue-100'
      : clean.includes('fail') || clean.includes('cancel')
        ? 'bg-rose-50 text-rose-700 border-rose-100'
        : 'bg-neutral-50 text-neutral-500 border-neutral-100';
  return <span className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-widest ${tone}`}>{label}</span>;
};

export const FinancePaymentSettings = ({ appId, businessId, canManageWorkspace, showToast }) => {
  const [saved, setSaved] = useState({});
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [saving, setSaving] = useState('');
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState('stripe');
  const [financeSummary, setFinanceSummary] = useState({});
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [period, setPeriod] = useState('month');
  const [deskView, setDeskView] = useState('transactions');
  const [search, setSearch] = useState('');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !appId || !businessId) return undefined;
    const settingsRef = FirebaseSDK.collection(db, 'artifacts', appId, 'users', businessId, 'payment_settings');
    return FirebaseSDK.onSnapshot(settingsRef, (snapshot) => {
      const next = {};
      snapshot.forEach((docSnap) => { next[docSnap.id] = docSnap.data() || {}; });
      setSaved(next);
      setDrafts((current) => {
        const merged = { ...current };
        gatewayCards.forEach((gateway) => {
          const publicConfig = next[gateway.id] || {};
          merged[gateway.id] = {
            ...merged[gateway.id],
            enabled: Boolean(publicConfig.enabled),
            mode: publicConfig.mode || merged[gateway.id]?.mode || 'test'
          };
        });
        return merged;
      });
    }, (error) => {
      console.error('Finance gateway settings listener failed', error);
    });
  }, [appId, businessId]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !appId || !businessId) return undefined;
    const userRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', businessId);
    const summaryRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', businessId, 'finance', 'summary');
    const attemptsQuery = FirebaseSDK.query(
      FirebaseSDK.collection(userRef, 'payment_attempts'),
      FirebaseSDK.limit(80)
    );
    const unsubSummary = FirebaseSDK.onSnapshot(summaryRef, (docSnap) => {
      setFinanceSummary(docSnap.exists() ? docSnap.data() || {} : {});
    }, (error) => {
      console.error('Finance summary listener failed', error);
    });
    const unsubAttempts = FirebaseSDK.onSnapshot(attemptsQuery, (snapshot) => {
      const next = snapshot.docs.map(normalizeAttempt).sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
      setPaymentAttempts(next);
    }, (error) => {
      console.error('Payment attempts listener failed', error);
    });
    return () => {
      unsubSummary();
      unsubAttempts();
    };
  }, [appId, businessId]);

  const selectedGateway = gatewayById[selectedGatewayId] || gatewayCards[0];
  const selectedDraft = drafts[selectedGateway.id] || emptyDrafts[selectedGateway.id];
  const selectedPublicConfig = saved[selectedGateway.id] || {};

  const enabledCount = useMemo(() => (
    gatewayCards.filter((gateway) => saved[gateway.id]?.enabled).length
  ), [saved]);

  const periodRange = useMemo(() => getPeriodRange(period, customRange), [period, customRange]);

  const periodRecords = useMemo(() => {
    const startMs = periodRange.start.getTime();
    const endMs = periodRange.end.getTime();
    return paymentAttempts.filter((record) => {
      if (!record.updatedAtMs) return false;
      return record.updatedAtMs >= startMs && record.updatedAtMs < endMs;
    });
  }, [paymentAttempts, periodRange]);

  const financeMetrics = useMemo(() => {
    const paid = periodRecords.filter((record) => record.status === 'paid');
    const open = periodRecords.filter((record) => !['paid', 'failed', 'cancelled', 'canceled'].includes(record.status));
    return {
      revenueInCents: paid.reduce((sum, record) => sum + record.amountInCents, 0),
      paidCount: paid.length,
      openCount: open.length,
      gatewayCount: enabledCount,
      lifetimeRevenue: Number(financeSummary.totalRevenueInCents || 0),
      lifetimePaidCount: Number(financeSummary.paidTransactionCount || 0)
    };
  }, [enabledCount, financeSummary, periodRecords]);

  const chartBuckets = useMemo(() => buildChartBuckets(periodRecords, period, periodRange), [period, periodRange, periodRecords]);
  const maxChartValue = Math.max(...chartBuckets.map((bucket) => bucket.value), 1);

  const visibleDeskRows = useMemo(() => {
    const rows = paymentAttempts.length ? paymentAttempts : exampleTransactions;
    const queryText = search.trim().toLowerCase();
    return rows.filter((row) => {
      const typeMatches = deskView === 'transactions'
        ? true
        : deskView === 'invoices'
          ? ['initiated', 'checkout_ready', 'paid'].includes(row.status)
          : row.status === 'paid';
      if (!typeMatches) return false;
      if (!queryText) return true;
      return [
        row.customerName,
        row.customerEmail,
        row.description,
        row.gatewayType,
        row.bookingId,
        row.status
      ].some((value) => String(value || '').toLowerCase().includes(queryText));
    }).slice(0, 12);
  }, [deskView, paymentAttempts, search]);

  const updateDraft = (gatewayId, patch) => {
    setDrafts((current) => ({
      ...current,
      [gatewayId]: {
        ...current[gatewayId],
        ...patch,
        credentials: {
          ...(current[gatewayId]?.credentials || {}),
          ...(patch.credentials || {})
        }
      }
    }));
  };

  const saveGateway = async (gateway) => {
    if (!canManageWorkspace) {
      showToast?.('Only owners and admins can manage finance settings.');
      return;
    }
    if (!functions) {
      showToast?.('Firebase Functions are not connected yet.');
      return;
    }
    setSaving(gateway.id);
    try {
      const callable = FirebaseSDK.httpsCallable(functions, 'savePaymentGatewaySettings');
      await callable({
        appId,
        businessId,
        gatewayType: gateway.id,
        enabled: drafts[gateway.id]?.enabled || false,
        mode: drafts[gateway.id]?.mode || 'test',
        providerName: gateway.name,
        credentials: drafts[gateway.id]?.credentials || {}
      });
      updateDraft(gateway.id, {
        credentials: gateway.fields.reduce((acc, field) => {
          acc[field.key] = '';
          return acc;
        }, {})
      });
      showToast?.(`${gateway.name} settings saved.`);
    } catch (error) {
      console.error('Payment settings save failed', error);
      showToast?.(error?.message || `${gateway.name} could not be saved.`);
    } finally {
      setSaving('');
    }
  };

  const openGatewayModal = (gatewayId = selectedGatewayId) => {
    setSelectedGatewayId(gatewayId);
    setGatewayModalOpen(true);
  };

  const applyCustomRange = () => {
    if (!customRange.from || !customRange.to) {
      showToast?.('Choose a start and end date first.');
      return;
    }
    setPeriod('custom');
    setRangeDialogOpen(false);
  };

  const downloadFinanceCsv = () => {
    const rows = (paymentAttempts.length ? paymentAttempts : exampleTransactions).map((row) => ({
      id: row.id,
      status: row.status,
      gateway: gatewayById[row.gatewayType]?.name || row.gatewayType || 'Gateway',
      client: row.customerName || 'Client',
      email: row.customerEmail || '',
      description: row.description || '',
      bookingId: row.bookingId || '',
      amount: formatMoney(row.amountInCents, row.currency),
      updated: formatDateTime(row.updatedAtMs)
    }));

    if (!rows.length) {
      showToast?.('No finance records to export yet.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `build-a-booking-finance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast?.('Finance export prepared.');
  };

  return (
    <section className="finance-studio w-full max-w-7xl mx-auto">
      <header className="dashboard-page-header mb-5 md:mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">Finance</h2>
          <p className="mt-2 text-sm md:text-base text-neutral-500 max-w-2xl">
            Track money in, connect gateways, and keep payments tied to bookings without exposing secret keys in the browser.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2 w-full xl:w-auto">
          <button
            type="button"
            onClick={() => openGatewayModal()}
            className="h-12 px-4 md:px-5 rounded-2xl native-gradient-button text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/10"
          >
            <Settings size={15} /> Gateway setup
          </button>
          <button
            type="button"
            onClick={downloadFinanceCsv}
            className="h-12 px-4 md:px-5 rounded-2xl finance-export-button text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/5"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </header>

      <div className="finance-hero rounded-[1.25rem] border border-neutral-200 bg-white shadow-sm overflow-hidden native-gradient-ring">
        <div className="h-1 native-gradient-line" />
        <div className="p-4 md:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Revenue pulse</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-black">{periodRange.label}</h3>
          </div>
          <div className="grid grid-cols-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-1 min-w-full sm:min-w-[420px]">
            {['day', 'week', 'month', 'custom'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => (item === 'custom' ? setRangeDialogOpen(true) : setPeriod(item))}
                className={`h-10 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${period === item ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-neutral-400 hover:text-black'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-0">
          <div className="p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-neutral-100">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Earnings', formatMoney(financeMetrics.revenueInCents, financeSummary.currency || 'ZAR'), WalletCards, 'Paid in selected period'],
                ['Paid', financeMetrics.paidCount, Check, 'Successful transactions'],
                ['Open', financeMetrics.openCount, ReceiptText, 'Checkout or invoice flow'],
                ['Gateways', financeMetrics.gatewayCount, LockKeyhole, `${gatewayCards.length} available`]
              ].map(([label, value, Icon, caption]) => (
                <div key={label} className="finance-metric-card rounded-2xl border border-neutral-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-black">
                      <Icon size={17} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{caption}</span>
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-black">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Earnings graph</p>
                <p className="text-sm text-neutral-500">Paid revenue only, counted in cents.</p>
              </div>
              <div className="w-10 h-10 rounded-xl native-gradient-button flex items-center justify-center text-black">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="finance-chart h-64 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 flex items-end gap-2">
              {chartBuckets.map((bucket) => {
                const height = Math.max(8, Math.round((bucket.value / maxChartValue) * 100));
                return (
                  <div key={bucket.label} className="flex-1 h-full flex flex-col justify-end gap-2 min-w-0">
                    <div className="finance-chart-bar rounded-t-2xl" style={{ height: `${height}%` }}>
                      <span className="sr-only">{formatMoney(bucket.value, financeSummary.currency || 'ZAR')}</span>
                    </div>
                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-neutral-400 truncate">{bucket.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-5">
        <section className="finance-desk rounded-[1.25rem] border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Finance desk</p>
              <h3 className="text-2xl font-black tracking-tight text-black mt-1">Transactions and invoices</h3>
            </div>
            <div className="grid grid-cols-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-1 min-w-full sm:min-w-[360px]">
              {[
                ['transactions', 'Transactions'],
                ['invoices', 'Invoices'],
                ['paid', 'Paid']
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDeskView(id)}
                  className={`h-10 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${deskView === id ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-neutral-400 hover:text-black'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 md:p-5 border-b border-neutral-100">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search client, gateway, booking, reference"
                className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm font-bold text-black outline-none focus:border-black transition-colors placeholder:text-neutral-300"
              />
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {visibleDeskRows.map((row) => {
              const gateway = gatewayById[row.gatewayType] || gatewayCards[0];
              const Icon = gateway.icon;
              return (
                <div key={row.id} className="finance-desk-row p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-black shrink-0">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-black truncate">{row.customerName || 'Client'}</p>
                        {row.isExample && <span className="rounded-full bg-neutral-50 border border-neutral-100 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-400">Example</span>}
                        <StatusPill status={row.status} />
                      </div>
                      <p className="mt-1 text-sm text-neutral-500 truncate">{row.description || 'Booking payment'} / {gateway.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:text-right">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Amount</p>
                      <p className="font-black text-black">{formatMoney(row.amountInCents, row.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Updated</p>
                      <p className="font-bold text-sm text-neutral-500">{formatDateTime(row.updatedAtMs)}</p>
                    </div>
                    <button type="button" className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-black text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      View <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {gatewayModalOpen && (
        <div className="finance-modal fixed inset-0 z-[1400] bg-black/45 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="finance-modal-panel w-full md:max-w-5xl max-h-[92vh] overflow-hidden rounded-t-[1.75rem] md:rounded-[1.5rem] bg-white border border-neutral-200 shadow-2xl shadow-black/30 flex flex-col">
            <div className="p-4 md:p-5 border-b border-neutral-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button type="button" onClick={() => setGatewayModalOpen(false)} className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-black md:hidden">
                  <ArrowLeft size={18} />
                </button>
                <div className="w-11 h-11 rounded-2xl native-gradient-button flex items-center justify-center text-black shrink-0">
                  <Settings size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Gateway setup</p>
                  <h3 className="text-2xl font-black tracking-tight text-black truncate">{selectedGateway.name}</h3>
                </div>
              </div>
              <button type="button" onClick={() => setGatewayModalOpen(false)} className="hidden md:flex w-11 h-11 rounded-2xl bg-white border border-neutral-200 items-center justify-center text-black">
                <X size={18} />
              </button>
            </div>

            <div className="finance-modal-body grid lg:grid-cols-[320px_1fr] min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
              <aside className="finance-modal-gateway-list border-b lg:border-b-0 lg:border-r border-neutral-100 bg-neutral-50/60 p-3 overflow-x-auto lg:overflow-y-auto">
                <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                  {gatewayCards.map((gateway) => {
                    const Icon = gateway.icon;
                    const active = selectedGatewayId === gateway.id;
                    const enabled = Boolean(drafts[gateway.id]?.enabled);
                    return (
                      <button
                        key={gateway.id}
                        type="button"
                        onClick={() => setSelectedGatewayId(gateway.id)}
                        className={`w-[220px] lg:w-full rounded-2xl border px-3 py-3 flex items-center gap-3 text-left transition-all ${active ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-black border-neutral-100 hover:border-neutral-300'}`}
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white text-black' : enabled ? 'native-gradient-button text-black' : 'bg-neutral-50 text-black'}`}>
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black truncate">{gateway.name}</span>
                          <span className={`block text-[9px] font-bold uppercase tracking-widest ${active ? 'text-white/55' : 'text-neutral-400'}`}>
                            {enabled ? 'Enabled' : gateway.region}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="finance-modal-config p-4 md:p-6 overflow-visible lg:overflow-y-auto lg:max-h-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500 max-w-xl">{selectedGateway.note}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-50 border border-neutral-100 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                      <LockKeyhole size={13} /> Secrets save through Cloud Functions
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 md:min-w-[220px]">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Gateway</p>
                      <p className="text-sm font-black text-black">{selectedDraft.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <Toggle checked={selectedDraft.enabled} onChange={(enabled) => updateDraft(selectedGateway.id, { enabled })} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-1">
                  {['test', 'live'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateDraft(selectedGateway.id, { mode })}
                      className={`h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedDraft.mode === mode ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-neutral-400'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-3">
                  {selectedGateway.fields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">{field.label}</span>
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 focus-within:border-black transition-colors">
                        <KeyRound size={15} className="text-neutral-300 shrink-0" />
                        <input
                          type={field.type}
                          value={selectedDraft.credentials?.[field.key] || ''}
                          onChange={(event) => updateDraft(selectedGateway.id, { credentials: { [field.key]: event.target.value } })}
                          placeholder={selectedPublicConfig.credentialSummary?.[field.key] || `Enter ${field.label.toLowerCase()}`}
                          className="h-12 flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-black placeholder:text-neutral-300"
                          autoComplete="off"
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-neutral-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-black">{selectedPublicConfig.configured ? 'Saved keys are masked' : 'Add keys once, then save'}</p>
                      <p className="text-sm text-neutral-500 mt-1">Public settings sync to the dashboard. Secret values are stored only by the backend.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveGateway(selectedGateway)}
                    disabled={saving === selectedGateway.id}
                    className="h-12 px-6 rounded-2xl native-gradient-button text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving === selectedGateway.id ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                    Save Gateway
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rangeDialogOpen && (
        <div className="finance-modal fixed inset-0 z-[1410] bg-black/45 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="finance-range-panel w-full md:max-w-lg rounded-t-[1.5rem] md:rounded-[1.25rem] bg-white border border-neutral-200 shadow-2xl shadow-black/30 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Custom report</p>
                <h3 className="text-2xl font-black tracking-tight text-black mt-1">Choose dates</h3>
              </div>
              <button type="button" onClick={() => setRangeDialogOpen(false)} className="w-11 h-11 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-black">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">From</span>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3">
                  <CalendarDays size={15} className="text-neutral-300" />
                  <input type="date" value={customRange.from} onChange={(event) => setCustomRange((current) => ({ ...current, from: event.target.value }))} className="h-12 flex-1 bg-transparent outline-none text-sm font-bold text-black" />
                </div>
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">To</span>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3">
                  <CalendarDays size={15} className="text-neutral-300" />
                  <input type="date" value={customRange.to} onChange={(event) => setCustomRange((current) => ({ ...current, to: event.target.value }))} className="h-12 flex-1 bg-transparent outline-none text-sm font-bold text-black" />
                </div>
              </label>
            </div>
            <button type="button" onClick={applyCustomRange} className="mt-5 h-12 w-full rounded-2xl native-gradient-button text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <SlidersHorizontal size={15} /> Apply range
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

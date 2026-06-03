import { useEffect, useMemo, useState } from 'react';
import * as FirebaseSDK from '../services/firebase';
import { db, functions, isFirebaseConfigured } from '../services/firebase';
import {
  cardGatewayIds,
  emptyDrafts,
  gatewayById,
  gatewayCards,
  getGatewayMissingRequiredFields
} from '../features/finance/config/gatewayConfig';
import { FinanceDesk } from '../features/finance/components/FinanceDesk';
import { FinanceTimelineChart } from '../features/finance/components/FinanceTimelineChart';
import { GatewaySettingsModal } from '../features/finance/components/GatewaySettingsModal';
import {
  buildChartBuckets,
  currencyOptionByCode,
  currencyOptions,
  dateToMs,
  formatDateTime,
  formatMoney,
  getAverageMetricMeta,
  getBookingAmountInCents,
  getPaidAverageByUnit,
  getPeriodRange,
  manualGatewayIds,
  normalizeAttempt
} from '../features/finance/utils/financeMetrics';

export { MigrationImportPanel } from '../features/finance/components/MigrationImportPanel';

export const FinancePaymentSettings = ({
  appId,
  businessId,
  isGuestWorkspace = false,
  canManageWorkspace,
  showToast,
  bookings = [],
  importedFinanceRecords = [],
  onMarkBookingPaid
}) => {
  const [saved, setSaved] = useState({});
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [saving, setSaving] = useState('');
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState('stripe');
  const [financeSummary, setFinanceSummary] = useState({});
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [period, setPeriod] = useState('all');
  const [deskView, setDeskView] = useState('transactions');
  const [search, setSearch] = useState('');
  const [deskStatusFilter, setDeskStatusFilter] = useState('all');
  const [deskSort, setDeskSort] = useState('newest');
  const [displayCurrency, setDisplayCurrency] = useState('ZAR');

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
  const effectiveSaved = useMemo(() => saved, [saved]);
  const selectedPublicConfig = effectiveSaved[selectedGateway.id] || {};
  const isManualGateway = manualGatewayIds.has(selectedGateway.id);
  const isCashGateway = selectedGateway.id === 'cash';

  const periodRange = useMemo(() => getPeriodRange(period), [period]);

  const manualBookingRows = useMemo(() => (
    (bookings || [])
      .filter((booking) => {
        if (!booking || booking.isExample) return false;
        const method = booking.paymentGateway || booking.paymentMethod || '';
        return isGuestWorkspace || manualGatewayIds.has(method) || booking.paymentStatus === 'manual_pending';
      })
      .map((booking) => {
        const method = booking.paymentGateway || booking.paymentMethod || 'cash';
        const paid = booking.paymentStatus === 'paid';
        return {
          id: `manual-${booking.id}`,
          gatewayType: isGuestWorkspace ? method : (manualGatewayIds.has(method) ? method : 'cash'),
          status: paid ? 'paid' : 'manual_pending',
          amountInCents: getBookingAmountInCents(booking),
          currency: booking.currency || 'ZAR',
          customerName: booking.clientName || booking.name || 'Client',
          customerEmail: booking.clientEmail || booking.email || '',
          description: booking.serviceName || booking.description || 'Manual booking payment',
          bookingId: booking.id || '',
          updatedAtMs: dateToMs(booking.paidAt || booking.updatedAt || booking.timestamp || booking.createdAt) || Date.now(),
          originalBooking: booking,
          canMarkPaid: !paid
        };
      })
  ), [bookings, isGuestWorkspace]);

  const importedFinanceRows = useMemo(() => (
    (importedFinanceRecords || [])
      .filter((record) => record && !record.isExample)
      .map((record) => ({
        id: `csv-${record.id || record.providerReference || record.bookingId}`,
        gatewayType: normalizeCsvGateway(record.gatewayType || record.paymentMethod || record.paymentGateway || 'cash'),
        status: normalizeCsvPaymentStatus(record.status || record.paymentStatus, Number(record.amountInCents || 0)),
        amountInCents: Number(record.amountInCents || 0),
        currency: record.currency || 'ZAR',
        customerName: record.customerName || record.clientName || 'Imported Client',
        customerEmail: record.customerEmail || record.clientEmail || '',
        description: record.description || 'Imported transaction',
        bookingId: record.bookingId || record.providerReference || '',
        providerReference: record.providerReference || '',
        updatedAtMs: dateToMs(record.updatedAtMs || record.updatedAt || record.paidAt || record.createdAt) || Date.now(),
        importedViaCsv: true
      }))
  ), [importedFinanceRecords]);

  const financeRecords = useMemo(() => (
    [...manualBookingRows, ...paymentAttempts, ...importedFinanceRows]
      .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0))
  ), [importedFinanceRows, manualBookingRows, paymentAttempts]);

  const effectiveFinanceRecords = useMemo(() => financeRecords, [financeRecords]);

  const inferredCurrency = useMemo(() => {
    if (currencyOptionByCode[financeSummary.currency]) return financeSummary.currency;
    const counts = effectiveFinanceRecords.reduce((acc, record) => {
      const code = currencyOptionByCode[record.currency] ? record.currency : '';
      if (code) acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ZAR';
  }, [effectiveFinanceRecords, financeSummary.currency]);

  const currencyStorageKey = useMemo(() => (
    `build-a-booking-finance-currency-${String(businessId || (isGuestWorkspace ? 'guest' : 'local')).replace(/[^a-zA-Z0-9_-]/g, '-')}`
  ), [businessId, isGuestWorkspace]);

  useEffect(() => {
    let stored = '';
    try {
      stored = window.localStorage.getItem(currencyStorageKey) || '';
    } catch {
      stored = '';
    }
    setDisplayCurrency(currencyOptionByCode[stored] ? stored : inferredCurrency);
  }, [currencyStorageKey, inferredCurrency]);

  const updateDisplayCurrency = (code) => {
    const next = currencyOptionByCode[code] ? code : inferredCurrency;
    setDisplayCurrency(next);
    try {
      window.localStorage.setItem(currencyStorageKey, next);
    } catch {
      // Local persistence is optional; the selected currency still applies for this session.
    }
  };

  const periodRecords = useMemo(() => {
    const startMs = periodRange.start.getTime();
    const endMs = periodRange.end.getTime();
    return effectiveFinanceRecords.filter((record) => {
      if (!record.updatedAtMs) return false;
      return record.updatedAtMs >= startMs && record.updatedAtMs < endMs;
    });
  }, [effectiveFinanceRecords, periodRange]);

  const financeMetrics = useMemo(() => {
    const paid = periodRecords.filter((record) => record.status === 'paid');
    const pending = periodRecords.filter((record) => record.status === 'manual_pending' || (record.canMarkPaid && !['paid', 'failed', 'cancelled', 'canceled'].includes(record.status)));
    const averageMeta = getAverageMetricMeta(period);
    return {
      revenueInCents: paid.reduce((sum, record) => sum + record.amountInCents, 0),
      paidCount: paid.length,
      pendingInCents: pending.reduce((sum, record) => sum + Number(record.amountInCents || 0), 0),
      pendingCount: pending.length,
      averageLabel: averageMeta.label,
      averageCaption: averageMeta.caption,
      averageInCents: getPaidAverageByUnit(effectiveFinanceRecords, averageMeta.unit)
    };
  }, [effectiveFinanceRecords, period, periodRecords]);

  const chartBuckets = useMemo(() => buildChartBuckets(periodRecords, period, periodRange), [period, periodRange, periodRecords]);

  const financeStatItems = useMemo(() => ([
    {
      label: 'Total Revenue',
      value: formatMoney(financeMetrics.revenueInCents, displayCurrency),
      caption: `${financeMetrics.paidCount} paid booking${financeMetrics.paidCount === 1 ? '' : 's'}`
    },
    {
      label: financeMetrics.averageLabel,
      value: formatMoney(financeMetrics.averageInCents, displayCurrency),
      caption: financeMetrics.averageCaption
    },
    {
      label: 'Pending Payments',
      value: formatMoney(financeMetrics.pendingInCents, displayCurrency),
      caption: `${financeMetrics.pendingCount} awaiting confirmation`
    }
  ]), [displayCurrency, financeMetrics]);

  const visibleDeskRows = useMemo(() => {
    const rows = effectiveFinanceRecords;
    const queryText = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const typeMatches = deskView === 'transactions'
        ? true
        : deskView === 'invoices'
          ? ['initiated', 'checkout_ready', 'paid'].includes(row.status)
          : row.status === 'paid';
      if (!typeMatches) return false;
      if (deskStatusFilter === 'paid' && row.status !== 'paid') return false;
      if (deskStatusFilter === 'open' && ['paid', 'failed', 'cancelled', 'canceled'].includes(row.status)) return false;
      if (deskStatusFilter === 'cash' && row.gatewayType !== 'cash') return false;
      if (deskStatusFilter === 'eft' && row.gatewayType !== 'manual_eft') return false;
      if (deskStatusFilter === 'card' && !cardGatewayIds.has(row.gatewayType)) return false;
      if (!queryText) return true;
      return [
        row.customerName,
        row.customerEmail,
        row.description,
        row.gatewayType,
        row.bookingId,
        row.status
      ].some((value) => String(value || '').toLowerCase().includes(queryText));
    });
    const sorted = [...filtered].sort((a, b) => {
      if (deskSort === 'oldest') return Number(a.updatedAtMs || 0) - Number(b.updatedAtMs || 0);
      if (deskSort === 'amount-high') return Number(b.amountInCents || 0) - Number(a.amountInCents || 0);
      if (deskSort === 'amount-low') return Number(a.amountInCents || 0) - Number(b.amountInCents || 0);
      if (deskSort === 'client') return String(a.customerName || '').localeCompare(String(b.customerName || ''));
      if (deskSort === 'status') return String(a.status || '').localeCompare(String(b.status || ''));
      return Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0);
    });
    return sorted.slice(0, 12);
  }, [deskSort, deskStatusFilter, deskView, effectiveFinanceRecords, search]);

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
    if (!businessId) {
      showToast?.('Sign in or save this workspace before saving payment settings.');
      return;
    }
    if (!functions) {
      showToast?.('Firebase Functions are not connected yet.');
      return;
    }
    const missingRequiredFields = getGatewayMissingRequiredFields({
      gateway,
      draft: drafts[gateway.id],
      publicConfig: effectiveSaved[gateway.id]
    });
    if (drafts[gateway.id]?.enabled && missingRequiredFields.length) {
      const labels = missingRequiredFields
        .map((fieldKey) => gateway.fields.find((field) => field.key === fieldKey)?.label || fieldKey)
        .join(', ');
      showToast?.(`Add ${labels} before enabling ${gateway.name}.`);
      return;
    }
    const manual = manualGatewayIds.has(gateway.id);
    setSaving(gateway.id);
    try {
      const callable = FirebaseSDK.httpsCallable(functions, 'savePaymentGatewaySettings');
      await callable({
        appId,
        businessId,
        gatewayType: gateway.id,
        enabled: drafts[gateway.id]?.enabled || false,
        mode: manual ? 'live' : (drafts[gateway.id]?.mode || 'test'),
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

  const downloadFinanceCsv = () => {
    const rows = effectiveFinanceRecords.map((row) => ({
      id: row.id,
      status: row.status,
      gateway: gatewayById[row.gatewayType]?.name || row.gatewayType || 'Gateway',
      client: row.customerName || 'Client',
      email: row.customerEmail || '',
      description: row.description || '',
      bookingId: row.bookingId || '',
      amount: formatMoney(row.amountInCents, displayCurrency),
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
      <div className="finance-hero rounded-[1.25rem] border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="finance-hero-accent" />
        <div className="finance-hero-head p-4 md:p-6 border-b border-neutral-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Revenue pulse</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-black">{periodRange.label}</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <label className="relative sm:w-36">
              <span className="sr-only">Display currency</span>
              <select
                value={displayCurrency}
                onChange={(event) => updateDisplayCurrency(event.target.value)}
                className="h-12 w-full rounded-2xl border border-neutral-100 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-black outline-none focus:border-black"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>{option.code}</option>
                ))}
              </select>
            </label>
            <div className="finance-period-tabs schedule-scope-toggle grid grid-cols-4 rounded-lg bg-neutral-100 p-1 min-w-full sm:min-w-[440px]">
              {[
                ['day', 'Day'],
                ['month', 'Monthly'],
                ['year', 'Year'],
                ['all', 'All time']
              ].map(([item, label]) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`finance-period-tab h-10 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${period === item ? 'is-active bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'text-neutral-500 hover:text-black'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="finance-hero-body p-4 md:p-6">
          <FinanceTimelineChart buckets={chartBuckets} currency={displayCurrency} statItems={financeStatItems} />
        </div>
      </div>

      <FinanceDesk
        deskSort={deskSort}
        deskStatusFilter={deskStatusFilter}
        deskView={deskView}
        displayCurrency={displayCurrency}
        onDownloadFinanceCsv={downloadFinanceCsv}
        onMarkBookingPaid={onMarkBookingPaid}
        onOpenGatewayModal={() => openGatewayModal()}
        rows={visibleDeskRows}
        search={search}
        setDeskSort={setDeskSort}
        setDeskStatusFilter={setDeskStatusFilter}
        setDeskView={setDeskView}
        setSearch={setSearch}
      />

      <GatewaySettingsModal
        open={gatewayModalOpen}
        drafts={drafts}
        selectedGateway={selectedGateway}
        selectedGatewayId={selectedGatewayId}
        selectedDraft={selectedDraft}
        selectedPublicConfig={selectedPublicConfig}
        saving={saving}
        isManualGateway={isManualGateway}
        isCashGateway={isCashGateway}
        onClose={() => setGatewayModalOpen(false)}
        onSelectGateway={setSelectedGatewayId}
        onUpdateDraft={updateDraft}
        onSaveGateway={saveGateway}
      />

    </section>
  );
};


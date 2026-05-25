import { useEffect, useMemo, useState } from 'react';
import { Check, CreditCard, KeyRound, Landmark, LockKeyhole, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
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

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-8 w-14 rounded-full border transition-all ${checked ? 'bg-black border-black' : 'bg-neutral-100 border-neutral-200'}`}
    aria-pressed={checked}
  >
    <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export const FinancePaymentSettings = ({ appId, businessId, canManageWorkspace, showToast }) => {
  const [saved, setSaved] = useState({});
  const [drafts, setDrafts] = useState(emptyDrafts);
  const [saving, setSaving] = useState('');
  const [activeGateway, setActiveGateway] = useState('stripe');

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
    });
  }, [appId, businessId]);

  const enabledCount = useMemo(() => (
    gatewayCards.filter((gateway) => saved[gateway.id]?.enabled).length
  ), [saved]);

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

  return (
    <section className="w-full max-w-7xl mx-auto">
      <header className="dashboard-page-header mb-5 md:mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">Finance</h2>
          <p className="mt-2 text-sm md:text-base text-neutral-500 max-w-2xl">
            Connect the payment gateways your clients use. Keys are encrypted by Cloud Functions and never exposed back to the browser.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl native-gradient-button flex items-center justify-center text-black">
            <LockKeyhole size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Secure Gateways</p>
            <p className="text-lg font-black text-black">{enabledCount} enabled</p>
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-[300px_1fr] gap-4 md:gap-6">
        <aside className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm h-fit">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Gateways</p>
          <div className="space-y-2">
            {gatewayCards.map((gateway) => {
              const Icon = gateway.icon;
              const active = activeGateway === gateway.id;
              return (
                <button
                  key={gateway.id}
                  type="button"
                  onClick={() => setActiveGateway(gateway.id)}
                  className={`w-full rounded-xl border px-3 py-3 flex items-center gap-3 text-left transition-all ${active ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-white text-black border-neutral-100 hover:border-neutral-300'}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white text-black' : 'bg-neutral-50 text-black'}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black truncate">{gateway.name}</span>
                    <span className={`block text-[10px] font-bold uppercase tracking-widest ${active ? 'text-white/55' : 'text-neutral-400'}`}>
                      {saved[gateway.id]?.enabled ? 'Enabled' : gateway.region}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
          {gatewayCards.map((gateway) => {
            const Icon = gateway.icon;
            const draft = drafts[gateway.id] || emptyDrafts[gateway.id];
            const publicConfig = saved[gateway.id] || {};
            const visible = activeGateway === gateway.id;
            return (
              <article
                key={gateway.id}
                className={`rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-[0_28px_90px_-70px_rgba(15,23,42,0.8)] ${visible ? 'block' : 'hidden lg:block'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-black">{gateway.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">{gateway.region}</p>
                    </div>
                  </div>
                  <Toggle checked={draft.enabled} onChange={(enabled) => updateDraft(gateway.id, { enabled })} />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-neutral-500">{gateway.note}</p>

                <div className="mt-5 grid grid-cols-2 rounded-xl border border-neutral-100 bg-neutral-50 p-1">
                  {['test', 'live'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateDraft(gateway.id, { mode })}
                      className={`h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${draft.mode === mode ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-neutral-400'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {gateway.fields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">{field.label}</span>
                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 focus-within:border-black transition-colors">
                        <KeyRound size={15} className="text-neutral-300" />
                        <input
                          type={field.type}
                          value={draft.credentials?.[field.key] || ''}
                          onChange={(event) => updateDraft(gateway.id, { credentials: { [field.key]: event.target.value } })}
                          placeholder={publicConfig.credentialSummary?.[field.key] || `Enter ${field.label.toLowerCase()}`}
                          className="h-12 flex-1 bg-transparent outline-none text-sm font-bold text-black placeholder:text-neutral-300"
                          autoComplete="off"
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck size={15} className="text-neutral-400" />
                    {publicConfig.configured ? 'Secrets are saved and masked.' : 'Add keys once, then save.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => saveGateway(gateway)}
                    disabled={saving === gateway.id}
                    className="h-12 px-5 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving === gateway.id ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                    Save Gateway
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

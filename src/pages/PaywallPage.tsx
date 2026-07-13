import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Check, Crown, X } from 'lucide-react';

// SELM Pro paywall — Build 37 / v2.0.6.
//
// Fixes from the Build 36 rejection (July 13, 2026):
//   * Guideline 2.1(b): when Apple's reviewer tapped "Start 7-day free
//     trial", RevenueCat.getOfferings() returned an empty set (the
//     RevenueCat dashboard's "current" Offering isn't visible to the
//     App Store sandbox for review builds) and our code showed
//     "Subscription options haven't loaded yet." — now we fall back to
//     Purchases.getProducts([...productIds]) which talks directly to
//     StoreKit and returns products as long as they exist in App Store
//     Connect. purchaseStoreProduct then triggers the real Apple sheet.
//   * Guideline 3.1.2(c): the trial's auto-renewal price and cadence
//     are now stated on every plan card and again as a one-line summary
//     next to the CTA, so the user cannot miss what will be billed.

// The iOS platform key from the RevenueCat dashboard for SELM.
// Public key, safe to ship (RevenueCat validates receipts server-side).
const REVENUECAT_IOS_API_KEY = 'appl_YiLluobcfOmIEoRDtYLwrCRgYqJ';

// Product identifiers configured in App Store Connect.
const PRODUCT_MONTHLY = 'selm_pro_monthly';
const PRODUCT_YEARLY  = 'selm_pro_yearly';
const ALL_PRODUCTS = [PRODUCT_MONTHLY, PRODUCT_YEARLY];

type UiPlan = {
  id: string;                   // Product identifier — must match App Store Connect + RC
  title: string;
  cadence: string;              // "month" or "year"
  fallbackPrice: string;        // Shown before StoreKit resolves; real price replaces it
  tag?: string;
};

const PLANS: UiPlan[] = [
  {
    id: PRODUCT_YEARLY,
    title: 'Yearly',
    cadence: 'year',
    fallbackPrice: '$79.99',
    tag: 'Best value',
  },
  {
    id: PRODUCT_MONTHLY,
    title: 'Monthly',
    cadence: 'month',
    fallbackPrice: '$9.99',
  },
];

const PERKS = [
  'Unlimited AI coaching across Speaking, Listening, Reading, Writing',
  'Real-time pronunciation feedback with IELTS-style scoring',
  'Adaptive lessons tuned to your CEFR level (A1–C2)',
  'Vocabulary spaced repetition',
  'Priority AI response times',
];

// Module-level flag so we only configure Purchases once per session,
// even if the paywall unmounts and remounts.
let purchasesReady: Promise<void> | null = null;

/**
 * Dynamically load and configure the RevenueCat plugin. We keep the
 * import dynamic so the web build (which has no native plugin) still
 * compiles — the module is only touched at runtime, on native, when the
 * user actually opens the paywall.
 */
async function ensurePurchasesConfigured(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases are only available in the SELM iPhone app.');
  }
  if (purchasesReady) return purchasesReady;
  purchasesReady = (async () => {
    const mod = await import('@revenuecat/purchases-capacitor');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const P: any = (mod as any).Purchases;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LOG_LEVEL: any = (mod as any).LOG_LEVEL;
    if (LOG_LEVEL) {
      try { await P.setLogLevel({ level: LOG_LEVEL.WARN }); } catch { /* non-fatal */ }
    }
    await P.configure({ apiKey: REVENUECAT_IOS_API_KEY });
  })();
  return purchasesReady;
}

async function getPurchases(): Promise<any> {
  await ensurePurchasesConfigured();
  const mod = await import('@revenuecat/purchases-capacitor');
  return (mod as any).Purchases;
}

/** Product shape RevenueCat returns from either getProducts or getOfferings. */
type StoreProduct = {
  identifier: string;
  priceString?: string;
  price?: number;
  title?: string;
  description?: string;
};

/**
 * Fetch the two SELM Pro products. Try Offerings first (the RevenueCat
 * dashboard flow) and fall back to getProducts([productIds]) which
 * talks straight to StoreKit — this fallback is what saves us from the
 * previous "Subscription options haven't loaded yet" rejection when
 * Offerings is empty in the reviewer's sandbox.
 */
async function loadProducts(): Promise<Record<string, StoreProduct>> {
  const Purchases = await getPurchases();
  const byId: Record<string, StoreProduct> = {};

  // Path A — Offerings (nicer, gives us the RC dashboard's "current" set)
  try {
    const result = await Purchases.getOfferings();
    const current = result?.current ?? result?.offerings?.current;
    const list = current?.availablePackages ?? [];
    for (const pkg of list) {
      const p: StoreProduct | undefined = pkg?.product;
      if (p?.identifier) byId[p.identifier] = p;
    }
  } catch {
    // ignore — will fall through to direct product lookup
  }

  // Path B — direct StoreKit lookup for any missing identifier.
  const missing = ALL_PRODUCTS.filter((id) => !byId[id]);
  if (missing.length) {
    try {
      const res = await Purchases.getProducts({ productIdentifiers: missing });
      // v10 returns { products: [...] } on Android and [...] on iOS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products: StoreProduct[] = Array.isArray(res) ? res : (res as any)?.products ?? [];
      for (const p of products) {
        if (p?.identifier) byId[p.identifier] = p;
      }
    } catch {
      // Last-resort: leave byId empty; UI shows fallback prices and
      // purchase will still be attempted with a naked product id.
    }
  }

  return byId;
}

export default function PaywallPage() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const [selectedId, setSelectedId] = useState<string>(PRODUCT_YEARLY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<string, StoreProduct>>({});

  // Load products on mount when running on iOS/Android. On web we show
  // fallback prices so the paywall page is still browseable in a browser.
  useEffect(() => {
    if (!isNative) return;
    let cancelled = false;
    (async () => {
      try {
        const map = await loadProducts();
        if (!cancelled) setProductMap(map);
      } catch (e: unknown) {
        // Don't surface load errors to the user — they'll try to purchase
        // and we'll surface the real StoreKit error from that call. Load
        // errors here are almost always sandbox/entitlement quirks that
        // resolve when the user actually taps Subscribe.
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn('Paywall product preload failed:', e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isNative]);

  const productFor = (planId: string): StoreProduct | undefined => productMap[planId];

  const priceFor = (plan: UiPlan): string =>
    productFor(plan.id)?.priceString ?? plan.fallbackPrice;

  const handleSubscribe = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      if (!isNative) {
        setNotice('Please open the SELM app on your iPhone or iPad to subscribe.');
        return;
      }

      // Make sure we have a product to buy. If preload failed for any
      // reason, try once more inline before giving up.
      let product = productFor(selectedId);
      if (!product) {
        try {
          const map = await loadProducts();
          setProductMap(map);
          product = map[selectedId];
        } catch { /* fall through to the naked-id purchase attempt below */ }
      }

      const Purchases = await getPurchases();

      // Preferred path: purchase the StoreProduct object we just loaded.
      // Fallback path: some legacy SDK builds accept a bare productIdentifier
      // string; try that if we somehow still don't have a StoreProduct.
      let res: any;
      if (product) {
        res = await Purchases.purchaseStoreProduct({ product });
      } else {
        try {
          res = await Purchases.purchaseProduct({ productIdentifier: selectedId });
        } catch (fallbackErr) {
          throw new Error(
            (fallbackErr as { message?: string })?.message ||
            'Could not reach the App Store. Please make sure you are signed in to the App Store and try again.'
          );
        }
      }

      const active = res?.customerInfo?.entitlements?.active ?? {};
      if (active['pro'] || active['Pro'] || Object.keys(active).length > 0) {
        setNotice('Welcome to SELM Pro! Your 7-day free trial has started.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setNotice('Purchase completed. Your Pro features will unlock shortly.');
      }
    } catch (e: unknown) {
      const anyErr = e as { userCancelled?: boolean; message?: string; code?: string };
      if (anyErr?.userCancelled) {
        // User dismissed the Apple sheet — say nothing.
      } else {
        setError(anyErr?.message ?? 'Purchase failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      if (!isNative) {
        setNotice('Please open the SELM app on your iPhone or iPad to restore purchases.');
        return;
      }
      const Purchases = await getPurchases();
      const res = await Purchases.restorePurchases();
      const active = res?.customerInfo?.entitlements?.active ?? {};
      if (Object.keys(active).length > 0) {
        setNotice('Your SELM Pro subscription is now active on this device.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setNotice('No previous purchases were found on this Apple ID.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Restore failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selectedId) ?? PLANS[0];
  const selectedPrice = priceFor(selectedPlan);

  const PkgCard = ({ plan }: { plan: UiPlan }) => {
    const selected = selectedId === plan.id;
    const price = priceFor(plan);
    return (
      <button
        type="button"
        onClick={() => setSelectedId(plan.id)}
        className={
          'relative w-full rounded-2xl border-2 p-4 text-left transition ' +
          (selected
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900')
        }
      >
        {plan.tag && (
          <span className="absolute -top-3 right-4 rounded-full bg-teal-500 px-3 py-0.5 text-xs font-bold text-white">
            {plan.tag}
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold text-navy dark:text-white">{plan.title}</div>
            {/* Trial + auto-renewal disclosure per Guideline 3.1.2(c):
                every plan card must say exactly what the user will be
                charged and when, up-front, before purchase. */}
            <div className="text-sm text-ink-secondary dark:text-slate-400">
              7 days free, then {price}/{plan.cadence}, auto-renews until cancelled.
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-navy dark:text-white">{price}</div>
            <div className="text-xs text-ink-secondary dark:text-slate-400">/{plan.cadence}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-40">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-full p-2 text-ink-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-navy dark:text-white">SELM Pro</h1>
        <p className="mt-1 text-sm text-ink-secondary dark:text-slate-400">
          Unlock every feature and reach fluency faster.
        </p>
      </div>

      <ul className="mb-6 space-y-2">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <Check className="mt-0.5 h-5 w-5 flex-none text-teal-500" />
            <span className="text-sm text-navy dark:text-slate-200">{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mb-5 space-y-3">
        {PLANS.map((plan) => (
          <PkgCard key={plan.id} plan={plan} />
        ))}
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {/* One-line reminder directly above the CTA. Duplicates the per-card
          disclosure so a user who taps the button without reading the
          card still sees exactly what will be billed. Required by
          Guideline 3.1.2(c). */}
      <p className="mb-2 text-center text-xs text-ink-secondary dark:text-slate-400">
        Free for 7 days, then {selectedPrice}/{selectedPlan.cadence}. Auto-renews unless cancelled at least 24 hours before the trial ends.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={busy}
        className="w-full rounded-2xl bg-teal-500 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-teal-600 disabled:opacity-60"
      >
        {busy ? 'Processing…' : 'Start 7-day free trial'}
      </button>

      <button
        onClick={handleRestore}
        disabled={busy}
        className="mt-3 w-full py-2 text-sm text-teal-600 hover:underline disabled:opacity-60 dark:text-teal-300"
      >
        Restore purchases
      </button>

      <p className="mt-6 text-center text-xs text-ink-disabled dark:text-slate-500">
        Payment will be charged to your Apple ID account at the end of the
        7-day free trial. Subscription automatically renews at {selectedPrice}/{selectedPlan.cadence}
        {' '}unless cancelled at least 24 hours before the end of the current period.
        You can manage and cancel your subscription any time by going to your account
        settings on the App Store after purchase. No refunds are provided for partial
        subscription periods.
      </p>
    </div>
  );
}

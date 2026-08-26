import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Check, Crown, X, RefreshCw } from 'lucide-react';

// SELM Pro paywall — Build 38 / v2.0.7.
//
// Fix history:
//   * Build 36: added trial disclosure copy (Guideline 3.1.2(c) — passed).
//   * Build 37: added two-tier product loading with getProducts() fallback
//     for the sandbox 'options haven't loaded' error.
//   * Build 38 (this file): Apple STILL saw "only spinning wheel when
//     trying to purchase" on iPad Air 11-inch (M3) / iPadOS 26.5.2.
//     Root cause: `purchaseStoreProduct()` in RevenueCat's Capacitor
//     plugin can await forever in sandbox conditions — the promise
//     simply never resolves or rejects — so our `busy` state stayed
//     `true` and the button read "Processing…" indefinitely. That's
//     exactly the "spinning wheel" the reviewer saw.
//
//     Fixes in this build (all defensive, none rely on Apple's sandbox
//     behaving well):
//
//       a) Hard timeout: every purchase / restore await is wrapped in
//          `withTimeout(promise, 30_000)`. If StoreKit or RevenueCat
//          silently hangs, we throw a clear error after 30s and re-
//          enable the button with a Retry action instead of leaving
//          the user staring at "Processing…" forever.
//
//       b) Preflight `canMakePayments()`: if the device can't make
//          payments (Screen Time restrictions, sandbox in bad state,
//          child account), we show a clear message BEFORE the user
//          taps Subscribe, so no wasted spinner cycle.
//
//       c) Removed the dead `purchaseProduct({productIdentifier})`
//          fallback — that method does not exist in
//          `@revenuecat/purchases-capacitor@10.x` and would throw
//          silently. Now if we can't get a StoreProduct we surface a
//          clear "products unavailable" error immediately.
//
//       d) Extensive `console.info` at every step (with `[SELM Pro]`
//          prefix) so future Xcode Console review can see exactly
//          where StoreKit stalls if it happens again.
//
//       e) Auto-preload runs once RevenueCat resolves — no dependency
//          on the paywall being mounted first.

// RevenueCat public app-specific API keys from the SELM RevenueCat
// dashboard (https://app.revenuecat.com/projects/4a61645a/apps).
// Public keys — safe to ship because receipts are validated server-side
// by RevenueCat against the App Store / Google Play.
const REVENUECAT_IOS_API_KEY = 'appl_YiLluobcfOmIEoRDtYLwrCRgYqJ';
// SELM (Play Store) app in RevenueCat — bundle com.selmapp.app.
// Public key, safe to ship. Receipts validated server-side by RevenueCat
// against Google Play.
const REVENUECAT_ANDROID_API_KEY = 'goog_ckhwiBGOgocklAUdwSsKQMbpxat';

function currentPlatformApiKey(): string {
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
  if (platform === 'android') return REVENUECAT_ANDROID_API_KEY;
  return REVENUECAT_IOS_API_KEY;
}

// Product identifiers configured in App Store Connect.
const PRODUCT_MONTHLY = 'selm_pro_monthly2';
const PRODUCT_YEARLY  = 'selm_pro_yearly';
const ALL_PRODUCTS = [PRODUCT_MONTHLY, PRODUCT_YEARLY];

// How long we let native purchase/restore/load calls hang before we
// treat them as failed and unblock the UI.
const PURCHASE_TIMEOUT_MS = 30_000;
const LOAD_TIMEOUT_MS = 12_000;
const RESTORE_TIMEOUT_MS = 20_000;

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

function log(...args: unknown[]) {
  // Keep a single tagged prefix so we can grep the Xcode Console log
  // for "[SELM Pro]" when debugging Apple review issues.
  // eslint-disable-next-line no-console
  console.info('[SELM Pro]', ...args);
}

/**
 * Race a promise against a timeout. If the timeout wins, we reject with
 * a clear error rather than leaving the caller `await`ing forever.
 */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err: Error & { code?: string } = new Error(
        `${label} did not respond within ${Math.round(ms / 1000)}s. ` +
        `Please make sure you are signed in to the App Store and try again.`
      );
      err.code = 'SELM_TIMEOUT';
      reject(err);
    }, ms);
  });
  return Promise.race([
    p.finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

/**
 * Dynamically load and configure the RevenueCat plugin. We keep the
 * import dynamic so the web build (which has no native plugin) still
 * compiles — the module is only touched at runtime, on native.
 */
async function ensurePurchasesConfigured(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases are only available in the SELM iPhone / iPad app.');
  }
  if (purchasesReady) return purchasesReady;
  purchasesReady = withTimeout((async () => {
    log('configure: importing plugin');
    const mod = await import('@revenuecat/purchases-capacitor');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const P: any = (mod as any).Purchases;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LOG_LEVEL: any = (mod as any).LOG_LEVEL;
    if (LOG_LEVEL) {
      try { await P.setLogLevel({ level: LOG_LEVEL.INFO }); } catch { /* non-fatal */ }
    }
    const apiKey = currentPlatformApiKey();
    log('configure: calling Purchases.configure() on', Capacitor.getPlatform(), 'with key prefix', apiKey.slice(0, 5));
    await P.configure({ apiKey });
    log('configure: done');
  })(), 10_000, 'Initialising subscriptions');
  // If configure fails/times out, allow a later call to retry rather
  // than locking us into a broken state for the rest of the session.
  purchasesReady.catch(() => { purchasesReady = null; });
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
 * talks straight to StoreKit.
 */
async function loadProductsInner(): Promise<Record<string, StoreProduct>> {
  const Purchases = await getPurchases();
  const byId: Record<string, StoreProduct> = {};

  // Path A — Offerings (nicer, gives us the RC dashboard's "current" set)
  try {
    log('load: getOfferings()');
    const result = await Purchases.getOfferings();
    const current = result?.current ?? result?.offerings?.current;
    const list = current?.availablePackages ?? [];
    log('load: offerings returned', list.length, 'packages');
    for (const pkg of list) {
      const p: StoreProduct | undefined = pkg?.product;
      if (p?.identifier) byId[p.identifier] = p;
    }
  } catch (e) {
    log('load: getOfferings failed', e);
  }

  // Path B — direct StoreKit lookup for any missing identifier.
  const missing = ALL_PRODUCTS.filter((id) => !byId[id]);
  if (missing.length) {
    try {
      log('load: getProducts()', missing);
      const res = await Purchases.getProducts({ productIdentifiers: missing });
      // v10 returns { products: [...] } on Android and [...] on iOS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products: StoreProduct[] = Array.isArray(res) ? res : (res as any)?.products ?? [];
      log('load: getProducts returned', products.length, 'products');
      for (const p of products) {
        if (p?.identifier) byId[p.identifier] = p;
      }
    } catch (e) {
      log('load: getProducts failed', e);
    }
  }

  return byId;
}

async function loadProducts(): Promise<Record<string, StoreProduct>> {
  return withTimeout(loadProductsInner(), LOAD_TIMEOUT_MS, 'Loading subscriptions');
}

export default function PaywallPage() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const [selectedId, setSelectedId] = useState<string>(PRODUCT_YEARLY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<string, StoreProduct>>({});
  const [preflightMsg, setPreflightMsg] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Preflight: on native, verify the device is allowed to make
  // payments AND preload products BEFORE the user taps Subscribe.
  useEffect(() => {
    if (!isNative) return;
    let cancelled = false;

    (async () => {
      try {
        log('preflight: canMakePayments()');
        const Purchases = await getPurchases();
        // canMakePayments returns { canMakePayments: bool } on some
        // versions of the SDK. Fall back gracefully if it's missing.
        try {
          const cmp = await withTimeout(
            Purchases.canMakePayments ? Purchases.canMakePayments() : Promise.resolve({ canMakePayments: true }),
            5_000,
            'canMakePayments'
          );
          const allowed = (cmp as { canMakePayments?: boolean })?.canMakePayments;
          if (allowed === false && !cancelled) {
            setPreflightMsg(
              'In-App Purchases are disabled on this device. ' +
              'Turn them on in Settings → Screen Time → Content & Privacy Restrictions.'
            );
            return;
          }
        } catch (e) {
          log('preflight: canMakePayments error (non-fatal)', e);
        }

        log('preflight: loadProducts()');
        const map = await loadProducts();
        if (cancelled) return;
        setProductMap(map);
        const found = Object.keys(map).length;
        log('preflight: preload complete —', found, 'products');
        if (found === 0) {
          setPreflightMsg(
            'Subscription plans are unavailable right now. ' +
            'Please try again in a moment.'
          );
        } else {
          setPreflightMsg(null);
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = (e as { message?: string })?.message ?? String(e);
        log('preflight failed', e);
        setPreflightMsg(msg);
      }
    })();

    return () => { cancelled = true; };
  }, [isNative, reloadTick]);

  const productFor = (planId: string): StoreProduct | undefined => productMap[planId];

  const priceFor = (plan: UiPlan): string =>
    productFor(plan.id)?.priceString ?? plan.fallbackPrice;

  const handleReload = () => {
    setError(null);
    setNotice(null);
    setPreflightMsg('Reloading subscriptions…');
    setProductMap({});
    setReloadTick((n) => n + 1);
  };

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

      log('subscribe: selected', selectedId);

      // Make sure we have a product to buy. If preload failed for any
      // reason, try once more inline before giving up.
      let product = productFor(selectedId);
      if (!product) {
        log('subscribe: product not preloaded, retrying loadProducts()');
        try {
          const map = await loadProducts();
          setProductMap(map);
          product = map[selectedId];
        } catch (e) {
          log('subscribe: inline reload failed', e);
        }
      }

      if (!product) {
        throw new Error(
          'This plan is not available right now. Please tap "Reload subscriptions" ' +
          'and try again, or make sure you are signed in to the App Store.'
        );
      }

      const Purchases = await getPurchases();

      // Purchase the StoreProduct — wrapped in a hard 30s timeout so
      // the button cannot spin forever if native side hangs. This is
      // the exact bug Apple's reviewer hit on iPad Air 11-inch (M3):
      // the spinner ran indefinitely because purchaseStoreProduct
      // never resolved. Now, worst case, they see a clear error and
      // can retry.
      log('subscribe: purchaseStoreProduct()', product.identifier);
      const res: any = await withTimeout(
        Purchases.purchaseStoreProduct({ product }),
        PURCHASE_TIMEOUT_MS,
        'Purchase',
      );
      log('subscribe: purchase result', res);

      const active = res?.customerInfo?.entitlements?.active ?? {};
      if (active['pro'] || active['Pro'] || Object.keys(active).length > 0) {
        setNotice('Welcome to SELM Pro! Your 7-day free trial has started.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        // The Apple sheet closed without an active entitlement.
        // Either the receipt is still validating on RevenueCat's side,
        // or Apple returned success but no entitlement was granted.
        setNotice('Purchase completed. Your Pro features will unlock shortly.');
      }
    } catch (e: unknown) {
      const anyErr = e as { userCancelled?: boolean; message?: string; code?: string };
      if (anyErr?.userCancelled) {
        // User dismissed the Apple sheet — say nothing.
        log('subscribe: user cancelled');
      } else {
        const msg = anyErr?.message ?? 'Purchase failed. Please try again.';
        log('subscribe: error', msg, anyErr?.code);
        setError(msg);
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
      log('restore: restorePurchases()');
      const Purchases = await getPurchases();
      const res: any = await withTimeout(
        Purchases.restorePurchases(),
        RESTORE_TIMEOUT_MS,
        'Restore',
      );
      log('restore: result', res);
      const active = res?.customerInfo?.entitlements?.active ?? {};
      if (Object.keys(active).length > 0) {
        setNotice('Your SELM Pro subscription is now active on this device.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setNotice('No previous purchases were found on this Apple ID.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      log('restore: error', msg);
      setError(`Restore failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selectedId) ?? PLANS[0];
  const selectedPrice = priceFor(selectedPlan);

  // Deliberately do NOT gate the CTA on productsLoaded. Instead the
  // paywall shows fallback prices immediately, the button is always
  // labelled "Start 7-day free trial", and if the user taps before the
  // silent product preload finishes, handleSubscribe will load them
  // inline (with its own timeout) and then proceed to purchase.
  // This gives a much cleaner UX than the previous "Loading
  // subscriptions…" state that could sit on-screen for tens of seconds
  // in the sandbox.
  const subscribeDisabled = busy;

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
          <span className="absolute -top-3 right-4 rounded-full bg-navy px-3 py-0.5 text-xs font-bold text-white">
            {plan.tag}
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold text-navy dark:text-white">{plan.title}</div>
            {/* Trial + auto-renewal disclosure per Guideline 3.1.2(c). */}
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
            <Check className="mt-0.5 h-5 w-5 flex-none text-navy" />
            <span className="text-sm text-navy dark:text-slate-200">{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mb-5 space-y-3">
        {PLANS.map((plan) => (
          <PkgCard key={plan.id} plan={plan} />
        ))}
      </div>

      {preflightMsg && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <span>{preflightMsg}</span>
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          <div>{error}</div>
          <button
            onClick={handleReload}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload subscriptions and try again
          </button>
        </div>
      )}

      {/* One-line reminder directly above the CTA. */}
      <p className="mb-2 text-center text-xs text-ink-secondary dark:text-slate-400">
        Free for 7 days, then {selectedPrice}/{selectedPlan.cadence}. Auto-renews unless cancelled at least 24 hours before the trial ends.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={subscribeDisabled}
        className="w-full rounded-2xl bg-navy py-3.5 text-base font-bold text-white shadow-md transition hover:bg-navy-700 disabled:opacity-60"
      >
        {busy ? 'Processing…' : 'Start 7-day free trial'}
      </button>

      <button
        onClick={handleRestore}
        disabled={busy}
        className="mt-3 w-full py-2 text-sm text-navy hover:underline disabled:opacity-60 dark:text-teal-300"
      >
        Restore purchases
      </button>

      <p className="mt-6 text-center text-xs text-ink-secondary dark:text-slate-500">
        Payment will be charged to your Apple ID account at the end of the
        7-day free trial. Subscription automatically renews at {selectedPrice}/{selectedPlan.cadence}
        {' '}unless cancelled at least 24 hours before the end of the current period.
        You can manage and cancel your subscription any time by going to your account
        settings on the App Store after purchase. No refunds are provided for partial
        subscription periods.
      </p>

      {/* Terms of Use + Privacy Policy links — required by App Store
          Guideline 3.1.2(c) for apps offering auto-renewable
          subscriptions. Must be functional (both routes are public
          in App.tsx). */}
      <p className="mt-3 text-center text-xs text-ink-secondary dark:text-slate-500">
        By subscribing you agree to our{' '}
        <a href="https://selmapp.com/terms" target="_blank" rel="noreferrer noopener" className="font-semibold text-navy hover:underline dark:text-teal-300">
          Terms of Use
        </a>{' '}and{' '}
        <a href="https://selmapp.com/privacy" target="_blank" rel="noreferrer noopener" className="font-semibold text-navy hover:underline dark:text-teal-300">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

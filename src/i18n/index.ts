/**
 * The interface language.
 *
 * Part 5, and the three rules it turns on:
 *
 *  - **§5.1 The user chooses, not the device.** *"Many francophone candidates
 *    carry phones set to English."* The device locale is the initial
 *    suggestion and nothing more.
 *  - **§5.1 Interface language and exam language are independent.** A
 *    candidate can read the app in French and sit IELTS in English. So this
 *    module knows nothing about `plan.examLocale`, and `practiceLanguage.ts`
 *    knows nothing about this. Neither imports the other, on purpose.
 *  - **§5.2 No user-facing string is written directly in a component.**
 *
 * **This extends a convention rather than introducing one.** The exam engine
 * has been bilingual by data since it was written — 119 `{ en, fr }` label
 * objects across `exam/definitions/` — and the app never adopted it. The
 * shape below is the same shape, keyed.
 */
import { useEffect, useState } from 'react';
import type { LanguageCode } from '../exam/model/types';
import { EN } from './en';
import { FR } from './fr';

export type UiLang = LanguageCode;
export const UI_LANG_KEY = 'selm_ui_lang';
export const UI_LANG_EVENT = 'selm:ui-lang';

export type Dict = typeof EN;
export type Key = keyof Dict;

const DICTS: Record<UiLang, Partial<Record<Key, string>>> = { en: EN, fr: FR };

/** The device locale is a suggestion. It is read once and never again. */
function suggested(): UiLang {
  try {
    return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

export function uiLang(): UiLang {
  try {
    const v = localStorage.getItem(UI_LANG_KEY);
    if (v === 'en' || v === 'fr') return v;
  } catch {
    /* fall through */
  }
  return suggested();
}

/** True once the user has actually chosen, as opposed to being suggested at. */
export function uiLangChosen(): boolean {
  try {
    const v = localStorage.getItem(UI_LANG_KEY);
    return v === 'en' || v === 'fr';
  } catch {
    return false;
  }
}

export function setUiLang(l: UiLang): void {
  try {
    localStorage.setItem(UI_LANG_KEY, l);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(UI_LANG_EVENT));
}

/**
 * Look up a string.
 *
 * **A missing French key falls back visibly in development and silently in
 * production** — Part 6's own row. A translator needs to see the hole; a
 * candidate needs a working page. `import.meta.env.DEV` is Vite's, and it is
 * compiled out of the production bundle entirely.
 */
export function ts(key: Key, lang: UiLang = uiLang()): string {
  const hit = DICTS[lang]?.[key];
  if (typeof hit === 'string') return hit;
  const en = EN[key];
  if (import.meta.env?.DEV && lang !== 'en') {
    return `⟨${String(key)}⟩ ${en}`;
  }
  return en ?? String(key);
}

/** Interpolation, kept deliberately primitive: `{n}` and nothing else. */
export function tf(key: Key, vars: Record<string, string | number>, lang: UiLang = uiLang()): string {
  return ts(key, lang).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/**
 * French number, percentage and currency formatting.
 *
 * §5.3 names the three the website already does and the app does not:
 * **119 865**, **42,1 %**, **390 $ CA**. All three come free from `Intl`
 * with the right locale, and none of them comes free without it.
 */
export function fmtNumber(n: number, lang: UiLang = uiLang()): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA').format(n);
}

export function fmtPercent(fraction: number, lang: UiLang = uiLang(), decimals = 1): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fraction);
}

export function fmtCurrency(amount: number, lang: UiLang = uiLang()): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Dates, formatted in the language the candidate CHOSE.
 *
 * ── The defect this exists for ────────────────────────────────────────────
 * Reported 29 August 2026: **dates rendered in Persian inside an English
 * interface.** `new Date(x).toLocaleDateString()` with no locale argument
 * follows the DEVICE, and the founder's phone is set to Persian. The app's
 * numbers had already been given an explicit locale — §5.3, right above —
 * and the dates were simply missed.
 *
 * It is the same rule §5.1 states for the interface itself: *the user
 * chooses, not the device.* A francophone candidate on an English phone reads
 * the app in French and must see French dates; the reverse holds too. Every
 * date a candidate sees goes through here, and no component calls
 * `toLocaleDateString` directly.
 */
export function fmtDate(value: number | string | Date, lang: UiLang = uiLang()): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(d);
}

export function fmtDateTime(value: number | string | Date, lang: UiLang = uiLang()): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

/** A `YYYY-MM` sitting month, as a month and year rather than a raw string. */
export function fmtMonth(yyyymm: string, lang: UiLang = uiLang()): string {
  const [y, m] = yyyymm.split('-').map(Number);
  if (!y || !m) return yyyymm;
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'short',
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/**
 * React binding. Kept in this file rather than a separate hooks module
 * because a component that imports `ts` and forgets `useUiLang` will not
 * re-render on a language change, and the two being one import makes that
 * mistake harder.
 */
export function useUiLangValue(): UiLang {
  const [l, setL] = useState<UiLang>(() => uiLang());
  useEffect(() => {
    const onChange = () => setL(uiLang());
    window.addEventListener(UI_LANG_EVENT, onChange);
    return () => window.removeEventListener(UI_LANG_EVENT, onChange);
  }, []);
  return l;
}

/** `const t = useT(); t('nav.dashboard')` */
export function useT(): (key: Key, vars?: Record<string, string | number>) => string {
  const lang = useUiLangValue();
  return (key, vars) => (vars ? tf(key, vars, lang) : ts(key, lang));
}

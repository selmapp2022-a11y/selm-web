import { useUiLangValue } from '../i18n';

type LogoProps = {
  variant?: 'horizontal' | 'symbol';
  className?: string;
  tone?: 'navy' | 'white';
  /**
   * Override the tagline's language. Defaults to the interface language the
   * candidate chose, which is the fix of 31 August: the default was the
   * literal `'en'` and NO caller passed anything, so the eight screens that
   * render the wordmark said KNOW YOUR SCORE to a candidate reading the app
   * in French — on the login screen, the consent screen and the sidebar of
   * every page. The French half of that tagline already existed; nothing was
   * asking for it.
   */
  lang?: 'en' | 'fr';
};

const ICON = '/selm-icon.png';

/**
 * The tagline, and why it changed on 2026-08-27.
 *
 * It read "English, simply" — the position the company is repositioning away
 * from. It is also wrong twice over now: the product's own flagship exam is
 * the TCF, which is French, and what it sells is not simplicity but a number
 * you can act on before you pay for a sitting. The marketing site already
 * says KNOW YOUR SCORE on every page in English and CONNAISSEZ VOTRE SCORE
 * on every page in French. The app now says the same thing, because a
 * company with two taglines has none.
 */
const TAGLINE = { en: 'Know your score', fr: 'Connaissez votre score' } as const;

/**
 * Official SELM logo.
 *  - Symbol: the brand icon (rounded navy tile with stylised "S").
 *  - Horizontal: icon + "SELM" wordmark with tagline.
 */
export function Logo({ variant = 'horizontal', className = '', tone = 'navy', lang }: LogoProps) {
  const ui = useUiLangValue();
  const tagline = TAGLINE[lang ?? ui];
  if (variant === 'symbol') {
    return <img src={ICON} alt="SELM" className={className || 'h-9 w-9'} />;
  }
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={ICON} alt="" aria-hidden="true" className="h-9 w-9 rounded-xl" />
      <div className="flex flex-col leading-none">
        <span className={`font-display text-xl font-bold tracking-tight ${tone === 'white' ? 'text-white' : 'text-navy'}`}>
          SELM
        </span>
        <span className={`text-[10px] font-medium uppercase tracking-[0.18em] ${tone === 'white' ? 'text-white/70' : 'text-ink-secondary'}`}>
          {tagline}
        </span>
      </div>
    </div>
  );
}

type LogoProps = {
  variant?: 'horizontal' | 'symbol';
  className?: string;
  tone?: 'navy' | 'white';
  /** Which language the tagline is set in. The app is English; the exam
   *  engine renders in whichever language the candidate chose. */
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
export function Logo({ variant = 'horizontal', className = '', tone = 'navy', lang = 'en' }: LogoProps) {
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
          {TAGLINE[lang]}
        </span>
      </div>
    </div>
  );
}

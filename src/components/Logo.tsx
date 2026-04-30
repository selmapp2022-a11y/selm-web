type LogoProps = { variant?: 'horizontal' | 'symbol'; className?: string; tone?: 'navy' | 'white' };

const ICON = '/selm-icon.png';

/**
 * Official SELM logo.
 *  - Symbol: the brand icon (rounded navy tile with stylised "S").
 *  - Horizontal: icon + "SELM" wordmark with tagline.
 */
export function Logo({ variant = 'horizontal', className = '', tone = 'navy' }: LogoProps) {
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
          English, simply
        </span>
      </div>
    </div>
  );
}

type LogoProps = { variant?: 'horizontal' | 'symbol'; className?: string; tone?: 'navy' | 'white' };

/**
 * SELM logo.
 *  - Symbol: rounded navy tile with a clean white "S" wordglyph + teal accent dot.
 *  - Horizontal: symbol + "SELM" wordmark with tagline.
 */
export function Logo({ variant = 'horizontal', className = '', tone = 'navy' }: LogoProps) {
  const fill = tone === 'white' ? '#FFFFFF' : '#183048';
  const fg = tone === 'white' ? '#183048' : '#FFFFFF';
  const accent = '#2EC4B6';

  const Symbol = (size: string) => (
    <svg className={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SELM">
      <rect width="64" height="64" rx="14" fill={fill} />
      {/* Clean stylised "S" using two rounded bars */}
      <path
        d="M44 22.5c-2.4-2.7-6.4-4.5-11-4.5-6 0-10 3-10 7 0 3.5 2.6 5.5 8 6.4l4 .7c5.4.9 8 2.9 8 6.4 0 4-4 7-10 7-4.6 0-8.6-1.8-11-4.5"
        stroke={fg}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Teal language-accent dot */}
      <circle cx="49" cy="49" r="4" fill={accent} />
    </svg>
  );

  if (variant === 'symbol') return Symbol(className || 'h-9 w-9');

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Symbol('h-9 w-9')}
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

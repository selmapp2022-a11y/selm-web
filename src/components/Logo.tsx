type LogoProps = { variant?: 'horizontal' | 'symbol'; className?: string; tone?: 'navy' | 'white' };

export function Logo({ variant = 'horizontal', className = '', tone = 'navy' }: LogoProps) {
  const stroke = tone === 'white' ? '#FFFFFF' : '#183048';
  const accent = '#2EC4B6';

  if (variant === 'symbol') {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill={stroke} />
        <path
          d="M20 22c0-3 2.4-5 6-5h12c3.6 0 6 2 6 5 0 4-3 6-7 6h-8c-3 0-5 2-5 4 0 3 2.5 5 6 5h14"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="44" r="3" fill={accent} />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg className="h-9 w-9" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill={stroke} />
        <path
          d="M20 22c0-3 2.4-5 6-5h12c3.6 0 6 2 6 5 0 4-3 6-7 6h-8c-3 0-5 2-5 4 0 3 2.5 5 6 5h14"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="44" r="3" fill={accent} />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold text-xl tracking-tight ${tone === 'white' ? 'text-white' : 'text-navy'}`}>
          SELM
        </span>
        <span className={`text-[10px] font-medium tracking-wider uppercase ${tone === 'white' ? 'text-white/70' : 'text-ink-secondary'}`}>
          English Learning App
        </span>
      </div>
    </div>
  );
}

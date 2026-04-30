import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { applyTheme, getStoredTheme, type Theme } from '../lib/theme';
import clsx from 'clsx';

export function ThemeToggle() {
  const [t, setT] = useState<Theme>(getStoredTheme());
  useEffect(() => { applyTheme(t); }, [t]);
  const opts: Array<{ k: Theme; Icon: any; label: string }> = [
    { k: 'light', Icon: Sun, label: 'Light' },
    { k: 'dark', Icon: Moon, label: 'Dark' },
    { k: 'auto', Icon: Monitor, label: 'Auto' },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-surface-muted p-1">
      {opts.map((o) => (
        <button
          key={o.k}
          onClick={() => setT(o.k)}
          className={clsx('flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition', t === o.k ? 'bg-white text-navy shadow-sm dark:bg-navy-700 dark:text-white' : 'text-ink-secondary')}
          title={o.label}
        >
          <o.Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

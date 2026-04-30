import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Mic, Headphones, BookOpen, PenLine, Flame, ChevronRight, Brain, Trophy } from 'lucide-react';
import { getSummary, type ProgressSummary, PROGRESS_EVENT } from '../lib/progress';

const skills = [
  { key: 'speaking',  to: '/speaking',  label: 'Speaking',  icon: Mic,        color: 'from-teal-500 to-teal-600',     desc: 'Real-time AI feedback' },
  { key: 'listening', to: '/listening', label: 'Listening', icon: Headphones, color: 'from-navy to-navy-700',         desc: 'Adaptive playback + news' },
  { key: 'reading',   to: '/reading',   label: 'Reading',   icon: BookOpen,   color: 'from-amber-500 to-orange-500',  desc: 'Any text, your level' },
  { key: 'writing',   to: '/writing',   label: 'Writing',   icon: PenLine,    color: 'from-purple-500 to-purple-600', desc: 'Live grammar coach' },
] as const;

async function fetchVocabSummary() {
  try {
    const review = await api.get('/vocabulary/my/review').then((r) => r.data).catch(() => null);
    const dueCount = Array.isArray(review) ? review.length : (review?.words?.length || 0);
    return { dueCount };
  } catch { return { dueCount: 0 }; }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: vocab } = useQuery({ queryKey: ['vocab-sum'], queryFn: fetchVocabSummary });

  const [progress, setProgress] = useState<ProgressSummary>(() => getSummary());
  useEffect(() => {
    const refresh = () => setProgress(getSummary());
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.username || '';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Still up?';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  // Suggested next skill: lowest count, fall back to speaking
  const suggested = [...skills].sort((a, b) =>
    progress.bySkill[a.key].count - progress.bySkill[b.key].count
  )[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* 1 — Greeting */}
      <header>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          {greeting}{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-1 text-ink-secondary">Pick a skill below and start practicing.</p>
      </header>

      {/* 2 — Compact progress strip (one row, no clutter) */}
      <Link to="/progress" className="card group flex flex-wrap items-center gap-5 p-5 hover:shadow-cardHover">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-teal text-white shadow-md">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="min-w-[140px]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">Your level</div>
          <div className="font-display text-2xl font-bold text-navy">Level {progress.level}</div>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="mb-1 flex justify-between text-xs text-ink-secondary">
            <span>{progress.xpThisLevel} / 200 XP</span>
            <span>{progress.xpToNext} to level {progress.level + 1}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${(progress.xpThisLevel / 200) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-700">
          <Flame className="h-5 w-5" />
          <span className="font-display font-bold">{progress.streak}</span>
          <span className="text-xs">day{progress.streak === 1 ? '' : 's'}</span>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-1 group-hover:text-teal" />
      </Link>

      {/* 3 — Suggested next */}
      {suggested && (
        <Link
          to={suggested.to}
          className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-teal p-6 text-white shadow-cardHover transition hover:-translate-y-0.5 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Suggested for you</div>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Practice {suggested.label}</h2>
              <p className="mt-1 text-sm opacity-90">{suggested.desc}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-3 font-semibold backdrop-blur transition group-hover:bg-white/25">
              Start <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      )}

      {/* 4 — Four skills (the focus) */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-navy">Practice the four skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((s) => {
            const stats = progress.bySkill[s.key];
            return (
              <Link key={s.to} to={s.to} className="group card relative overflow-hidden p-6 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-navy">{s.label}</h3>
                      {stats.count > 0 && (
                        <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal">Lv {stats.level}</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-secondary">{s.desc}</p>
                  </div>
                </div>
                <ChevronRight className="absolute right-5 top-5 h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-1 group-hover:text-teal" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 — Vocabulary card (single quiet item) */}
      <Link to="/vocabulary" className="card flex items-center gap-4 p-5 hover:shadow-cardHover">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <Brain className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-navy">Vocabulary</div>
          <div className="text-xs text-ink-secondary">
            {vocab?.dueCount ? `${vocab.dueCount} cards due for review` : 'Review and add new words'}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-disabled" />
      </Link>
    </div>
  );
}

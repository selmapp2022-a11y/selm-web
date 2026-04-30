import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Mic, Headphones, BookOpen, PenLine, Flame, Target, TrendingUp, ChevronRight, Brain, Sparkles, Calendar, Star, Trophy } from 'lucide-react';
import { getSummary, type ProgressSummary, PROGRESS_EVENT } from '../lib/progress';

const skills = [
  { to: '/speaking', label: 'Speaking', icon: Mic, color: 'from-teal-500 to-teal-600', desc: 'Real-time AI feedback' },
  { to: '/listening', label: 'Listening', icon: Headphones, color: 'from-navy to-navy-700', desc: 'Adaptive playback + news' },
  { to: '/reading', label: 'Reading', icon: BookOpen, color: 'from-amber-500 to-orange-500', desc: 'Any text, your level' },
  { to: '/writing', label: 'Writing', icon: PenLine, color: 'from-purple-500 to-purple-600', desc: 'Live grammar coach' },
];

async function fetchDashboards() {
  const sources = ['/speaking/dashboard/', '/listening/dashboard/', '/reading/dashboard/', '/writing/dashboard/'];
  const results = await Promise.allSettled(sources.map((s) => api.get(s).then((r) => r.data).catch(() => null)));
  return {
    speaking: results[0].status === 'fulfilled' ? results[0].value : null,
    listening: results[1].status === 'fulfilled' ? results[1].value : null,
    reading: results[2].status === 'fulfilled' ? results[2].value : null,
    writing: results[3].status === 'fulfilled' ? results[3].value : null,
  };
}

async function fetchVocabSummary() {
  try {
    const [progress, review] = await Promise.all([
      api.get('/vocabulary/my/progress').then((r) => r.data).catch(() => null),
      api.get('/vocabulary/my/review').then((r) => r.data).catch(() => null),
    ]);
    const dueCount = Array.isArray(review) ? review.length : (review?.words?.length || 0);
    const total = progress?.total_words || progress?.words_learned || 0;
    return { dueCount, total };
  } catch { return { dueCount: 0, total: 0 }; }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: dash } = useQuery({ queryKey: ['dash'], queryFn: fetchDashboards });
  const { data: vocab } = useQuery({ queryKey: ['vocab-sum'], queryFn: fetchVocabSummary });

  // Local progress (XP, level, streak) — updated live as the user completes exercises.
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

  const minutesToday = (dash?.speaking?.minutes_today ?? 0) + (dash?.listening?.minutes_today ?? 0) + (dash?.reading?.minutes_today ?? 0) + (dash?.writing?.minutes_today ?? 0);

  const skillBest: Record<string, number | null> = {
    Speaking: progress.bySkill.speaking.bestPct ?? (dash?.speaking?.average_score ?? null),
    Listening: progress.bySkill.listening.bestPct ?? (dash?.listening?.average_score ?? null),
    Reading: progress.bySkill.reading.bestPct ?? (dash?.reading?.average_score ?? null),
    Writing: progress.bySkill.writing.bestPct ?? (dash?.writing?.average_score ?? null),
  };
  const skillCount: Record<string, number> = {
    Speaking: progress.bySkill.speaking.count,
    Listening: progress.bySkill.listening.count,
    Reading: progress.bySkill.reading.count,
    Writing: progress.bySkill.writing.count,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="mt-1 text-ink-secondary">Ready for today's session?</p>
      </div>

      {/* Level + XP banner */}
      <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-teal p-6 text-white shadow-cardHover sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Your level</div>
              <div className="font-display text-3xl font-bold">Level {progress.level}</div>
              <div className="text-sm opacity-90">{progress.totalXP} XP earned · {progress.totalExercises} exercises</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur">
              <div className="font-display text-2xl font-bold"><Flame className="-mt-1 mr-1 inline h-5 w-5" />{progress.streak}</div>
              <div className="text-[11px] uppercase tracking-wider opacity-80">day streak</div>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur">
              <div className="font-display text-2xl font-bold"><Star className="-mt-1 mr-1 inline h-5 w-5" />{progress.xpToNext}</div>
              <div className="text-[11px] uppercase tracking-wider opacity-80">to lvl {progress.level + 1}</div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs opacity-80">
            <span>Progress to level {progress.level + 1}</span>
            <span>{progress.xpThisLevel}/200 XP</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(progress.xpThisLevel / 200) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Flame} label="Day streak" value={progress.streak ? `${progress.streak}d` : '—'} tone="orange" />
        <StatCard icon={Target} label="Minutes today" value={minutesToday ? `${minutesToday}` : '0'} tone="teal" />
        <StatCard icon={TrendingUp} label="Current level" value={user?.current_level || '—'} tone="navy" />
        <StatCard icon={Brain} label="Words due" value={vocab?.dueCount ? String(vocab.dueCount) : '0'} tone="purple" linkTo="/vocabulary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl font-bold text-navy">Practice the four skills</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((s) => {
              const score = skillBest[s.label];
              const count = skillCount[s.label];
              return (
                <Link key={s.to} to={s.to} className="group card relative overflow-hidden p-6 transition-transform hover:-translate-y-0.5">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-navy">{s.label}</h3>
                  <p className="text-sm text-ink-secondary">{s.desc}</p>
                  {score != null ? (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-secondary">best score · {count} done</span><span className="font-bold text-navy">{Math.round(score)}/100</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, score)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-ink-disabled">No exercises yet — try one!</div>
                  )}
                  <ChevronRight className="absolute right-5 top-5 h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-1 group-hover:text-teal" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-navy">Today</h2>
          <Link to="/vocabulary" className="card flex items-start gap-4 p-5 hover:shadow-cardHover">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600"><Brain className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="font-display font-bold text-navy">Vocabulary review</div>
              <div className="text-xs text-ink-secondary">{vocab?.dueCount || 0} cards due</div>
            </div>
            <ChevronRight className="h-5 w-5 self-center text-ink-disabled" />
          </Link>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal" />
              <h3 className="font-display font-bold text-navy">5-min daily challenge</h3>
            </div>
            <p className="mb-3 text-sm text-ink-secondary">A quick mixed-skill micro-lesson to keep your streak.</p>
            <Link to="/speaking" className="btn-accent w-full">Start challenge</Link>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-navy" />
              <h3 className="font-display font-bold text-navy">Weekly plan</h3>
            </div>
            <p className="text-sm text-ink-secondary">Generated from your interests and goal. View in dashboard tab.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, linkTo }: { icon: any; label: string; value: string; tone: 'orange' | 'teal' | 'navy' | 'purple'; linkTo?: string }) {
  const toneCls = { orange: 'bg-orange-100 text-orange-600', teal: 'bg-teal/10 text-teal-600', navy: 'bg-navy/10 text-navy', purple: 'bg-purple-100 text-purple-600' }[tone];
  const Body = (
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneCls}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-ink-secondary">{label}</div>
        <div className="font-display text-2xl font-bold text-navy">{value}</div>
      </div>
    </div>
  );
  return linkTo
    ? <Link to={linkTo} className="card p-5 hover:shadow-cardHover">{Body}</Link>
    : <div className="card p-5">{Body}</div>;
}

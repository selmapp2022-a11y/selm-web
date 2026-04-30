import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Mic, Headphones, BookOpen, PenLine, Flame, Target, TrendingUp, ChevronRight, Brain, Sparkles, Calendar } from 'lucide-react';

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

  const streak = dash?.speaking?.streak_days ?? dash?.listening?.streak_days ?? 0;
  const minutesToday = (dash?.speaking?.minutes_today ?? 0) + (dash?.listening?.minutes_today ?? 0) + (dash?.reading?.minutes_today ?? 0) + (dash?.writing?.minutes_today ?? 0);

  const skillScores = {
    Speaking: dash?.speaking?.average_score ?? dash?.speaking?.overall_score ?? null,
    Listening: dash?.listening?.average_score ?? null,
    Reading: dash?.reading?.average_score ?? null,
    Writing: dash?.writing?.average_score ?? null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="mt-1 text-ink-secondary">Ready for today's session?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Flame} label="Day streak" value={streak ? `${streak}d` : '—'} tone="orange" />
        <StatCard icon={Target} label="Minutes today" value={minutesToday ? `${minutesToday}` : '0'} tone="teal" />
        <StatCard icon={TrendingUp} label="Current level" value={user?.current_level || '—'} tone="navy" />
        <StatCard icon={Brain} label="Words due" value={vocab?.dueCount ? String(vocab.dueCount) : '0'} tone="purple" linkTo="/vocabulary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl font-bold text-navy">Practice the four skills</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((s) => {
              const score = skillScores[s.label as keyof typeof skillScores];
              return (
                <Link key={s.to} to={s.to} className="group card relative overflow-hidden p-6 transition-transform hover:-translate-y-0.5">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-navy">{s.label}</h3>
                  <p className="text-sm text-ink-secondary">{s.desc}</p>
                  {score != null && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-secondary">avg score</span><span className="font-bold text-navy">{Math.round(score)}/100</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, score)}%` }} />
                      </div>
                    </div>
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

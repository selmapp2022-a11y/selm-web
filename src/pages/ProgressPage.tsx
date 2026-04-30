import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Flame, Award, Mic, Headphones, BookOpen, PenLine, Brain, Calendar, ChevronRight, Lock } from 'lucide-react';
import clsx from 'clsx';
import { getSummary, getAchievements, getEvents, type ProgressSummary, type AchievementState, type SkillKey, PROGRESS_EVENT } from '../lib/progress';

const SKILL_META: Record<Exclude<SkillKey, 'vocabulary'>, { label: string; to: string; icon: any; color: string }> = {
  speaking:  { label: 'Speaking',  to: '/speaking',  icon: Mic,        color: 'from-teal-500 to-teal-600' },
  listening: { label: 'Listening', to: '/listening', icon: Headphones, color: 'from-navy to-navy-700' },
  reading:   { label: 'Reading',   to: '/reading',   icon: BookOpen,   color: 'from-orange-500 to-orange-600' },
  writing:   { label: 'Writing',   to: '/writing',   icon: PenLine,    color: 'from-purple-500 to-purple-600' },
};

export default function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary>(() => getSummary());
  const [achievements, setAchievements] = useState<AchievementState[]>(() => getAchievements());
  const [events, setEvents] = useState(() => getEvents());

  useEffect(() => {
    const refresh = () => {
      setSummary(getSummary());
      setAchievements(getAchievements());
      setEvents(getEvents());
    };
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const recent = [...events].reverse().slice(0, 12);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Your progress</h1>
        <p className="mt-1 text-ink-secondary">Track your growth across every skill.</p>
      </div>

      {/* Big level banner */}
      <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-teal p-6 text-white shadow-cardHover sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Overall</div>
              <div className="font-display text-3xl font-bold">Level {summary.level}</div>
              <div className="text-sm opacity-90">{summary.totalXP} XP · {summary.totalExercises} exercises · {summary.perfectCount} perfect</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BannerStat icon={Flame} value={summary.streak} label="day streak" />
            <BannerStat icon={Calendar} value={summary.longestStreak} label="longest" />
            <BannerStat icon={Award} value={`${unlockedCount}/${achievements.length}`} label="badges" />
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs opacity-80">
            <span>Progress to level {summary.level + 1}</span>
            <span>{summary.xpThisLevel}/200 XP</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(summary.xpThisLevel / 200) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Per-skill cards */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-navy">Skill progress</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(SKILL_META) as Array<keyof typeof SKILL_META>).map((k) => {
            const meta = SKILL_META[k];
            const stats = summary.bySkill[k];
            const pct = (stats.xpThisLevel / 120) * 100;
            return (
              <Link key={k} to={meta.to} className="group card relative overflow-hidden p-6 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', meta.color)}>
                    <meta.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-navy">{meta.label}</h3>
                      <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal">Lv {stats.level}</span>
                    </div>
                    <div className="text-sm text-ink-secondary">{stats.tier}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink-secondary">{stats.count} exercises · {stats.xp} XP</span>
                    <span className="font-semibold text-navy">{stats.xpThisLevel}/120</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {stats.bestPct != null && (
                    <div className="mt-2 text-xs text-ink-secondary">Best score: <span className="font-semibold text-navy">{Math.round(stats.bestPct)}%</span></div>
                  )}
                  {stats.count === 0 && (
                    <div className="mt-2 text-xs text-ink-disabled">No exercises yet — get started!</div>
                  )}
                </div>
                <ChevronRight className="absolute right-5 top-5 h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-1 group-hover:text-teal" />
              </Link>
            );
          })}
        </div>

        {summary.bySkill.vocabulary.count > 0 && (
          <Link to="/vocabulary" className="card mt-4 flex items-center gap-4 p-5 hover:shadow-cardHover">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600"><Brain className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="font-display font-bold text-navy">Vocabulary</div>
              <div className="text-xs text-ink-secondary">{summary.bySkill.vocabulary.count} reviews · {summary.bySkill.vocabulary.xp} XP</div>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-disabled" />
          </Link>
        )}
      </section>

      {/* Achievements */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-navy">Achievements</h2>
          <span className="text-sm text-ink-secondary">{unlockedCount} / {achievements.length} unlocked</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <div key={a.id} className={clsx(
              'card flex items-start gap-3 p-4 transition',
              a.unlocked ? 'border-teal/30 bg-gradient-to-br from-white to-teal/5' : 'opacity-60',
            )}>
              <div className={clsx('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl', a.unlocked ? 'bg-amber-100' : 'bg-surface-muted')}>
                {a.unlocked ? a.emoji : <Lock className="h-5 w-5 text-ink-disabled" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-navy">{a.title}</h4>
                  {a.unlocked && <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal">Unlocked</span>}
                </div>
                <p className="text-xs text-ink-secondary">{a.description}</p>
                {a.unlocked && a.unlockedAt && (
                  <div className="mt-1 text-[11px] text-ink-disabled">Earned {new Date(a.unlockedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent sessions */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-navy">Recent sessions</h2>
        {recent.length === 0 ? (
          <div className="card p-8 text-center text-ink-secondary">
            No sessions yet. <Link to="/dashboard" className="font-semibold text-teal hover:underline">Start practicing →</Link>
          </div>
        ) : (
          <div className="card divide-y divide-surface-divider overflow-hidden">
            {recent.map((e, i) => {
              const meta = (SKILL_META as any)[e.skill] as { label: string; icon: any; color: string } | undefined;
              const pct = typeof e.score === 'number' && typeof e.total === 'number' && e.total > 0
                ? Math.round((e.score / e.total) * 100)
                : (typeof e.score === 'number' ? Math.round(e.score) : null);
              return (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', meta?.color || 'from-purple-500 to-purple-600')}>
                    {meta ? <meta.icon className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-navy">{meta?.label || e.skill}{e.topic ? ` · ${e.topic}` : ''}</div>
                    <div className="text-xs text-ink-secondary">{new Date(e.ts).toLocaleString()}{pct != null ? ` · ${pct}%` : ''}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-teal">
                    <Star className="h-3.5 w-3.5" /> +{e.xp}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function BannerStat({ icon: Icon, value, label }: { icon: any; value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur">
      <div className="font-display text-2xl font-bold"><Icon className="-mt-1 mr-1 inline h-5 w-5" />{value}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

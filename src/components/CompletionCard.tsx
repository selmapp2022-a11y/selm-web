import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Sparkles, ArrowRight, LayoutDashboard, Flame, TrendingUp, Award } from 'lucide-react';
import clsx from 'clsx';
import { type ProgressEvent, type SkillKey, getSummary, recordProgress, evaluateAchievements, ACHIEVEMENTS } from '../lib/progress';

type Props = {
  skill: SkillKey;
  topic?: string;
  score?: number;       // raw correct OR 0..100
  total?: number;       // out of (omit for free-form)
  onNext: () => void;
  nextLabel?: string;
  extra?: React.ReactNode;
};

const PRAISE = ['Great job!', 'Nice work!', 'You crushed it!', 'Awesome session!', "You're on a roll!", 'Keep it up!'];
const PRAISE_PERFECT = ['Perfect score! 🎯', 'Flawless!', 'Outstanding — full marks!', 'You nailed every question!'];

export function CompletionCard({ skill, topic, score, total, onNext, nextLabel = 'Continue with another', extra }: Props) {
  const [recorded, setRecorded] = useState<{
    ev: ProgressEvent;
    leveledUp: boolean;
    newLevel: number;
    skillLeveledUp: boolean;
    newSkillLevel: number;
    newAchievements: string[];
  } | null>(null);

  useEffect(() => {
    const before = getSummary();
    const ev = recordProgress({ skill, topic, score, total });
    const newAchievements = evaluateAchievements(); // ids unlocked by THIS event
    const after = getSummary();
    setRecorded({
      ev,
      leveledUp: after.level > before.level,
      newLevel: after.level,
      skillLeveledUp: after.bySkill[skill].level > before.bySkill[skill].level,
      newSkillLevel: after.bySkill[skill].level,
      newAchievements,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const after = recorded ? getSummary() : null;
  const skillStats = after?.bySkill[skill];
  const pct = typeof score === 'number' && typeof total === 'number' && total > 0
    ? Math.round((score / total) * 100)
    : (typeof score === 'number' ? Math.round(score) : null);
  const perfect = typeof score === 'number' && typeof total === 'number' && score === total && total > 0;
  const headline = perfect
    ? PRAISE_PERFECT[Math.floor(Math.random() * PRAISE_PERFECT.length)]
    : PRAISE[Math.floor(Math.random() * PRAISE.length)];

  const newAchDefs = recorded
    ? ACHIEVEMENTS.filter((a) => recorded.newAchievements.includes(a.id))
    : [];

  return (
    <div className="card overflow-hidden">
      <div className={clsx(
        'relative px-6 py-8 text-white',
        perfect ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500' : 'bg-gradient-to-br from-teal to-navy',
      )}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            {perfect ? <Trophy className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-bold">{headline}</h3>
            {pct != null && (
              <p className="text-sm opacity-90">
                {typeof total === 'number' ? `You got ${score}/${total} correct` : `Score ${pct}/100`}
                {' · '}<span className="font-semibold">{pct}%</span>
              </p>
            )}
          </div>
        </div>

        {recorded && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill icon={Star} label={`+${recorded.ev.xp} XP`} />
            {after && <Pill icon={TrendingUp} label={`Level ${after.level}`} />}
            {after && after.streak > 0 && <Pill icon={Flame} label={`${after.streak}-day streak`} />}
            {recorded.leveledUp && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-600 shadow-md">🎉 LEVEL UP!</span>
            )}
            {recorded.skillLeveledUp && !recorded.leveledUp && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal shadow-md">
                {capitalize(skill)} → Lv {recorded.newSkillLevel}
              </span>
            )}
          </div>
        )}

        {/* Per-skill mini progress bar */}
        {skillStats && (
          <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur">
            <div className="mb-1 flex justify-between text-[11px] opacity-90">
              <span>{capitalize(skill)} · {skillStats.tier} (Lv {skillStats.level})</span>
              <span>{skillStats.xpThisLevel} / 120 XP</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(skillStats.xpThisLevel / 120) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Overall level progress */}
        {after && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] opacity-80">
              <span>Overall · {after.xpThisLevel} / 200 XP</span>
              <span>{after.xpToNext} to level {after.level + 1}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(after.xpThisLevel / 200) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Newly unlocked achievements */}
      {newAchDefs.length > 0 && (
        <div className="border-b border-surface-divider bg-amber-50 px-6 py-4">
          <div className="mb-2 flex items-center gap-2 text-amber-700">
            <Award className="h-5 w-5" />
            <span className="font-display font-bold">{newAchDefs.length === 1 ? 'New achievement unlocked!' : `${newAchDefs.length} new achievements!`}</span>
          </div>
          <div className="space-y-2">
            {newAchDefs.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="text-3xl">{a.emoji}</div>
                <div className="flex-1">
                  <div className="font-display font-bold text-navy">{a.title}</div>
                  <div className="text-xs text-ink-secondary">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {extra && <div className="border-b border-surface-divider px-6 py-4">{extra}</div>}

      <div className="flex flex-col gap-2 p-6 sm:flex-row">
        <button onClick={onNext} className="btn-primary flex-1 justify-center">
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
        <Link to="/progress" className="btn-secondary flex-1 justify-center">
          <LayoutDashboard className="h-4 w-4" /> View progress
        </Link>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

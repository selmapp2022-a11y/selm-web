import { Target } from 'lucide-react';
import type { PracticeSet } from '../lib/practiceTasks';
import { ts, useUiLangValue } from '../i18n';
import { Rich } from '../i18n/Rich';

/**
 * What this destination demands of this skill, in the exam's own units.
 *
 * ── The complaint this answers, on its third telling ────────────────────
 *
 * *"All the practice in the three English destinations is the same."* It was,
 * and the honest half of the reason is that IELTS Speaking Part 1 asks about
 * your home whether you need band 5 or band 8. **The exam does not band its
 * prompts.** Giving CLB 9 a "harder" question would be inventing a difference
 * the awarding body does not make, which is the one thing this product may
 * never do to look personalised.
 *
 * What differs is the demand, and it differs a great deal: CLB 9 needs band
 * 7.0 in speaking and CLB 4 needs 4.0. The same question, and a sufficient
 * answer to it is not remotely the same performance. That number is published,
 * it is checkable, and it was nowhere on the page — the candidate was left to
 * infer the bar from a prompt that cannot carry it.
 *
 * So the page states the bar. It does not claim the answer will be scored
 * against it here, because that is the scorer's business and its accuracy is
 * published elsewhere; it states what the destination requires.
 */
export function WhatYouNeed({ need, skill }: { need: PracticeSet['need']; skill: 'writing' | 'speaking' }) {
  const ui = useUiLangValue();
  if (!need) return null;
  const noun = ts(skill === 'writing' ? 'need.writing' : 'need.speaking', ui);

  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-muted px-4 py-3">
      <Target className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
      <p className="text-xs leading-relaxed text-ink-secondary">
        <Rich k="need.demand" vars={{ system: need.system, level: need.level, skill: noun }} />
        {need.score !== null && !need.onExamScale ? (
          <Rich k="need.onThisExam" vars={{ score: need.score.toFixed(1) }} />
        ) : (
          <>. </>
        )}
        {ts('need.sameTask', ui)}
      </p>
    </div>
  );
}

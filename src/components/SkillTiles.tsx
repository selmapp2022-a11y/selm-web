import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { lookFor } from '../lib/skillLook';
import { t } from '../exam/model/format';
import { ts, tf, useUiLangValue } from '../i18n';
import type { SittingRecord } from '../exam/model/history';
import { servableQuestions, servableSituations } from '../exam/engine/comprehension';
import type { ComprehensionSection, ExamDefinition, ProductionSection, SectionDefinition, SkillId } from '../exam/model/types';

/**
 * THE FOUR SKILLS, AS FOUR TILES.
 *
 * ── Why this replaced the four rows on Today ──────────────────────────────
 * The founder, 31 August, on the app as a whole: *"the app is cluttered."*
 * Today was six stacked sections, four of which were full-width rows of prose
 * with a status chip. Correct, glanceable at no distance, and the screen it
 * made was a report.
 *
 * A tile grid is not decoration here. The four skills are the product's own
 * unit — the plan addresses them, the exam awards them, the candidate thinks
 * in them — and a 2×2 grid puts all four inside one phone screen with the
 * hue that already identifies each of them elsewhere. Four rows do not fit;
 * they scroll, and scrolling is what turns four facts into four visits.
 *
 * ── AND IT ABSORBED A WHOLE SECTION ───────────────────────────────────────
 * Today carried a separate block, "What is not built for your exam", whose
 * job was to say that an exam awarding four skills has only some of them
 * built here. That fact is true and it is kept — but as the STATE OF A TILE
 * rather than a paragraph two scrolls below the skills it is about. A skill
 * this product has not built says so on its own face, greyed, unlinked, and
 * unmistakable. One section left the page and nothing was lost.
 *
 * The rows themselves are not deleted: they moved to `/progress`, which is
 * the page a candidate opens to study the numbers rather than to start.
 *
 * ── What a tile may never do ──────────────────────────────────────────────
 * Show a level this product cannot stand behind. A production skill has no
 * calibrated scorer bound to it, so its tile says NOT SCORED and shows no
 * number — the same refusal the rows made, in a quarter of the space.
 */
export function SkillTiles({
  exam,
  record,
}: {
  exam: ExamDefinition;
  record: SittingRecord | null;
}) {
  const ui = useUiLangValue();
  // Every skill the EXAM awards, not every section this product has built.
  // The difference is the point: a skill with no section is the "not built"
  // state, and it can only be seen if it is drawn.
  return (
    <div className="grid grid-cols-2 gap-3">
      {exam.awards.map((a) => {
        const section = exam.sections.find((s) => s.skill === a.skill) ?? null;
        return (
          <SkillTile
            key={a.skill}
            skill={a.skill}
            label={t(a.label, ui)}
            section={section}
            record={record}
          />
        );
      })}
    </div>
  );
}

/** A production section's tâche count, read outside a screen file. */
const tasksOf = (s: ProductionSection) => s.tasks.length;

const PRACTICE: Record<SkillId, string> = {
  listening: '/practice/listening',
  reading: '/practice/reading',
  writing: '/practice/writing',
  speaking: '/practice/speaking',
};

function SkillTile({
  skill,
  label,
  section,
  record,
}: {
  skill: SkillId;
  label: string;
  section: SectionDefinition | null;
  record: SittingRecord | null;
}) {
  const ui = useUiLangValue();
  const look = lookFor(skill);
  const Icon = look.icon;
  const counted = section?.kind === 'comprehension';
  const v = section && record ? record.skills[section.id] : null;
  const pct = v && v.total > 0 ? Math.round((v.correct / v.total) * 100) : null;

  const body = (
    <>
      {/* ── NO STATUS CHIP ───────────────────────────────────────────
          A "COUNTED" / "NOT SCORED" pill sat here beside the icon. The
          founder, on seeing it: *"take this NOT SCORED off the tiles, there is
          no need to write it."* He is right, and the reason is that it was
          saying the same thing twice: a counted skill already shows "29 of 39
          correct", and a skill with no scorer already says so in the line
          below, in a sentence rather than a shout.
          **The statement itself is not removed** — a production skill still
          says, on its own tile, that no calibrated scorer is bound to it. What
          went is the second copy of that fact, set in uppercase, competing
          with the skill's own name for the eye. */}
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
          section ? look.tile : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        {section ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
      </span>

      {/* The title carries the SKILL'S OWN HUE, which is how the app looked
          before the standardisation flattened it — "Speaking" teal, "Reading"
          amber, "Writing" violet, on every screen the skill appears. A tile
          whose only colour is a 40px icon does not read as that skill at a
          glance; the word does. */}
      <div className={`mt-3 font-display text-base font-bold leading-tight ${section ? look.ink : 'text-ink-secondary'}`}>
        {label}
      </div>

      {/* ── WHAT IS HERE, NOT WHAT IS MISSING ────────────────────────
          This line read "No calibrated scorer is bound to this skill yet."
          The founder: *"this is not advertising, it is anti-advertising."*
          He is right about the placement and it is worth being exact about
          why, because the rule it looked like it was serving is a real one.

          The rule is: **never publish a number this product cannot stand
          behind.** It is not: put the product's gaps on the screen a
          candidate opens several times a day. A writing tile that says a
          scorer is missing is answering a question nobody asked at the
          moment they are choosing what to practise — and it is not even the
          most useful true thing about that tile, because writing and speaking
          DO have the exam's own tâches behind them, each with four situations.

          So the tile says what is behind it. No score is shown, no score is
          implied, and the "not scored yet" statement stays where a number
          would otherwise be expected: on the task screen, and on `/progress`
          under the verdict it qualifies. */}
      <div className="mt-2 text-[11px] leading-snug text-ink-secondary">
        {!section ? (
          ts('today.tileNotBuiltShort', ui)
        ) : counted && v ? (
          <>
            <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div className={`h-full rounded-full ${look.bar}`} style={{ width: `${pct ?? 0}%` }} />
            </div>
            <span className="tabular-nums">{tf('today.tileCorrect', { correct: v.correct, total: v.total }, ui)}</span>
          </>
        ) : counted ? (
          // SERVABLE, not written. `scripts/counts-audit.mjs` refuses a raw
          // bank length on a screen, and it is right: IELTS listening holds
          // 160 questions and serves none until the audio is rendered, so the
          // bank length on this tile would be a number the product cannot
          // put in front of anyone. See `engine/comprehension.ts`.
          tf('today.tileQuestions', { n: servableQuestions(section as ComprehensionSection) }, ui)
        ) : (
          tf('today.tileTasks', {
            tasks: tasksOf(section as ProductionSection),
            situations: servableSituations(section as ProductionSection),
          }, ui)
        )}
      </div>
    </>
  );

  // A tile for a skill this product has not built is not a link. There is
  // nowhere honest for it to go, and a card that looks tappable and is not is
  // worse than one that plainly is not.
  return section ? (
    <Link
      to={PRACTICE[skill]}
      className={`card relative flex min-h-[8.5rem] flex-col overflow-hidden p-4 transition hover:shadow-cardHover ${look.soft}`}
    >
      {body}
    </Link>
  ) : (
    <div className="card flex min-h-[8.5rem] flex-col bg-surface-muted/60 p-4 opacity-90">{body}</div>
  );
}

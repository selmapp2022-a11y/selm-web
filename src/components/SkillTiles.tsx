import { Lock } from 'lucide-react';
import { Board, BoardGrid } from './Board';
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
    <BoardGrid>
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
    </BoardGrid>
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

  /* ── NO STATUS CHIP ──────────────────────────────────────────────
     A "COUNTED" / "NOT SCORED" pill sat beside the icon. The founder, on
     seeing it: *"take this NOT SCORED off the tiles, there is no need to
     write it."* He is right: a counted skill already shows "29 of 39
     correct", and a skill with no scorer already says so in the line below,
     in a sentence rather than a shout. The statement itself is not removed —
     what went is the second copy of it, set in uppercase, competing with the
     skill's own name for the eye.

     ── WHAT IS HERE, NOT WHAT IS MISSING ────────────────────────────
     This line read "No calibrated scorer is bound to this skill yet." The
     founder: *"this is not advertising, it is anti-advertising."* The rule it
     looked like it was serving is real — **never publish a number this
     product cannot stand behind** — but that rule does not say to put the
     product's gaps on the screen a candidate opens several times a day. So
     the tile says what is BEHIND it; no score is shown and none is implied,
     and the "not scored yet" statement stays where a number would otherwise
     be expected: on the task screen, and on `/progress` under the verdict it
     qualifies. */
  const meta = !section ? (
    ts('today.tileNotBuiltShort', ui)
  ) : counted && v ? (
    <>
      <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full ${look.bar}`} style={{ width: `${pct ?? 0}%` }} />
      </div>
      <span className="tabular-nums">{tf('today.tileCorrect', { correct: v.correct, total: v.total }, ui)}</span>
    </>
  ) : counted ? (
    // SERVABLE, not written. `scripts/counts-audit.mjs` refuses a raw bank
    // length on a screen, and it is right: IELTS listening holds 160
    // questions and serves none until the audio is rendered, so the bank
    // length on this tile would be a number the product cannot put in front
    // of anyone. See `engine/comprehension.ts`.
    tf('today.tileQuestions', { n: servableQuestions(section as ComprehensionSection) }, ui)
  ) : (
    tf('today.tileTasks', {
      tasks: tasksOf(section as ProductionSection),
      situations: servableSituations(section as ProductionSection),
    }, ui)
  );

  // A tile for a skill this product has not built is not a link. There is
  // nowhere honest for it to go, and a card that looks tappable and is not is
  // worse than one that plainly is not.
  return (
    <Board
      to={section ? PRACTICE[skill] : undefined}
      locked={!section}
      icon={section ? Icon : Lock}
      iconClass={look.tile}
      tint={look.soft}
      title={label}
      titleClass={look.ink}
      meta={meta}
    />
  );
}

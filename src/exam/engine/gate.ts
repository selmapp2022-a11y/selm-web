/**
 * Layer 1 — the deterministic gate.
 *
 * No model is called here and nothing costs money. Each rule id is
 * implemented once; which rules apply, and with what numbers, comes from the
 * task definition. That is the whole reason the TCF automatic-zero triggers
 * and the IELTS under-length penalty share this file instead of forking.
 */
import type { GateRule, Localised, TaskDefinition } from '../model/types';
import { keywordHits, longestCommonRun, overlapRatio, wordCount, DEFAULT_SEGMENTATION, type Segmentation } from './text';

export type GateFinding = {
  ruleId: GateRule['id'];
  kind: 'zero' | 'penalty' | 'warn';
  label: Localised;
  detail: Localised;
  /** The measured value that tripped the rule, for the candidate to see. */
  measured: string;
};

export type GateResult = {
  findings: GateFinding[];
  /** True when at least one rule with `kind: 'zero'` fired. */
  zeroed: boolean;
  /** Measurements shown whether or not a rule fired. */
  measurements: {
    wordCount: number;
    promptOverlap: number;
    scaffoldRatio: number;
    longestLiftedRun: number;
    topicHits: number;
    /** Hits per declared source, when the task declares any. */
    sourceHits: Array<{ id: string; label: Localised; hits: number; need: number }>;
  };
};

export function runGate(
  task: TaskDefinition,
  text: string,
  promptText: string,
  /**
   * How this exam's language is cut into words. Comes from the exam
   * definition's `locale` via `segmentationFor`. Defaulted rather than
   * required so no existing caller breaks — but a French exam that does not
   * pass it under-counts by 5% and wrongly zeroes a third of correct-length
   * answers, which is measured in `text.ts`.
   */
  seg: Segmentation = DEFAULT_SEGMENTATION,
): GateResult {
  const scaffold = (task.suppliedScaffold ?? []).join(' ');
  const m = {
    wordCount: wordCount(text, seg),
    promptOverlap: overlapRatio(text, promptText, seg),
    scaffoldRatio: scaffold ? overlapRatio(text, scaffold, seg) : 0,
    longestLiftedRun: longestCommonRun(text, promptText, seg),
    topicHits: keywordHits(text, task.topicKeywords, seg),
    sourceHits: [] as GateResult['measurements']['sourceHits'],
  };

  // Measured whether or not a rule reads it, so the candidate can see which
  // document they under-served even when the response was long enough to
  // pass. Half an answer that is not quite half enough to fail is the case
  // worth showing.
  for (const rule of task.gate) {
    if (rule.id === 'source_coverage') {
      for (const src of rule.sources) {
        m.sourceHits.push({
          id: src.id,
          label: src.label,
          hits: keywordHits(text, src.keywords, seg),
          need: rule.minHitsPerSource,
        });
      }
    }
  }

  const findings: GateFinding[] = [];
  const fire = (rule: GateRule, measured: string) =>
    findings.push({ ruleId: rule.id, kind: rule.verdict.kind, label: rule.verdict.label, detail: rule.verdict.detail, measured });

  for (const rule of task.gate) {
    switch (rule.id) {
      case 'empty':
        if (m.wordCount === 0) fire(rule, '0');
        break;
      case 'min_words':
        if (m.wordCount < rule.words) fire(rule, `${m.wordCount} / ${rule.words}`);
        break;
      case 'max_words':
        if (m.wordCount > rule.words) fire(rule, `${m.wordCount} / ${rule.words}`);
        break;
      case 'prompt_copy': {
        // The run threshold comes from the rule. It used to be the literal 8
        // below, which was the last exam-specific number left in this file
        // and it was wrong for any task whose prompt carries source material.
        const maxRun = rule.maxLiftedRun ?? 8;
        if (m.promptOverlap > rule.maxOverlapRatio || m.longestLiftedRun >= maxRun)
          fire(rule, `${Math.round(m.promptOverlap * 100)}% · run ${m.longestLiftedRun}/${maxRun}`);
        break;
      }
      case 'template_ratio':
        if (m.scaffoldRatio > rule.maxRatio) fire(rule, `${Math.round(m.scaffoldRatio * 100)}% / ${Math.round(rule.maxRatio * 100)}%`);
        break;
      case 'off_topic':
        if (m.wordCount > 0 && m.topicHits < rule.minKeywordHits)
          fire(rule, `${m.topicHits} / ${rule.minKeywordHits}`);
        break;
      case 'source_coverage': {
        if (m.wordCount === 0) break;
        const short = m.sourceHits.filter(
          (h) => rule.sources.some((s) => s.id === h.id) && h.hits < rule.minHitsPerSource
        );
        if (short.length)
          fire(rule, short.map((h) => `${h.id} ${h.hits}/${h.need}`).join(' · '));
        break;
      }
    }
  }

  return { findings, zeroed: findings.some((f) => f.kind === 'zero'), measurements: m };
}

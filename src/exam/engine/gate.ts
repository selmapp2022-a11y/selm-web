/**
 * Layer 1 — the deterministic gate.
 *
 * No model is called here and nothing costs money. Each rule id is
 * implemented once; which rules apply, and with what numbers, comes from the
 * task definition. That is the whole reason the TCF automatic-zero triggers
 * and the IELTS under-length penalty share this file instead of forking.
 */
import type { GateRule, Localised, TaskDefinition } from '../model/types';
import { keywordHits, longestCommonRun, overlapRatio, wordCount } from './text';

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
  measurements: { wordCount: number; promptOverlap: number; scaffoldRatio: number; longestLiftedRun: number; topicHits: number };
};

export function runGate(task: TaskDefinition, text: string, promptText: string): GateResult {
  const scaffold = (task.suppliedScaffold ?? []).join(' ');
  const m = {
    wordCount: wordCount(text),
    promptOverlap: overlapRatio(text, promptText),
    scaffoldRatio: scaffold ? overlapRatio(text, scaffold) : 0,
    longestLiftedRun: longestCommonRun(text, promptText),
    topicHits: keywordHits(text, task.topicKeywords),
  };

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
      case 'prompt_copy':
        if (m.promptOverlap > rule.maxOverlapRatio || m.longestLiftedRun >= 8)
          fire(rule, `${Math.round(m.promptOverlap * 100)}% · run ${m.longestLiftedRun}`);
        break;
      case 'template_ratio':
        if (m.scaffoldRatio > rule.maxRatio) fire(rule, `${Math.round(m.scaffoldRatio * 100)}% / ${Math.round(rule.maxRatio * 100)}%`);
        break;
      case 'off_topic':
        if (m.wordCount > 0 && m.topicHits < rule.minKeywordHits)
          fire(rule, `${m.topicHits} / ${rule.minKeywordHits}`);
        break;
    }
  }

  return { findings, zeroed: findings.some((f) => f.kind === 'zero'), measurements: m };
}

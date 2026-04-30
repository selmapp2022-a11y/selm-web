import { api, unwrap, parseAIContent } from './api';

export type GrammarError = {
  type: string;
  text: string;
  suggestion: string;
  explanation?: string;
  rule?: string;
  severity?: string;
};

export type GrammarCheck = {
  errors: GrammarError[];
  corrected_text?: string;
  original?: string;
};

export type WritingAssessment = {
  overall_score: number;
  grammar_score?: number;
  vocabulary_score?: number;
  coherence_score?: number;
  task_response_score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  errors?: GrammarError[];
};

export async function checkGrammar(text: string): Promise<GrammarCheck> {
  const { data } = await api.post('/ai/grammar-check', { text });
  // backend returns { content: "```json {...} ```", success: true }
  const parsed = parseAIContent<any>(data) || {};
  const errors = (parsed.errors || []).map((e: any) => ({
    type: e.type || 'grammar',
    text: e.error || e.original || e.text || '',
    suggestion: e.correction || e.suggestion || e.replacement || '',
    explanation: e.explanation,
    rule: e.rule,
    severity: e.severity,
  }));
  return {
    errors,
    original: parsed.original,
    corrected_text: parsed.corrected || parsed.corrected_text,
  };
}

export async function rewriteText(text: string, style: string): Promise<string> {
  // No dedicated endpoint — use grammar-check with a styling instruction.
  const { data } = await api.post('/ai/grammar-check', {
    text: `Rewrite the following in a ${style} tone, keeping the same meaning. Return ONLY the rewritten text. Original: """${text}"""`,
  });
  const parsed = parseAIContent<any>(data);
  if (parsed?.corrected) return parsed.corrected;
  if (typeof data?.content === 'string') {
    // strip markdown if present
    return data.content.replace(/^```(?:\w+)?\n?/, '').replace(/```$/, '').trim();
  }
  return text;
}

export async function assessWriting(text: string, prompt?: string): Promise<WritingAssessment> {
  const { data } = await api.post('/writing/assess', {
    text,
    prompt: prompt || '',
    assessment_type: 'comprehensive',
  });
  const a: any = unwrap(data, 'assessment');
  const scores = a?.scores || {};
  return {
    overall_score: Math.round(scores.overall ?? a?.overall_score ?? 0),
    grammar_score: scores.grammar ?? a?.grammar_score,
    vocabulary_score: scores.vocabulary ?? a?.vocabulary_score,
    coherence_score: scores.coherence ?? a?.coherence_score,
    task_response_score: scores.task_achievement ?? scores.task_response ?? a?.task_response_score,
    feedback: a?.feedback,
    strengths: a?.strengths,
    weaknesses: a?.weaknesses,
    errors: (a?.errors || []).map((e: any) => ({
      type: e.type || 'grammar',
      text: e.original || e.text || '',
      suggestion: e.corrected || e.suggestion || '',
      explanation: e.explanation,
      severity: e.severity,
    })),
  };
}

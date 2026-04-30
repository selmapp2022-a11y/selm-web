import { api } from './api';

export type GrammarCheck = {
  errors: Array<{
    type: string;
    text: string;
    suggestion: string;
    explanation?: string;
    start?: number;
    end?: number;
    severity?: 'low' | 'medium' | 'high';
  }>;
  corrected_text?: string;
  overall_score?: number;
};

export type WritingAssessment = {
  overall_score: number;
  grammar_score?: number;
  vocabulary_score?: number;
  coherence_score?: number;
  task_response_score?: number;
  tone?: string;
  feedback?: string;
  suggestions?: string[];
};

export async function checkGrammar(text: string): Promise<GrammarCheck> {
  const { data } = await api.post('/ai/grammar-check', { text, level: 'detailed' });
  return normalizeGrammar(data);
}

export async function rewriteText(text: string, style: 'formal' | 'simple' | 'natural' | 'academic' | 'friendly'): Promise<string> {
  const { data } = await api.post('/ai/grammar-check', {
    text,
    rewrite_style: style,
    return_rewritten: true,
  });
  return data?.rewritten || data?.corrected_text || text;
}

export async function assessWriting(text: string, prompt?: string): Promise<WritingAssessment> {
  const { data } = await api.post('/writing/assess', {
    text,
    prompt: prompt || '',
    assessment_type: 'comprehensive',
  });
  return {
    overall_score: data?.overall_score ?? 0,
    grammar_score: data?.grammar_score,
    vocabulary_score: data?.vocabulary_score,
    coherence_score: data?.coherence_score,
    task_response_score: data?.task_response_score,
    tone: data?.tone || data?.detected_tone,
    feedback: data?.feedback || data?.ai_feedback,
    suggestions: data?.suggestions,
  };
}

export async function listTemplates() {
  const { data } = await api.get('/writing/templates/');
  return data;
}

function normalizeGrammar(data: any): GrammarCheck {
  const errors = (data?.errors || data?.issues || []).map((e: any) => ({
    type: e.type || e.error_type || 'grammar',
    text: e.text || e.original || e.error_text || '',
    suggestion: e.suggestion || e.correction || e.replacement || '',
    explanation: e.explanation || e.message,
    start: e.start ?? e.offset,
    end: e.end ?? (e.offset != null && e.length != null ? e.offset + e.length : undefined),
    severity: e.severity,
  }));
  return {
    errors,
    corrected_text: data?.corrected_text || data?.corrected,
    overall_score: data?.overall_score ?? data?.score,
  };
}

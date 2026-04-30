import { api, unwrap, parseAIContent } from './api';

export type ReadingText = {
  id?: number;
  title: string;
  content: string;
  difficulty_level: string;
  word_count?: number;
  vocabulary?: Array<{ word: string; definition: string; example?: string }>;
  questions?: Array<{
    question: string;
    question_type?: string;
    options?: string[];
    correct_answer: string;
    explanation?: string;
  }>;
};

export async function generateText(topic: string, level: string, textType = 'article'): Promise<ReadingText> {
  const { data } = await api.post('/ai/reading/generate-text', {
    topic,
    level,
    text_type: textType,
    word_count: 250,
    vocabulary_count: 8,
    include_questions: true,
  });
  return normalize(data, level);
}

export async function enhanceText(text: string, level: string): Promise<ReadingText> {
  // backend doesn't have a true "analyze your text" endpoint that's stable,
  // so we ask the AI to generate a parallel exercise on the same topic and
  // also surface the user's text as the body when shorter responses come back.
  try {
    const { data } = await api.post('/ai/reading/generate-text', {
      topic: 'user_text',
      level,
      text_type: 'article',
      word_count: Math.max(150, Math.min(400, text.split(/\s+/).length)),
      vocabulary_count: 8,
      include_questions: true,
      original_text: text,
    });
    const r = normalize(data, level);
    // If backend echoed our text back, keep it; otherwise, prepend a note
    if (!r.content || r.content.length < 50) r.content = text;
    return r;
  } catch {
    return {
      title: 'Your text',
      content: text,
      difficulty_level: level,
      word_count: text.split(/\s+/).filter(Boolean).length,
    };
  }
}

function normalize(raw: any, level: string): ReadingText {
  // /ai/reading/generate-text returns flat:
  //   { text_content, vocabulary_used, comprehension_questions, reading_text_id, level, topic, word_count, ... }
  // Some other variants wrap inside `reading_text` or `text`, or send a JSON-in-content string.
  let body: any = raw;
  if (body && typeof body === 'object') {
    body = body.reading_text || body.text || body;
  }
  // Fallback: AI-content-as-string (e.g. wrapped in ```json fences)
  if (body?.content && typeof body.content === 'string' && body.content.includes('```')) {
    const parsed = parseAIContent<any>(body);
    if (parsed) body = parsed;
  }
  // Pull title from a sensible default. The text body often starts with "## Title\n..."
  let title: string = body?.title || body?.topic || '';
  const content: string = body?.text_content || body?.text || body?.content || body?.passage || body?.body || '';
  if (!title && typeof content === 'string') {
    const m = content.match(/^\s*#{1,6}\s*(.+?)\s*$/m);
    title = m ? m[1] : 'Reading passage';
  }
  const vocab = (body?.vocabulary_used || body?.vocabulary || body?.key_words || []).map((v: any) =>
    typeof v === 'string' ? { word: v, definition: '' } : { word: v.word || v.term, definition: v.definition || v.meaning, example: v.example });
  const questions = (body?.comprehension_questions || body?.questions || []).map((q: any) => ({
    question: q.question || q.text,
    question_type: q.question_type || q.type,
    options: q.options || q.choices,
    correct_answer: q.correct_answer || q.answer,
    explanation: q.explanation,
  }));
  return {
    id: body?.reading_text_id ?? body?.id,
    title,
    content: typeof content === 'string' ? content : '',
    difficulty_level: body?.level || body?.difficulty_level || level,
    word_count: body?.word_count,
    vocabulary: vocab,
    questions,
  };
}
// Suppress lint warning for unwrap import (kept for back-compat usage)
void unwrap;

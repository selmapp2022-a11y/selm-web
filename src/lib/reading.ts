import { api } from './api';

export type ReadingText = {
  id?: number;
  title: string;
  content: string;
  difficulty_level: string;
  word_count?: number;
  reading_time_minutes?: number;
  vocabulary?: Array<{ word: string; definition: string; example?: string }>;
  questions?: Array<{
    id?: number;
    question: string;
    question_type: 'multiple_choice' | 'true_false_ng' | 'matching';
    options?: string[];
    correct_answer: string;
    explanation?: string;
  }>;
};

export async function enhanceText(text: string, level?: string): Promise<ReadingText> {
  try {
    const { data } = await api.post('/ai/reading/enhance-text', {
      text,
      target_level: level || 'B1',
      include_vocabulary: true,
      include_questions: true,
      question_count: 5,
    });
    return data;
  } catch {
    const { data } = await api.post('/ai/reading/generate-text', {
      topic: 'user_provided',
      difficulty_level: level || 'B1',
      original_text: text,
    });
    return data;
  }
}

export async function generateText(topic: string, level: string): Promise<ReadingText> {
  const { data } = await api.post('/ai/reading/generate-text', {
    topic,
    difficulty_level: level,
    word_count: 250,
    include_questions: true,
    question_count: 5,
  });
  return data;
}

export async function listTexts() {
  const { data } = await api.get('/reading/texts/');
  return data;
}

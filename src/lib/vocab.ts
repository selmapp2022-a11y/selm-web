import { api } from './api';

export type VocabWord = {
  id: number;
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  part_of_speech?: string;
};

export async function dueWords(): Promise<VocabWord[]> {
  try {
    const { data } = await api.get('/vocabulary/my/review');
    const arr = data?.words_to_review || data?.words || (Array.isArray(data) ? data : []);
    return arr.map((w: any) => ({
      id: w.id ?? w.vocabulary_id ?? 0,
      word: w.word || w.term || '',
      definition: w.definition || w.meaning || '',
      example: w.example || w.sentence,
      pronunciation: w.pronunciation || w.ipa,
      part_of_speech: w.part_of_speech || w.pos,
    }));
  } catch {
    return [];
  }
}

export async function recordReview(vocabId: number, quality: 0 | 1 | 2 | 3 | 4 | 5) {
  if (!vocabId) return;
  try {
    await api.post(`/vocabulary/my/words/${vocabId}/progress`, {
      quality_score: quality,
      reviewed_at: new Date().toISOString(),
    });
  } catch { /* */ }
}

// Add a custom word to the user's vocabulary list. The backend will look up
// the word (or generate a learner-friendly definition with Gemini if it's
// new) and enrol the user; the word is then immediately available in the
// daily review queue.
export async function addWord(word: string): Promise<{
  success: boolean;
  word?: string;
  definition?: string;
  example?: string;
  error?: string;
}> {
  const trimmed = word.trim();
  if (!trimmed) return { success: false, error: 'Please type a word.' };
  try {
    const { data } = await api.post('/vocabulary/my/add', { word: trimmed });
    return {
      success: true,
      word: data.word,
      definition: data.definition,
      example: data.example,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.response?.data?.detail || e?.message || 'Could not add word.',
    };
  }
}

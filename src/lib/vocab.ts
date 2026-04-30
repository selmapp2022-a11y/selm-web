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

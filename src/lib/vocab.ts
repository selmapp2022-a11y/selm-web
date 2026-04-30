import { api } from './api';

export type VocabWord = {
  id: number;
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  part_of_speech?: string;
  difficulty_level?: string;
  next_review?: string;
  ease_factor?: number;
  interval_days?: number;
  review_count?: number;
};

export async function dueWords(): Promise<VocabWord[]> {
  try {
    const { data } = await api.get('/vocabulary/my/review');
    return Array.isArray(data) ? data : data?.words || [];
  } catch {
    return [];
  }
}

export async function myWords(): Promise<VocabWord[]> {
  try {
    const { data } = await api.get('/vocabulary/my/words');
    return Array.isArray(data) ? data : data?.words || [];
  } catch {
    return [];
  }
}

export async function recordReview(vocabId: number, quality: 0 | 1 | 2 | 3 | 4 | 5) {
  try {
    await api.post(`/vocabulary/my/words/${vocabId}/progress`, {
      quality_score: quality,
      reviewed_at: new Date().toISOString(),
    });
  } catch {
    // ignore: backend may not support
  }
}

// SM-2 client-side fallback when backend isn't tracking
export function sm2(prev: { ease: number; interval: number; reps: number }, quality: 0 | 1 | 2 | 3 | 4 | 5) {
  let { ease, interval, reps } = prev;
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { ease, interval, reps };
}

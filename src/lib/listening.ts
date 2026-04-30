import { api } from './api';

export type ListeningExercise = {
  id: number;
  title: string;
  difficulty_level: string;
  audio_url?: string;
  audio_text?: string;
  transcript?: string;
  duration_seconds?: number;
  questions?: Array<{
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
  }>;
};

export async function generateListening(level: string, topic: string) {
  const { data } = await api.post('/listening/generate', {
    difficulty_level: level,
    topic,
    duration_seconds: 60,
    question_count: 5,
  });
  return data as ListeningExercise;
}

export async function getRecommended() {
  try {
    const { data } = await api.get('/listening/exercises/recommended');
    return data;
  } catch {
    const { data } = await api.get('/listening/exercises/');
    return data;
  }
}

export async function getExercise(id: number) {
  const { data } = await api.get(`/listening/exercises/${id}`);
  return data as ListeningExercise;
}

export async function ttsForText(text: string): Promise<string | null> {
  try {
    const { data } = await api.post('/ai/text-to-speech', { text, voice: 'en-US-Standard' });
    return data?.audio_url || data?.url || null;
  } catch {
    return null;
  }
}

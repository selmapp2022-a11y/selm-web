import { api, unwrap } from './api';

export type ListeningQuestion = {
  id: string | number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
};

export type ListeningExercise = {
  id: string | number;
  title: string;
  level: string;
  audio_url?: string;
  speakers?: Array<{ name: string; voice_name?: string }>;
  transcript?: string;
  questions: ListeningQuestion[];
  points?: number;
};

export async function generateListening(level: string, topic: string): Promise<ListeningExercise> {
  const { data } = await api.post('/listening/generate', {
    difficulty_level: level,
    topic,
    duration_seconds: 60,
    question_count: 5,
  });
  const ex: any = unwrap(data, 'exercise');
  return {
    id: ex.id,
    title: ex.title || `${topic} — listening`,
    level: ex.level || level,
    audio_url: ex.audio_url,
    speakers: ex.speakers,
    transcript: ex.transcript || ex.dialogue || ex.audio_text,
    questions: (ex.questions || []).map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    })),
    points: ex.points,
  };
}

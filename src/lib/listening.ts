import { api, unwrap } from './api';
import { remapTranscript, pickSpeakerPair } from './speakerNames';

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
    include_transcript: true,
    include_vocabulary: true,
  });
  const ex: any = unwrap(data, 'exercise');
  const rawTranscript: string = ex.transcript || ex.dialogue || ex.audio_text || '';
  // Backend reuses generic speakers (Sarah/Tom or Dr. Anya/Liam) regardless of topic.
  // Rewrite the transcript to use a topic-specific pair so each topic feels different.
  const transcript = remapTranscript(rawTranscript, topic);
  const [a, b] = pickSpeakerPair(topic);
  const speakers = [{ name: a }, { name: b }];
  return {
    id: ex.id,
    title: ex.title || `${topic} — listening`,
    level: ex.level || level,
    audio_url: ex.audio_url,
    speakers,
    transcript,
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

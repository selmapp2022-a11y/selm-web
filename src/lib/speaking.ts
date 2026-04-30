import { api } from './api';

export type PhonemeScore = {
  phoneme: string;
  quality_score: number; // 0..100
  ipa?: string;
};

export type WordScore = {
  word: string;
  quality_score: number;
  phonemes?: PhonemeScore[];
};

export type SpeechAssessment = {
  overall_score: number;
  pronunciation_score: number;
  fluency_score?: number;
  pace_score?: number;
  prosody_score?: number;
  word_scores: WordScore[];
  feedback?: string;
  filler_words?: string[];
  pause_count?: number;
};

// Submit recorded audio for assessment
export async function assessRealtime(blob: Blob, prompt?: string): Promise<SpeechAssessment> {
  const fd = new FormData();
  fd.append('audio_data', blob, 'recording.webm');
  if (prompt) fd.append('prompt_text', prompt);
  const { data } = await api.post('/speaking/real-time-assessment', fd);
  return normalizeAssessment(data);
}

export async function audioConversation(blob: Blob, sessionId?: string): Promise<{
  transcript: string;
  ai_response: string;
  audio_url?: string;
  ai_audio_url?: string;
  session_id?: string;
}> {
  const fd = new FormData();
  fd.append('audio_file', blob, 'recording.webm');
  if (sessionId) fd.append('session_id', sessionId);
  const { data } = await api.post('/speaking/audio-conversation', fd);
  return data;
}

export async function startConversation(payload: { topic: string; level: string; turns?: number }) {
  const { data } = await api.post('/speaking/conversation/start-session', payload);
  return data;
}

export async function generateConversationPrompt(payload: { topic: string; level: string; turns?: number }) {
  const { data } = await api.post('/ai/conversation-practice', payload);
  return data;
}

export async function getRandomPrompt(skillType?: string, difficulty?: string) {
  const { data } = await api.get('/speaking/prompts/random', { params: { skill_type: skillType, difficulty } });
  return data;
}

function normalizeAssessment(raw: any): SpeechAssessment {
  // backend returns various shapes from SpeechAce — normalize to our type
  const speechace = raw?.speechace_response || raw?.text_score || raw;
  const overall = raw?.overall_score ?? speechace?.text_score?.quality_score ?? speechace?.quality_score ?? 0;
  const fluency = raw?.fluency_score ?? speechace?.fluency?.overall_metrics?.fluency_score;
  const pace = speechace?.fluency?.overall_metrics?.speech_rate ?? raw?.pace_score;
  const words = (speechace?.text_score?.word_score_list || speechace?.word_score_list || []).map((w: any) => ({
    word: w.word,
    quality_score: w.quality_score,
    phonemes: (w.phone_score_list || []).map((p: any) => ({
      phoneme: p.phone || p.phoneme,
      quality_score: p.quality_score,
      ipa: p.ipa,
    })),
  }));
  return {
    overall_score: Math.round(overall),
    pronunciation_score: Math.round(overall),
    fluency_score: fluency != null ? Math.round(fluency) : undefined,
    pace_score: pace != null ? Math.round(pace) : undefined,
    word_scores: words,
    feedback: raw?.feedback || raw?.ai_feedback,
    filler_words: raw?.filler_words || [],
    pause_count: raw?.pause_count,
  };
}

export function scoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-teal/10', text: 'text-teal-600', border: 'border-teal' };
  if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400' };
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-400' };
}

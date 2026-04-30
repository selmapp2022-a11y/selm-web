import { api, parseAIContent } from './api';
import { remapDialogueSpeakers } from './speakerNames';
import { variantOfTopic } from './topicVariants';

export type PhonemeScore = { phoneme: string; quality_score: number; ipa?: string };
export type WordScore = { word: string; quality_score: number; phonemes?: PhonemeScore[] };

export type SpeechAssessment = {
  overall_score: number;
  pronunciation_score: number;
  fluency_score?: number;
  pace_score?: number;
  word_scores: WordScore[];
  feedback?: string;
  filler_words?: string[];
  pause_count?: number;
};

// Submit recorded audio for assessment (multipart)
export async function assessRealtime(blob: Blob, _prompt?: string): Promise<SpeechAssessment> {
  const fd = new FormData();
  fd.append('audio_data', blob, 'recording.webm');
  const { data } = await api.post('/speaking/real-time-assessment', fd);
  return normalizeAssessment(data);
}

export type ConversationDialogue = {
  scenario: string;
  dialogue: Array<{ speaker: string; text: string }>;
};

export async function generateConversation(topic: string, level: string, turns = 6): Promise<ConversationDialogue> {
  // Vary the phrasing each call so the cached backend response doesn't repeat.
  const apiTopic = variantOfTopic(topic);
  const { data } = await api.post('/ai/conversation-practice', { topic: apiTopic, level, turns });
  const parsed = parseAIContent<any>(data) || {};
  const rawDialogue = parsed.dialogue || parsed.turns || [];
  return {
    scenario: parsed.scenario || `Practice talking about ${topic}.`,
    // Backend returns the same Sarah/Tom (or A/B) for every topic.
    // Remap to topic-specific speakers so each conversation feels distinct.
    dialogue: remapDialogueSpeakers(rawDialogue, topic),
  };
}

// Submit user's audio reply during conversation
export async function audioConversation(blob: Blob): Promise<{ transcript?: string; ai_response?: string; ai_audio_url?: string }> {
  const fd = new FormData();
  fd.append('audio_file', blob, 'recording.webm');
  try {
    const { data } = await api.post('/speaking/audio-conversation', fd);
    return {
      transcript: data?.transcript || data?.user_text,
      ai_response: data?.ai_response || data?.response || data?.message,
      ai_audio_url: data?.ai_audio_url || data?.audio_url,
    };
  } catch {
    return {};
  }
}

function normalizeAssessment(raw: any): SpeechAssessment {
  // Try common shapes
  let body: any = raw;
  if (raw?.success && raw?.assessment) body = raw.assessment;
  if (raw?.success && raw?.result) body = raw.result;
  // If it's wrapped in AI content
  const aiParsed = body?.content && typeof body.content === 'string' && body.content.includes('```')
    ? parseAIContent(body) : null;
  if (aiParsed) body = aiParsed;

  const sa = body?.speechace_response?.text_score || body?.text_score || body;
  const overall = body?.overall_score ?? sa?.quality_score ?? body?.scores?.overall ?? 0;
  const fluency = body?.fluency_score ?? sa?.fluency?.overall_metrics?.fluency_score ?? body?.scores?.fluency;
  const pace = sa?.fluency?.overall_metrics?.speech_rate ?? body?.pace_score;
  const words = (sa?.word_score_list || body?.word_scores || []).map((w: any) => ({
    word: w.word,
    quality_score: w.quality_score ?? w.score ?? 0,
    phonemes: (w.phone_score_list || w.phonemes || []).map((p: any) => ({
      phoneme: p.phone || p.phoneme,
      quality_score: p.quality_score ?? p.score ?? 0,
      ipa: p.ipa,
    })),
  }));
  return {
    overall_score: Math.round(overall),
    pronunciation_score: Math.round(overall),
    fluency_score: fluency != null ? Math.round(fluency) : undefined,
    pace_score: pace != null ? Math.round(pace) : undefined,
    word_scores: words,
    feedback: body?.feedback || body?.ai_feedback,
    filler_words: body?.filler_words || [],
    pause_count: body?.pause_count,
  };
}

export function scoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-teal/10', text: 'text-teal-600', border: 'border-teal' };
  if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400' };
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-400' };
}

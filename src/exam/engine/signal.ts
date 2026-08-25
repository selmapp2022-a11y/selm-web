/**
 * Layer 2 — the signal layer.
 *
 * Deterministic measurement of the response itself: transcription for a
 * spoken answer, and whatever acoustic measures the bound service returns
 * alongside it. Nothing here judges anything.
 *
 * For a spoken response this layer runs BEFORE the gate, because the gate
 * counts words and there are no words until something transcribes them.
 */
import { api } from '../../lib/api';
import type { Localised, Response, SignalBinding } from '../model/types';

export type SignalResult = {
  /** What the candidate is taken to have said. Empty when nothing was heard. */
  transcript: string;
  /** Words per minute over the recording. Null when not derivable. */
  wpm: number | null;
  durationSec: number | null;
  /** Service-reported measures, on the service's own scales. */
  measures: Array<{ id: string; label: Localised; value: number; outOf: number }>;
  /** The raw payload, so a judge can read it without a second upload. */
  raw: unknown;
  error: Localised | null;
};

const EMPTY: SignalResult = { transcript: '', wpm: null, durationSec: null, measures: [], raw: null, error: null };

const adapters = {
  /**
   * `/speech/evaluate`. Multipart. The backend chain is ElevenLabs ASR, then
   * SpeechAce, then Google STT, and it returns pronunciation and fluency on
   * a 0-100 scale alongside the transcript.
   */
  speech_evaluate(data: any): SignalResult {
    const d = data?.result ?? data ?? {};
    // The backend answers `transcript` as an object `{ text, words[] }` on
    // the mode=ielts path and as a bare string elsewhere. Both are accepted;
    // reading it as a string produced "[object Object]" on the first run.
    const rawTranscript = d.transcript ?? d.text ?? d.recognizedText;
    const transcript =
      typeof rawTranscript === 'string'
        ? rawTranscript
        : String(rawTranscript?.text ?? '');
    const pronunciation = num(d.pronunciation?.score ?? d.pronunciationScore ?? d.overallScore);
    const fluency = num(d.fluency?.score ?? d.fluencyScore);
    const wpm = round(num(d.fluency?.wpm ?? d.wpm));
    const durationSec = round(num(d.durationSec ?? d.duration ?? d.fluency?.durationSec));
    const measures: SignalResult['measures'] = [];
    if (pronunciation !== null)
      measures.push({ id: 'pronunciation', label: { en: 'Pronunciation', fr: 'Prononciation' }, value: pronunciation, outOf: 100 });
    if (fluency !== null)
      measures.push({ id: 'fluency', label: { en: 'Fluency', fr: 'Aisance' }, value: fluency, outOf: 100 });
    return { transcript, wpm, durationSec, measures, raw: data, error: null };
  },
};

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function round(v: number | null): number | null {
  return v === null ? null : Math.round(v);
}

export async function runSignal(binding: SignalBinding | undefined, response: Response): Promise<SignalResult> {
  // A typed response is already words; there is nothing to transcribe.
  if (response.kind === 'text') return { ...EMPTY, transcript: response.text };
  if (!binding || binding.kind === 'none') {
    return {
      ...EMPTY,
      error: {
        en: 'No transcriber is bound to this task, so a spoken response cannot be measured at all.',
        fr: "Aucun transcripteur n'est rattaché à cette tâche : une réponse orale ne peut donc pas être mesurée.",
      },
    };
  }
  try {
    const fd = new FormData();
    fd.append('audio', response.blob, 'response.webm');
    fd.append('language', binding.language);
    for (const [k, v] of Object.entries(binding.fields ?? {})) fd.append(k, v);
    const { data } = await api.post(binding.endpoint, fd);
    const out = adapters[binding.adapter](data);
    // Prefer the recorder's own duration; it is measured locally and is not
    // subject to whatever the service decides to report.
    const durationSec = round(response.durationSec || out.durationSec);
    const words = out.transcript.trim() ? out.transcript.trim().split(/\s+/).length : 0;
    return {
      ...out,
      durationSec,
      wpm: out.wpm ?? (durationSec && words ? Math.round((words / durationSec) * 60) : null),
    };
  } catch (e: any) {
    return {
      ...EMPTY,
      error: {
        en: `The transcriber could not be reached (${e?.message ?? 'network error'}).`,
        fr: `Le transcripteur est injoignable (${e?.message ?? 'erreur réseau'}).`,
      },
    };
  }
}

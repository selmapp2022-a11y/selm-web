import { api } from './api';

/**
 * Reading the marks off an uploaded score report.
 *
 * The backend returns only what the document prints and only the linguistic
 * half of it: the examination, its variant, the month it was sat, the marks
 * per skill, and the overall and CEFR when the document carries them. Name,
 * date of birth and candidate number are stripped server-side and never reach
 * this file - see `backend/app/api/v1/endpoints/attestation.py`.
 *
 * A failure is a normal outcome, not an exception to shout about: the
 * candidate types their marks, which is the path that already worked.
 */

export type ReadScore = {
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  mark: number | null;
  not_sat: boolean;
};

export type ScoreReading = {
  exam: 'ielts' | 'tcf' | 'tef' | 'celpip' | 'pte' | 'unknown';
  variant: 'general_training' | 'academic' | 'canada' | 'tout_public' | 'quebec' | 'unknown';
  sat_year: number | null;
  sat_month: number | null;
  scores: ReadScore[];
  overall: number | null;
  cefr: string | null;
  confidence: 'high' | 'medium' | 'low';
};

export type ReadResult =
  | { ok: true; reading: ScoreReading; latencyMs: number }
  | { ok: false; reason: string };

export async function readScoreReport(file: File): Promise<ReadResult> {
  const fd = new FormData();
  fd.append('file', file, file.name || 'report');
  try {
    const { data } = await api.post('/attestation/read', fd);
    if (data?.ok && data?.reading) {
      return { ok: true, reading: data.reading as ScoreReading, latencyMs: data?._meta?.latency_ms ?? 0 };
    }
    return { ok: false, reason: String(data?.reason ?? 'unreadable') };
  } catch (e: any) {
    const detail = e?.response?.data?.detail;
    return { ok: false, reason: typeof detail === 'string' ? detail : 'unreachable' };
  }
}

/** What to tell the candidate when a read does not produce marks. */
export function readFailureMessage(reason: string): string {
  if (reason.startsWith('unsupported_type')) {
    return 'That file type cannot be read. A photograph (JPG, PNG) or a PDF of the page works.';
  }
  if (reason === 'not_a_score_report') {
    return 'That does not look like a language examination score report. Your typed marks stand.';
  }
  if (reason === 'empty') return 'The file arrived empty. Try again, or type your marks below.';
  if (reason.startsWith('unreadable')) {
    return 'The marks could not be read from that image. Type them below — that is what counts anyway.';
  }
  if (typeof reason === 'string' && reason.includes('10 MB')) return reason;
  return 'The document could not be read just now. Type your marks below — that is what counts anyway.';
}

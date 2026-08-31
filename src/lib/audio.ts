// Audio recording utility with waveform support.
// Uses MediaRecorder + AudioContext for live amplitude data.

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped';

export type RecorderEvents = {
  onAmplitude?: (level: number) => void; // 0..1
  onStop?: (blob: Blob, durationMs: number) => void;
  onError?: (err: Error) => void;
};

/** The browser's own failure name, turned into the sentence that has a remedy. */
function explain(err: any): string {
  const name = err?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Microphone permission was refused. Allow it for this site in your browser’s address bar, then try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'No microphone was found. Connect one, or choose a different input in your system sound settings.';
  if (name === 'NotReadableError' || name === 'AbortError')
    return 'The microphone is in use by another application — a video call, usually. Close it and try again.';
  if (typeof window !== 'undefined' && !window.isSecureContext)
    return 'Recording needs a secure connection, and this page is not on one.';
  return err?.message ? `Could not start recording: ${err.message}` : 'Could not start recording.';
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private rafId: number | null = null;
  private startedAt = 0;
  state: RecorderState = 'idle';

  constructor(private events: RecorderEvents = {}) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      // pick a supported mime type
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const mimeType = candidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        const duration = Date.now() - this.startedAt;
        this.events.onStop?.(blob, duration);
        this.cleanup();
      };
      this.mediaRecorder.onerror = (e: any) => this.events.onError?.(e.error || new Error('recorder error'));

      // Setup amplitude monitoring
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);
      this.tickAmplitude();

      this.startedAt = Date.now();
      this.mediaRecorder.start(250); // gather chunks every 250ms
      this.state = 'recording';
    } catch (err: any) {
      // ── SAY WHICH FAILURE IT WAS ─────────────────────────────────────
      //
      // This re-threw the raw DOMException, and every one of them reached the
      // candidate as "Could not access microphone." — which is true of all
      // four causes and useful for none. The founder reported *"the
      // microphone was not working"* on 31 August, and that sentence is all
      // the screen was able to tell him, so it is all he was able to tell us.
      //
      // The names are the browser's own, and each one has a different remedy:
      // a permission the candidate can grant, a device that is not plugged
      // in, a device another application is holding — on macOS, usually a
      // video call — and a page that is not on HTTPS.
      const named = new Error(explain(err));
      named.name = err?.name ?? 'Error';
      this.events.onError?.(named);
      this.cleanup();
      throw named;
    }
  }

  stop() {
    if (this.mediaRecorder && this.state === 'recording') {
      this.state = 'stopped';
      this.mediaRecorder.stop();
    }
  }

  private tickAmplitude = () => {
    if (!this.analyser) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / bufferLength);
    this.events.onAmplitude?.(Math.min(1, rms * 3));
    this.rafId = requestAnimationFrame(this.tickAmplitude);
  };

  private cleanup() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.analyser = null;
    this.mediaRecorder = null;
  }
}

export function blobToFile(blob: Blob, name = 'recording.webm') {
  return new File([blob], name, { type: blob.type });
}

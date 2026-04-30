// Audio recording utility with waveform support.
// Uses MediaRecorder + AudioContext for live amplitude data.

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped';

export type RecorderEvents = {
  onAmplitude?: (level: number) => void; // 0..1
  onStop?: (blob: Blob, durationMs: number) => void;
  onError?: (err: Error) => void;
};

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
      this.events.onError?.(err);
      this.cleanup();
      throw err;
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

// Subtle audio cues using WebAudio (no asset files).
// Disabled by default if user has reduced-motion preference.

let ctx: AudioContext | null = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function tone(freq: number, duration = 0.12, type: OscillatorType = 'sine', gain = 0.05) {
  const c = getCtx();
  if (!c) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export const sounds = {
  success: () => { tone(660, 0.1); setTimeout(() => tone(880, 0.14), 80); },
  error: () => { tone(200, 0.16, 'square', 0.04); },
  tap: () => { tone(440, 0.05, 'sine', 0.03); },
  reveal: () => { tone(523, 0.1); },
};

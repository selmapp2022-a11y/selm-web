import { api, API_BASE } from './api';

const cache = new Map<string, string>();

export async function aiTTS(text: string, opts?: { language?: string; slow?: boolean }): Promise<string | null> {
  const key = `${opts?.language || 'en'}:${opts?.slow ? 1 : 0}:${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const token = localStorage.getItem('selm_token');
    const r = await fetch(`${API_BASE}/ai/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, language: opts?.language || 'en', slow: !!opts?.slow }),
    });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) {
      const data = await r.json();
      const url = data?.audio_url || data?.url || data?.file;
      if (url) { cache.set(key, url); return url; }
      return null;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

let voicesCache: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (voicesCache && voicesCache.length) return voicesCache;
  const all = speechSynthesis.getVoices();
  voicesCache = all.filter((v) => v.lang.toLowerCase().startsWith('en'));
  return voicesCache;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { voicesCache = null; loadVoices(); };
  setTimeout(() => loadVoices(), 50);
}

const FEMALE_HINTS = ['female', 'samantha', 'victoria', 'karen', 'allison', 'ava', 'susan', 'tessa', 'fiona', 'moira', 'serena', 'zira', 'catherine', 'kate', 'linda', 'heather', 'jessa', 'google us english', 'aria', 'jenny', 'michelle'];
const MALE_HINTS = ['male', 'daniel', 'fred', 'alex', 'tom ', 'oliver', 'aaron', 'arthur', 'david', 'mark', 'james', 'george', 'reed', 'guy', 'ryan', 'eric', 'brandon'];

function pickVoice(gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  const hints = gender === 'female' ? FEMALE_HINTS : MALE_HINTS;
  const opp = gender === 'female' ? MALE_HINTS : FEMALE_HINTS;
  for (const h of hints) {
    const v = voices.find((vv) => vv.name.toLowerCase().includes(h));
    if (v) return v;
  }
  // pick first that doesn't match the opposite gender hints
  const any = voices.find((vv) => !opp.some((h) => vv.name.toLowerCase().includes(h)));
  return any || voices[0];
}

const FEMALE_NAMES = new Set(['sarah', 'emily', 'maria', 'anna', 'lisa', 'amy', 'kate', 'laura', 'olivia', 'sophia', 'emma', 'jessica', 'rachel', 'julia', 'rebecca', 'linda', 'susan', 'karen', 'helen', 'elena', 'ana', 'nina', 'mia', 'grace', 'elise', 'ella', 'clara', 'fiona', 'natalie', 'holly', 'amelia', 'molly', 'jane', 'mary', 'patricia', 'jennifer', 'nancy', 'betty', 'dorothy', 'sandra', 'ashley', 'kimberly', 'donna', 'michelle', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'sharon', 'cynthia', 'kathleen', 'amber', 'shirley', 'angela', 'brenda', 'pamela', 'nicole', 'samantha', 'katherine', 'christine', 'debra', 'rachel', 'catherine', 'janet', 'maria', 'heather', 'diane', 'ruth', 'julie', 'joyce', 'virginia', 'victoria', 'kelly', 'lauren', 'christina', 'joan', 'evelyn', 'judith', 'megan', 'andrea', 'cheryl', 'hannah', 'jacqueline', 'martha', 'gloria', 'teresa', 'sara', 'janice', 'marie', 'julia', 'frances', 'judy', 'allison', 'beverly', 'isabella', 'theresa', 'diana', 'natalie', 'brittany', 'charlotte', 'doris', 'kayla', 'alexis', 'lori', 'tiffany', 'woman', 'girl', 'her', 'she']);
const MALE_NAMES = new Set(['tom', 'john', 'michael', 'david', 'james', 'peter', 'mark', 'paul', 'andrew', 'daniel', 'chris', 'alex', 'adam', 'luke', 'ben', 'sam', 'ryan', 'ethan', 'noah', 'william', 'henry', 'george', 'robert', 'steven', 'kevin', 'brian', 'jason', 'tony', 'carlos', 'jose', 'ali', 'ahmed', 'jack', 'jacob', 'joseph', 'thomas', 'charles', 'christopher', 'matthew', 'donald', 'anthony', 'edward', 'brian', 'ronald', 'kenneth', 'jeffrey', 'gary', 'nicholas', 'jonathan', 'larry', 'justin', 'scott', 'eric', 'stephen', 'frank', 'raymond', 'gregory', 'joshua', 'jerry', 'dennis', 'walter', 'patrick', 'aaron', 'douglas', 'nathan', 'zachary', 'kyle', 'jeremy', 'lucas', 'liam', 'mason', 'logan', 'oliver', 'elijah', 'aiden', 'man', 'boy', 'him', 'he', 'guy', 'sir', 'mr']);

const speakerCache = new Map<string, 'female' | 'male'>();
let altGender: 'female' | 'male' = 'female'; // toggles for unknown speakers

export function genderForSpeaker(rawSpeaker: string): 'female' | 'male' {
  const speaker = (rawSpeaker || '').trim();
  if (!speaker) return 'female';
  if (speakerCache.has(speaker)) return speakerCache.get(speaker)!;
  const first = speaker.toLowerCase().split(/[\s:,\-_/]+/)[0] || '';
  let g: 'female' | 'male';
  if (FEMALE_NAMES.has(first)) g = 'female';
  else if (MALE_NAMES.has(first)) g = 'male';
  else {
    // Alternate so two unknown speakers get different voices
    g = altGender;
    altGender = altGender === 'female' ? 'male' : 'female';
  }
  speakerCache.set(speaker, g);
  return g;
}

export function browserTTS(text: string, opts?: { rate?: number; speaker?: string; gender?: 'female' | 'male'; onEnd?: () => void }) {
  try {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = opts?.rate ?? 1;

    const gender = opts?.gender || (opts?.speaker ? genderForSpeaker(opts.speaker) : null);
    if (gender) {
      const v = pickVoice(gender);
      if (v) u.voice = v;
      // Pitch tweak guarantees two distinct voices even when only one system voice exists
      u.pitch = gender === 'female' ? 1.18 : 0.82;
    }
    if (opts?.onEnd) u.onend = opts.onEnd;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

/**
 * Parse a transcript like:
 *   "Dr. Anya: Hello.\nLiam: Hi there!"
 * into [{speaker, text}, ...]. Returns null if the text doesn't look like a multi-speaker dialogue.
 */
export function parseDialogue(raw: string): Array<{ speaker: string; text: string }> | null {
  if (!raw) return null;
  const text = raw.trim();
  // Matches "Name:" or "Dr. Anya:" at start of a line. Speaker name = letters/spaces/dots, max 32 chars.
  const re = /(^|\n)\s*([A-Z][A-Za-z .'\-]{0,31}?):\s+/g;
  const matches: Array<{ speaker: string; start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ speaker: m[2].trim(), start: m.index + m[1].length, end: m.index + m[0].length });
  }
  if (matches.length < 2) return null;
  const uniqueSpeakers = new Set(matches.map((mm) => mm.speaker.toLowerCase()));
  if (uniqueSpeakers.size < 2) return null;
  const lines: Array<{ speaker: string; text: string }> = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const body = text.slice(cur.end, next ? next.start : text.length).trim();
    if (body) lines.push({ speaker: cur.speaker, text: body });
  }
  return lines.length >= 2 ? lines : null;
}

export function speakSequence(parts: Array<{ text: string; speaker?: string }>, opts?: { rate?: number; onProgress?: (i: number) => void; onDone?: () => void }) {
  if (!('speechSynthesis' in window)) return () => {};
  speechSynthesis.cancel();
  let cancelled = false;
  const run = (i: number) => {
    if (cancelled || i >= parts.length) { opts?.onDone?.(); return; }
    opts?.onProgress?.(i);
    const p = parts[i];
    browserTTS(p.text, {
      rate: opts?.rate,
      speaker: p.speaker,
      onEnd: () => run(i + 1),
    });
  };
  run(0);
  return () => { cancelled = true; speechSynthesis.cancel(); };
}

export function stopBrowserTTS() {
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* */ }
}

void api;

/**
 * Backend often returns the same generic speakers (Sarah/Tom or A/B) for every topic.
 * We remap them to topic-appropriate names so each topic has its own characters.
 *
 * Pairs are chosen so that:
 *  - the two names sound clearly different (different gender when possible)
 *  - the names match the genderForSpeaker() heuristic in tts.ts so voices differ
 */

type Pair = [string, string];

const TOPIC_PAIRS: Record<string, Pair> = {
  // Speaking conversation topics
  food: ['Maria', 'Carlos'],
  cooking: ['Maria', 'Carlos'],
  travel: ['Emily', 'David'],
  work: ['Sophia', 'Michael'],
  movies: ['Jessica', 'Daniel'],
  hobbies: ['Grace', 'Lucas'],
  'daily routine': ['Mia', 'Adam'],
  shopping: ['Lily', 'Ryan'],
  health: ['Anna', 'Peter'],
  family: ['Emma', 'Noah'],
  music: ['Ava', 'Oliver'],
  sports: ['Olivia', 'Jake'],
  school: ['Chloe', 'Henry'],
  education: ['Chloe', 'Henry'],

  // Listening / news topics
  technology: ['Hannah', 'Ethan'],
  science: ['Rachel', 'Marcus'],
  business: ['Rachel', 'James'],
  climate: ['Sophie', 'Mark'],
  culture: ['Isabella', 'Liam'],
  news: ['Anchor Sarah', 'Reporter Tom'],
  lifestyle: ['Zoe', 'Leo'],
  conversation: ['Lisa', 'Ryan'],
  commute: ['Karen', 'Mike'],
  photography: ['Clara', 'Ben'],
  books: ['Alice', 'Charlie'],
  money: ['Jane', 'Frank'],
  home: ['Emma', 'Jack'],
  general: ['Anna', 'David'],
};

const FALLBACK_PAIRS: Pair[] = [
  ['Sophia', 'Liam'],
  ['Olivia', 'Noah'],
  ['Emma', 'James'],
  ['Ava', 'William'],
  ['Mia', 'Lucas'],
  ['Charlotte', 'Henry'],
];

export function pickSpeakerPair(topic: string): Pair {
  const key = (topic || '').toLowerCase().trim();
  if (TOPIC_PAIRS[key]) return TOPIC_PAIRS[key];
  // Try matching prefix words
  for (const k of Object.keys(TOPIC_PAIRS)) {
    if (key.includes(k) || k.includes(key)) return TOPIC_PAIRS[k];
  }
  // Deterministic fallback so the same topic always gets the same pair
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK_PAIRS[h % FALLBACK_PAIRS.length];
}

export type DialogueLine = { speaker: string; text: string };

export function remapDialogueSpeakers(dialogue: DialogueLine[], topic: string): DialogueLine[] {
  if (!dialogue || dialogue.length === 0) return dialogue;
  const [a, b] = pickSpeakerPair(topic);

  // Collect unique speakers in order of appearance.
  const seen: string[] = [];
  for (const d of dialogue) {
    if (d.speaker && !seen.includes(d.speaker)) seen.push(d.speaker);
  }
  const map = new Map<string, string>();
  if (seen[0]) map.set(seen[0], a);
  if (seen[1]) map.set(seen[1], b);
  const extras = ['Sophia', 'Liam', 'Ava', 'Noah', 'Emma', 'Jacob'];
  for (let i = 2; i < seen.length; i++) map.set(seen[i], extras[(i - 2) % extras.length]);

  return dialogue.map((d) => ({ ...d, speaker: map.get(d.speaker) || d.speaker }));
}

/**
 * Remap a "Speaker: text\nSpeaker2: text" transcript to use topic-appropriate speakers.
 * If the transcript isn't a dialogue, returns it unchanged.
 */
export function remapTranscript(transcript: string, topic: string): string {
  if (!transcript) return transcript;
  // Reuse parser pattern from tts.ts
  const re = /(^|\n)\s*([A-Z][A-Za-z .'\-]{0,31}?):\s+/g;
  type M = { speaker: string; start: number; end: number };
  const matches: M[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(transcript)) !== null) {
    matches.push({ speaker: m[2].trim(), start: m.index + m[1].length, end: m.index + m[0].length });
  }
  if (matches.length < 2) return transcript;
  const uniqueSpeakers = new Set(matches.map((mm) => mm.speaker.toLowerCase()));
  if (uniqueSpeakers.size < 2) return transcript;

  // Build lines, then remap.
  const lines: DialogueLine[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const body = transcript.slice(cur.end, next ? next.start : transcript.length).trim();
    if (body) lines.push({ speaker: cur.speaker, text: body });
  }
  const remapped = remapDialogueSpeakers(lines, topic);
  return remapped.map((l) => `${l.speaker}: ${l.text}`).join('\n');
}

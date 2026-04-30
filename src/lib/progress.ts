/**
 * Lightweight client-side progression: XP, level, streak, per-skill stats.
 * Stored in localStorage so the user feels real progress between sessions
 * without depending on backend bookkeeping.
 */

export type SkillKey = 'listening' | 'reading' | 'speaking' | 'writing' | 'vocabulary';

export type ProgressEvent = {
  skill: SkillKey;
  topic?: string;
  score?: number;       // raw score (e.g. 4 of 5 correct, or 78/100)
  total?: number;       // out of (e.g. 5)
  xp: number;
  ts: number;
};

const KEY = 'selm_progress_v1';
const XP_PER_LEVEL = 200;

export const PROGRESS_EVENT = 'selm:progress';

function read(): ProgressEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: ProgressEvent[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* */ }
}

export function getEvents(): ProgressEvent[] {
  return read();
}

/**
 * Compute XP for a finished exercise.
 *  - Base: 20 XP just for completing.
 *  - Quiz (score/total): +1 per correct, with bonus for perfect.
 *  - Score 0-100: scaled.
 */
export function xpFor(skill: SkillKey, score?: number, total?: number): number {
  let xp = 20;
  if (typeof score === 'number' && typeof total === 'number' && total > 0) {
    xp += score * 6; // 6 XP per correct answer
    if (score === total) xp += 20; // perfect bonus
  } else if (typeof score === 'number') {
    // assume 0..100
    xp += Math.round(score * 0.5);
  }
  if (skill === 'speaking' || skill === 'writing') xp += 10; // production tasks reward more
  return xp;
}

export function recordProgress(input: Omit<ProgressEvent, 'ts' | 'xp'> & { xp?: number }): ProgressEvent {
  const xp = input.xp ?? xpFor(input.skill, input.score, input.total);
  const ev: ProgressEvent = { ...input, xp, ts: Date.now() };
  const list = read();
  list.push(ev);
  // Keep last 500 events
  if (list.length > 500) list.splice(0, list.length - 500);
  write(list);
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: ev }));
  } catch { /* */ }
  return ev;
}

export type SkillStats = { count: number; xp: number; bestPct?: number; lastTs?: number };

export type ProgressSummary = {
  totalXP: number;
  level: number;
  xpThisLevel: number;
  xpToNext: number;
  streak: number;
  totalExercises: number;
  bySkill: Record<SkillKey, SkillStats>;
};

export function getSummary(): ProgressSummary {
  const list = read();
  const bySkill: Record<SkillKey, SkillStats> = {
    listening: { count: 0, xp: 0 },
    reading: { count: 0, xp: 0 },
    speaking: { count: 0, xp: 0 },
    writing: { count: 0, xp: 0 },
    vocabulary: { count: 0, xp: 0 },
  };
  let totalXP = 0;
  for (const e of list) {
    totalXP += e.xp;
    const cur = bySkill[e.skill];
    if (!cur) continue;
    cur.count += 1;
    cur.xp += e.xp;
    cur.lastTs = e.ts;
    if (typeof e.score === 'number' && typeof e.total === 'number' && e.total > 0) {
      const pct = (e.score / e.total) * 100;
      cur.bestPct = Math.max(cur.bestPct ?? 0, pct);
    } else if (typeof e.score === 'number') {
      cur.bestPct = Math.max(cur.bestPct ?? 0, e.score);
    }
  }
  const level = 1 + Math.floor(totalXP / XP_PER_LEVEL);
  const xpThisLevel = totalXP - (level - 1) * XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpThisLevel;

  // Streak: consecutive days with at least one event ending today (or yesterday if no events today yet)
  const days = new Set(list.map((e) => new Date(e.ts).toDateString()));
  let s = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) {
    // Allow streak to be measured from yesterday so visiting tomorrow shows yesterday's streak.
    d.setDate(d.getDate() - 1);
  }
  while (days.has(d.toDateString())) {
    s += 1;
    d.setDate(d.getDate() - 1);
  }

  return {
    totalXP,
    level,
    xpThisLevel,
    xpToNext,
    streak: s,
    totalExercises: list.length,
    bySkill,
  };
}

export function levelFromXP(xp: number) {
  return 1 + Math.floor(xp / XP_PER_LEVEL);
}

/** True when the new event caused a level-up vs. the totals before it. */
export function didLevelUp(prevTotalXP: number, addedXP: number): boolean {
  return levelFromXP(prevTotalXP) < levelFromXP(prevTotalXP + addedXP);
}

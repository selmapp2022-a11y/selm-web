/**
 * Client-side progression: XP, level, streak, per-skill levels, achievements.
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
const ACH_KEY = 'selm_achievements_v1';
const XP_PER_LEVEL = 200;
const XP_PER_SKILL_LEVEL = 120;

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

function readUnlocked(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ACH_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function writeUnlocked(map: Record<string, number>) {
  try { localStorage.setItem(ACH_KEY, JSON.stringify(map)); } catch { /* */ }
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
    xp += score * 6;
    if (score === total) xp += 20;
  } else if (typeof score === 'number') {
    xp += Math.round(score * 0.5);
  }
  if (skill === 'speaking' || skill === 'writing') xp += 10;
  return xp;
}

export function recordProgress(input: Omit<ProgressEvent, 'ts' | 'xp'> & { xp?: number }): ProgressEvent {
  const xp = input.xp ?? xpFor(input.skill, input.score, input.total);
  const ev: ProgressEvent = { ...input, xp, ts: Date.now() };
  const list = read();
  list.push(ev);
  if (list.length > 500) list.splice(0, list.length - 500);
  write(list);
  // Re-evaluate achievements after each event
  evaluateAchievements();
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: ev }));
  } catch { /* */ }
  return ev;
}

export type SkillStats = {
  count: number;
  xp: number;
  level: number;
  xpThisLevel: number;
  xpToNext: number;
  bestPct?: number;
  lastTs?: number;
  tier: string; // named rank for the skill
};

export type ProgressSummary = {
  totalXP: number;
  level: number;
  xpThisLevel: number;
  xpToNext: number;
  streak: number;
  longestStreak: number;
  totalExercises: number;
  perfectCount: number;
  bySkill: Record<SkillKey, SkillStats>;
};

const TIER_NAMES = ['Beginner', 'Apprentice', 'Learner', 'Practiced', 'Confident', 'Skilled', 'Advanced', 'Proficient', 'Expert', 'Master'];

function tierFor(skillLevel: number): string {
  return TIER_NAMES[Math.min(TIER_NAMES.length - 1, Math.max(0, skillLevel - 1))];
}

function emptySkill(): SkillStats {
  return { count: 0, xp: 0, level: 1, xpThisLevel: 0, xpToNext: XP_PER_SKILL_LEVEL, tier: TIER_NAMES[0] };
}

export function getSummary(): ProgressSummary {
  const list = read();
  const bySkill: Record<SkillKey, SkillStats> = {
    listening: emptySkill(),
    reading: emptySkill(),
    speaking: emptySkill(),
    writing: emptySkill(),
    vocabulary: emptySkill(),
  };
  let totalXP = 0;
  let perfectCount = 0;
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
      if (e.score === e.total) perfectCount += 1;
    } else if (typeof e.score === 'number') {
      cur.bestPct = Math.max(cur.bestPct ?? 0, e.score);
      if (e.score >= 95) perfectCount += 1;
    }
  }
  // Per-skill levels
  for (const k of Object.keys(bySkill) as SkillKey[]) {
    const s = bySkill[k];
    s.level = 1 + Math.floor(s.xp / XP_PER_SKILL_LEVEL);
    s.xpThisLevel = s.xp - (s.level - 1) * XP_PER_SKILL_LEVEL;
    s.xpToNext = XP_PER_SKILL_LEVEL - s.xpThisLevel;
    s.tier = tierFor(s.level);
  }
  const level = 1 + Math.floor(totalXP / XP_PER_LEVEL);
  const xpThisLevel = totalXP - (level - 1) * XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpThisLevel;

  // Streaks: consecutive days ending today (or yesterday if no events today yet)
  const days = new Set(list.map((e) => new Date(e.ts).toDateString()));
  let s = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    s += 1;
    d.setDate(d.getDate() - 1);
  }
  // Longest streak: scan all unique days sorted ascending
  const sortedDays = [...days].map((s) => new Date(s).getTime()).sort((a, b) => a - b);
  let longest = 0; let run = 0; let prev = 0;
  const ONE = 86400000;
  for (const t of sortedDays) {
    if (prev && t - prev === ONE) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = t;
  }

  return {
    totalXP,
    level,
    xpThisLevel,
    xpToNext,
    streak: s,
    longestStreak: longest,
    totalExercises: list.length,
    perfectCount,
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

// ---------------- Achievements ----------------

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  test: (s: ProgressSummary) => boolean;
};

export type AchievementState = AchievementDef & {
  unlocked: boolean;
  unlockedAt?: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // Getting started
  { id: 'first_step', title: 'First Step', description: 'Complete your first exercise', emoji: '🎯', test: (s) => s.totalExercises >= 1 },
  { id: 'level_2', title: 'Rising Learner', description: 'Reach overall level 2', emoji: '⭐', test: (s) => s.level >= 2 },
  { id: 'level_5', title: 'Dedicated Student', description: 'Reach overall level 5', emoji: '🌟', test: (s) => s.level >= 5 },
  { id: 'level_10', title: 'English Champion', description: 'Reach overall level 10', emoji: '🏆', test: (s) => s.level >= 10 },
  // Streaks
  { id: 'streak_3', title: '3-Day Streak', description: 'Practice 3 days in a row', emoji: '🔥', test: (s) => s.longestStreak >= 3 || s.streak >= 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Practice 7 days in a row', emoji: '🔥', test: (s) => s.longestStreak >= 7 || s.streak >= 7 },
  { id: 'streak_30', title: 'Monthly Marathon', description: 'Practice 30 days in a row', emoji: '💪', test: (s) => s.longestStreak >= 30 || s.streak >= 30 },
  // Volume
  { id: 'sessions_10', title: 'Getting Serious', description: 'Complete 10 exercises', emoji: '📚', test: (s) => s.totalExercises >= 10 },
  { id: 'sessions_50', title: 'Half Century', description: 'Complete 50 exercises', emoji: '🎓', test: (s) => s.totalExercises >= 50 },
  { id: 'sessions_100', title: 'Century Club', description: 'Complete 100 exercises', emoji: '💯', test: (s) => s.totalExercises >= 100 },
  // Perfection
  { id: 'perfect_1', title: 'Perfectionist', description: 'Get a perfect score', emoji: '✨', test: (s) => s.perfectCount >= 1 },
  { id: 'perfect_10', title: 'Flawless Ten', description: 'Get 10 perfect scores', emoji: '👑', test: (s) => s.perfectCount >= 10 },
  // Per-skill mastery
  { id: 'speak_lv3', title: 'Speaking · Confident', description: 'Reach Speaking level 3', emoji: '🎤', test: (s) => s.bySkill.speaking.level >= 3 },
  { id: 'listen_lv3', title: 'Listening · Confident', description: 'Reach Listening level 3', emoji: '🎧', test: (s) => s.bySkill.listening.level >= 3 },
  { id: 'read_lv3', title: 'Reading · Confident', description: 'Reach Reading level 3', emoji: '📖', test: (s) => s.bySkill.reading.level >= 3 },
  { id: 'write_lv3', title: 'Writing · Confident', description: 'Reach Writing level 3', emoji: '✍️', test: (s) => s.bySkill.writing.level >= 3 },
  // Well-rounded
  { id: 'all_four', title: 'Well-Rounded', description: 'Practice all 4 main skills', emoji: '🌈', test: (s) => (['speaking','listening','reading','writing'] as SkillKey[]).every((k) => s.bySkill[k].count >= 1) },
  { id: 'all_lv2', title: 'Balanced Learner', description: 'Reach level 2 in every main skill', emoji: '⚖️', test: (s) => (['speaking','listening','reading','writing'] as SkillKey[]).every((k) => s.bySkill[k].level >= 2) },
];

export function getAchievements(): AchievementState[] {
  const unlocked = readUnlocked();
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: !!unlocked[a.id],
    unlockedAt: unlocked[a.id],
  }));
}

/** Re-check every achievement against current summary. Returns ids newly unlocked. */
export function evaluateAchievements(): string[] {
  const summary = getSummary();
  const unlocked = readUnlocked();
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!unlocked[a.id] && a.test(summary)) {
      unlocked[a.id] = Date.now();
      newly.push(a.id);
    }
  }
  if (newly.length) writeUnlocked(unlocked);
  return newly;
}

/** Clear everything — only for development/debug. */
export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ACH_KEY);
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch { /* */ }
}

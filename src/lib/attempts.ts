/**
 * What the candidate has actually done, and nothing else.
 *
 * This file replaced `progress.ts` on 2026-08-29. That module kept XP, a
 * level, a day streak, per-skill ranks and eighteen achievements — the
 * scoreboard of the general language app this company is repositioning away
 * from. It was removed rather than renamed, because every number in it was
 * one the product cannot defend, sitting one navigation click from a page
 * that refuses to publish numbers it cannot defend.
 *
 * **Counting attempts is not the same as awarding points for them.** The first
 * is a fact about what happened; the second is a reward the exam does not
 * give. What survives here is the first: which skill, which task, when, and
 * what came back. No total, no rank, no reward.
 *
 * Backend remains the source of truth (`/users/me/client-state`), mirrored to
 * localStorage as a cache, so a cleared cache or a new device does not lose
 * the record.
 */

import { api } from './api';

export type SkillKey = 'listening' | 'reading' | 'speaking' | 'writing' | 'vocabulary';

/**
 * One finished piece of work.
 *
 * `score`/`total` are present when the work was counted — a comprehension set
 * returns 4 of 5. They are absent when it was not, and an absent score is left
 * absent rather than filled with a zero: not attempted and attempted badly are
 * different facts, and the second one is not this record's to invent.
 */
export type Attempt = {
  skill: SkillKey;
  /** The task or family this belonged to, as the planner names it. */
  topic?: string;
  score?: number;
  total?: number;
  /** Epoch ms the work finished. */
  ts: number;
};

const KEY = 'selm_progress_v1';
const MAX = 500;

/** Fired whenever the attempt log changes, so open pages re-read it. */
export const ATTEMPTS_EVENT = 'selm:attempts';

function read(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Records written by the old module carry extra fields. They are read for
    // what they are — a skill, a time, and sometimes a score — and the rest is
    // ignored rather than migrated, because the rest is what was removed.
    return parsed
      .filter((e: any) => e && typeof e.skill === 'string' && typeof e.ts === 'number')
      .map((e: any) => ({
        skill: e.skill as SkillKey,
        topic: typeof e.topic === 'string' ? e.topic : undefined,
        score: typeof e.score === 'number' ? e.score : undefined,
        total: typeof e.total === 'number' ? e.total : undefined,
        ts: e.ts as number,
      }));
  } catch {
    return [];
  }
}

function write(list: Attempt[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* */ }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

async function pushToBackend() {
  try {
    await api.put('/users/me/client-state', { events: read() });
  } catch { /* offline or signed out — localStorage still holds it */ }
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushToBackend, 1500);
}

/** Pull the server's record and merge it into the local cache. Idempotent. */
export async function syncAttemptsFromBackend(): Promise<void> {
  try {
    const { data } = await api.get('/users/me/client-state');
    const remote: Attempt[] = Array.isArray(data?.events)
      ? data.events.filter((e: any) => e && typeof e.skill === 'string' && typeof e.ts === 'number')
      : [];
    const local = read();
    const seen = new Set<string>();
    const merged: Attempt[] = [];
    for (const a of [...remote, ...local]) {
      const k = `${a.skill}|${a.topic ?? ''}|${a.ts}`;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({ skill: a.skill, topic: a.topic, score: a.score, total: a.total, ts: a.ts });
    }
    merged.sort((x, y) => x.ts - y.ts);
    if (merged.length > MAX) merged.splice(0, merged.length - MAX);
    write(merged);
    if (local.length > remote.length) schedulePush();
    try { window.dispatchEvent(new CustomEvent(ATTEMPTS_EVENT)); } catch { /* */ }
  } catch {
    /* unreachable backend is not a broken app — the cache stands */
  }
}

export function getAttempts(): Attempt[] {
  return read();
}

/** Record one finished piece of work. Returns what was written. */
export function recordAttempt(input: Omit<Attempt, 'ts'>): Attempt {
  const a: Attempt = { ...input, ts: Date.now() };
  const list = read();
  list.push(a);
  if (list.length > MAX) list.splice(0, list.length - MAX);
  write(list);
  try { window.dispatchEvent(new CustomEvent(ATTEMPTS_EVENT, { detail: a })); } catch { /* */ }
  schedulePush();
  return a;
}

export type SkillAttempts = {
  /** How many pieces of work finished. A count, not a score. */
  count: number;
  /** Epoch ms of the most recent one, or null. */
  lastAt: number | null;
  /** Distinct topics attempted, so a gap can be named. */
  topics: string[];
};

export function attemptsBySkill(list: Attempt[] = read()): Record<SkillKey, SkillAttempts> {
  const empty = (): SkillAttempts => ({ count: 0, lastAt: null, topics: [] });
  const out: Record<SkillKey, SkillAttempts> = {
    listening: empty(), reading: empty(), speaking: empty(), writing: empty(), vocabulary: empty(),
  };
  for (const a of list) {
    const row = out[a.skill];
    if (!row) continue;
    row.count += 1;
    if (row.lastAt === null || a.ts > row.lastAt) row.lastAt = a.ts;
    if (a.topic && !row.topics.includes(a.topic)) row.topics.push(a.topic);
  }
  return out;
}

/** Clear the local record. Used by sign-out and by the settings reset. */
export function resetAttempts() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
  try { window.dispatchEvent(new CustomEvent(ATTEMPTS_EVENT)); } catch { /* */ }
}

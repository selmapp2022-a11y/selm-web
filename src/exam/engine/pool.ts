/**
 * Serving from the pool.
 *
 * THE PLAN §4.3: "least-recently-served among unseen. Never random." And the
 * reason, which is the whole point of the rule — a bank of 120 that serves
 * the same 8 because of a selection bug is a bank of 8.
 *
 * Nothing is generated here. Generation is a background job (§4.2, measured
 * at 40.7 s median, 99.5% of it the model); this file is what stands in
 * front of the candidate, and it must never wait on that.
 */
export type PoolItem = { id: string };

export type ServeState = {
  /** Item id → the draw number it was last served on. */
  lastServed: Map<string, number>;
  /** Item ids this candidate has already seen. */
  seen: Set<string>;
  draw: number;
};

export function newServeState(): ServeState {
  return { lastServed: new Map(), seen: new Set(), draw: 0 };
}

export type ServeResult<T extends PoolItem> = {
  item: T | null;
  /** True when every item had been seen and the pool was recycled. */
  recycled: boolean;
};

/**
 * Least-recently-served among unseen. When every item has been seen the
 * pool recycles — and says so, because "the candidate has exhausted this
 * coordinate" is a fact the planner needs and a silent repeat is the bug
 * §4.3 exists to prevent.
 */
export function serve<T extends PoolItem>(items: T[], st: ServeState): ServeResult<T> {
  st.draw += 1;
  let pool = items.filter((i) => !st.seen.has(i.id));
  let recycled = false;
  if (pool.length === 0) {
    st.seen.clear();
    pool = items.slice();
    recycled = true;
  }
  if (pool.length === 0) return { item: null, recycled };

  let best = pool[0];
  let bestAt = st.lastServed.get(best.id) ?? -1;
  for (const i of pool) {
    const at = st.lastServed.get(i.id) ?? -1;
    if (at < bestAt) {
      best = i;
      bestAt = at;
    }
  }
  st.lastServed.set(best.id, st.draw);
  st.seen.add(best.id);
  return { item: best, recycled };
}

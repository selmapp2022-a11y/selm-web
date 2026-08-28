/**
 * Where an attestation lives before there is an endpoint for it.
 *
 * `localStorage`, and for the same reason `plan.ts` gives: the exam engine
 * is a separate document on the same origin (`/exam.html`) and both halves
 * must read the same record with no round trip. Moving it behind the API is
 * a later change and does not alter the shape.
 *
 * **One thing this file must never do is store the image**, and it cannot:
 * `Attestation` has no field for it, and the reader below discards the file
 * in the same function that reads it. `attestation.ts` explains why that is
 * a stronger promise than "we delete it later".
 */
import type { Attestation } from './attestation';

export const ATTESTATION_KEY = 'selm_attestations_v1';
export const ATTESTATION_EVENT = 'selm:attestations';

export function loadAttestations(): Attestation[] {
  try {
    const raw = localStorage.getItem(ATTESTATION_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as Attestation[]) : [];
  } catch {
    return [];
  }
}

export function saveAttestation(a: Attestation): void {
  const all = loadAttestations().filter((x) => x.id !== a.id);
  all.push(a);
  try {
    localStorage.setItem(ATTESTATION_KEY, JSON.stringify(all));
  } catch {
    /* a full or disabled store must not lose the plan the candidate just built */
  }
  window.dispatchEvent(new CustomEvent(ATTESTATION_EVENT));
}

/** Withdrawal, which the consent promises and therefore has to exist. */
export function withdrawAttestation(id: string): void {
  const all = loadAttestations().filter((x) => x.id !== id);
  try {
    localStorage.setItem(ATTESTATION_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(ATTESTATION_EVENT));
}

export function newAttestationId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Whole months between a `YYYY-MM` sitting and today. Never negative. */
export function gapMonthsFrom(sat: string): number {
  const [y, m] = sat.split('-').map(Number);
  if (!y || !m) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m));
}

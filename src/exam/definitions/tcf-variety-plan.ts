/**
 * Which variety each of the 39 TCF listening recordings is to be spoken in.
 *
 * Ruled 29 August 2026 (`SELM-RULINGS-voices.md` §1): the 39 are re-rendered
 * rather than identified, because they were made in one batch from one cast —
 * whatever variety they turn out to be, they are all the SAME one, and
 * `FRENCH_VARIETY_MIX` requires a weighted mixture. Identification cannot
 * produce a mixture; only re-rendering can.
 *
 * This table is DATA, not a computation, on purpose. A function that assigned
 * varieties at render time would have to be re-run and re-read to be checked,
 * and a reviewer could not see at a glance that Quebecois appears at B1 as
 * well as C1. It was produced by the method described below and then frozen.
 *
 * ## The shares
 *
 * Twenty international, seven Quebecois, six West African, three Belgian,
 * three Swiss. That is `FRENCH_VARIETY_MIX` turned into counts: international
 * a clear majority at 51%, Quebecois and West African clear minorities at 18%
 * and 15%, Belgian and Swiss occasional at 8% each.
 *
 * ## Spread across the bands, which is the part that is easy to get wrong
 *
 * The first attempt distributed the shares across the bank in level order and
 * produced a bank where a candidate met NO Quebecois below B1 and no
 * international at C2. That is not the mixture the ruling asked for — it is
 * the mixture correlated with difficulty, which would teach a candidate that
 * unfamiliar accents are a hard-band problem. Real exams do not work that way.
 *
 * So the shares are applied INSIDE each band by largest remainder, and the
 * majority is interleaved so two minority recordings rarely sit adjacent.
 * West African appears in all six bands; Quebecois in four; international in
 * all six, as the majority everywhere.
 *
 * ## One constraint from the account, not from the exam
 *
 * The ElevenLabs library holds seven Belgian French voices and they are all
 * male (`KNOWN_CAST_GAPS` in `french-voices.ts`). A two-speaker dialogue needs
 * two voices of one variety, so **Belgian is assigned only to single-speaker
 * recordings.** That is a limit of the account written into the data rather
 * than met at render time, when the renderer would substitute a voice of
 * another variety and the file would play perfectly and wrongly.
 *
 * One manual correction after the method ran: `tcf-co-01-r` and `tcf-co-02-r`
 * both came out Belgian, which would have opened the bank — the first two
 * recordings any candidate hears — with an occasional variety. `tcf-co-02-r`
 * was swapped with `tcf-co-07-r`.
 */

import type { SpeechVariety } from '../model/types';

export type VarietyAssignment = {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** Two speakers need two voices of one variety — see the Belgian note. */
  speakers: number;
  variety: SpeechVariety;
};

export const TCF_VARIETY_PLAN: VarietyAssignment[] = [
  { id: 'tcf-co-01-r', level: 'A1', speakers: 1, variety: 'belgian' },
  { id: 'tcf-co-02-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-03-r', level: 'A1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-04-r', level: 'A1', speakers: 1, variety: 'west_african' },
  { id: 'tcf-co-05-r', level: 'A2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-06-r', level: 'A2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-07-r', level: 'A2', speakers: 1, variety: 'belgian' },
  { id: 'tcf-co-08-r', level: 'A2', speakers: 2, variety: 'west_african' },
  { id: 'tcf-co-09-r', level: 'A2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-10-r', level: 'A2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-11-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-12-r', level: 'B1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-13-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-14-r', level: 'B1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-15-r', level: 'B1', speakers: 2, variety: 'international' },
  { id: 'tcf-co-16-r', level: 'B1', speakers: 2, variety: 'west_african' },
  { id: 'tcf-co-17-r', level: 'B1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-18-r', level: 'B1', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-19-r', level: 'B1', speakers: 2, variety: 'swiss' },
  { id: 'tcf-co-20-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-21-r', level: 'B2', speakers: 2, variety: 'quebecois' },
  { id: 'tcf-co-22-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-23-r', level: 'B2', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-24-r', level: 'B2', speakers: 2, variety: 'international' },
  { id: 'tcf-co-25-r', level: 'B2', speakers: 2, variety: 'west_african' },
  { id: 'tcf-co-26-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-27-r', level: 'B2', speakers: 1, variety: 'belgian' },
  { id: 'tcf-co-28-r', level: 'B2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-29-r', level: 'B2', speakers: 2, variety: 'swiss' },
  { id: 'tcf-co-30-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-31-r', level: 'C1', speakers: 1, variety: 'quebecois' },
  { id: 'tcf-co-32-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-33-r', level: 'C1', speakers: 2, variety: 'west_african' },
  { id: 'tcf-co-34-r', level: 'C1', speakers: 1, variety: 'international' },
  { id: 'tcf-co-35-r', level: 'C1', speakers: 1, variety: 'swiss' },
  { id: 'tcf-co-36-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-37-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-38-r', level: 'C2', speakers: 1, variety: 'international' },
  { id: 'tcf-co-39-r', level: 'C2', speakers: 1, variety: 'west_african' },
];

/** The shares this plan realises, for a check to assert against. */
export const TCF_VARIETY_SHARES: Record<string, number> = {
  international: 20,
  quebecois: 7,
  west_african: 6,
  belgian: 3,
  swiss: 3,
};

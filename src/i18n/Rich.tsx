import { Fragment } from 'react';
import { tf, useUiLangValue, type Key } from './index';

/**
 * A translated string whose emphasis travels WITH the translation.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * Most of the sentences §5.2 still had written into components are not bare
 * labels — they are prose with a word or two in `<strong>`:
 *
 *     Comprehension is <strong>counted</strong> — an exact number …
 *
 * The obvious move is to cut them into three keys and reassemble them in JSX.
 * That works in English and breaks in French, where the emphasised word does
 * not sit in the same place in the sentence and sometimes does not exist as a
 * separate word at all. A translator handed `'… is'`, `'counted'`, `'— an
 * exact number …'` cannot produce a French sentence; they can only produce
 * three English-shaped fragments.
 *
 * So the whole sentence stays one key, and the emphasis is marked inside it
 * with `**double asterisks**` — a mark a translator can move. Deliberately the
 * only mark supported: this is not a markdown renderer, and a component that
 * quietly accepted links or lists would be an injection surface for a string
 * file.
 */
export function Rich({ k, vars }: { k: Key; vars?: Record<string, string | number> }) {
  const lang = useUiLangValue();
  return <RichText text={tf(k, vars ?? {}, lang)} />;
}

/**
 * The same mark, on a string that is already in hand.
 *
 * The legal pages hold their text as `{ en, fr }` data rather than as keys —
 * a privacy policy is one document that must be translated as a whole, not
 * forty independent strings a translator meets out of order — so they need
 * the emphasis renderer without going through the key table.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split('**');
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{i % 2 ? <strong>{part}</strong> : part}</Fragment>
      ))}
    </>
  );
}

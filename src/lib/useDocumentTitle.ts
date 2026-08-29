import { useEffect } from 'react';

/**
 * Set the browser title to match the page.
 *
 * The ruling of 29 August 2026: *a navigation label and its page heading must
 * be the same word*, and the browser title is the third place that name
 * appears. Without this the tab said "SELM — Learn English with AI" on every
 * screen, which is both the wrong page name and, for a product whose only
 * finished item bank is French, the wrong claim.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · SELM`;
    return () => { document.title = previous; };
  }, [title]);
}

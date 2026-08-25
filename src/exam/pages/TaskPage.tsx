import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam, firstTask } from '../state';
import { t } from '../model/format';
import { wordCount } from '../engine/text';
import { scoreResponse } from '../engine/score';

/**
 * One task runner. It reads the task definition and nothing else — the clock,
 * the word guidance and the scaffolding all come from the definition, so the
 * same component runs the IELTS letter and the TCF message without a branch.
 */
export default function TaskPage() {
  const { exam, ui, setResult } = useExam();
  const nav = useNavigate();
  const task = useMemo(() => firstTask(exam), [exam]);

  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showScaffold, setShowScaffold] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    started.current = Date.now();
    setText('');
    setElapsed(0);
  }, [task.id]);

  useEffect(() => {
    const h = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(h);
  }, [task.id]);

  const remaining = task.timeLimitSec - elapsed;
  const over = remaining < 0;
  const clock = `${Math.floor(Math.abs(remaining) / 60)}:${String(Math.abs(remaining) % 60).padStart(2, '0')}`;
  const wc = wordCount(text);

  async function submit() {
    setBusy(true);
    const response = {
      taskId: task.id,
      text,
      elapsedSec: Math.floor((Date.now() - started.current) / 1000),
      submittedAt: new Date().toISOString(),
    };
    const result = await scoreResponse(exam, task, response);
    setResult(response, result);
    setBusy(false);
    nav('/result');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-disabled">
            {t(exam.name, ui)} · {t(exam.sections[0].name, ui)}
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight">{t(task.name, ui)}</h1>
        </div>
        <div className={`rounded-xl px-3 py-2 text-right ${over ? 'bg-red-500/10' : 'bg-surface-muted'}`}>
          <div className={`font-display text-xl font-bold tabular-nums ${over ? 'text-red-500' : ''}`}>
            {over ? '+' : ''}{clock}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-disabled">
            {over ? (ui === 'en' ? 'over' : 'dépassé') : (ui === 'en' ? 'left' : 'restant')}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-surface-divider bg-surface-card p-4">
        <p className="text-sm leading-relaxed">{t(task.prompt, ui)}</p>
        {task.wordGuidance && (
          <p className="mt-3 text-xs font-medium text-ink-secondary">{t(task.wordGuidance, ui)}</p>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        lang={exam.locale}
        placeholder={ui === 'en' ? 'Write your response here.' : 'Rédigez votre réponse ici.'}
        className="h-72 w-full resize-none rounded-xl border border-surface-divider bg-surface-card p-4 text-sm leading-relaxed outline-none focus:border-teal"
      />

      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span className="tabular-nums">
          {wc} {ui === 'en' ? 'words' : 'mots'}
        </span>
        {task.suppliedScaffold && (
          <button className="underline underline-offset-2" onClick={() => setShowScaffold((s) => !s)}>
            {showScaffold
              ? ui === 'en' ? 'Hide the structure' : 'Masquer la trame'
              : ui === 'en' ? 'Show the structure' : 'Afficher la trame'}
          </button>
        )}
      </div>

      {showScaffold && task.suppliedScaffold && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            {ui === 'en' ? 'Structure, not content' : 'Une trame, pas un contenu'}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
            {task.suppliedScaffold.map((s, i) => (
              <li key={i}>· {s}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? 'How much of this you lean on is measured, and it is reported back to you on the result screen.'
              : "La part que vous en reprenez est mesurée et vous est rapportée sur l'écran de résultat."}
          </p>
        </div>
      )}

      <button
        disabled={busy}
        onClick={submit}
        className="w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy
          ? ui === 'en' ? 'Scoring…' : 'Correction en cours…'
          : ui === 'en' ? 'Submit' : 'Remettre'}
      </button>
    </div>
  );
}

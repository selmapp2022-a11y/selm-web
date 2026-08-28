import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useExam, allTasks, sectionOf } from '../state';
import { AudioRecorder } from '../../components/AudioRecorder';
import { SectionClock } from '../components/SectionClock';
import { t } from '../model/format';
import { wordCount, segmentationFor } from '../engine/text';
import { scoreResponse } from '../engine/score';
import type { Response } from '../model/types';

/**
 * One task runner. It reads the task definition and nothing else — the clock,
 * the word guidance and the scaffolding all come from the definition, so the
 * same component runs the IELTS letter and the TCF message without a branch.
 */
export default function TaskPage() {
  const { exam, ui, setResult, taskId, sitting, submitSection } = useExam();
  const nav = useNavigate();

  // Inside a sitting this page runs the production section's tasks in order.
  // Outside one it runs the single task the goal page picked. The two were
  // never joined until a full sitting was actually run end to end, and the
  // sitting stalled here: it reached expression écrite and stopped, because
  // nothing advanced it. Found by running it, not by reading it.
  const sittingSection = useMemo(() => {
    if (!sitting) return null;
    const s = exam.sections.find((x) => x.id === sitting.order[sitting.at]);
    return s && s.kind === 'production' ? s : null;
  }, [exam, sitting]);
  const [inSectionAt, setInSectionAt] = useState(0);

  const task = useMemo(() => {
    if (sittingSection) return sittingSection.tasks[Math.min(inSectionAt, sittingSection.tasks.length - 1)];
    return allTasks(exam).find((t) => t.id === taskId) ?? allTasks(exam)[0];
  }, [exam, taskId, sittingSection, inSectionAt]);

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
  const wc = wordCount(text, segmentationFor(exam.locale));

  async function run(response: Response) {
    setBusy(true);
    const result = await scoreResponse(exam, task, response);
    setResult(response, result);
    setBusy(false);
    if (sittingSection) {
      // Inside a sitting the per-task result screen is not shown: it would
      // hand the candidate feedback in the middle of an exam. The next task
      // starts, and when the section is finished the sitting moves on.
      if (inSectionAt + 1 < sittingSection.tasks.length) {
        setInSectionAt(inSectionAt + 1);
      } else {
        setInSectionAt(0);
        submitSection(sittingSection.id);
        nav('/section');
      }
      return;
    }
    nav('/result');
  }

  function submitText() {
    return run({
      kind: 'text',
      taskId: task.id,
      text,
      elapsedSec: Math.floor((Date.now() - started.current) / 1000),
      submittedAt: new Date().toISOString(),
    });
  }

  function submitAudio(blob: Blob, durationMs: number) {
    return run({
      kind: 'audio',
      taskId: task.id,
      blob,
      durationSec: Math.round(durationMs / 1000),
      elapsedSec: Math.floor((Date.now() - started.current) / 1000),
      submittedAt: new Date().toISOString(),
    });
  }

  const sittingCrumb = sittingSection ? (
    <p className="mt-1 text-xs text-ink-secondary">
      {ui === 'en'
        ? `${t(sittingSection.name, ui)} · task ${inSectionAt + 1} of ${sittingSection.tasks.length} · section ${(sitting?.at ?? 0) + 1} of ${sitting?.order.length}`
        : `${t(sittingSection.name, ui)} · tâche ${inSectionAt + 1} sur ${sittingSection.tasks.length} · épreuve ${(sitting?.at ?? 0) + 1} sur ${sitting?.order.length}`}
    </p>
  ) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="chip">
            {/* The task's own section, not sections[0]. It was sections[0]
                until 2026-08-27, which was invisible while writing was the
                first section and became wrong the moment comprehension was
                added in front of it: a tâche of expression écrite was
                labelled "compréhension orale". */}
            {t(exam.name, ui)} · {t(sectionOf(exam, task.id).name, ui)}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-navy">{t(task.name, ui)}</h1>
          {sittingCrumb}
        </div>
        <SectionClock
          seconds={remaining}
          tone={over ? 'over' : remaining < 60 ? 'warn' : 'normal'}
          label={over ? (ui === 'en' ? 'over' : 'dépassé') : (ui === 'en' ? 'left' : 'restant')}
        />
      </header>

      <div className="card p-6">
        <p className="leading-relaxed text-ink-primary">{t(task.prompt, ui)}</p>
        {task.wordGuidance && (
          <p className="mt-3 text-xs font-medium text-ink-secondary">{t(task.wordGuidance, ui)}</p>
        )}
        {task.timeLimitApportioned && (
          <p className="mt-2 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'The clock above is our own split of the section time. The exam times the section, not this task.'
              : "Le chronomètre ci-dessus correspond à notre propre répartition du temps de l'épreuve. L'examen chronomètre l'épreuve, pas cette tâche."}
          </p>
        )}
      </div>

      {task.responseMode === 'audio' ? (
        <div className="card p-6">
          <AudioRecorder
            maxSeconds={task.timeLimitSec}
            disabled={busy}
            label={ui === 'en' ? 'Record your answer' : 'Enregistrez votre réponse'}
            onComplete={(blob, durationMs) => submitAudio(blob, durationMs)}
          />
          <p className="mt-4 text-xs leading-relaxed text-ink-secondary">
            {ui === 'en'
              ? 'The recording stops itself at the task limit, as the exam does. It is transcribed before anything else happens to it.'
              : "L'enregistrement s'arrête de lui-même à la limite de la tâche, comme à l'examen. Il est transcrit avant toute autre étape."}
          </p>
          {busy && (
            <p className="mt-3 text-sm font-medium text-ink-primary">
              {ui === 'en' ? 'Transcribing and scoring…' : 'Transcription et correction en cours…'}
            </p>
          )}
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            lang={exam.locale}
            rows={14}
            placeholder={ui === 'en' ? 'Write your response here.' : 'Rédigez votre réponse ici.'}
            className="input"
          />

          {task.responseMode === 'text' && (
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span className="tabular-nums">
                {wc} {ui === 'en' ? 'words' : 'mots'}
              </span>
              {task.suppliedScaffold && (
                <button className="btn-ghost text-sm" onClick={() => setShowScaffold((s) => !s)}>
                  {showScaffold
                    ? ui === 'en' ? 'Hide the structure' : 'Masquer la trame'
                    : ui === 'en' ? 'Show the structure' : 'Afficher la trame'}
                </button>
              )}
            </div>
          )}

          {showScaffold && task.suppliedScaffold && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
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
              </div>
            </div>
          )}
        </>
      )}
      {task.responseMode === 'text' && (
        <button disabled={busy} onClick={submitText} className="btn-primary w-full">
          {busy
            ? ui === 'en' ? 'Scoring…' : 'Correction en cours…'
            : sittingSection
              ? inSectionAt + 1 < sittingSection.tasks.length
                ? ui === 'en' ? 'Submit and go to the next tâche' : 'Remettre et passer à la tâche suivante'
                : ui === 'en' ? 'Submit and finish this section' : "Remettre et terminer l'épreuve"
              : ui === 'en' ? 'Submit' : 'Remettre'}
        </button>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useExam } from '../state';
import { t } from '../model/format';
import { resolveAudio } from '../engine/audio';
import { serveEpreuve, itemsOf, itemsFor } from '../engine/comprehension';
import { SectionClock, ProgressBar } from '../components/SectionClock';
import { PlayOnce } from '../components/PlayOnce';
import type { ComprehensionItem, ComprehensionSection, LanguageCode, Recording } from '../model/types';

/**
 * One comprehension section, run under the exam's own delivery rules.
 *
 * Every rule enforced here comes from `section.delivery`, which is data. This
 * component asks the definition what the exam does; it does not decide.
 */
export default function SectionPage() {
  const { exam, ui, sitting } = useExam();
  const nav = useNavigate();

  const section = useMemo(() => {
    if (!sitting) return null;
    const id = sitting.order[sitting.at];
    const s = exam.sections.find((x) => x.id === id);
    return s && s.kind === 'comprehension' ? s : null;
  }, [exam, sitting]);

  useEffect(() => {
    if (!sitting) return;
    if (sitting.at >= sitting.order.length) nav('/sitting-result');
    else if (!section) nav('/task');
  }, [sitting, section, nav]);

  if (!sitting) {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink-primary">
          {ui === 'en' ? 'No sitting in progress.' : 'Aucune session en cours.'}
        </p>
      </div>
    );
  }
  if (!section) return null;

  return <Section key={section.id} section={section} />;
}

function Section({ section }: { section: ComprehensionSection }) {
  const { ui, sitting, answerItem, submitSection } = useExam();
  const nav = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);

  const started = sitting?.sectionStartedAt ?? Date.now();
  const left = section.timeLimitSec - Math.floor((now - started) / 1000);
  // The ÉPREUVE, not the bank. `section.items` is what has been written;
  // this is what one sitting presents, at the published length and band
  // profile. They were the same number until the bank outgrew the exam.
  // The ÉPREUVE, not the bank — and RECORDINGS, not questions. A recording's
  // questions travel with it, because half a recording cannot be served.
  const recordings = useMemo(() => serveEpreuve(section), [section]);
  const items = useMemo(() => itemsFor(section, recordings), [section, recordings]);
  const answers = sitting?.answers[section.id] ?? {};
  const answeredCount = items.filter((i) => typeof answers[i.id] === 'number').length;

  const done = useMemo(
    () => () => {
      submitSection(section.id);
      nav('/section');
    },
    [section.id, submitSection, nav]
  );

  // The section clock runs the section, not the item — a delivery rule.
  useEffect(() => {
    if (left <= 0) done();
  }, [left, done]);

  // Nothing is generated at request time. If the audio for a play-once section
  // has not been rendered and stored, the section cannot be sat under exam
  // conditions — and showing the script instead would turn a listening test
  // into a reading test, which is worse than showing nothing.
  // Per item, not per section. A section whose bank is complete runs; an item
  // whose audio is missing stops the section rather than being skipped, which
  // is the one behaviour worse than refusing outright — the candidate would
  // never know a question had been dropped.
  // Per RECORDING, not per question. A section whose bank is complete runs; a
  // recording with no audio stops the section rather than being skipped,
  // which is the one behaviour worse than refusing outright — the candidate
  // would never know that questions had been dropped.
  const missing = section.delivery.audioPlaysOnce
    ? recordings.filter((r) => !r.audioPath).map((r) => r.id)
    : [];
  const audioMissing = missing.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-navy">{t(section.name, ui)}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {ui === 'en'
              ? `${items.length} questions · ${Math.round(section.timeLimitSec / 60)} minutes for the whole section · ${answeredCount} answered`
              : `${items.length} questions · ${Math.round(section.timeLimitSec / 60)} minutes pour l'ensemble · ${answeredCount} répondues`}
          </p>
        </div>
        <SectionClock
          seconds={left}
          tone={left < 60 ? 'warn' : 'normal'}
          label={ui === 'en' ? 'left' : 'restant'}
        />
      </header>

      <ProgressBar value={answeredCount} total={items.length} />

      {audioMissing ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-display font-bold text-amber-700">
                {ui === 'en' ? 'This section cannot be sat yet' : "Cette épreuve n'est pas encore praticable"}
              </p>
              <p className="mt-1 text-xs text-ink-secondary">
                {ui === 'en'
                  ? `${missing.length} of ${recordings.length} recordings have no audio: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}`
                  : `${missing.length} enregistrements sur ${recordings.length} n'ont pas d'audio : ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {ui === 'en'
                  ? 'The audio for these items has not been recorded yet. It is rendered once and stored, never generated while you wait — and the French recordings are held until the dialect question is settled, because recording them in a variety that turns out to be wrong would mean recording every item again. The written text of the items is deliberately not shown instead: reading a listening item is a different test.'
                  : "L'audio de ces items n'est pas encore enregistré. Il est produit une fois puis stocké, jamais généré pendant votre attente — et les enregistrements français attendent que la question de la variété de français soit tranchée. Le texte des items n'est volontairement pas affiché à la place : lire un item d'écoute, c'est un autre test."}
              </p>
            </div>
          </div>
        </div>
      ) : section.delivery.presentation === 'all_at_once' ? (
        <ol className="space-y-6">
          {recordings.map((rec, ri) => {
            const its = itemsOf(section, rec.id);
            const before = recordings.slice(0, ri).reduce((n, r) => n + itemsOf(section, r.id).length, 0);
            return (
              <li key={rec.id} className="space-y-3">
                <div className="card p-6">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{rec.script}</p>
                </div>
                {its.map((item, n) => (
                  <Item
                    key={item.id}
                    item={item}
                    n={before + n}
                    sectionId={section.id}
                    chose={answers[item.id] ?? null}
                    onChoose={answerItem}
                  />
                ))}
              </li>
            );
          })}
        </ol>
      ) : (
        <OneRecording
          section={section}
          recordings={recordings}
          cursor={cursor}
          setCursor={setCursor}
          answers={answers}
          onChoose={answerItem}
          ui={ui}
        />
      )}

      <div className="card p-6">
        <p className="text-xs leading-relaxed text-ink-secondary">{t(section.provenance, ui)}</p>
      </div>

      <button onClick={done} className="btn-primary w-full">
        {ui === 'en' ? 'Submit this section' : 'Remettre cette épreuve'}
      </button>
      <p className="text-center text-xs text-ink-secondary">
        {ui === 'en'
          ? 'Answers can be changed until you submit. A submitted section cannot be reopened.'
          : "Les réponses restent modifiables jusqu'à la remise. Une épreuve remise ne peut pas être rouverte."}
      </p>
    </div>
  );
}

/**
 * One recording at a time, with all of its questions beneath it.
 *
 * The cursor indexes RECORDINGS, not questions. Before 2026-08-29 it indexed
 * questions and the played flag was component state reset on every cursor
 * change — which was correct only while every question had its own clip. Ten
 * questions on one five-minute recording would have bought ten listens.
 *
 * The flag now lives in the sitting (`playedRecordings`), so it survives a
 * reload and a device change: a dropped connection resumes at the questions
 * rather than costing the candidate the recording. Ruling 2.
 */
function OneRecording({
  section,
  recordings,
  cursor,
  setCursor,
  answers,
  onChoose,
  ui,
}: {
  section: ComprehensionSection;
  recordings: Recording[];
  cursor: number;
  setCursor: (n: number) => void;
  answers: Record<string, number | null>;
  onChoose: (sectionId: string, itemId: string, chose: number | null) => void;
  ui: LanguageCode;
}) {
  const { sitting, markPlayed } = useExam();
  const rec = recordings[cursor];
  const its = itemsOf(section, rec.id);
  const before = recordings.slice(0, cursor).reduce((n, r) => n + itemsOf(section, r.id).length, 0);
  const played = !!sitting?.playedRecordings.includes(rec.id);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <span className="chip">
          {rec.part
            ? t(rec.part, ui)
            : ui === 'en'
              ? `Recording ${cursor + 1} of ${recordings.length}`
              : `Enregistrement ${cursor + 1} sur ${recordings.length}`}
        </span>
        <div className="mt-4">
          <PlayOnce
            src={resolveAudio(rec.audioPath)}
            played={played}
            // Recorded before the audio starts, and written straight into the
            // sitting, so a reload, a second click or a failed play does not
            // buy a second listen.
            onPlayed={() => markPlayed(rec.id)}
            label={
              played
                ? ui === 'en' ? 'Played' : 'Écouté'
                : ui === 'en' ? 'Play — once only' : 'Écouter — une seule fois'
            }
            note={
              section.delivery.questionAfterAudio && !played
                ? ui === 'en'
                  ? 'The questions appear after the recording, as they do in the exam.'
                  : "Les questions apparaissent après l'enregistrement, comme à l'examen."
                : undefined
            }
          />
        </div>
      </div>

      {(!section.delivery.questionAfterAudio || played) &&
        its.map((item, n) => (
          <Item
            key={item.id}
            item={item}
            n={before + n}
            sectionId={section.id}
            chose={answers[item.id] ?? null}
            onChoose={onChoose}
          />
        ))}

      <div className="flex gap-2">
        <button
          disabled={cursor === 0}
          onClick={() => setCursor(cursor - 1)}
          className="btn-secondary flex-1"
        >
          {ui === 'en' ? 'Previous' : 'Précédent'}
        </button>
        <button
          disabled={cursor >= recordings.length - 1}
          onClick={() => setCursor(cursor + 1)}
          className="btn-secondary flex-1"
        >
          {ui === 'en' ? 'Next' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}

function Item({
  item,
  n,
  sectionId,
  chose,
  onChoose,
}: {
  item: ComprehensionItem;
  n: number;
  sectionId: string;
  chose: number | null;
  onChoose: (sectionId: string, itemId: string, chose: number | null) => void;
}) {
  // The material is rendered by whoever owns the recording — once, above its
  // questions — rather than repeated under each of them.
  return (
    <div className="card p-6">
      <p className="font-medium text-ink-primary">
        <span className="mr-2 text-ink-secondary">{n + 1}.</span>
        {item.stem}
      </p>
      <div className="mt-3 space-y-2">
        {item.options.map((o, i) => (
          <button
            key={i}
            onClick={() => onChoose(sectionId, item.id, chose === i ? null : i)}
            className={clsx(
              'w-full rounded-xl border-2 px-5 py-3 text-left text-sm font-medium transition-all',
              chose === i
                ? 'border-teal bg-teal/10 text-navy'
                : 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted'
            )}
          >
            {o}
          </button>
        ))}
      </div>
      {/* No per-item feedback during the section. Feedback is a results-page
          concern, and showing it here would turn a mock into a drill. */}
    </div>
  );
}

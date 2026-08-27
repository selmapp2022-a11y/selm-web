import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useExam } from '../state';
import { t } from '../model/format';
import { resolveAudio } from '../engine/audio';
import { SectionClock, ProgressBar } from '../components/SectionClock';
import { PlayOnce } from '../components/PlayOnce';
import type { ComprehensionItem, ComprehensionSection, LanguageCode } from '../model/types';

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
  const answers = sitting?.answers[section.id] ?? {};
  const answeredCount = section.items.filter((i) => typeof answers[i.id] === 'number').length;

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
  const missing = section.delivery.audioPlaysOnce
    ? section.items.filter((i) => !i.audioPath).map((i) => i.id)
    : [];
  const audioMissing = missing.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-navy">{t(section.name, ui)}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {ui === 'en'
              ? `${section.items.length} questions · ${Math.round(section.timeLimitSec / 60)} minutes for the whole section · ${answeredCount} answered`
              : `${section.items.length} questions · ${Math.round(section.timeLimitSec / 60)} minutes pour l'ensemble · ${answeredCount} répondues`}
          </p>
        </div>
        <SectionClock
          seconds={left}
          tone={left < 60 ? 'warn' : 'normal'}
          label={ui === 'en' ? 'left' : 'restant'}
        />
      </header>

      <ProgressBar value={answeredCount} total={section.items.length} />

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
                  ? `${missing.length} of ${section.items.length} items have no recording: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}`
                  : `${missing.length} items sur ${section.items.length} n'ont pas d'enregistrement : ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}`}
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
        <ol className="space-y-4">
          {section.items.map((item, n) => (
            <li key={item.id}>
              <Item
                item={item}
                n={n}
                sectionId={section.id}
                chose={answers[item.id] ?? null}
                onChoose={answerItem}
                showContent
              />
            </li>
          ))}
        </ol>
      ) : (
        <OneAtATime
          section={section}
          cursor={cursor}
          setCursor={setCursor}
          chose={answers[section.items[cursor].id] ?? null}
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

function OneAtATime({
  section,
  cursor,
  setCursor,
  chose,
  onChoose,
  ui,
}: {
  section: ComprehensionSection;
  cursor: number;
  setCursor: (n: number) => void;
  chose: number | null;
  onChoose: (sectionId: string, itemId: string, chose: number | null) => void;
  ui: LanguageCode;
}) {
  const item = section.items[cursor];
  const [played, setPlayed] = useState(false);

  useEffect(() => setPlayed(false), [cursor]);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <span className="chip">
          {ui === 'en'
            ? `Question ${cursor + 1} of ${section.items.length}`
            : `Question ${cursor + 1} sur ${section.items.length}`}
        </span>
        <div className="mt-4">
          <PlayOnce
            src={resolveAudio(item.audioPath)}
            played={played}
            // One play. The flag is set before the audio starts, so a reload,
            // a second click or a failed play does not buy a second listen.
            onPlayed={() => setPlayed(true)}
            label={
              played
                ? ui === 'en' ? 'Played' : 'Écouté'
                : ui === 'en' ? 'Play — once only' : 'Écouter — une seule fois'
            }
            note={
              section.delivery.questionAfterAudio && !played
                ? ui === 'en'
                  ? 'The question appears after the recording, as it does in the exam.'
                  : "La question apparaît après l'enregistrement, comme à l'examen."
                : undefined
            }
          />
        </div>
      </div>

      {(!section.delivery.questionAfterAudio || played) && (
        <Item
          item={item}
          n={cursor}
          sectionId={section.id}
          chose={chose}
          onChoose={onChoose}
          showContent={false}
        />
      )}

      <div className="flex gap-2">
        <button
          disabled={cursor === 0}
          onClick={() => setCursor(cursor - 1)}
          className="btn-secondary flex-1"
        >
          {ui === 'en' ? 'Previous' : 'Précédent'}
        </button>
        <button
          disabled={cursor >= section.items.length - 1}
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
  showContent,
}: {
  item: ComprehensionItem;
  n: number;
  sectionId: string;
  chose: number | null;
  onChoose: (sectionId: string, itemId: string, chose: number | null) => void;
  showContent: boolean;
}) {
  return (
    <div className="card p-6">
      {showContent && <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{item.content}</p>}
      <p className={clsx('font-medium text-ink-primary', showContent && 'mt-4')}>
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

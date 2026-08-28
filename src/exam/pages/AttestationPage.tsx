import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Trash2, Upload } from 'lucide-react';
import clsx from 'clsx';
import { useExam } from '../state';
import type { SkillId } from '../model/types';
import { IRCC_ACCEPTED, irccAge } from '../model/ircc';
import { PROVISIONAL_REFUSAL, TCF_VARIANTS, variantById, type TcfVariantId } from '../model/tcf-variants';
import { IELTS_REFUSALS, type IeltsModule, type IeltsTrfKind } from '../model/ielts-variants';
import { CONSENT_POINTS, isExpired, kindOf, type Attestation, type EntryMethod, type Verification } from '../model/attestation';
import { gapMonthsFrom, loadAttestations, newAttestationId, saveAttestation, withdrawAttestation } from '../model/attestationStore';
import { toBenchmark } from '../engine/aggregate';
import { formatScale, t } from '../model/format';

/**
 * Upload and type. §1.4, and the design is the point rather than a
 * workaround.
 *
 * The candidate types the four scores — **that is the source of truth** —
 * and may add the image, which is read once and discarded in the same
 * request. So the promise never depends on OCR, typing is a deliberate
 * consent act, and a disagreement between the two is simultaneously a fraud
 * signal and a data-quality signal.
 *
 * **No OCR is bound today.** That is stated on the screen rather than
 * hidden: an image that is offered is recorded as unread, the typed values
 * stand, and the plan is built. §1.4's own table already prescribes exactly
 * that row, which is why the screen ships now instead of after proof 2.
 *
 * `kind` is not asked. It is derived — see `kindOf`.
 */
export default function AttestationPage() {
  const { exam, ui } = useExam();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  // What the AWARDING BODY reports, not what we have built.
  //
  // This read `sections` until 2026-08-28, and rendering it caught the
  // defect: an IELTS candidate holding a Test Report Form with four bands
  // was shown two boxes, because listening and reading are not built here.
  // The candidate's document does not care what we built. `awards` does not
  // either — see `types.ts`.
  /**
   * Which TCF the candidate is holding.
   *
   * Asked BEFORE any score box is shown, and the boxes are built from the
   * answer. Sixteen real score reports contained four different TCF
   * examinations printing four different sets of épreuves; a form that shows
   * four boxes and calls them "your TCF scores" is wrong for three of them.
   * `null` means not yet answered, and nothing is shown until it is.
   */
  const [tcf, setTcf] = useState<TcfVariantId | null>(null);
  /**
   * IELTS asks two questions instead of five, and neither is about layout.
   *
   * Academic and General Training print the identical form — so unlike the
   * TCF there is nothing to detect from shape, and the module has to be
   * asked. It decides everything: IRCC does not accept Academic for economic
   * immigration, and four of the eight real Test Report Forms in the corpus
   * are Academic.
   *
   * `trfKind` is the newer hazard. Since 2023 a candidate can retake one
   * skill and receive a SECOND genuine Test Report Form that disagrees with
   * the first. Nothing on either page says which one IRCC will read, and no
   * checksum can find it — the two forms are each internally consistent.
   * Only asking works.
   */
  const [module_, setModule] = useState<IeltsModule | null>(null);
  const [trfKind, setTrfKind] = useState<IeltsTrfKind>('original');

  const isFrench = exam.language === 'fr';
  const variant = tcf ? variantById(tcf) : null;
  // The épreuves the DOCUMENT carries, in our own skill ids.
  const EPREUVE_SKILL: Record<string, string> = {
    comprehension_orale: 'listening',
    comprehension_ecrite: 'reading',
    expression_ecrite: 'writing',
    expression_orale: 'speaking',
  };
  const fields = useMemo(() => {
    const all = exam.awards.map((a) => ({ id: a.skill, label: a.label, scaleId: a.scaleId }));
    if (!variant) return all;
    // Only the boxes this variant actually prints, and only where we have a
    // scale for them. `maîtrise des structures` has no counterpart at all,
    // which is why the variant is refused rather than partly filled.
    const printed = new Set(
      [...variant.required, ...variant.optional].map((e) => EPREUVE_SKILL[e]).filter(Boolean),
    );
    return all.filter((f) => printed.has(f.id as string));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, tcf]);

  const [scores, setScores] = useState<Record<string, string>>({});
  // Which épreuves the candidate did not sit.
  //
  // Added 2026-08-28 after eight real score reports were read into the model.
  // Two of them print « Non inscrit(e) à cette épreuve » where a mark would
  // go — TCF's expression épreuves are optional and are sat separately. The
  // form as it stood demanded four numbers and would not submit without
  // them, so those two documents could not be entered at all, and the only
  // way through was to invent a mark.
  const [notSat, setNotSat] = useState<Record<string, boolean>>({});
  const [expiry, setExpiry] = useState('');
  const [docStatus, setDocStatus] = useState<'definitive' | 'provisional'>('definitive');
  const [sat, setSat] = useState('');
  const [studied, setStudied] = useState<boolean | null>(null);
  const [imageState, setImageState] = useState<'none' | 'unread'>('none');
  const [consented, setConsented] = useState(false);
  const [saved, setSaved] = useState<Attestation | null>(null);
  const existing = loadAttestations().filter((a) => a.examId === exam.id);

  const scaleOf = (id?: string) => exam.scales.find((s) => s.id === id);
  const errorFor = (f: { id: string; scaleId?: string }) => {
    if (notSat[f.id]) return null;
    const raw = scores[f.id];
    if (raw === undefined || raw === '') return null;
    const v = Number(raw);
    const sc = scaleOf(f.scaleId);
    if (!sc) return null;
    if (Number.isNaN(v)) return ui === 'en' ? 'Not a number' : 'Ce n’est pas un nombre';
    if (v < sc.min || v > sc.max)
      return ui === 'en' ? `Outside ${sc.min}–${sc.max}` : `Hors de ${sc.min}–${sc.max}`;
    // The scale declares its smallest reportable increment and the form has
    // to honour it. IELTS reports half bands and nothing between them, so
    // 4.7 is not a low score — it is not a score. Added after a real Test
    // Report Form showed the scale itself had been wrong.
    if (sc.step > 0 && Math.abs(v / sc.step - Math.round(v / sc.step)) > 1e-9)
      return ui === 'en'
        ? `This exam reports in steps of ${sc.step}`
        : `Cet examen est noté par paliers de ${sc.step}`;
    return null;
  };

  // A field is answered when it holds a valid score OR is marked not sat.
  // At least one real mark is still required — an attestation with four
  // blanks is not evidence of anything and there would be nothing to build
  // a plan from.
  const ieltsBlocked = !isFrench && (module_ !== 'general_training' || trfKind !== 'original');
  const complete =
    sat !== '' &&
    consented &&
    (!isFrench || (tcf !== null && variant?.irccAccepted === true)) &&
    !ieltsBlocked &&
    fields.some((f) => !notSat[f.id]) &&
    fields.every((f) => notSat[f.id] || (scores[f.id] !== undefined && scores[f.id] !== '' && !errorFor(f)));

  /**
   * Read once, never stored. The handler takes the file, records that an
   * image was offered, and lets it go — there is nowhere in `Attestation`
   * to put it even if someone tried.
   */
  const takeImage = () => {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    setImageState('unread');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = () => {
    if (!complete) return;
    const awarded: Record<string, number | null> = {};
    const benchmark: Record<string, number | null> = {};
    for (const f of fields) {
      if (notSat[f.id]) {
        // Not zero. Nobody sat it, so there is no mark and no level, and
        // both have to stay empty all the way down to the planner.
        awarded[f.id] = null;
        benchmark[f.id] = null;
        continue;
      }
      const v = Number(scores[f.id]);
      awarded[f.id] = v;
      // The skill is passed, and it has to be: IRCC converts each IELTS skill
      // differently on the same 0-9 scale. See `types.ts` on `bySkill`.
      benchmark[f.id] = toBenchmark(v, exam.benchmark, f.scaleId, f.id as SkillId) ?? null;
    }
    const entryMethod: EntryMethod = imageState === 'none' ? 'typed' : 'typed+image_unread';
    // Three states, and which one applies is a property of the DOCUMENT, not
    // of the language. A CIEP attestation carries no QR — there is nothing to
    // follow, and filing that as "unverified" reads as though we could not be
    // bothered. A current FEI attestation does carry one, and no reader here
    // is bound to it, which is the same closure as IELTS restricting checks
    // to Recognising Organisations: a check exists and we did not make it.
    const verification: Verification = variant
      ? variant.hasQr
        ? 'not_available'
        : 'no_qr_legacy_format'
      : 'not_available';
    const base = { responseIds: [] as string[] };
    const a: Attestation = {
      id: newAttestationId(),
      examId: exam.id,
      kind: kindOf(base),
      entryMethod,
      verification,
      language: exam.language,
      sat: sat as `${number}-${number}`,
      awarded: awarded as Attestation['awarded'],
      benchmark: { system: exam.benchmark.system, ...(benchmark as object) } as Attestation['benchmark'],
      responseIds: base.responseIds,
      studiedSince: studied,
      expiresAt: expiry === '' ? null : expiry,
      documentStatus: docStatus,
      provenance: 'volunteered',
      consentedAt: new Date().toISOString(),
      retainUntil: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString(),
    };
    saveAttestation(a);
    setSaved(a);
  };

  if (saved) {
    const gap = gapMonthsFrom(saved.sat);
    const expired = isExpired(saved);
    // IRCC's two-year rule, which is stricter than any expiry the paper
    // prints and is the one that actually decides. Applied to the month the
    // candidate typed, shown so they can check it themselves.
    const age = irccAge(saved.sat);
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold text-navy">
            {ui === 'en' ? 'Recorded. Your plan is built on these marks.' : 'Enregistré. Votre plan repose sur ces notes.'}
          </h1>
          <p className="mt-1 text-ink-secondary">
            {ui === 'en'
              ? 'The value and the record arrive in the same moment — that is the whole arrangement.'
              : "La valeur et l'enregistrement arrivent au même instant — c'est tout l'accord."}
          </p>
        </header>
        <div className="rounded-xl border-2 border-teal bg-teal/10 p-5 text-sm text-navy">
          <div className="grid gap-1">
            {fields.map((f) => (
              <div key={f.id} className="flex justify-between">
                <span>{t(f.label, ui)}</span>
                {/* Through the scale, not raw. The scale declares how many
                    decimals its awards carry, and a screen that ignores it
                    showed a real 5.0 as "5" — the same class of defect as the
                    scale itself declaring `decimals: 0` for an exam that
                    reports halves. */}
                <span className="font-semibold">
                  {(() => {
                    const v = saved.awarded[f.id as keyof Attestation['awarded']];
                    const b = saved.benchmark[f.id as keyof Attestation['benchmark']] as number | null;
                    // `null` is a value, not a missing one, and it renders as
                    // words rather than as an empty cell or a dash the
                    // candidate has to interpret.
                    if (v === null)
                      return (
                        <span className="text-ink-secondary">
                          {ui === 'en' ? 'not sat' : 'non passée'}
                        </span>
                      );
                    return (
                      <>
                        {formatScale(v, scaleOf(f.scaleId)!, ui)} · {saved.benchmark.system}{' '}
                        {b === null ? '—' : b}
                      </>
                    );
                  })()}
                </span>
              </div>
            ))}
          </div>
          {age === 'past' && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900">
              {ui === 'en'
                ? `This sitting was ${gap} months ago. IRCC requires results to be less than two years old both when you complete your Express Entry profile and again when you submit your application, so you will need to sit the exam again before you file. Your plan is built on these marks all the same — they measure you, and they are the best starting point we have.`
                : `Cette épreuve remonte à ${gap} mois. IRCC exige des résultats de moins de deux ans au moment où vous complétez votre profil Entrée express et de nouveau au dépôt de votre demande : il faudra donc repasser l'examen avant de déposer. Votre plan repose malgré tout sur ces notes — elles vous mesurent, et c'est le meilleur point de départ dont nous disposions.`}
            </p>
          )}
          {expired === true && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900">
              {ui === 'en'
                ? 'This result has passed the validity period printed on it. Your plan is still built from these marks — they are a true measurement of you — but IRCC will not accept the document itself, and you will need to sit the exam again before you file.'
                : "Ce résultat a dépassé la durée de validité qui y figure. Votre plan repose toujours sur ces notes — elles vous mesurent réellement — mais IRCC n'acceptera pas le document lui-même, et il faudra repasser l'examen avant de déposer votre dossier."}
            </p>
          )}
          {saved.documentStatus === 'provisional' && (
            <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-ink-secondary">
              {ui === 'en'
                ? 'Recorded as a provisional results sheet. It builds your plan exactly like a definitive one. It is kept separate when we measure how closely our marking agrees with official marking, because the awarding body does not stand behind it in the same way.'
                : "Enregistré comme fiche de résultats provisoires. Elle bâtit votre plan exactement comme une attestation définitive. Elle est comptée à part lorsque nous mesurons l'accord entre notre correction et la correction officielle, car l'organisme n'en répond pas de la même manière."}
            </p>
          )}
          <p className="mt-4 text-xs text-ink-secondary">
            {ui === 'en'
              ? `Kind: ${saved.kind} — derived from your record, not asked. Sitting was ${gap} month(s) before today, and that interval is published with any figure this contributes to.`
              : `Type : ${saved.kind} — déduit de votre dossier, jamais demandé. L'épreuve remonte à ${gap} mois, et cet intervalle est publié avec tout chiffre auquel cet enregistrement contribue.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => nav('/')} className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">
            {ui === 'en' ? 'Continue' : 'Continuer'}
          </button>
          <button
            type="button"
            onClick={() => { withdrawAttestation(saved.id); setSaved(null); }}
            className="flex items-center gap-2 rounded-xl border-2 border-surface-divider px-5 py-3 text-sm font-medium text-ink-secondary"
          >
            <Trash2 className="h-4 w-4" />
            {ui === 'en' ? 'Withdraw it' : 'Le retirer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">
          {ui === 'en' ? 'Have you sat this exam before?' : 'Avez-vous déjà passé cet examen ?'}
        </h1>
        <p className="mt-1 text-ink-secondary">
          {ui === 'en'
            ? 'If you have, your real marks build a better plan than any test we could give you. However long ago it was.'
            : "Si oui, vos notes réelles bâtissent un meilleur plan que n'importe quel test de notre part. Quelle que soit son ancienneté."}
        </p>
      </header>

      {IRCC_ACCEPTED[exam.id]?.caution && (
        <p className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {IRCC_ACCEPTED[exam.id].caution![ui]}
        </p>
      )}

      <section className="rounded-xl border-2 border-surface-divider bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <ShieldCheck className="h-4 w-4 text-teal" />
          {ui === 'en' ? 'What we take, and what we never keep' : 'Ce que nous relevons, et ce que nous ne gardons jamais'}
        </div>
        <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
          {CONSENT_POINTS[ui].map((p) => (
            <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" /><span>{p}</span></li>
          ))}
        </ul>
        <label className="mt-4 flex items-start gap-3 text-sm text-navy">
          <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1" />
          <span>{ui === 'en' ? 'I have read this and I agree.' : "J'ai lu ce qui précède et j'accepte."}</span>
        </label>
      </section>

      {!isFrench && (
        <section className="rounded-xl border-2 border-surface-divider bg-white p-5">
          <span className="text-sm font-semibold text-navy">
            {ui === 'en' ? 'Which IELTS is on your form?' : 'Quel IELTS figure sur votre attestation ?'}
          </span>
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'Academic and General Training print the identical Test Report Form, so there is no way to tell from the layout. The module is the box at the top right of your page.'
              : "L'Academic et le General Training impriment une attestation identique : rien dans la mise en page ne les distingue. Le module figure dans la case en haut à droite de votre page."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              ['general_training', 'GENERAL TRAINING'],
              ['academic', 'ACADEMIC'],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setModule(v)}
                className={clsx(
                  'rounded-xl border-2 px-4 py-2 text-sm font-medium',
                  module_ === v ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="mt-5 block text-sm font-semibold text-navy">
            {ui === 'en' ? 'Is this a One Skill Retake report?' : "S'agit-il d'une attestation One Skill Retake ?"}
          </span>
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'If you retook a single skill you were given a second, separate form carrying just that skill. Both are real, and they disagree — so we have to know which one you are entering.'
              : "Si vous avez repassé une seule épreuve, vous avez reçu une deuxième attestation distincte ne portant que cette épreuve. Les deux sont authentiques et se contredisent : nous devons savoir laquelle vous saisissez."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              ['original', ui === 'en' ? 'My original, full form' : "Mon attestation d'origine, complète"],
              ['one_skill_retake', ui === 'en' ? 'A One Skill Retake' : 'Une One Skill Retake'],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setTrfKind(v)}
                className={clsx(
                  'rounded-xl border-2 px-4 py-2 text-sm',
                  trfKind === v ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {module_ === 'academic' && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{IELTS_REFUSALS.academic[ui]}</p>
          )}
          {trfKind === 'one_skill_retake' && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              {IELTS_REFUSALS.one_skill_retake[ui]}
            </p>
          )}
        </section>
      )}

      {isFrench && (
        <section className="rounded-xl border-2 border-surface-divider bg-white p-5">
          <span className="text-sm font-semibold text-navy">
            {ui === 'en' ? 'Which TCF is on your attestation?' : 'Quel TCF figure sur votre attestation ?'}
          </span>
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'The TCF is a family of exams, not one exam. They print different épreuves on different scales, and asking for "your TCF scores" without asking this first is wrong for most of them. The title is at the top of your document.'
              : "Le TCF est une famille d'examens, pas un examen. Ils rapportent des épreuves différentes sur des barèmes différents, et demander « vos notes au TCF » sans poser d'abord cette question est faux pour la plupart d'entre eux. Le titre figure en haut de votre document."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TCF_VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => { setTcf(v.id); setScores({}); setNotSat({}); }}
                className={clsx(
                  'rounded-xl border-2 px-4 py-2 text-sm',
                  tcf === v.id ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary',
                )}
              >
                {v.label[ui]}
              </button>
            ))}
          </div>
          {variant && !variant.irccAccepted && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              {variant.id === 'provisional' ? PROVISIONAL_REFUSAL[ui] : variant.why![ui]}
              {variant.qcmMax === null && (
                <>
                  {' '}
                  {ui === 'en'
                    ? 'We also do not calculate a level from it: its published score scale is not agreed between sources, and a scale guessed wrong moves a result by more than a full level.'
                    : "Nous n'en calculons pas non plus de niveau : son barème publié n'est pas concordant selon les sources, et un barème deviné à tort déplace un résultat de plus d'un niveau entier."}
                </>
              )}
            </p>
          )}
        </section>
      )}

      {((!isFrench && !ieltsBlocked) || (isFrench && variant && variant.irccAccepted)) && (
      <section className="grid gap-4">
        <div>
          <label className="text-sm font-medium text-navy">
            {ui === 'en' ? 'Month of the sitting' : "Mois de l'épreuve"}
          </label>
          <input
            type="month"
            value={sat}
            onChange={(e) => setSat(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-surface-divider px-4 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'Month only. The day is not needed, and a full date plus a centre narrows a person considerably.'
              : "Le mois seulement. Le jour n'est pas nécessaire, et une date complète avec un centre identifie fortement une personne."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => {
            const sc = scaleOf(f.scaleId);
            const err = errorFor(f);
            const off = !!notSat[f.id];
            return (
              <div key={f.id}>
                <label className="text-sm font-medium text-navy">{t(f.label, ui)}</label>
                <input
                  inputMode="decimal"
                  value={off ? '' : scores[f.id] ?? ''}
                  disabled={off}
                  onChange={(e) => setScores({ ...scores, [f.id]: e.target.value })}
                  placeholder={off ? (ui === 'en' ? 'not sat' : 'non passée') : sc ? `${sc.min}–${sc.max}` : ''}
                  className={clsx(
                    'mt-1 w-full rounded-xl border-2 px-4 py-3 text-sm',
                    off ? 'border-surface-divider bg-surface-muted text-ink-secondary' : err ? 'border-red-400' : 'border-surface-divider',
                  )}
                />
                {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                <label className="mt-1 flex items-center gap-2 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={off}
                    onChange={(e) => setNotSat({ ...notSat, [f.id]: e.target.checked })}
                  />
                  <span>
                    {ui === 'en'
                      ? 'My attestation says I did not sit this one'
                      : "Mon attestation indique « Non inscrit(e) à cette épreuve »"}
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-navy">
              {ui === 'en' ? 'Valid until, if it says' : "Valable jusqu'au, si c'est indiqué"}
            </label>
            <input
              type="month"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-surface-divider px-4 py-3 text-sm"
            />
            <p className="mt-1 text-xs text-ink-secondary">
              {ui === 'en'
                ? 'Leave it blank if your document prints no expiry. Month only, for the same reason as above.'
                : "Laissez vide si votre document n'indique aucune échéance. Le mois seulement, pour la même raison que ci-dessus."}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-navy">
              {ui === 'en' ? 'Which document is it?' : 'De quel document s’agit-il ?'}
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {([
                ['definitive', ui === 'en' ? 'The official result' : 'Attestation définitive'],
                ['provisional', ui === 'en' ? 'A provisional sheet' : 'Fiche provisoire'],
              ] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDocStatus(v)}
                  className={clsx(
                    'rounded-xl border-2 px-4 py-2 text-sm',
                    docStatus === v ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              {ui === 'en'
                ? 'A provisional sheet builds your plan just the same. It only changes which pile it sits in when we publish how closely our marking agrees with official marking.'
                : "Une fiche provisoire bâtit votre plan exactement pareil. Elle change seulement le lot auquel elle appartient quand nous publions l'accord entre notre correction et la correction officielle."}
            </p>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-navy">
            {ui === 'en' ? 'Have you studied since that sitting?' : 'Avez-vous étudié depuis cette épreuve ?'}
          </span>
          <p className="mt-1 text-xs text-ink-secondary">
            {ui === 'en'
              ? 'It changes how much weight this result carries when we check our marking against official marking. It never changes your plan.'
              : "Cela change le poids de ce résultat quand nous comparons notre correction à la correction officielle. Cela ne change jamais votre plan."}
          </p>
          <div className="mt-2 flex gap-2">
            {([[true, ui === 'en' ? 'Yes' : 'Oui'], [false, ui === 'en' ? 'No' : 'Non'], [null, ui === 'en' ? 'Rather not say' : 'Je préfère ne pas dire']] as const).map(([v, label]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setStudied(v)}
                className={clsx(
                  'rounded-xl border-2 px-4 py-2 text-sm',
                  studied === v ? 'border-teal bg-teal/10 text-navy' : 'border-surface-divider text-ink-secondary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-surface-divider p-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm font-medium text-navy"
          >
            <Upload className="h-4 w-4" />
            {ui === 'en' ? 'Add a photo of the attestation (optional)' : "Ajouter une photo de l'attestation (facultatif)"}
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={takeImage} />
          <p className="mt-2 text-xs text-ink-secondary">
            {imageState === 'unread'
              ? ui === 'en'
                ? 'Image received and discarded. Automatic reading is not available yet, so it is recorded as unread and your typed values stand — which is exactly what the design says should happen.'
                : "Image reçue puis détruite. La lecture automatique n'est pas encore disponible : elle est donc notée comme non lue et vos valeurs saisies font foi — ce que le modèle prévoit précisément."
              : ui === 'en'
                ? 'Never stored. It is read in the same moment it arrives and then discarded.'
                : "Jamais conservée. Elle est lue au moment même où elle arrive, puis détruite."}
          </p>
        </div>
      </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!complete}
          onClick={submit}
          className={clsx(
            'rounded-xl px-5 py-3 text-sm font-semibold',
            complete ? 'bg-navy text-white' : 'cursor-not-allowed bg-surface-muted text-ink-secondary',
          )}
        >
          {ui === 'en' ? 'Build my plan from these marks' : 'Bâtir mon plan à partir de ces notes'}
        </button>
        <button type="button" onClick={() => nav('/')} className="rounded-xl border-2 border-surface-divider px-5 py-3 text-sm font-medium text-ink-secondary">
          {ui === 'en' ? 'I have not sat it — start teaching' : "Je ne l'ai pas passé — commencer l'apprentissage"}
        </button>
      </div>
      <p className="text-xs text-ink-secondary">
        {ui === 'en'
          ? 'Skipping this changes nothing about what you can use. You will be asked again later, and never blocked.'
          : "Passer cette étape ne change rien à ce que vous pouvez utiliser. La question reviendra plus tard, et ne bloque jamais."}
      </p>
      {existing.length > 0 && (
        <p className="text-xs text-ink-secondary">
          {ui === 'en' ? `${existing.length} attestation(s) already recorded for this exam.` : `${existing.length} attestation(s) déjà enregistrée(s) pour cet examen.`}
        </p>
      )}
    </div>
  );
}

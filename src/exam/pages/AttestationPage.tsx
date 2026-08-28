import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Trash2, Upload } from 'lucide-react';
import clsx from 'clsx';
import { useExam } from '../state';
import type { SkillId } from '../model/types';
import { CONSENT_POINTS, kindOf, type Attestation, type EntryMethod, type Verification } from '../model/attestation';
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
  const fields = useMemo(
    () => exam.awards.map((a) => ({ id: a.skill, label: a.label, scaleId: a.scaleId })),
    [exam],
  );

  const [scores, setScores] = useState<Record<string, string>>({});
  const [sat, setSat] = useState('');
  const [studied, setStudied] = useState<boolean | null>(null);
  const [imageState, setImageState] = useState<'none' | 'unread'>('none');
  const [consented, setConsented] = useState(false);
  const [saved, setSaved] = useState<Attestation | null>(null);
  const existing = loadAttestations().filter((a) => a.examId === exam.id);

  const scaleOf = (id?: string) => exam.scales.find((s) => s.id === id);
  const errorFor = (f: { id: string; scaleId?: string }) => {
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

  const complete =
    sat !== '' &&
    consented &&
    fields.every((f) => scores[f.id] !== undefined && scores[f.id] !== '' && !errorFor(f));

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
    const awarded: Record<string, number> = {};
    const benchmark: Record<string, number> = {};
    for (const f of fields) {
      const v = Number(scores[f.id]);
      awarded[f.id] = v;
      // The skill is passed, and it has to be: IRCC converts each IELTS skill
      // differently on the same 0-9 scale. See `types.ts` on `bySkill`.
      benchmark[f.id] = toBenchmark(v, exam.benchmark, f.scaleId, f.id as SkillId) ?? 0;
    }
    const entryMethod: EntryMethod = imageState === 'none' ? 'typed' : 'typed+image_unread';
    // TCF and TEF publish a QR anyone can follow; IELTS restricts
    // verification to registered Recognising Organisations, which we are
    // not. §2.4: never mixed silently.
    const verification: Verification = exam.language === 'fr' ? 'unverified' : 'not_available';
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
      provenance: 'volunteered',
      consentedAt: new Date().toISOString(),
      retainUntil: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString(),
    };
    saveAttestation(a);
    setSaved(a);
  };

  if (saved) {
    const gap = gapMonthsFrom(saved.sat);
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
                  {formatScale(
                    saved.awarded[f.id as keyof Attestation['awarded']],
                    scaleOf(f.scaleId)!,
                    ui,
                  )}{' '}
                  · {saved.benchmark.system}{' '}
                  {saved.benchmark[f.id as keyof Attestation['benchmark']] as number}
                </span>
              </div>
            ))}
          </div>
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
            return (
              <div key={f.id}>
                <label className="text-sm font-medium text-navy">{t(f.label, ui)}</label>
                <input
                  inputMode="decimal"
                  value={scores[f.id] ?? ''}
                  onChange={(e) => setScores({ ...scores, [f.id]: e.target.value })}
                  placeholder={sc ? `${sc.min}–${sc.max}` : ''}
                  className={clsx(
                    'mt-1 w-full rounded-xl border-2 px-4 py-3 text-sm',
                    err ? 'border-red-400' : 'border-surface-divider',
                  )}
                />
                {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
              </div>
            );
          })}
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

/**
 * A runnable check on the deterministic gate — no judge, no network, no cost.
 *
 * Five responses to TCF Tâche 3, four of which should be refused for four
 * different reasons and one of which must pass. It is here because writing
 * the comparison rule was the easy half; the first run of this file zeroed
 * the model answer three separate ways, and every threshold in tâche 3's
 * gate was corrected because of what it printed.
 *
 *   npx tsc src/exam/engine/gate.check.ts --outDir /tmp/gc --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/gc/engine/gate.check.js
 */
import { runGate } from './gate';
import { TCF_CANADA } from '../definitions/tcf-canada';

const CASES: Array<[string, string]> = [
  ['both documents', `Les deux documents abordent la fermeture du centre-ville aux voitures le samedi.
L'avis municipal met en avant la pollution, la place rendue aux marchés et au vélo, et
présente cette mesure comme un progrès pour les piétons. La lettre des commerçants, au
contraire, soutient que le chiffre d'affaires baissera, que les livraisons n'auront plus
d'endroit où s'arrêter et que la clientèle à mobilité réduite renoncera à venir. Pour ma
part, je pense que les deux positions se rejoignent davantage qu'il n'y paraît : on peut
réduire la pollution sans ruiner les boutiques, à condition de prévoir des créneaux de
livraison tôt le matin et un transport adapté pour les personnes qui en ont besoin. En
conclusion, la mesure me semble souhaitable mais incomplète telle qu'elle est présentée.`],
  ['only the municipal notice', `L'avis municipal annonce la fermeture du centre-ville aux voitures le samedi. Cette
mesure vise à réduire la pollution et à laisser la place aux marchés et au vélo. Je
trouve cette idée excellente. Dans ma ville, l'air est irrespirable le week-end et les
piétons n'ont nulle part où marcher tranquillement. Rendre le centre aux habitants me
paraît une évidence, et beaucoup de villes européennes l'ont déjà fait avec succès. Le
samedi est le bon jour puisque c'est celui où les familles sortent. Je pense que la
municipalité devrait même aller plus loin et étendre la mesure au dimanche, car la
pollution ne s'arrête pas au week-end et le vélo mérite plus de place en ville.`],
  ['only the shopkeepers', `La lettre des commerçants explique que la fermeture fera baisser le chiffre d'affaires
des boutiques du centre. Les livraisons n'auront plus d'endroit où s'arrêter, ce qui est
un vrai problème pour les commerces qui reçoivent des marchandises chaque matin. La
clientèle à mobilité réduite, elle, ne pourra plus se garer près des magasins et ira
ailleurs. Je partage cette inquiétude. Un commerce de quartier vit de ses habitués, et
ces habitués sont souvent des personnes âgées qui viennent en voiture. Si les ventes
chutent, les boutiques fermeront et le centre-ville sera vide, ce qui serait le contraire
du but recherché par la mairie. Il me semble donc qu'une consultation sérieuse des
commerçants aurait dû précéder cette annonce, et qu'un compromis reste possible si la
municipalité accepte d'aménager des places de stationnement réservées à proximité.`],
  ['short, both documents', `Le premier document parle de pollution et de vélo. Le second parle des commerçants et
des livraisons. Je suis plutôt d'accord avec la mairie.`],
  ['lifted sentences, long', `Les deux documents abordent la circulation. Un avis municipal annonçant la fermeture du
centre-ville aux voitures le samedi, afin de réduire la pollution et de laisser la place
aux marchés et au vélo. Une lettre d'une association de commerçants soutenant que cette
fermeture fera baisser le chiffre d'affaires, que les livraisons n'auront plus où
s'arrêter, et que la clientèle à mobilité réduite ne viendra plus. Voilà ce que disent
les deux textes. Je trouve que c'est un sujet intéressant et important pour toutes les
villes modernes qui cherchent un équilibre entre l'environnement et l'économie locale,
et je pense que chacun peut comprendre les deux points de vue exprimés ici. Il faudrait
sans doute discuter davantage avec les habitants avant de décider quoi que ce soit, car
c'est toujours mieux quand tout le monde participe à ce genre de décision publique.`],
];

const task = TCF_CANADA.sections.flatMap((s) => s.tasks).find((t) => t.id === 'tcf-ee-t3')!;
console.log('TCF Tache 3 — deterministic gate only, no judge, no network\n');
for (const [name, text] of CASES) {
  const r = runGate(task, text, task.prompt.fr);
  const zero = r.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId);
  const warn = r.findings.filter((f) => f.kind !== 'zero').map((f) => f.ruleId);
  console.log(`  ${name.padEnd(26)} words=${String(r.measurements.wordCount).padStart(3)}  ` +
    `${r.zeroed ? 'ZEROED' : 'passes'}  ${zero.length ? '[' + zero.join(', ') + ']' : ''}${warn.length ? ' warn:[' + warn.join(',') + ']' : ''}`);
  for (const h of r.measurements.sourceHits) console.log(`       ${h.id}: ${h.hits}/${h.need} hits`);
}

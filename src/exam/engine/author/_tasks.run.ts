import { EXAMS } from '../../definitions';
for (const exam of EXAMS) {
  for (const s of exam.sections) {
    if (s.kind !== 'production') continue;
    for (const t of s.tasks) {
      const lang = exam.language;
      console.log(`\n=== ${t.id} (${t.skill}) — ${t.name[lang]} | ${t.wordGuidance?.[lang] ?? ''} | ${t.timeLimitSec}s`);
      console.log('INSTRUCTION: ' + t.instruction[lang]);
      console.log('PROMPT: ' + t.prompt[lang]);
      console.log('KEYWORDS: ' + t.topicKeywords.join(', '));
    }
  }
}

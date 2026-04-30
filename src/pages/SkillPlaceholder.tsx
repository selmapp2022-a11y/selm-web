import { Construction } from 'lucide-react';

export default function SkillPlaceholder({ skill }: { skill: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal-600">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-navy">{skill}</h2>
        <p className="mt-2 text-ink-secondary">This skill is being built in the next phase. Stay tuned.</p>
      </div>
    </div>
  );
}

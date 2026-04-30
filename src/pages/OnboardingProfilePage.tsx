import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, GraduationCap, Target, Heart, Calendar, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const AGE_RANGES = ['13–17', '18–24', '25–34', '35–44', '45–54', '55+'];
const OCCUPATIONS = ['Student', 'Engineer', 'Doctor / Healthcare', 'Business / Finance', 'Teacher', 'Designer', 'Marketing', 'Researcher', 'Other'];
const EDUCATION = ['High school', "Bachelor's", "Master's", 'PhD', 'Self-taught'];
const GOALS = ['Career growth', 'Travel', 'IELTS / TOEFL', 'Academic study', 'Daily conversation', 'Entertainment'];
const INTERESTS = ['Tech', 'Business', 'Health', 'Science', 'Arts', 'Sports', 'News', 'Lifestyle', 'Food', 'Music', 'Movies', 'Gaming'];

export type DemographicProfile = {
  age_range: string;
  occupation: string;
  education: string;
  goal: string;
  interests: string[];
};

const STORAGE_KEY = 'selm_demographics';

export default function OnboardingProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<DemographicProfile>({
    age_range: '', occupation: '', education: '', goal: '', interests: [],
  });

  const steps = [
    { key: 'age_range', title: 'How old are you?', icon: Calendar, options: AGE_RANGES, multi: false },
    { key: 'occupation', title: 'What do you do?', icon: Briefcase, options: OCCUPATIONS, multi: false },
    { key: 'education', title: 'Your education level?', icon: GraduationCap, options: EDUCATION, multi: false },
    { key: 'goal', title: 'Why are you learning English?', icon: Target, options: GOALS, multi: false },
    { key: 'interests', title: 'What topics interest you?', subtitle: 'Pick up to 5 — your lessons will use these contexts.', icon: Heart, options: INTERESTS, multi: true },
  ] as const;

  const current = steps[step];
  const value = profile[current.key as keyof DemographicProfile];
  const isAnswered = current.multi ? (value as string[]).length > 0 : !!value;

  const choose = (opt: string) => {
    if (current.multi) {
      const arr = profile.interests;
      const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : arr.length < 5 ? [...arr, opt] : arr;
      setProfile({ ...profile, interests: next });
    } else {
      setProfile({ ...profile, [current.key]: opt });
      setTimeout(() => {
        if (step < steps.length - 1) setStep(step + 1);
      }, 200);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      navigate('/onboarding/assessment');
    }
  };

  const Icon = current.icon;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-secondary">Step {step + 1} of {steps.length}</span>
          <span className="font-medium text-ink-secondary">About you</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal-600">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">{current.title}</h2>
            {('subtitle' in current) && current.subtitle && <p className="text-sm text-ink-secondary">{current.subtitle}</p>}
          </div>
        </div>

        <div className={clsx('grid gap-3', current.multi ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
          {current.options.map((opt) => {
            const isSelected = current.multi
              ? (profile.interests as string[]).includes(opt)
              : (profile[current.key as keyof DemographicProfile] as string) === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => choose(opt)}
                className={clsx(
                  'rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                  isSelected
                    ? 'border-teal bg-teal/10 text-navy shadow-card'
                    : 'border-surface-divider bg-white text-ink-secondary hover:border-navy/40 hover:bg-surface-muted'
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost">
            Back
          </button>
          <button onClick={handleNext} disabled={!isAnswered} className="btn-primary">
            {step < steps.length - 1 ? 'Continue' : 'Start assessment'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mic, Headphones, BookOpen, PenLine, Flame, Target, TrendingUp, ChevronRight } from 'lucide-react';

const skills = [
  { to: '/speaking', label: 'Speaking', icon: Mic, color: 'from-teal-500 to-teal-600', desc: 'Practice with AI feedback' },
  { to: '/listening', label: 'Listening', icon: Headphones, color: 'from-navy to-navy-700', desc: 'Real-world audio' },
  { to: '/reading', label: 'Reading', icon: BookOpen, color: 'from-amber-500 to-orange-500', desc: 'Texts at your level' },
  { to: '/writing', label: 'Writing', icon: PenLine, color: 'from-purple-500 to-purple-600', desc: 'Live grammar coach' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="mt-1 text-ink-secondary">Ready for today's session?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Flame} label="Day streak" value="—" tone="orange" />
        <StatCard icon={Target} label="Today's goal" value={`${user ? '0' : '–'}/30 min`} tone="teal" />
        <StatCard icon={TrendingUp} label="Current level" value={user?.current_level || '—'} tone="navy" />
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-navy">Practice the four skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group card relative overflow-hidden p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy">{s.label}</h3>
              <p className="text-sm text-ink-secondary">{s.desc}</p>
              <ChevronRight className="absolute right-5 top-5 h-5 w-5 text-ink-disabled transition-transform group-hover:translate-x-1 group-hover:text-teal" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'orange' | 'teal' | 'navy' }) {
  const toneCls = { orange: 'bg-orange-100 text-orange-600', teal: 'bg-teal/10 text-teal-600', navy: 'bg-navy/10 text-navy' }[tone];
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-secondary">{label}</div>
          <div className="font-display text-2xl font-bold text-navy">{value}</div>
        </div>
      </div>
    </div>
  );
}

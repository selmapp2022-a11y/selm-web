import type { LucideIcon } from 'lucide-react';
import {
  Plane, UtensilsCrossed, Briefcase, Film, Heart, Sun,
  ShoppingBag, Stethoscope, Users, Music, Trophy, GraduationCap,
  Cpu, FlaskConical, Newspaper, Globe2, Leaf, Coffee,
  Home as HomeIcon, Car, Camera, BookOpen, Wallet, MessageCircle,
} from 'lucide-react';

export type Topic = {
  /** Internal value sent to the API (lowercase, simple). */
  value: string;
  /** Short English label shown big on the button. */
  label: string;
  /** One-line plain English explanation under the label. */
  description: string;
  icon: LucideIcon;
};

export const SPEAKING_TOPICS: Topic[] = [
  { value: 'travel', label: 'Travel', description: 'Trips, airports, hotels, sightseeing', icon: Plane },
  { value: 'food', label: 'Food & Cooking', description: 'Restaurants, recipes, ordering meals', icon: UtensilsCrossed },
  { value: 'work', label: 'Work Life', description: 'Office, meetings, jobs, careers', icon: Briefcase },
  { value: 'movies', label: 'Movies & TV', description: 'Films, series, actors, recommendations', icon: Film },
  { value: 'hobbies', label: 'Hobbies', description: 'Free time, interests, weekend plans', icon: Heart },
  { value: 'daily routine', label: 'Daily Routine', description: 'Morning, evening, everyday habits', icon: Sun },
  { value: 'shopping', label: 'Shopping', description: 'Stores, prices, sizes, returns', icon: ShoppingBag },
  { value: 'health', label: 'Health', description: 'Doctor visits, fitness, wellbeing', icon: Stethoscope },
  { value: 'family', label: 'Family & Friends', description: 'Relatives, relationships, social life', icon: Users },
  { value: 'music', label: 'Music', description: 'Songs, artists, concerts, playlists', icon: Music },
  { value: 'sports', label: 'Sports', description: 'Games, teams, exercise, players', icon: Trophy },
  { value: 'school', label: 'School & Study', description: 'Classes, exams, learning, university', icon: GraduationCap },
];

export const LISTENING_TOPICS: Topic[] = [
  { value: 'technology', label: 'Technology', description: 'Phones, apps, AI, gadgets', icon: Cpu },
  { value: 'science', label: 'Science', description: 'Discoveries, research, space', icon: FlaskConical },
  { value: 'health', label: 'Health', description: 'Medicine, fitness, mental health', icon: Stethoscope },
  { value: 'business', label: 'Business', description: 'Companies, money, work', icon: Briefcase },
  { value: 'climate', label: 'Climate', description: 'Weather, environment, energy', icon: Leaf },
  { value: 'sports', label: 'Sports', description: 'Games, athletes, tournaments', icon: Trophy },
  { value: 'travel', label: 'Travel', description: 'Places, cultures, journeys', icon: Plane },
  { value: 'food', label: 'Food', description: 'Cooking, recipes, restaurants', icon: UtensilsCrossed },
  { value: 'culture', label: 'Culture & Arts', description: 'Music, art, traditions', icon: Globe2 },
  { value: 'news', label: 'World News', description: 'Current events, headlines', icon: Newspaper },
  { value: 'lifestyle', label: 'Lifestyle', description: 'Daily life, habits, trends', icon: Coffee },
  { value: 'education', label: 'Education', description: 'Schools, learning, study tips', icon: GraduationCap },
];

export const READING_TOPICS: Topic[] = [
  { value: 'travel', label: 'Travel Story', description: 'A short story about a trip', icon: Plane },
  { value: 'home', label: 'At Home', description: 'Family and home life', icon: HomeIcon },
  { value: 'commute', label: 'On the Road', description: 'Transport, driving, traffic', icon: Car },
  { value: 'photography', label: 'Photography', description: 'Cameras, photos, memories', icon: Camera },
  { value: 'books', label: 'Books & Stories', description: 'Reading, literature, authors', icon: BookOpen },
  { value: 'money', label: 'Money & Saving', description: 'Budget, banks, prices', icon: Wallet },
  { value: 'conversation', label: 'A Conversation', description: 'Two people talking', icon: MessageCircle },
  { value: 'technology', label: 'Tech & Gadgets', description: 'Devices changing our life', icon: Cpu },
];

type Props = {
  topics: Topic[];
  onPick: (value: string, topic: Topic) => void;
  title?: string;
  subtitle?: string;
};

export function TopicPicker({ topics, onPick, title = 'Pick a topic', subtitle }: Props) {
  return (
    <div className="card p-6 sm:p-8">
      <h3 className="font-display text-xl font-bold text-navy">{title}</h3>
      {subtitle && <p className="mt-1 mb-5 text-sm text-ink-secondary">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <button
            key={t.value}
            onClick={() => onPick(t.value, t)}
            className="group flex items-start gap-3 rounded-2xl border-2 border-surface-divider bg-surface-card p-4 text-left transition hover:border-teal hover:shadow-card focus:outline-none focus:ring-2 focus:ring-teal dark:border-white/10 dark:bg-white/5 dark:hover:border-teal dark:hover:bg-white/10"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-white">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-bold text-navy leading-tight dark:text-white">{t.label}</div>
              <div className="mt-0.5 text-xs text-ink-secondary leading-snug dark:text-white/70">{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

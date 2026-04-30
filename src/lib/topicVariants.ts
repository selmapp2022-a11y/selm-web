/**
 * Backend caches generated content by (topic, level), so the same `topic` always
 * returns the exact same transcript / dialogue. By rephrasing the topic we make
 * the cache key different and force fresh content. The user-facing topic key
 * (used for icons / speaker name pairs) stays unchanged.
 */

const TOPIC_VARIATIONS: Record<string, string[]> = {
  travel: [
    'travel adventures',
    'travel and tourism',
    'planning a vacation',
    'a recent trip abroad',
    'favorite travel destinations',
    'exploring new cities',
    'budget travel tips',
    'unforgettable travel memories',
  ],
  food: [
    'cooking at home',
    'restaurant experiences',
    'trying new recipes',
    'favorite cuisines around the world',
    'healthy eating habits',
    'street food adventures',
    'baking and desserts',
    'family meals and traditions',
  ],
  cooking: [
    'cooking at home',
    'learning new recipes',
    'kitchen tips and tricks',
    'baking favorites',
    'meal planning ideas',
    'family cooking traditions',
  ],
  work: [
    'a new job experience',
    'workplace challenges',
    'remote work life',
    'team meetings and projects',
    'work-life balance',
    'career goals and growth',
  ],
  movies: [
    'a recent movie at the cinema',
    'favorite film genres',
    'streaming series recommendations',
    'classic movies worth watching',
    'opinions about a new release',
    'memorable film characters',
  ],
  hobbies: [
    'weekend hobbies',
    'creative pastimes',
    'new things to try in free time',
    'collecting and crafts',
    'relaxing activities after work',
    'sharing a favorite hobby',
  ],
  'daily routine': [
    'morning routines',
    'a typical weekday',
    'evening habits',
    'weekend plans',
    'productivity routines',
    'family schedules',
  ],
  shopping: [
    'shopping at the mall',
    'online shopping experiences',
    'finding good deals',
    'buying clothes and shoes',
    'grocery shopping tips',
    'gift shopping ideas',
  ],
  health: [
    'staying healthy',
    'a doctor appointment',
    'exercise and nutrition',
    'mental wellbeing tips',
    'sleep and stress',
    'healthy lifestyle changes',
  ],
  family: [
    'family weekends together',
    'visiting relatives',
    'parenting moments',
    'family traditions',
    'siblings growing up',
    'family celebrations',
  ],
  music: [
    'favorite music genres',
    'a recent concert experience',
    'discovering new artists',
    'learning a musical instrument',
    'songs from childhood',
    'music for different moods',
  ],
  sports: [
    'a favorite sports team',
    'playing weekend sports',
    'a recent match or game',
    'staying fit through sports',
    'olympic events',
    'extreme sports adventures',
  ],
  school: [
    'school memories',
    'studying for exams',
    'a favorite teacher',
    'school clubs and activities',
    'learning new subjects',
    'student life today',
  ],
  education: [
    'online learning experiences',
    'studying a new language',
    'university life',
    'continuing education',
    'learning new skills',
    'classroom moments',
  ],
  technology: [
    'new smartphones',
    'artificial intelligence in daily life',
    'social media trends',
    'gadgets that changed life',
    'cybersecurity tips',
    'a new tech product launch',
  ],
  science: [
    'a recent scientific discovery',
    'space exploration news',
    'environmental research',
    'medical breakthroughs',
    'everyday science around us',
    'inventors and inventions',
  ],
  business: [
    'starting a small business',
    'workplace innovation',
    'global market trends',
    'entrepreneur stories',
    'company culture',
    'business meetings abroad',
  ],
  climate: [
    'climate change today',
    'extreme weather events',
    'renewable energy at home',
    'sustainable lifestyle choices',
    'protecting the environment',
    'wildlife and habitats',
  ],
  culture: [
    'cultural festivals around the world',
    'local traditions and customs',
    'art and museum visits',
    'languages and identity',
    'cross-cultural friendships',
    'heritage and history',
  ],
  news: [
    "a recent local news story",
    'an interesting headline today',
    'breaking world events',
    'community news updates',
    'sports headlines this week',
    'a positive news report',
  ],
  lifestyle: [
    'work-life balance tips',
    'minimalism and simple living',
    'modern lifestyle trends',
    'self-care routines',
    'home organization ideas',
    'living abroad',
  ],
};

export function variantOfTopic(topic: string): string {
  const key = (topic || 'general').toLowerCase().trim();
  const variants = TOPIC_VARIATIONS[key];
  if (variants && variants.length) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  // Generic phrasings so unknown topics still get fresh content each time.
  const generic = [
    `${key} stories`,
    `talking about ${key}`,
    `personal experiences with ${key}`,
    `interesting facts about ${key}`,
    `everyday ${key} moments`,
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

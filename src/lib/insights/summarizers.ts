/**
 * Data summarization functions to keep token usage low
 */

interface MoodEntry {
  mood: number;
  created_at: string;
  notes?: string | null;
}

interface PoopEntry {
  type: number;
  logged_at: string;
  notes?: string | null;
}

interface FoodEntry {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snack: string | null;
  logged_at: string;
}

interface IllnessEntry {
  illness_types: string[];
  logged_at: string;
  notes?: string | null;
}

const MOOD_LABELS = ['terrible', 'bad', 'okay', 'good', 'great'];

export function summarizeMoods(moods: MoodEntry[] | null): string {
  if (!moods || moods.length === 0) return "No mood data recorded";

  const counts: Record<string, number> = {};
  moods.forEach(m => {
    const label = MOOD_LABELS[m.mood - 1] || 'unknown';
    counts[label] = (counts[label] || 0) + 1;
  });

  const summary = Object.entries(counts)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');

  // Get recent trend
  const recentMoods = moods.slice(0, 3);
  const avgRecent = recentMoods.reduce((a, b) => a + b.mood, 0) / recentMoods.length;
  const trend = avgRecent >= 3.5 ? 'trending positive' : avgRecent <= 2.5 ? 'trending negative' : 'mixed';

  // Include any notes
  const notesWithContent = moods.filter(m => m.notes).slice(0, 3);
  const notesSummary = notesWithContent.length > 0
    ? ` Notes: ${notesWithContent.map(n => n.notes).join('; ')}`
    : '';

  return `Last ${moods.length} moods: ${summary} (${trend}).${notesSummary}`;
}

export function summarizePoops(poops: PoopEntry[] | null): string {
  if (!poops || poops.length === 0) return "No poop data recorded";

  const types = poops.map(p => p.type);
  const avg = types.reduce((a, b) => a + b, 0) / types.length;

  const hasConstipation = types.some(t => t <= 2);
  const hasDiarrhoea = types.some(t => t >= 6);
  const hasNormal = types.some(t => t >= 3 && t <= 5);

  const issues: string[] = [];
  if (hasConstipation) issues.push('some constipation (types 1-2)');
  if (hasDiarrhoea) issues.push('some diarrhoea (types 6-7)');
  if (hasNormal) issues.push('some normal (types 3-5)');

  // Include notes if any
  const notesWithContent = poops.filter(p => p.notes).slice(0, 2);
  const notesSummary = notesWithContent.length > 0
    ? ` Notes: ${notesWithContent.map(n => n.notes).join('; ')}`
    : '';

  return `Last ${poops.length} entries: avg Bristol type ${avg.toFixed(1)}. ${issues.join(', ')}.${notesSummary}`;
}

export function summarizeFoods(foods: FoodEntry[] | null): string {
  if (!foods || foods.length === 0) return "No food data recorded";

  const allMeals: string[] = [];

  foods.forEach(f => {
    const date = new Date(f.logged_at).toLocaleDateString('en-US', { weekday: 'short' });
    const meals: string[] = [];

    if (f.breakfast) meals.push(`breakfast: ${f.breakfast}`);
    if (f.lunch) meals.push(`lunch: ${f.lunch}`);
    if (f.dinner) meals.push(`dinner: ${f.dinner}`);
    if (f.snack) meals.push(`snacks: ${f.snack}`);

    if (meals.length > 0) {
      allMeals.push(`${date}: ${meals.join(', ')}`);
    }
  });

  if (allMeals.length === 0) return "Food entries exist but no meals logged";

  return `Recent meals (last ${foods.length} days): ${allMeals.slice(0, 5).join(' | ')}`;
}

export function summarizeIllnesses(illnesses: IllnessEntry[] | null): string {
  if (!illnesses || illnesses.length === 0) return "No illness/symptoms recorded";

  const allTypes = illnesses.flatMap(i => i.illness_types || []);
  const typeCounts: Record<string, number> = {};

  allTypes.forEach(type => {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const summary = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${type} (${count}x)`)
    .join(', ');

  // Include notes
  const notesWithContent = illnesses.filter(i => i.notes).slice(0, 2);
  const notesSummary = notesWithContent.length > 0
    ? ` Notes: ${notesWithContent.map(n => n.notes).join('; ')}`
    : '';

  return `Recent symptoms (${illnesses.length} entries): ${summary}.${notesSummary}`;
}

export function calculateCycleStats(periodDates: string[] | null): string {
  if (!periodDates || periodDates.length === 0) return "No period data recorded";

  // Sort dates descending
  const sorted = [...periodDates].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Find period start dates (gaps of more than 5 days between entries indicate new period)
  const periodStarts: Date[] = [];
  let lastDate: Date | null = null;

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    if (!lastDate || (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) > 5) {
      periodStarts.push(date);
    }
    lastDate = date;
  }

  // Calculate cycle lengths
  const cycleLengths: number[] = [];
  for (let i = 0; i < periodStarts.length - 1; i++) {
    const diff = Math.round(
      (periodStarts[i].getTime() - periodStarts[i + 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0 && diff < 60) { // reasonable cycle length
      cycleLengths.push(diff);
    }
  }

  // Most recent period
  const mostRecent = periodStarts[0];
  const daysSincePeriod = Math.round(
    (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Average cycle length
  const avgCycle = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : null;

  // Predicted next period
  let prediction = '';
  if (avgCycle && daysSincePeriod < avgCycle) {
    const daysUntil = avgCycle - daysSincePeriod;
    prediction = ` Next period expected in ~${daysUntil} days.`;
  } else if (avgCycle && daysSincePeriod >= avgCycle) {
    const daysLate = daysSincePeriod - avgCycle;
    prediction = ` Period is ~${daysLate} days late based on avg cycle.`;
  }

  // Current phase estimation (simplified)
  let phase = 'unknown';
  if (daysSincePeriod <= 5) phase = 'menstrual phase';
  else if (daysSincePeriod <= 13) phase = 'follicular phase';
  else if (daysSincePeriod <= 16) phase = 'ovulation window';
  else phase = 'luteal phase (PMS possible)';

  return `Last period: ${daysSincePeriod} days ago. Avg cycle: ${avgCycle || 'insufficient data'} days. Current phase: ${phase}.${prediction}`;
}

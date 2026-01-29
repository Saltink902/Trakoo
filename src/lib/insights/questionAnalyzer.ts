/**
 * Analyzes user questions to determine what health data is needed
 */

export type DataCategory = 'mood' | 'poop' | 'food' | 'illness' | 'period';

export interface QuestionIntent {
  dataNeeded: DataCategory[];
  timeRange: string; // e.g., "1d", "3d", "7d", "14d", "30d", "90d"
}

export function analyzeQuestionIntent(question: string): QuestionIntent {
  const q = question.toLowerCase();
  const needs: DataCategory[] = [];
  let timeRange = "7d"; // default

  // Digestive keywords
  if (q.match(/constipat|poop|bowel|diarrh|stomach|digest|bloat|gas/)) {
    needs.push('poop', 'food');
    timeRange = "3d";
  }

  // Mood/mental keywords
  if (q.match(/anxious|anxiety|sad|depress|mood|stress|irritab|emotional|mental|feeling|feel\b/)) {
    needs.push('mood', 'period', 'illness');
    timeRange = "7d";
  }

  // Period/cycle keywords
  if (q.match(/period|cycle|pms|cramp|ovulat|menstr|bleed/)) {
    needs.push('period');
    timeRange = "90d";
  }

  // Food keywords
  if (q.match(/eat|ate|food|meal|dinner|lunch|breakfast|snack|diet/)) {
    needs.push('food');
    if (q.match(/last night|yesterday|today/)) timeRange = "1d";
    else if (q.match(/this week|weekly/)) timeRange = "7d";
  }

  // Illness/symptom keywords
  if (q.match(/sick|ill|headache|fever|cold|flu|nausea|fatigue|tired|pain|ache|symptom/)) {
    needs.push('illness', 'mood');
    timeRange = "14d";
  }

  // Summary/general keywords
  if (q.match(/summary|overview|pattern|trend|week|month|how.*been|what.*happening/)) {
    needs.push('mood', 'poop', 'food', 'illness', 'period');
    if (q.match(/month/)) timeRange = "30d";
    else timeRange = "7d";
  }

  // Sleep keywords (check mood since we track fatigue there)
  if (q.match(/sleep|tired|energy|exhaust/)) {
    needs.push('mood', 'illness');
    timeRange = "7d";
  }

  // If no matches, include common data but keep it recent
  if (needs.length === 0) {
    needs.push('mood', 'poop', 'food', 'illness');
    timeRange = "7d";
  }

  // Remove duplicates
  const uniqueNeeds = [...new Set(needs)] as DataCategory[];

  return { dataNeeded: uniqueNeeds, timeRange };
}

/**
 * Get cutoff date based on time range string
 */
export function getDateBefore(timeRange: string): Date {
  const now = new Date();
  const days = parseInt(timeRange.replace('d', ''), 10);
  now.setDate(now.getDate() - days);
  return now;
}

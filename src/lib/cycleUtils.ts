/**
 * Cycle stats derived from period date entries (individual days, not ranges).
 * Groups consecutive period days into "periods" and computes cycle lengths
 * (days from one period start to the next).
 */

export type CycleStats = {
  /** Average days between period starts (cycle length). */
  averageCycleLength: number | null;
  /** Average number of days per period (bleed length). */
  averagePeriodLength: number | null;
  /** Start date (YYYY-MM-DD) of the most recent period. */
  lastPeriodStart: string | null;
  /** Days since the start of the last period. */
  daysSinceLastPeriod: number | null;
  /** Predicted next period start (YYYY-MM-DD), or null if not enough data. */
  predictedNextPeriod: string | null;
  /** Number of cycles (period starts) used for averages. */
  cycleCount: number;
};

function parseDate(str: string): Date {
  return new Date(str + "T12:00:00");
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/** Group sorted date strings into runs of consecutive days. Each run is [startDate, ...]. */
function groupIntoPeriods(sortedDates: string[]): string[][] {
  if (sortedDates.length === 0) return [];
  const runs: string[][] = [];
  let current: string[] = [sortedDates[0]!];
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseDate(sortedDates[i - 1]!);
    const curr = parseDate(sortedDates[i]!);
    const gap = daysBetween(prev, curr);
    if (gap === 1) {
      current.push(sortedDates[i]!);
    } else {
      runs.push(current);
      current = [sortedDates[i]!];
    }
  }
  runs.push(current);
  return runs;
}

/**
 * Compute cycle statistics from an array of period date strings (YYYY-MM-DD).
 * Uses all provided dates; for best results pass at least several months of data.
 */
export function calculateCycleStats(periodDates: string[]): CycleStats {
  const sorted = [...periodDates].filter(Boolean).sort();
  if (sorted.length === 0) {
    return {
      averageCycleLength: null,
      averagePeriodLength: null,
      lastPeriodStart: null,
      daysSinceLastPeriod: null,
      predictedNextPeriod: null,
      cycleCount: 0,
    };
  }

  const periods = groupIntoPeriods(sorted);
  const today = new Date();

  // Period lengths (days per bleed)
  const periodLengths = periods.map((p) => p.length);
  const averagePeriodLength =
    periodLengths.length > 0
      ? Math.round(
          periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
        )
      : null;

  // Cycle lengths: days from start of one period to start of next
  const cycleLengths: number[] = [];
  for (let i = 1; i < periods.length; i++) {
    const prevStart = parseDate(periods[i - 1]![0]!);
    const currStart = parseDate(periods[i]![0]!);
    cycleLengths.push(daysBetween(prevStart, currStart));
  }
  const averageCycleLength =
    cycleLengths.length > 0
      ? Math.round(
          cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
        )
      : null;

  const lastPeriodStart = periods[periods.length - 1]?.[0] ?? null;
  const lastStartDate = lastPeriodStart ? parseDate(lastPeriodStart) : null;
  const daysSinceLastPeriod =
    lastStartDate != null ? daysBetween(lastStartDate, today) : null;

  // Predict next: last period start + average cycle length (or default 28)
  const cycleForPrediction = averageCycleLength ?? 28;
  const predictedNextPeriod =
    lastPeriodStart != null
      ? toDateString(addDays(parseDate(lastPeriodStart), cycleForPrediction))
      : null;

  return {
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    daysSinceLastPeriod,
    predictedNextPeriod,
    cycleCount: periods.length,
  };
}

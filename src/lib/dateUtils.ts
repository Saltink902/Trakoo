/**
 * Shared date utilities for consistent timezone handling.
 *
 * The key insight: we store timestamps as "noon UTC" of the intended local date.
 * This ensures date extraction works correctly in any timezone within ±12 hours of UTC.
 */

/**
 * Get the current local date as YYYY-MM-DD string.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Convert a local date string (YYYY-MM-DD) to an ISO timestamp for storage.
 * Uses noon UTC to avoid timezone edge cases.
 */
export function dateToTimestamp(dateStr: string): string {
  return `${dateStr}T12:00:00Z`;
}

/**
 * Extract the local YYYY-MM-DD date from an ISO timestamp.
 * This handles timezone conversion correctly for display.
 */
export function timestampToLocalDate(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get start and end timestamps for querying a date range.
 * Uses a wider window to account for timezone differences.
 */
export function getDateRangeForQuery(dateStr: string): { start: string; end: string } {
  // Use a window from the previous day to the next day to catch all entries
  const date = new Date(`${dateStr}T12:00:00Z`);
  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() - 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get year boundaries for querying (used for calendar displays).
 * Extends the range slightly to account for timezone edge cases.
 */
export function getYearRangeForQuery(year: number): { start: string; end: string } {
  // Start from Dec 31 of previous year to catch late-night entries
  const start = new Date(Date.UTC(year - 1, 11, 31, 0, 0, 0));
  // End on Jan 2 of next year to catch early-morning entries
  const end = new Date(Date.UTC(year + 1, 0, 2, 23, 59, 59, 999));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

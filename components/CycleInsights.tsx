"use client";

import type { CycleStats } from "@/lib/cycleUtils";

type CycleInsightsProps = {
  stats: CycleStats;
};

function formatDate(str: string): string {
  const d = new Date(str + "T12:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function CycleInsights({ stats }: CycleInsightsProps) {
  const {
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    daysSinceLastPeriod,
    predictedNextPeriod,
    cycleCount,
  } = stats;

  const hasAnyStats =
    averageCycleLength != null ||
    averagePeriodLength != null ||
    lastPeriodStart != null ||
    daysSinceLastPeriod != null ||
    predictedNextPeriod != null;

  if (!hasAnyStats && cycleCount === 0) {
    return (
      <div className="w-full soft-card p-4">
        <h3 className="font-semibold text-trakoo-text mb-2">Cycle insights</h3>
        <p className="text-sm text-trakoo-muted">
          Log period days to see your average cycle length, last period start, and predicted next period.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full soft-card p-4">
      <h3 className="font-semibold text-trakoo-text mb-3">Cycle insights</h3>
      <div className="space-y-3 text-sm">
        {averageCycleLength != null && (
          <div className="flex justify-between items-center">
            <span className="text-trakoo-muted">Average cycle length</span>
            <span className="font-medium text-trakoo-text">{averageCycleLength} days</span>
          </div>
        )}
        {averagePeriodLength != null && (
          <div className="flex justify-between items-center">
            <span className="text-trakoo-muted">Average period length</span>
            <span className="font-medium text-trakoo-text">{averagePeriodLength} days</span>
          </div>
        )}
        {lastPeriodStart != null && (
          <div className="flex justify-between items-center">
            <span className="text-trakoo-muted">Last period start</span>
            <span className="font-medium text-trakoo-text">{formatDate(lastPeriodStart)}</span>
          </div>
        )}
        {daysSinceLastPeriod != null && (
          <div className="flex justify-between items-center">
            <span className="text-trakoo-muted">Days since last period</span>
            <span className="font-medium text-trakoo-text">{daysSinceLastPeriod} days</span>
          </div>
        )}
        {predictedNextPeriod != null && (
          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <span className="text-trakoo-muted">Predicted next period</span>
            <span className="font-medium text-trakoo-text" style={{ color: "#FF6B6B" }}>
              {formatDate(predictedNextPeriod)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

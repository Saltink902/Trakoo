"use client";

type PeriodYearCalendarProps = {
  year: number;
  periodData: Record<string, boolean>; // date YYYY-MM-DD -> is period day
  onDayClick: (date: string) => void;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const PERIOD_RED = "#FF6B6B";
const NO_PERIOD = "#E5E5E5";

function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  const startDay = firstDay.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function PeriodYearCalendar({
  year,
  periodData,
  onDayClick,
}: PeriodYearCalendarProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold text-trakoo-text mb-6 text-center">
        {year} Period Calendar
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => {
          const days = getDaysInMonth(year, month);
          return (
            <div key={month} className="flex flex-col">
              <h3 className="text-xs font-semibold text-trakoo-text mb-2 text-center">
                {MONTH_NAMES[month].slice(0, 3)}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={`label-${i}`}
                    className="text-[8px] text-trakoo-muted text-center font-medium h-4 flex items-center justify-center"
                  >
                    {label}
                  </div>
                ))}
                {days.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  const dateStr = formatDate(date);
                  const isPeriodDay = periodData[dateStr] ?? false;
                  const today = isToday(date);
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onDayClick(dateStr)}
                      className="aspect-square rounded-sm transition-all hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-trakoo-text/30 relative"
                      style={{
                        backgroundColor: isPeriodDay ? PERIOD_RED : NO_PERIOD,
                      }}
                      aria-label={`${MONTH_NAMES[month]} ${date.getDate()}`}
                    >
                      {today && (
                        <div className="absolute inset-0 border-2 border-white rounded-sm pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

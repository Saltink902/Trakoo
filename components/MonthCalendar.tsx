"use client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const PERIOD_RED = "#FF6B6B";
const DAY_BG = "#F5F5F5";
const DAY_SIZE = 40;

type MonthCalendarProps = {
  selectedDates: string[];
  onDateToggle: (date: string) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (year: number, month: number) => void;
};

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

export function MonthCalendar({
  selectedDates,
  onDateToggle,
  currentMonth,
  currentYear,
  onMonthChange,
}: MonthCalendarProps) {
  const days = getDaysInMonth(currentYear, currentMonth);
  const set = new Set(selectedDates);

  const goPrev = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const goNext = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          className="w-10 h-10 rounded-full soft-pill flex items-center justify-center text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-trakoo-text/30"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-trakoo-text">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <button
          type="button"
          onClick={goNext}
          className="w-10 h-10 rounded-full soft-pill flex items-center justify-center text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-trakoo-text/30"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 w-full max-w-[320px] mx-auto">
        {DAY_LABELS.map((label, i) => (
          <div
            key={`label-${i}`}
            className="text-[10px] text-trakoo-muted text-center font-medium flex items-center justify-center"
            style={{ height: DAY_SIZE }}
          >
            {label}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
          }
          const dateStr = formatDate(date);
          const isSelected = set.has(dateStr);
          const today = isToday(date);
          const dayNum = date.getDate();
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDateToggle(dateStr)}
              className="rounded-lg transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-trakoo-text/30 relative flex items-center justify-center flex-shrink-0 text-sm font-medium"
              style={{
                width: DAY_SIZE,
                height: DAY_SIZE,
                backgroundColor: isSelected ? PERIOD_RED : DAY_BG,
                color: isSelected ? "#fff" : "#1a1a1a",
              }}
              aria-label={`${MONTH_NAMES[currentMonth]} ${dayNum}${isSelected ? ", period day" : ""}`}
              aria-pressed={isSelected}
            >
              {dayNum}
              {today && (
                <div
                  className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none"
                  style={{ borderRadius: 8 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

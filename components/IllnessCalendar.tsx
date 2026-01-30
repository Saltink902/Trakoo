"use client";

type IllnessCalendarProps = {
  year: number;
  illnessData: Record<string, string[]>; // date YYYY-MM-DD -> illness type ids
  onDayClick: (date: string) => void;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  const startDay = firstDay.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  return days;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

const ILLNESS_DAY_GREEN = "#22c55e"; // single fill color for any illness day

function getIllnessColor(typeIds: string[]): string {
  if (!typeIds.length) return "#e5e5e5";
  return ILLNESS_DAY_GREEN;
}

export function IllnessCalendar({ year, illnessData, onDayClick }: IllnessCalendarProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold text-trakoo-text mb-6 text-center">
        {year} Illness Calendar
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
                  const types = illnessData[dateStr] ?? [];
                  const bgColor = getIllnessColor(types);
                  const today = isToday(date);
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onDayClick(dateStr)}
                      className="aspect-square rounded-sm transition-all hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-trakoo-text/30 relative"
                      style={{ backgroundColor: bgColor }}
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

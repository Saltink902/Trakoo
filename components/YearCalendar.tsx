"use client";

import { MOODS } from "@/components/MoodCarousel";

type YearCalendarProps = {
  year: number;
  moodData: Record<string, number>; // date -> moodId
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
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isToday(date: Date): boolean {
  if (!date) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function getMoodColor(moodId?: number): string {
  if (!moodId) return "#e5e5e5"; // Gray for no mood
  const mood = MOODS.find(m => m.id === moodId);
  if (!mood?.bg || typeof mood.bg !== "string") return "#e5e5e5";
  const match = mood.bg.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : "#e5e5e5";
}

export function YearCalendar({ year, moodData, onDayClick }: YearCalendarProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold text-trakoo-text mb-6 text-center">
        {year} Mood Calendar
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
                {/* Day labels */}
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={`label-${i}`}
                    className="text-[8px] text-trakoo-muted text-center font-medium h-4 flex items-center justify-center"
                  >
                    {label}
                  </div>
                ))}
                
                {/* Day squares */}
                {days.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  
                  const dateStr = formatDate(date);
                  const moodId = moodData[dateStr];
                  const bgColor = getMoodColor(moodId);
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

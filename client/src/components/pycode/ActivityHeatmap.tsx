import React, { useState, useMemo } from 'react';
import { Flame, Zap } from 'lucide-react';

interface ActivityHeatmapProps {
  dailyCounts?: Record<string, number>;
  currentStreak?: number;
  longestStreak?: number;
  loading?: boolean;
  year?: number;
}

interface DayCell {
  dateStr: string;
  dayOfMonth: number;
  dayOfWeek: number; // 0 = Sun, ..., 6 = Sat
  count: number;
  dateObj: Date;
}

interface MonthColumn {
  days: (DayCell | null)[]; // exactly 7 rows: index 0 (Sun) to 6 (Sat)
}

interface MonthSection {
  index: number;
  name: string;
  shortName: string;
  columns: MonthColumn[];
  totalSubmissions: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  dailyCounts = {},
  currentStreak = 0,
  longestStreak = 0,
  loading = false,
  year: propYear,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    formattedDate: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const activeYear = propYear || new Date().getFullYear();

  // Compute 12 calendar months strictly partitioned into Sunday-Saturday columns
  const { months, totalSubmissions } = useMemo(() => {
    const list: MonthSection[] = [];
    let yearSum = 0;

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(activeYear, m + 1, 0).getDate();

      const columns: MonthColumn[] = [];
      let currentCol: (DayCell | null)[] = Array(7).fill(null);
      let monthSum = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(activeYear, m, day);
        const dayOfWeek = dateObj.getDay();

        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const count = dailyCounts[dateStr] || 0;
        monthSum += count;

        currentCol[dayOfWeek] = {
          dateStr,
          dayOfMonth: day,
          dayOfWeek,
          count,
          dateObj,
        };

        // If Saturday or last day of the month, conclude the column
        if (dayOfWeek === 6 || day === daysInMonth) {
          columns.push({ days: currentCol });
          currentCol = Array(7).fill(null);
        }
      }

      yearSum += monthSum;
      list.push({
        index: m,
        name: MONTH_NAMES[m],
        shortName: MONTH_NAMES[m].slice(0, 3),
        columns,
        totalSubmissions: monthSum,
      });
    }

    return { months: list, totalSubmissions: yearSum };
  }, [dailyCounts, activeYear]);

  const getColorClass = (count: number) => {
    if (count === 0) {
      return 'bg-[#e8ebf0] dark:bg-[#26282e] border-[#d6dbe5] dark:border-[#383d47] hover:border-slate-400 dark:hover:border-neutral-500';
    }
    if (count <= 2) {
      return 'bg-[#a7f3d0] dark:bg-[#064e3b] border-[#6ee7b7] dark:border-emerald-700 hover:border-emerald-500';
    }
    if (count <= 5) {
      return 'bg-[#00c982] dark:bg-[#059669] border-[#00b072] dark:border-emerald-500 hover:border-emerald-400';
    }
    return 'bg-[#00875a] dark:bg-[#10b981] border-[#006f4a] dark:border-emerald-400 hover:border-emerald-300';
  };

  const formatDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && (!dailyCounts || Object.keys(dailyCounts).length === 0)) {
    return (
      <div className="p-6 rounded-2xl bg-[#fbf9f5] dark:bg-[#18181b] border border-[#ede9e2] dark:border-neutral-800 animate-pulse space-y-4">
        <div className="w-56 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-40 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Subtle Companion Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Python Practice Submissions
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
            {totalSubmissions} problems solved
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentStreak} Day Streak</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold border border-purple-500/20">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
            <span>Best: {longestStreak} Days</span>
          </span>
        </div>
      </div>

      {/* Main Heatmap Card matching reference design */}
      <div className="rounded-2xl border border-[#ede9e2] dark:border-neutral-800 bg-[#fbf9f5] dark:bg-[#18181b] p-5 sm:p-6 shadow-2xs">
        {/* Scrollable Month Grid */}
        <div className="relative overflow-x-auto pb-3 pt-1 no-scrollbar">
          <div className="flex items-start gap-0 min-w-max select-none">
            {/* Days of Week Left Labels */}
            <div className="flex flex-col pt-7 pr-3 shrink-0">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                {DAYS_OF_WEEK.map((d) => (
                  <div
                    key={d}
                    className="h-3.5 sm:h-4 flex items-center text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-neutral-500 leading-none"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* 12 Months Columns with Dotted Separators */}
            <div className="flex items-start">
              {months.map((month, idx) => (
                <div
                  key={month.name}
                  className={`flex flex-col px-2.5 sm:px-3 ${
                    idx < months.length - 1
                      ? 'border-r border-dotted border-slate-300 dark:border-neutral-700/70'
                      : ''
                  }`}
                >
                  {/* Month Label Header */}
                  <div className="h-7 flex items-center mb-0">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-neutral-400">
                      {month.shortName}
                    </span>
                  </div>

                  {/* 7-Row Week Columns */}
                  <div className="flex gap-1 sm:gap-1.5">
                    {month.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex flex-col gap-1 sm:gap-1.5">
                        {col.days.map((day, rIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${rIdx}`}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 invisible pointer-events-none"
                              />
                            );
                          }

                          return (
                            <div
                              key={day.dateStr}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredDay({
                                  dateStr: day.dateStr,
                                  formattedDate: formatDate(day.dateObj),
                                  count: day.count,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredDay(null)}
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border transition-colors cursor-pointer ${getColorClass(
                                day.count
                              )}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Day Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 px-2.5 py-1.5 rounded-lg bg-neutral-950 text-white dark:bg-neutral-800 text-[11px] font-medium shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap border border-neutral-700/80"
              style={{
                left: `${hoveredDay.x}px`,
                top: `${hoveredDay.y - 6}px`,
              }}
            >
              <span className="font-bold text-emerald-400">{hoveredDay.count}</span>{' '}
              {hoveredDay.count === 1 ? 'problem' : 'problems'} solved on {hoveredDay.formattedDate}
            </div>
          )}
        </div>

        {/* Bottom Legend Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/50 dark:border-neutral-800/60 text-xs text-slate-500 dark:text-neutral-400 font-medium">
          <div>
            Submission history logs for the year {activeYear}
          </div>

          {/* Color Level Legend */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">Less</span>
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] bg-[#e8ebf0] dark:bg-[#26282e] border border-[#d6dbe5] dark:border-[#383d47]"
              title="0 problems"
            />
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] bg-[#a7f3d0] dark:bg-[#064e3b] border border-[#6ee7b7] dark:border-emerald-700"
              title="1-2 problems"
            />
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] bg-[#00c982] dark:bg-[#059669] border border-[#00b072] dark:border-emerald-500"
              title="3-5 problems"
            />
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] bg-[#00875a] dark:bg-[#10b981] border border-[#006f4a] dark:border-emerald-400"
              title="6+ problems"
            />
            <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;

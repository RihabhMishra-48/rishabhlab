import React, { useState, useMemo } from 'react';
import { Flame, Zap, Calendar, Trophy } from 'lucide-react';

interface ActivityHeatmapProps {
  dailyCounts?: Record<string, number>;
  currentStreak?: number;
  longestStreak?: number;
  loading?: boolean;
}

interface MonthBlock {
  name: string;
  year: number;
  weeks: {
    days: {
      dateStr: string;
      dateObj: Date;
      count: number;
      isCurrentMonth: boolean;
    }[];
  }[];
  totalMonthSubmissions: number;
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

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  dailyCounts = {},
  currentStreak = 0,
  longestStreak = 0,
  loading = false,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    formattedDate: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Build 12 rolling months ending in the current month
  const { monthBlocks, totalYearSubmissions } = useMemo(() => {
    const today = new Date();
    const blocks: MonthBlock[] = [];
    let yearSum = 0;

    // Last 12 months (e.g. from 11 months ago to current month)
    for (let m = 11; m >= 0; m--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const year = monthDate.getFullYear();
      const monthIdx = monthDate.getMonth();
      const monthName = MONTH_NAMES[monthIdx];

      // Total days in this month
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      let monthSum = 0;

      // Group days of this month into columns of up to 7 days
      const days: { dateStr: string; dateObj: Date; count: number; isCurrentMonth: boolean }[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, monthIdx, d);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const count = dailyCounts[dateStr] || 0;
        monthSum += count;
        days.push({ dateStr, dateObj, count, isCurrentMonth: true });
      }

      yearSum += monthSum;

      // Segment days into weeks (columns of 7)
      const weeks: MonthBlock['weeks'] = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push({ days: days.slice(i, i + 7) });
      }

      blocks.push({
        name: monthName,
        year,
        weeks,
        totalMonthSubmissions: monthSum,
      });
    }

    return { monthBlocks: blocks, totalYearSubmissions: yearSum };
  }, [dailyCounts]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-neutral-100 dark:bg-[#252525] border-transparent';
    if (count <= 2) return 'bg-emerald-300 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200 border-emerald-400/40';
    if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600/40';
    return 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-emerald-950 font-bold border-emerald-800/40';
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
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4">
        <div className="w-56 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-36 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-5">
      {/* Heatmap Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Python Practice Activity (Monthly Segregated)
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
            {totalYearSubmissions} total problems solved
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-neutral-100 dark:bg-[#252525]" title="0" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-900" title="1-2" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-600" title="3-5" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-700 dark:bg-emerald-400" title="6+" />
          <span>More</span>
        </div>
      </div>

      {/* Month Segregated Grid Container */}
      <div className="relative overflow-x-auto pb-3 pt-1 no-scrollbar">
        <div className="flex items-start gap-4 min-w-[850px] select-none py-1">
          {monthBlocks.map((month) => (
            <div
              key={`${month.name}-${month.year}`}
              className="flex flex-col space-y-1.5 p-2 rounded-xl bg-neutral-50/70 dark:bg-[#252525]/60 border border-neutral-200/60 dark:border-neutral-800/60 shrink-0"
            >
              {/* Month Header Label */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                  {month.name.slice(0, 3)}
                </span>
                {month.totalMonthSubmissions > 0 && (
                  <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{month.totalMonthSubmissions}
                  </span>
                )}
              </div>

              {/* Weekly columns of 7 days */}
              <div className="flex gap-1">
                {month.weeks.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {col.days.map((day) => (
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
                        className={`w-3.5 h-3.5 rounded-[3px] border transition-colors cursor-pointer ${getColorClass(
                          day.count
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Tooltip */}
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

      {/* Stats Banner Below Heatmap */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
            <Flame className="w-4 h-4 text-amber-500" />
            Current Streak:{' '}
            <span className="font-mono text-amber-600 dark:text-amber-400">{currentStreak} Days</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
            <Zap className="w-4 h-4 text-purple-500" />
            Longest Streak:{' '}
            <span className="font-mono text-purple-600 dark:text-purple-400">{longestStreak} Days</span>
          </span>
        </div>

        <div className="text-[11px] text-neutral-500 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-emerald-500" />
          <span>Synchronized with PyCode Submissions</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;

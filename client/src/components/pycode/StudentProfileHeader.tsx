import React from 'react';
import { MentorshipSyncPayload } from '../../types/pycode';
import { Flame, Zap, Award, BookCheck, ExternalLink, UserCheck, AlertCircle } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface StudentProfileHeaderProps {
  data: MentorshipSyncPayload | null;
  loading: boolean;
  email?: string;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  data,
  loading,
  email,
}) => {
  // 1. Loading Skeleton State (Only show if no cached data exists)
  if (loading && !data) {
    return (
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800/80 animate-pulse space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2">
              <div className="w-40 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="w-28 h-4 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-full sm:w-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. 404 / Not Found State
  if (!data || data.not_found || !data.user) {
    return (
      <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-neutral-800 dark:text-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No PyCode account connected for{' '}
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {email || 'your email'}
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
                Create a PyCode account with this email to automatically sync your Python scripts, activity heatmap,
                and exam scores into your mentorship progress.
              </p>
            </div>
          </div>
          <a
            href="https://pycode-student.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 transition-colors"
          >
            <span>Create Account on PyCode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const { user } = data;
  const stats = user.stats || {
    questions_solved_count: 0,
    current_streak_days: 0,
    longest_streak_days: 0,
    tests_attempted_count: 0,
  };

  return (
    <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* User Avatar & Info */}
        <div className="flex items-start sm:items-center gap-4.5">
          <div className="relative shrink-0">
            <div className="p-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-purple-500/20 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs">
              <UserAvatar
                src={user.avatar_url}
                name={user.full_name || user.username}
                email={user.email}
                size={60}
                roundedClassName="rounded-xl"
              />
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-[#1a1a1e] flex items-center justify-center text-[10px] shadow-xs"
              title="Synced with PyCode Engine"
            >
              <UserCheck className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight truncate">
                {user.full_name || 'PyCode Student'}
              </h2>
              {user.username && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  @{user.username}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Python Live Engine
              </span>
            </div>

            {user.bio ? (
              <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                {user.bio}
              </p>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Active Python developer practicing algorithms, patterns & live codeathons.
              </p>
            )}
          </div>
        </div>

        {/* High-Readability Themed Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
          {/* Problems Solved */}
          <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex flex-col justify-between min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <span className="p-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <BookCheck className="w-3.5 h-3.5" />
              </span>
              <span>Solved</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-1.5">
              {stats.questions_solved_count ?? 0}
            </p>
          </div>

          {/* Current Streak */}
          <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col justify-between min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <span className="p-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <span>Streak</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-1.5 flex items-baseline gap-1">
              {stats.current_streak_days ?? 0}<span className="text-sm font-sans">d</span> <span className="text-sm">🔥</span>
            </p>
          </div>

          {/* Longest Streak */}
          <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 flex flex-col justify-between min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              <span className="p-1 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Zap className="w-3.5 h-3.5" />
              </span>
              <span>Best</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-1.5 flex items-baseline gap-1">
              {stats.longest_streak_days ?? 0}<span className="text-sm font-sans">d</span> <span className="text-sm">⚡</span>
            </p>
          </div>

          {/* Tests Attempted */}
          <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col justify-between min-w-[110px]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <span className="p-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span>Exams</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-1.5">
              {stats.tests_attempted_count ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

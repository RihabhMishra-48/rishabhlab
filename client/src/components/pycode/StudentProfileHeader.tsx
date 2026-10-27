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
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-2">
              <div className="w-36 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="w-24 h-4 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-24 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. 404 / Not Found State
  if (!data || data.not_found || !data.user) {
    return (
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f] border border-amber-500/30 dark:border-amber-500/20 text-neutral-800 dark:text-neutral-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No PyCode account connected for{' '}
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {email || 'your email'}
                </span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
                Create a PyCode account with this email to automatically sync your Python scripts, activity heatmap,
                and exam scores into your mentorship progress.
              </p>
            </div>
          </div>
          <a
            href="https://pycode-student.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* User Avatar & Info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              src={user.avatar_url}
              name={user.full_name || user.username}
              email={user.email}
              size={64}
              roundedClassName="rounded-2xl"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]" title="Synced with PyCode Engine">
              <UserCheck className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.full_name || 'PyCode Student'}
              </h2>
              {user.username && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  @{user.username}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Python Live Engine
              </span>
            </div>
            {user.bio ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
                {user.bio}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Active Python developer practicing algorithms, patterns & live codeathons.
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
          {/* Problems Solved */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800 text-center min-w-[105px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              <BookCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Solved</span>
            </div>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {stats.questions_solved_count ?? 0}
            </p>
          </div>

          {/* Current Streak */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800 text-center min-w-[105px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Streak</span>
            </div>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {stats.current_streak_days ?? 0}d 🔥
            </p>
          </div>

          {/* Longest Streak */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800 text-center min-w-[105px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Best</span>
            </div>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {stats.longest_streak_days ?? 0}d ⚡
            </p>
          </div>

          {/* Tests Attempted */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800 text-center min-w-[105px]">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              <span>Exams</span>
            </div>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {stats.tests_attempted_count ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getCuratedMission } from '../../data/curatedMissions';
import { normalizeTrackName } from '../../data/curatedRoadmaps';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code,
  Compass,
  FolderGit2,
  Trophy,
  Users,
  Flame,
  Clock,
  Sparkles,
  GitBranch,
  Play,
  Award
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const targetTrack = normalizeTrackName(user?.targetGoal || localStorage.getItem('rishabhlabs_goal') || 'App Development');
  const mission = dashboardData?.todayMission || getCuratedMission(targetTrack);

  const handleToggleTask = async (taskId: string) => {
    if (!mission) return;
    const updatedTasks = (mission.tasks || []).map((t: any) =>
      t.taskId === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const completedTasksCount = updatedTasks.filter((t: any) => t.isCompleted).length;
    const updatedMission = {
      ...mission,
      tasks: updatedTasks,
      completedTasksCount,
      isAllCompleted: completedTasksCount === updatedTasks.length,
    };
    setDashboardData((prev: any) => ({
      ...prev,
      todayMission: updatedMission,
    }));

    try {
      const completedIds = updatedTasks.filter((t: any) => t.isCompleted).map((t: any) => t.taskId);
      localStorage.setItem(`rishabhlabs_mission_completed_${targetTrack}`, JSON.stringify(completedIds));
    } catch (e) {
      // Ignore
    }

    if (dashboardData?.todayMission?._id) {
      try {
        await api.toggleMissionTask(dashboardData.todayMission._id, taskId);
      } catch (err) {
        console.warn('Backend mission toggle sync note:', err);
      }
    }
  };
  const stats = dashboardData?.stats || {
    progressPercent: 0,
    skillsCompleted: 0,
    totalSkills: 10,
    projectsCompleted: 0,
    totalProjects: 4,
    streakDays: 0,
    totalPoints: 0,
  };

  // Circular progress calculations (Modern Android / Material 3 style segmented arcs)
  const progressPercent = Math.min(100, Math.max(0, stats.progressPercent ?? 0));
  const strokeWidth = 12;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  // Track gap between active & pending segments for soft rounded pill caps
  // Stroke cap radius is strokeWidth / 2 = 6px.
  // gap = 20px provides a clean ~8px visual breathing space between pill heads.
  const rawActive = (progressPercent / 100) * circumference;
  const rawPending = circumference - rawActive;

  const hasBothSegments = progressPercent > 0 && progressPercent < 100;
  const gap = hasBothSegments ? Math.min(20, rawActive * 0.45, rawPending * 0.45) : 0;
  const gapDeg = (gap / circumference) * 360;
  const halfGapDeg = gapDeg / 2;

  const activeLength = hasBothSegments
    ? Math.max(0.1, rawActive - gap)
    : (progressPercent >= 100 ? circumference : 0);
  const pendingLength = hasBothSegments
    ? Math.max(0.1, rawPending - gap)
    : (progressPercent <= 0 ? circumference : 0);

  const activeRotation = -90 + (hasBothSegments ? halfGapDeg : 0);
  const pendingRotation = -90 + (progressPercent / 100) * 360 + (hasBothSegments ? halfGapDeg : 0);

  const showActive = progressPercent > 0;
  const showPending = progressPercent < 100;

  const currentTrack = mission?.trackTitle || user?.targetGoal || 'Personalized Path';
  const todayDateFormatted = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Greeting Header matching Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {dashboardData?.greeting || `Good Morning, ${user?.name ? user.name.split(' ')[0] : 'Engineer'}`}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {dashboardData?.subGreeting || "Keep going. Every day of focused execution compounds!"}
          </p>
        </div>

        {/* Quick Streak & Points Pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>{stats.streakDays ?? 0} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>{stats.totalPoints ?? 0} XP</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Mission & Your Progress (Matching Screen 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Today's Mission (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 p-2 flex items-center justify-center shrink-0">
                  <img src="/graphics/daily-calendar.svg" alt="Daily Mission" className="w-full h-full object-contain dark:invert" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Today's Mission
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5 truncate">
                    Day {mission?.dayNumber || 1} • {currentTrack}
                  </h2>
                </div>
              </div>
              <span className="text-xs text-neutral-400 font-mono shrink-0">
                {mission?.dateString || todayDateFormatted}
              </span>
            </div>

            {/* Tasks Group (Merged Container with Soft Top/Bottom Corners) */}
            <div className="pt-2">
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                {mission?.tasks?.map((t: any, idx: number) => {
                  const titleClean = (t.title || '').replace(/\s*\(\d+\s*min\)/i, '');

                  return (
                    <div
                      key={t.taskId || idx}
                      onClick={() => handleToggleTask(t.taskId)}
                      className={`px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-colors group ${
                        t.isCompleted
                          ? 'bg-neutral-50/40 dark:bg-transparent text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-[#222222]'
                          : 'bg-white dark:bg-[#212121] hover:bg-neutral-50/80 dark:hover:bg-[#262626] text-neutral-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Checkbox */}
                        <div className="shrink-0">
                          {t.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 space-y-0.5">
                          <h3
                            className={`text-xs font-semibold truncate ${
                              t.isCompleted
                                ? 'line-through text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {titleClean}
                          </h3>
                          {t.description && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-md sm:max-w-lg">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action & Duration (Aligned Column) */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                          {t.durationMinutes || 20}m
                        </span>
                        <Link
                          to={t.actionUrl || '/missions'}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
                          title="Open task"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2">
            <Link
              to="/missions"
              className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Start Mission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Card: Your Progress (Executive SaaS Analytics Widget) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-6">
          {/* Card Header with Status & Navigation */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Your Progress
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Overall roadmap progression
              </p>
            </div>
            <Link
              to="/roadmap"
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="View full roadmap"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Radial Ring (Modern Android Material 3 segmented arcs) */}
          <div className="flex-1 flex flex-col items-center justify-center py-3 sm:py-5">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg viewBox="0 0 180 180" className="w-full h-full">
                <defs>
                  <linearGradient id="activeRoadmapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                {/* Pending (Remaining Arc, Soft Pill Ends with crisp contrast) */}
                {showPending && (
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${pendingLength} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    className="text-neutral-200 dark:text-[#383d47] transition-all duration-1000 ease-out"
                    fill="transparent"
                    transform={`rotate(${pendingRotation} 90 90)`}
                  />
                )}
                {/* Active Progress Arc (Vibrant Gradient, Soft Pill Ends) */}
                {showActive && (
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="url(#activeRoadmapGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${activeLength} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    fill="transparent"
                    transform={`rotate(${activeRotation} 90 90)`}
                  />
                )}
              </svg>
              {/* Inner Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Micro-Stat Grid (Executive SaaS Style - Fully Responsive) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
            {/* Skills Tile */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Skills</span>
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white font-mono truncate">
                  {stats.skillsCompleted} <span className="text-[9px] sm:text-[10px] font-normal text-neutral-400">/ {stats.totalSkills || 18}</span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.round((stats.skillsCompleted / (stats.totalSkills || 18)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Projects Tile */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Projects</span>
                <Code className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white font-mono truncate">
                  {stats.projectsCompleted} <span className="text-[9px] sm:text-[10px] font-normal text-neutral-400">/ {stats.totalProjects || 4}</span>
                </div>
                <div className="mt-1.5 w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.round((stats.projectsCompleted / (stats.totalProjects || 4)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Streak Tile */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Streak</span>
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-amber-500 font-mono flex items-baseline gap-1 truncate">
                  <span>{stats.streakDays || 7}</span>
                  <span className="text-[9px] sm:text-[10px] font-normal text-neutral-400">days</span>
                </div>
                <div className="mt-1.5 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < Math.min(5, stats.streakDays || 7)
                          ? 'bg-amber-500'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section (4 Cards matching Screen 3) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/roadmap"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#212121] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs transition-colors group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 p-2 flex items-center justify-center mb-3">
              <img src="/graphics/roadmap.png" alt="Roadmap" className="w-5 h-5 sm:w-6 sm:h-6 object-contain dark:invert" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">View Roadmap</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">See your path</p>
          </Link>

          <Link
            to="/projects"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#212121] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs transition-colors group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 p-2 flex items-center justify-center mb-3">
              <img src="/graphics/support.png" alt="Projects & Support" className="w-5 h-5 sm:w-6 sm:h-6 object-contain dark:invert" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Browse Projects</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Build & showcase</p>
          </Link>

          <Link
            to="/hackathon"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#212121] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs transition-colors group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-2 flex items-center justify-center mb-3">
              <img src="/graphics/troph-cap.svg" alt="Hackathon Mode" className="w-5 h-5 sm:w-6 sm:h-6 object-contain dark:invert" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Hackathon Mode</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Prepare for events</p>
          </Link>

          <Link
            to="/mentorship"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#212121] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs transition-colors group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Find a Mentor</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Book 1:1 session</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

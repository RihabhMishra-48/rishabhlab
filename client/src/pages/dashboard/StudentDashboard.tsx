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

  // Circular progress calculations
  const progressPercent = stats.progressPercent ?? 0;
  const strokeWidth = 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

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
        <div className="flex items-center gap-3">
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
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Today's Mission
                </span>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  Day {mission?.dayNumber || 1} • {currentTrack}
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {mission?.dateString || todayDateFormatted}
              </span>
            </div>

            {/* Tasks Checklist matching Screen 3 */}
            <div className="space-y-3 pt-2">
              {mission?.tasks?.map((t: any) => (
                <div
                  key={t.taskId}
                  onClick={() => handleToggleTask(t.taskId)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    t.isCompleted
                      ? 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-500'
                      : 'bg-white dark:bg-[#0D121B] border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-900 dark:text-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {t.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${t.isCompleted ? 'line-through text-neutral-500' : ''}`}>
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-neutral-400 truncate max-w-md mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {t.durationMinutes} min
                    </span>
                    <Link
                      to={t.actionUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Open task"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
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

        {/* Right Card: Your Progress (4 cols matching Screen 3) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Your Progress
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Overall roadmap progression</p>
          </div>

          {/* Radial Ring 41% */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-neutral-100 dark:text-neutral-800"
                  fill="transparent"
                />
                {/* Progress Arc */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              {/* Inner Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Roadmap
                </span>
              </div>
            </div>
          </div>

          {/* Metrics List matching Screen 3 */}
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Skills</span>
              <span className="font-bold text-neutral-900 dark:text-white font-mono">
                {stats.skillsCompleted} / {stats.totalSkills}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Projects</span>
              <span className="font-bold text-neutral-900 dark:text-white font-mono">
                {stats.projectsCompleted} / {stats.totalProjects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Streak</span>
              <span className="font-bold text-amber-500 font-mono">
                {stats.streakDays} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section (4 Cards matching Screen 3) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/roadmap"
            className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">View Roadmap</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">See your path</p>
          </Link>

          <Link
            to="/projects"
            className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Browse Projects</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Build & showcase</p>
          </Link>

          <Link
            to="/hackathon"
            className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Hackathon Mode</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Prepare for events</p>
          </Link>

          <Link
            to="/mentorship"
            className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Find a Mentor</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Get expert guidance</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

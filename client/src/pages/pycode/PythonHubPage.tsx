import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pycodeService } from '../../services/pycodeService';
import { MentorshipSyncPayload } from '../../types/pycode';
import { StudentProfileHeader } from '../../components/pycode/StudentProfileHeader';
import { ActivityHeatmap } from '../../components/pycode/ActivityHeatmap';
import { StudentWorkspaceViewer } from '../../components/pycode/StudentWorkspaceViewer';
import { PracticeQuestionsArena } from '../../components/pycode/PracticeQuestionsArena';
import { CodeathonsHub } from '../../components/pycode/CodeathonsHub';
import { Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Trophy,
  LogIn,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const PythonHubPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'practice' | 'codeathons' | 'workspace'>('practice');
  const [userData, setUserData] = useState<MentorshipSyncPayload | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadUserData(user.email);
    }
  }, [user?.email]);

  const loadUserData = async (email: string) => {
    // 1. Instant Cache Hydration: Render cached profile picture, name, and workspace files with 0ms latency
    const cached = pycodeService.getCachedUserData(email);
    if (cached) {
      setUserData(cached);
    } else {
      setLoadingUserData(true);
    }

    // 2. Network Revalidation: Fetch fresh live data (real-time position, streak, codeathon results)
    try {
      const freshData = await pycodeService.fetchUserData(email);
      setUserData(freshData);
    } catch (err) {
      console.error('Failed to load PyCode user data:', err);
    } finally {
      setLoadingUserData(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Python Live Arena
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                · Interactive IDE, Curated Tracks & Proctored Codeathons
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-3">
              <Code2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <span>Python Practice & Codeathon Hub</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
              Solve real-world algorithmic problems, compete in proctored live codeathons, and synchronize your terminal workspace files seamlessly with your mentorship journey.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://pycode-student.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Open Python Sandbox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Student Profile Quick Stats Header (If Logged In) */}
      {user?.email && (
        <StudentProfileHeader
          data={userData}
          loading={loadingUserData}
          email={user.email}
        />
      )}

      {/* Main Feature Segmented Tabs */}
      <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800 gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar shadow-2xs">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'practice' ? 'text-emerald-400 dark:text-emerald-600' : 'text-emerald-500'}`} />
          <span>Practice Arena</span>
        </button>

        <button
          onClick={() => setActiveTab('codeathons')}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'codeathons'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Trophy className={`w-4 h-4 ${activeTab === 'codeathons' ? 'text-amber-400 dark:text-amber-600' : 'text-amber-500'}`} />
          <span>Codeathons & Exams</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'workspace'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Terminal className={`w-4 h-4 ${activeTab === 'workspace' ? 'text-blue-400 dark:text-blue-600' : 'text-blue-500'}`} />
          <span>My Workspace & Heatmap</span>
        </button>
      </div>

      {/* Tab 1: Practice Arena */}
      {activeTab === 'practice' && <PracticeQuestionsArena />}

      {/* Tab 2: Codeathons */}
      {activeTab === 'codeathons' && (
        <CodeathonsHub
          pastAttempts={userData?.tests_and_assessments?.past_attempts || []}
          userEmail={user?.email}
        />
      )}

      {/* Tab 3: Workspace & Heatmap */}
      {activeTab === 'workspace' && (
        <>
          {!user ? (
            /* Logged Out Guest Banner */
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                <LogIn className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Log in with your student email to view your synced code, heatmap, and exam progress.
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                Once logged in, your terminal scripts, activity streak, and test scores from PyCode will automatically reflect here.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Sign In / Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Activity Heatmap Grid */}
              <ActivityHeatmap
                dailyCounts={userData?.heatmap?.daily_counts}
                currentStreak={userData?.heatmap?.current_streak}
                longestStreak={userData?.heatmap?.longest_streak}
                loading={loadingUserData}
              />

              {/* Saved Workspace Python Scripts */}
              <StudentWorkspaceViewer
                workspace={userData?.workspace}
                loading={loadingUserData}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PythonHubPage;

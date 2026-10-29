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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Profile Quick Stats Header (If Logged In) */}
      {user?.email && (
        <StudentProfileHeader
          data={userData}
          loading={loadingUserData}
          email={user.email}
        />
      )}

      {/* Main Feature Segmented Tabs & Sandbox Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="overflow-x-auto no-scrollbar py-1">
          <div className="inline-flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800 gap-1 min-w-max shadow-2xs">
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'practice'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'practice' ? 'text-emerald-400 dark:text-emerald-600' : 'text-emerald-500'}`} />
              <span>Practice Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('codeathons')}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'codeathons'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Trophy className={`w-4 h-4 shrink-0 ${activeTab === 'codeathons' ? 'text-amber-400 dark:text-amber-600' : 'text-amber-500'}`} />
              <span>Codeathons & Exams</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'workspace'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Terminal className={`w-4 h-4 shrink-0 ${activeTab === 'workspace' ? 'text-blue-400 dark:text-blue-600' : 'text-blue-500'}`} />
              <span>My Workspace & Heatmap</span>
            </button>
          </div>
        </div>

        <a
          href="https://pycode-student.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto shrink-0"
        >
          <span>Open Python Sandbox</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
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

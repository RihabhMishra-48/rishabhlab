import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api, hasAuthToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DailyMission } from '../../types';
import { getCuratedMission } from '../../data/curatedMissions';
import { normalizeTrackName } from '../../data/curatedRoadmaps';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  GitBranch,
  Clock,
  Play,
  Share2,
  Send,
  Quote
} from 'lucide-react';

export const DailyMissionPage: React.FC = () => {
  const { user } = useAuth();
  const track = normalizeTrackName(user?.targetGoal || localStorage.getItem('rishabhlabs_goal') || 'App Development');
  const [mission, setMission] = useState<DailyMission>(() => getCuratedMission(track));
  const [loading, setLoading] = useState(false);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [githubProofUrl, setGithubProofUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isShipping, setIsShipping] = useState(false);

  const fetchMission = async () => {
    const fallback = getCuratedMission(track);
    if (!hasAuthToken()) {
      setMission(fallback);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getTodayMission();
      if (data && data.tasks && data.tasks.length > 0) {
        setMission(data);
      } else {
        setMission(fallback);
      }
    } catch (err) {
      setMission(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
  }, [user?.targetGoal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shipModalOpen) {
        setShipModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shipModalOpen]);

  const handleToggleTask = async (taskId: string) => {
    if (!mission) return;
    const updatedTasks = mission.tasks.map((t) =>
      t.taskId === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const completedTasksCount = updatedTasks.filter((t) => t.isCompleted).length;
    const isAllCompleted = completedTasksCount === updatedTasks.length;
    const updatedMission = {
      ...mission,
      tasks: updatedTasks,
      completedTasksCount,
      isAllCompleted,
    };
    setMission(updatedMission);

    if (isAllCompleted) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    try {
      const completedIds = updatedTasks.filter((t) => t.isCompleted).map((t) => t.taskId);
      const dayNum = mission.dayNumber || 1;
      localStorage.setItem(`rishabhlabs_mission_completed_${track}_day_${dayNum}`, JSON.stringify(completedIds));
      localStorage.setItem(`rishabhlabs_mission_completed_${track}`, JSON.stringify(completedIds));
    } catch (e) {
      // Ignore
    }

    try {
      await api.toggleMissionTask(mission._id, taskId);
    } catch (err) {
      console.warn('Backend mission toggle sync note:', err);
    }
  };

  const handleShipProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;
    setIsShipping(true);

    const updatedTasks = mission.tasks.map((t) =>
      t.type === 'ship'
        ? {
            ...t,
            isCompleted: true,
            proofSubmitted: githubProofUrl,
          }
        : t
    );
    const completedTasksCount = updatedTasks.filter((t) => t.isCompleted).length;
    const isAllCompleted = completedTasksCount === updatedTasks.length;
    const updatedMission = {
      ...mission,
      tasks: updatedTasks,
      completedTasksCount,
      isAllCompleted,
    };
    setMission(updatedMission);

    try {
      const completedIds = updatedTasks.filter((t) => t.isCompleted).map((t) => t.taskId);
      localStorage.setItem(`rishabhlabs_mission_completed_${track}`, JSON.stringify(completedIds));
      localStorage.setItem(
        `rishabhlabs_mission_proof_${track}`,
        JSON.stringify({ url: githubProofUrl, message: commitMessage })
      );
    } catch (e) {
      // Ignore
    }

    setShipModalOpen(false);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });

    try {
      await api.shipMissionProof(mission._id, githubProofUrl, commitMessage);
    } catch (err) {
      console.warn('Backend ship proof sync note:', err);
    } finally {
      setIsShipping(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-[84px] sm:h-[84px] rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center p-2.5 sm:p-4 shrink-0 shadow-2xs">
            <img src="/graphics/daily-calendar.svg" alt="Daily Mission" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="flex flex-col justify-between py-0.5 min-w-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 leading-none">
              Daily Mission Execution
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight truncate mt-1">
              Day {mission?.dayNumber || 1} • {mission?.trackTitle || 'Your Mission'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-none truncate mt-1">
              {mission?.dateString || todayFormatted} • Complete daily tasks to build momentum
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800">
            {mission?.dateString || todayFormatted}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mission Tasks & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Core Execution Queue ({mission?.completedTasksCount || 2} / 4 Done)
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Budget: ~95 mins
              </span>
            </div>

            {/* Merged Tasks Group with Soft Outer Edges */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
              {mission?.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className={`p-4 transition-colors ${
                    task.isCompleted
                      ? 'bg-neutral-50/40 dark:bg-transparent text-neutral-400 dark:text-neutral-500'
                      : 'bg-white dark:bg-[#212121] hover:bg-neutral-50/80 dark:hover:bg-[#262626] text-neutral-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.taskId)}
                        className="mt-0.5 shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                        )}
                      </button>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={`text-xs font-semibold ${
                              task.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                            {task.durationText}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed truncate max-w-xl">
                          {task.description}
                        </p>

                        {task.proofSubmitted && (
                          <div className="mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate flex items-center gap-1">
                            <GitBranch className="w-3 h-3 shrink-0" />
                            <span className="truncate">Proof: {task.proofSubmitted}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action link button */}
                    <div className="shrink-0 flex items-center gap-2">
                      {task.type === 'ship' ? (
                        <button
                          onClick={() => setShipModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
                        >
                          {task.isCompleted ? 'Update Proof' : 'Ship & Verify'}
                        </button>
                      ) : (
                        <Link
                          to={task.actionUrl}
                          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Mission Button matching Screen 5 */}
            <div className="pt-2">
              <Link
                to={mission?.tasks?.find(t => !t.isCompleted)?.actionUrl || mission?.tasks?.[0]?.actionUrl || '/learn'}
                className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Continue Mission →</span>
              </Link>
            </div>
          </div>

          {/* Today's Quote matching Screen 5 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Today's Quote
              </p>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 italic mt-0.5">
                "{mission?.quote || 'Small steps every day lead to big results.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Mission Focus Mode with Daily Calendar Graphic */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="relative w-44 h-44 flex items-center justify-center rounded-3xl bg-white dark:bg-neutral-800/90 shadow-md border border-neutral-200/70 dark:border-neutral-700/70 p-8">
            <img
              src="/graphics/daily-calendar.svg"
              alt="Daily Mission Focus Mode Calendar"
              className="w-full h-full object-contain dark:invert"
            />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Daily Mission Focus Mode
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Complete the Learn and Practice tasks to unlock full credit for building today's feature.
            </p>
          </div>
        </div>
      </div>

      {/* Ship Task Proof Modal */}
      {shipModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShipModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Ship Task Verification
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Submit Your GitHub Proof
              </h3>
              <p className="text-xs text-neutral-500">
                Provide your GitHub commit or PR link to verify today's shipping task and boost your streak.
              </p>
            </div>

            <form onSubmit={handleShipProof} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  GitHub Commit / PR Link
                </label>
                <input
                  type="url"
                  value={githubProofUrl}
                  onChange={(e) => setGithubProofUrl(e.target.value)}
                  required
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Commit Summary
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat: add filtering pills"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShipModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <div className="w-full sm:w-auto flex justify-end">
                  <button
                    type="submit"
                    disabled={isShipping}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isShipping ? 'Shipping...' : 'Submit & Ship Proof'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { DailyMission } from '../../types';
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
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [githubProofUrl, setGithubProofUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isShipping, setIsShipping] = useState(false);

  const fetchMission = async () => {
    try {
      const data = await api.getTodayMission();
      setMission(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    if (!mission) return;
    try {
      const res = await api.toggleMissionTask(mission._id, taskId);
      setMission(res.mission);
      if (res.mission.isAllCompleted) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShipProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;
    setIsShipping(true);
    try {
      const res = await api.shipMissionProof(mission._id, githubProofUrl, commitMessage);
      setMission(res.mission);
      setShipModalOpen(false);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsShipping(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Daily Mission Execution
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Day {mission?.dayNumber || 1} • {mission?.trackTitle || 'Your Mission'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            {mission?.dateString || todayFormatted}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mission Tasks & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Core Execution Queue ({mission?.completedTasksCount || 2} / 4 Done)
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Budget: ~95 mins
              </span>
            </div>

            <div className="space-y-3">
              {mission?.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className={`p-4 rounded-2xl border transition-all ${
                    task.isCompleted
                      ? 'bg-neutral-50/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/80'
                      : 'bg-white dark:bg-[#0D121B] border-neutral-200 dark:border-neutral-700/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.taskId)}
                        className="mt-0.5"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              task.type === 'learn'
                                ? 'bg-blue-500/10 text-blue-500'
                                : task.type === 'practice'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : task.type === 'build'
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {task.type}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">
                            {task.durationText}
                          </span>
                        </div>
                        <h3
                          className={`text-xs font-bold text-neutral-900 dark:text-white ${
                            task.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {task.description}
                        </p>

                        {task.proofSubmitted && (
                          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            <span>Proof: {task.proofSubmitted}</span>
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
                          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
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

        {/* Right Column: 3D Minimal Desk / Clock / Plant Illustration (Matching Screen 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-neutral-50 dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Clock 3D minimalist ring */}
            <div className="w-40 h-40 rounded-full bg-white dark:bg-neutral-800 shadow-podium dark:shadow-podium-dark border-4 border-neutral-100 dark:border-neutral-700 flex items-center justify-center relative">
              <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white z-10"></div>
              {/* Minute & Hour Hands */}
              <div className="absolute w-1 h-12 bg-neutral-900 dark:bg-white rounded-full -top-1 origin-bottom transform rotate-45"></div>
              <div className="absolute w-1.5 h-8 bg-neutral-600 dark:text-neutral-400 rounded-full top-3 origin-bottom transform -rotate-45"></div>
            </div>

            {/* Potted desk plant illustration next to clock */}
            <div className="absolute -bottom-2 -right-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-emerald-600 shadow-inner"></div>
              </div>
              <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-700 rounded-b-xl shadow-xs"></div>
            </div>
          </div>

          <div className="text-center space-y-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111722] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShipModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isShipping}
                  className="w-1/2 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 shadow-sm"
                >
                  {isShipping ? 'Verifying...' : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

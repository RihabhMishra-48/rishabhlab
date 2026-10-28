import React, { useState, useEffect } from 'react';
import { pycodeService } from '../../services/pycodeService';
import { AvailableCodeathon, CodeathonAttempt } from '../../types/pycode';
import { LeaderboardModal } from './LeaderboardModal';
import {
  Trophy,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  ExternalLink,
  Award,
  Layers,
  FileCheck2,
  XCircle,
  Sparkles
} from 'lucide-react';

interface CodeathonsHubProps {
  pastAttempts?: CodeathonAttempt[];
  userEmail?: string;
}

export const CodeathonsHub: React.FC<CodeathonsHubProps> = ({
  pastAttempts = [],
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'codeathons' | 'results'>('codeathons');
  const [codeathons, setCodeathons] = useState<AvailableCodeathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<{ id: string; title?: string } | null>(null);

  useEffect(() => {
    loadCodeathons();
  }, [userEmail]);

  const loadCodeathons = async () => {
    try {
      setLoading(true);
      const res = await pycodeService.fetchCodeathons('all', userEmail);
      setCodeathons(res.codeathons || []);
    } catch (err) {
      console.error('Failed to load codeathons:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return 'TBA';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const liveCount = codeathons.filter((c) => c.is_live).length;

  return (
    <div className="space-y-6">
      {/* Modern Segmented Sub-Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="inline-flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800 gap-1 min-w-max shadow-2xs">
          <button
            onClick={() => setActiveTab('codeathons')}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'codeathons'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Trophy className={`w-4 h-4 shrink-0 ${activeTab === 'codeathons' ? 'text-amber-400 dark:text-amber-600' : 'text-amber-500'}`} />
            <span>Live & Upcoming Codeathons</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'codeathons'
                ? 'bg-white/20 dark:bg-neutral-900/20'
                : 'bg-neutral-200/80 dark:bg-neutral-800'
            }`}>
              {codeathons.length}
            </span>
            {liveCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'results'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <FileCheck2 className={`w-4 h-4 shrink-0 ${activeTab === 'results' ? 'text-blue-400 dark:text-blue-600' : 'text-blue-500'}`} />
            <span>My Exam Results</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'results'
                ? 'bg-white/20 dark:bg-neutral-900/20'
                : 'bg-neutral-200/80 dark:bg-neutral-800'
            }`}>
              {pastAttempts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Codeathons Grid */}
      {activeTab === 'codeathons' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800/80 animate-pulse space-y-4 shadow-xs"
                >
                  <div className="w-2/3 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="w-1/2 h-4 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                  <div className="w-full h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/40" />
                </div>
              ))}
            </div>
          ) : codeathons.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
              <Trophy className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No codeathons available right now
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Upcoming proctored tests, competitive coding sprints, and weekly exams will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              {codeathons.map((c) => {
                const userAttempt = c.user_attempt;
                const isCompleted = userAttempt?.is_completed;
                const isDisqualified = userAttempt?.is_disqualified;

                return (
                  <div
                    key={c.id}
                    className="group p-6 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3.5">
                      {/* Status Badge + Difficulty */}
                      <div className="flex items-center justify-between gap-2">
                        {c.is_live ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Now
                          </span>
                        ) : c.is_upcoming ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-neutral-500" />
                            Concluded
                          </span>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                          {c.difficulty || 'All Levels'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 leading-snug tracking-tight">
                          {c.title}
                        </h3>
                        {c.description && (
                          <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata Chips Row */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        {c.creator_name && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-semibold">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{c.creator_name}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-semibold">
                          <Layers className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{c.total_questions} Questions</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{c.timings?.duration_minutes ? `${c.timings.duration_minutes} Mins` : 'Timed'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Starts: {formatDateTime(c.timings?.start_time)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2.5">
                      {isDisqualified ? (
                        <div className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" />
                          <span>Disqualified (3 Warnings Exceeded)</span>
                        </div>
                      ) : isCompleted ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Submitted · Score: {userAttempt?.score ?? 0}</span>
                        </div>
                      ) : c.is_live ? (
                        <a
                          href={c.attempt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Attend Live Codeathon</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : c.is_upcoming ? (
                        <div className="w-full py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold text-center border border-neutral-200/60 dark:border-neutral-700/60">
                          Starts at {formatDateTime(c.timings?.start_time)}
                        </div>
                      ) : (
                        <div className="w-full py-2 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/70 text-neutral-500 dark:text-neutral-400 text-xs font-semibold text-center">
                          Codeathon Concluded
                        </div>
                      )}

                      {/* View Leaderboard Button */}
                      <button
                        onClick={() => setSelectedLeaderboard({ id: c.id, title: c.title })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                        <span>View Leaderboard & Rankings</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: My Exam Results Table */}
      {activeTab === 'results' && (
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-[#1a1a1e] overflow-hidden shadow-xs">
          {pastAttempts.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No past exam attempts found
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                When you participate in live Codeathons on PyCode, your scored submissions, analytics, and rank will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#202024] border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-5 py-3.5">Codeathon Title</th>
                    <th className="px-4 py-3.5">Date Taken</th>
                    <th className="px-4 py-3.5">Answered</th>
                    <th className="px-4 py-3.5">Warnings</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Percentage</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {pastAttempts.map((attempt) => (
                    <tr
                      key={attempt.test_id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white">
                        {attempt.test_title}
                      </td>
                      <td className="px-4 py-4 text-neutral-500 dark:text-neutral-400 font-mono">
                        {formatDateTime(attempt.completed_at || attempt.started_at)}
                      </td>
                      <td className="px-4 py-4 text-neutral-700 dark:text-neutral-300">
                        {attempt.questions_answered} Questions
                      </td>
                      <td className="px-4 py-4">
                        {attempt.warnings_count > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {attempt.warnings_count}
                          </span>
                        ) : (
                          <span className="text-neutral-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-neutral-900 dark:text-white">
                        {attempt.score}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {attempt.score_percentage}%
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              attempt.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : attempt.status === 'disqualified'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {attempt.status}
                          </span>

                          <button
                            onClick={() => setSelectedLeaderboard({ id: attempt.test_id, title: attempt.test_title })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            <span>Leaderboard</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Codeathon Leaderboard Modal */}
      {selectedLeaderboard && (
        <LeaderboardModal
          codeathonId={selectedLeaderboard.id}
          codeathonTitle={selectedLeaderboard.title}
          onClose={() => setSelectedLeaderboard(null)}
          currentUserEmail={userEmail}
        />
      )}
    </div>
  );
};

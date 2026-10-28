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
  XCircle
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

  return (
    <div className="space-y-6">
      {/* 2 Tabs Header */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('codeathons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'codeathons'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Live & Upcoming Codeathons</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800">
            {codeathons.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-blue-500" />
          <span>My Exam Results</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800">
            {pastAttempts.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Codeathons Grid */}
      {activeTab === 'codeathons' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4"
                >
                  <div className="w-2/3 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="w-1/2 h-4 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                  <div className="w-full h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/40" />
                </div>
              ))}
            </div>
          ) : codeathons.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800">
              <Trophy className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No codeathons available right now
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Upcoming proctored tests and coding sprints will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codeathons.map((c) => {
                const userAttempt = c.user_attempt;
                const isCompleted = userAttempt?.is_completed;
                const isDisqualified = userAttempt?.is_disqualified;

                return (
                  <div
                    key={c.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      {/* Status Badge + Difficulty */}
                      <div className="flex items-center justify-between gap-2">
                        {c.is_live ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Now
                          </span>
                        ) : c.is_upcoming ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Coming Soon
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                            Quiz Ended
                          </span>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {c.difficulty || 'All Levels'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                          {c.title}
                        </h3>
                        {c.description && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                            {c.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                        {c.creator_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            {c.creator_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-neutral-400" />
                          {c.total_questions} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {c.timings?.duration_minutes ? `${c.timings.duration_minutes} Mins` : 'Timed'}
                        </span>
                      </div>

                      {/* Timings */}
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono pt-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span>Starts: {formatDateTime(c.timings?.start_time)}</span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                      {isDisqualified ? (
                        <div className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Disqualified (3 Warnings Exceeded)</span>
                        </div>
                      ) : isCompleted ? (
                        <div className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Submitted (Score: {userAttempt?.score ?? 0})</span>
                        </div>
                      ) : c.is_live ? (
                        <a
                          href={c.attempt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Attend Codeathon →</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : c.is_upcoming ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-semibold cursor-not-allowed text-center"
                        >
                          Starts at {formatDateTime(c.timings?.start_time)}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-semibold cursor-not-allowed text-center"
                        >
                          Codeathon Ended
                        </button>
                      )}

                      {/* View Leaderboard Button */}
                      <button
                        onClick={() => setSelectedLeaderboard({ id: c.id, title: c.title })}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>View Leaderboard</span>
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
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] overflow-hidden shadow-2xs">
          {pastAttempts.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No past exam attempts found
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                When you participate in live Codeathons on PyCode, your scored submissions and analytics will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#222222] border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-5 py-3.5">Codeathon Title</th>
                    <th className="px-4 py-3.5">Date Taken</th>
                    <th className="px-4 py-3.5">Answered</th>
                    <th className="px-4 py-3.5">Warnings</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Percentage</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {pastAttempts.map((attempt) => (
                    <tr
                      key={attempt.test_id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white">
                        {attempt.test_title}
                      </td>
                      <td className="px-4 py-4 text-neutral-500 font-mono">
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
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            <span>View Leaderboard</span>
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

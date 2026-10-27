import React, { useState, useEffect } from 'react';
import { pycodeService } from '../../services/pycodeService';
import { CodeathonLeaderboardResponse, LeaderboardEntry } from '../../types/pycode';
import { UserAvatar } from '../common/UserAvatar';
import {
  Trophy,
  X,
  Search,
  RotateCw,
  Medal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileCode2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface LeaderboardModalProps {
  codeathonId: string | null;
  codeathonTitle?: string;
  onClose: () => void;
  currentUserEmail?: string;
  currentUsername?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  codeathonId,
  codeathonTitle,
  onClose,
  currentUserEmail,
  currentUsername,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CodeathonLeaderboardResponse | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (codeathonId) {
      loadLeaderboard(codeathonId);
    }
  }, [codeathonId]);

  const loadLeaderboard = async (id: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await pycodeService.fetchLeaderboard(id);
      setData(res);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!codeathonId) return null;

  const leaderboard = data?.leaderboard || [];
  const topThree = leaderboard.slice(0, 3);

  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.full_name?.toLowerCase().includes(q) ||
      entry.username?.toLowerCase().includes(q) ||
      entry.roll_number?.toLowerCase().includes(q) ||
      entry.course?.toLowerCase().includes(q) ||
      entry.section?.toLowerCase().includes(q)
    );
  });

  const title = data?.codeathon?.title || codeathonTitle || 'Codeathon Leaderboard';
  const totalParticipants = data?.codeathon?.total_participants ?? leaderboard.length;
  const totalQuestions = data?.codeathon?.total_questions ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#202020]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white line-clamp-1">
                  {title}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Rankings
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  {totalParticipants} Competitors
                </span>
                {totalQuestions > 0 && (
                  <span className="flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-purple-500" />
                    {totalQuestions} Problems
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadLeaderboard(codeathonId, true)}
              disabled={refreshing || loading}
              title="Refresh live leaderboard"
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top 3 Podium (Only if we have at least 2 entries) */}
          {!loading && topThree.length >= 2 && !search && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 sm:order-1 p-4 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center relative">
                  <span className="absolute -top-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-300 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-400/30">
                    🥈 Rank #2
                  </span>
                  <div className="mt-2">
                    <UserAvatar
                      src={topThree[1].avatar_url}
                      name={topThree[1].full_name}
                      email={topThree[1].username}
                      size={52}
                      roundedClassName="rounded-2xl"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-2 line-clamp-1">
                    {topThree[1].full_name}
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500">@{topThree[1].username}</p>
                  <div className="mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {topThree[1].score} pts ({topThree[1].score_percentage}%)
                  </div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {topThree[1].time_taken_formatted}
                  </div>
                </div>
              )}

              {/* 1st Place (Champion) */}
              {topThree[0] && (
                <div className="order-1 sm:order-2 p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 flex flex-col items-center text-center relative shadow-sm">
                  <span className="absolute -top-3.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 fill-current" />
                    🥇 Champion #1
                  </span>
                  <div className="mt-2 ring-2 ring-amber-500/50 rounded-2xl">
                    <UserAvatar
                      src={topThree[0].avatar_url}
                      name={topThree[0].full_name}
                      email={topThree[0].username}
                      size={60}
                      roundedClassName="rounded-2xl"
                    />
                  </div>
                  <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white mt-2.5 line-clamp-1">
                    {topThree[0].full_name}
                  </h4>
                  <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                    @{topThree[0].username}
                  </p>
                  <div className="mt-2 text-sm font-black text-amber-600 dark:text-amber-400">
                    {topThree[0].score} pts ({topThree[0].score_percentage}%)
                  </div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {topThree[0].time_taken_formatted}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 sm:order-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center relative">
                  <span className="absolute -top-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-700/20 text-amber-800 dark:text-amber-300 border border-amber-600/30">
                    🥉 Rank #3
                  </span>
                  <div className="mt-2">
                    <UserAvatar
                      src={topThree[2].avatar_url}
                      name={topThree[2].full_name}
                      email={topThree[2].username}
                      size={52}
                      roundedClassName="rounded-2xl"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-2 line-clamp-1">
                    {topThree[2].full_name}
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500">@{topThree[2].username}</p>
                  <div className="mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {topThree[2].score} pts ({topThree[2].score_percentage}%)
                  </div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {topThree[2].time_taken_formatted}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search competitor by name, username, roll number, or section..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#242424] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-[#1f1f1f]">
            {loading ? (
              <div className="p-8 text-center space-y-3">
                <RotateCw className="w-6 h-6 mx-auto animate-spin text-emerald-500" />
                <p className="text-xs text-neutral-500">Retrieving real-time leaderboard rankings...</p>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-neutral-400" />
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  No competitors found
                </h4>
                <p className="text-[11px] text-neutral-500">
                  {search ? 'Try adjusting your search keywords.' : 'No submissions recorded yet for this codeathon.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#242424] text-[11px] font-bold text-neutral-500">
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4 text-center">Cases</th>
                      <th className="py-3 px-4 text-center">Time</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {filteredLeaderboard.map((entry) => {
                      const isMe =
                        Boolean(currentUserEmail && entry.username && currentUserEmail.toLowerCase().includes(entry.username.toLowerCase())) ||
                        Boolean(currentUsername && entry.username && currentUsername.toLowerCase() === entry.username.toLowerCase());

                      return (
                        <tr
                          key={entry.user_id || entry.rank}
                          className={`transition-colors ${
                            isMe
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/5 font-semibold'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                                entry.rank === 1
                                  ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                                  : entry.rank === 2
                                  ? 'bg-slate-300 dark:bg-zinc-700 text-slate-800 dark:text-zinc-100'
                                  : entry.rank === 3
                                  ? 'bg-amber-700/20 text-amber-800 dark:text-amber-300'
                                  : 'text-neutral-500 dark:text-neutral-400 font-mono'
                              }`}
                            >
                              {entry.rank <= 3 ? (
                                entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                              ) : (
                                `#${entry.rank}`
                              )}
                            </span>
                          </td>

                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={entry.avatar_url}
                                name={entry.full_name}
                                email={entry.username}
                                size={34}
                                roundedClassName="rounded-xl"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-neutral-900 dark:text-white">
                                    {entry.full_name}
                                  </span>
                                  {isMe && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-white">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                  <span className="font-mono">@{entry.username}</span>
                                  {entry.roll_number && (
                                    <span>· Roll: {entry.roll_number}</span>
                                  )}
                                  {entry.course && (
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium">
                                      {entry.course} {entry.section ? `(${entry.section})` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Score & Percentage */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="font-extrabold text-neutral-900 dark:text-white">
                              {entry.score} pts
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {entry.score_percentage}% score
                            </div>
                          </td>

                          {/* Cases Passed */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                              {entry.passed_cases}/{entry.total_cases}
                            </div>
                            <div className="text-[10px] text-neutral-400">cases passed</div>
                          </td>

                          {/* Time Taken */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="font-mono text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{entry.time_taken_formatted}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {entry.is_disqualified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                Disqualified ({entry.warnings_count}w)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Hackathon } from '../../types';
import {
  CURATED_COMPETITIONS,
  CAMPUS_LEADERBOARDS,
  Competition,
  LeaderboardUser
} from '../../data/curatedCompetitions';
import {
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Flag,
  Lightbulb,
  FileCode,
  Layers,
  Presentation,
  HelpCircle,
  ArrowRight,
  Send,
  Flame,
  Award,
  Users,
  Medal,
  ChevronRight,
  Shield,
  Code,
  ExternalLink,
  Target
} from 'lucide-react';

export const HackathonModePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'competitions';

  const [activeMainTab, setActiveMainTab] = useState<'competitions' | 'leaderboard' | 'builder'>(
    initialTab as any
  );

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [activeTool, setActiveTool] = useState<string>('ideas');
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [loadingTool, setLoadingTool] = useState(false);
  const [problemInput, setProblemInput] = useState(
    'Automated AI platform for evaluating student code artifacts, detecting edge case vulnerabilities, and accelerating prototype delivery.'
  );

  // Competitions state
  const [competitions, setCompetitions] = useState<Competition[]>(CURATED_COMPETITIONS);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(CURATED_COMPETITIONS[0]);
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({
    'comp-1': true,
    'comp-2': true,
  });

  // Leaderboard state
  const [selectedCampus, setSelectedCampus] = useState<'GLA University' | 'Global'>('GLA University');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'competitions' || tab === 'leaderboard' || tab === 'builder')) {
      setActiveMainTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const data = await api.getHackathon();
        setHackathon(data);
        runTool('ideas');
      } catch (err) {
        console.error(err);
      }
    };
    fetchHackathon();
  }, []);

  const handleTabChange = (tab: 'competitions' | 'leaderboard' | 'builder') => {
    setActiveMainTab(tab);
    setSearchParams({ tab });
  };

  const runTool = async (toolName: string) => {
    setActiveTool(toolName);
    setLoadingTool(true);
    try {
      const res = await api.runHackathonAITool(toolName, problemInput);
      setToolOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTool(false);
    }
  };

  const handleToggleRegister = (compId: string) => {
    setRegisteredMap((prev) => ({
      ...prev,
      [compId]: !prev[compId],
    }));
  };

  const currentLeaderboard = CAMPUS_LEADERBOARDS[selectedCampus] || CAMPUS_LEADERBOARDS['GLA University'];
  const topThree = currentLeaderboard.slice(0, 3);
  const remainingRankings = currentLeaderboard.slice(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md shadow-amber-500/10 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none" />
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 relative z-10" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                Competitions & Leaderboards
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Season 4 Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Arena & Hackathons
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Compete in weekly algorithmic sprints, earn campus leaderboard ranks, and build 48-hr prototypes.
            </p>
          </div>
        </div>

        {/* User Rank Card Pill — Sleek Telemetry Badge */}
        <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1f1f23] border border-neutral-200/80 dark:border-neutral-800 shadow-sm backdrop-blur-md self-start sm:self-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-500/30 text-amber-500 flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 shadow-2xs">
            <span>#14</span>
          </div>
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">GLA Cohort</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Top 4%
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>17d Streak</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold">1,450 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs & Live Arena Telemetry Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => handleTabChange('competitions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'competitions'
                ? 'bg-white dark:bg-[#26262c] text-neutral-950 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.03]'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Live Sprints & Contests</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>1 LIVE</span>
            </span>
          </button>

          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'leaderboard'
                ? 'bg-white dark:bg-[#26262c] text-neutral-950 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.03]'
            }`}
          >
            <Award className="w-4 h-4 text-blue-500" />
            <span>Campus & Global Leaderboards</span>
          </button>

          <button
            onClick={() => handleTabChange('builder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'builder'
                ? 'bg-white dark:bg-[#26262c] text-neutral-950 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.03]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>48-Hour Hackathon AI Engine</span>
          </button>
        </div>

        {/* Live Arena Telemetry Pill — Fills the previous empty space with real-time status */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#222228] border border-neutral-200/70 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 self-center mr-1">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>428 GLA Coders Active</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Sprint #18</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-neutral-500 dark:text-neutral-400">3h 42m Left</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: LIVE COMPETITIONS & SPRINTS
          ======================================================== */}
      {activeMainTab === 'competitions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Highlight Live Sprint Banner */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1a1b22] via-[#15161c] to-[#101115] text-white border border-neutral-800/80 shadow-xl overflow-hidden">
            {/* Ambient Lighting Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Sprint Details & CTAs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>LIVE SPRINT HAPPENING NOW</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                    Weekly Sprint #18 • Algorithm Arena
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    High-Throughput In-Memory Cache
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  Design an in-memory key-value cache engine supporting TTL expiration, thread-safe LRU eviction, and sub-millisecond lookups under high concurrent simulated workload.
                </p>

                {/* Sleek Glass Metric Capsules */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>3h 42m Left</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>428 GLA Coders Active</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>₹20,000 Prize Pool</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/practice/high-throughput-in-memory-cache"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    <span>Enter Code Arena & Submit</span>
                  </Link>
                  <button
                    onClick={() => handleTabChange('leaderboard')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Sprint Standings</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Leaderboard Snapshot Card (5 cols) */}
              <div className="lg:col-span-5">
                <div
                  onClick={() => handleTabChange('leaderboard')}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 dark:bg-black/40 border border-neutral-800 backdrop-blur-md space-y-3 cursor-pointer hover:border-amber-500/40 transition-colors group"
                  title="Click to view full GLA & Global Leaderboards"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-amber-400 flex items-center gap-1.5 font-mono transition-colors">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Live Sprint Standings
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                      GLA Cohort
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-neutral-950 font-extrabold text-[10px] flex items-center justify-center font-mono">
                          #1
                        </span>
                        <div>
                          <span className="font-bold text-white block leading-tight">Sahil Kumar</span>
                          <span className="text-[10px] text-neutral-400">44m solve • 0 fails</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-xs">980 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-neutral-700 text-white font-extrabold text-[10px] flex items-center justify-center font-mono">
                          #2
                        </span>
                        <div>
                          <span className="font-bold text-white block leading-tight">Pooja Sharma</span>
                          <span className="text-[10px] text-neutral-400">51m solve • 1 retry</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-300 text-xs">920 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-neutral-800 text-neutral-400 font-extrabold text-[10px] flex items-center justify-center font-mono">
                          #3
                        </span>
                        <div>
                          <span className="font-bold text-white block leading-tight">Vikas Dubey</span>
                          <span className="text-[10px] text-neutral-400">58m solve • 1 retry</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-300 text-xs">870 pts</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="text-amber-400 font-bold">Your Rank: #14</span> (720 pts)
                    </span>
                    <span className="text-emerald-400 font-semibold">+150 pts to Top 10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competitions Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Upcoming Hackathons & Code Sprints
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Join national hackathons, weekly sprints, and speed runs to boost campus rank.
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono font-medium hidden sm:block">
                4 Active & Verified Contests
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {competitions.map((comp) => {
                const isReg = registeredMap[comp.id];

                return (
                  <div
                    key={comp.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#1e1f24] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${
                          comp.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        }`}>
                          {comp.status === 'live' ? '● LIVE CONTEST' : comp.remainingTime}
                        </span>

                        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 font-mono">
                          {comp.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                        {comp.title}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>

                      {/* Specification Preview Box */}
                      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#15161a] border border-neutral-200/60 dark:border-neutral-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-1.5">
                            <Code className="w-3 h-3 text-blue-500" />
                            Challenge Specification
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {comp.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-800 dark:text-neutral-200 leading-normal">
                          {comp.problemStatementBrief}
                        </p>
                      </div>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {comp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-100 dark:bg-[#25262c] text-neutral-600 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono">Prize & Perks</span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>{comp.prizePool}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {comp.status === 'live' && (
                          <Link
                            to="/practice/high-throughput-in-memory-cache"
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Enter Arena</span>
                          </Link>
                        )}
                        {comp.id === 'comp-2' && (
                          <button
                            onClick={() => handleTabChange('builder')}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Engine</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleRegister(comp.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isReg
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 shadow-xs'
                          }`}
                        >
                          {isReg ? 'Registered ✓' : 'Register Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CAMPUS & GLOBAL LEADERBOARDS
          ======================================================== */}
      {activeMainTab === 'leaderboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Campus Switcher Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Official Campus Standings
              </span>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Engineering Leaderboards
              </h2>
              <p className="text-xs text-neutral-500">
                Ranked by verified challenge submissions, sprint points, and streak consistency.
              </p>
            </div>

            {/* Campus Selector Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-xs font-bold">
              <button
                onClick={() => setSelectedCampus('GLA University')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedCampus === 'GLA University'
                    ? 'bg-white dark:bg-[#262626] text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🏫 GLA University Cohort
              </button>
              <button
                onClick={() => setSelectedCampus('Global')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedCampus === 'Global'
                    ? 'bg-white dark:bg-[#262626] text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🌍 Global (All Institutes)
              </button>
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center space-y-3 relative">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-extrabold text-base border-2 border-slate-300 dark:border-slate-600">
                  #2
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {topThree[1].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[1].college}</span>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {topThree[1].track}
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Score</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{topThree[1].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[1].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) - Elevated in center */}
            {topThree[0] && (
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-[#212121] border-2 border-amber-400/60 dark:border-amber-600/60 shadow-lg flex flex-col items-center text-center space-y-3 relative md:-mt-4">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-[10px] font-mono shadow-xs flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>CAMPUS LEADER</span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-amber-300">
                  #1
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                    {topThree[0].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[0].college}</span>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {topThree[0].badge}
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-amber-200/40 dark:border-amber-900/40 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Total Score</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">{topThree[0].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{topThree[0].streakDays}d Streak</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center space-y-3 relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-700/20 text-amber-800 dark:text-amber-400 flex items-center justify-center font-extrabold text-base border-2 border-amber-600/40">
                  #3
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {topThree[2].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[2].college}</span>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {topThree[2].track}
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Score</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{topThree[2].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[2].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Cohort Rankings Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              Rankings 4 – 15
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {remainingRankings.map((user) => (
                <div
                  key={user.id}
                  className={`py-3.5 px-3 flex items-center justify-between gap-4 rounded-xl transition-colors ${
                    user.isCurrentUser
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80'
                      : 'hover:bg-neutral-50 dark:hover:bg-[#1f1f1f]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-sm font-bold font-mono ${
                      user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'
                    }`}>
                      #{user.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${
                          user.isCurrentUser ? 'text-blue-600 dark:text-blue-300' : 'text-neutral-900 dark:text-white'
                        }`}>
                          {user.name}
                        </span>
                        {user.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500">{user.college} • {user.track}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-neutral-400 font-sans block">Problems</span>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">{user.problemsSolved} Solved</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{user.streakDays}d</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-bold text-neutral-900 dark:text-white">{user.points}</span>
                      <span className="text-[10px] text-neutral-400 ml-1">XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: 48-HOUR HACKATHON AI ENGINE
          ======================================================== */}
      {activeMainTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Left Column: Countdown & Timeline Phases (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Countdown Card */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-neutral-900 dark:bg-[#212121] text-white border border-neutral-800 shadow-xl overflow-hidden space-y-4">
              <div className="absolute right-4 bottom-2 opacity-20 pointer-events-none select-none w-36 h-28 flex items-end justify-end">
                <img src="/graphics/mountain.svg" alt="Summit Mountain" className="w-28 h-28 object-contain invert" />
              </div>

              <div className="relative z-10 space-y-3">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Sprint Time Remaining</p>
                  <div className="flex items-baseline gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white mt-1">
                    <span>12<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">d</span></span>
                    <span>04<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">h</span></span>
                    <span>32<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">m</span></span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Target: {hackathon?.hackathonName || 'Smart India Hackathon & InnovateX 2026'}
                </p>
              </div>
            </div>

            {/* Timeline Phases List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                48-Hour Sprint Milestones
              </h2>

              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                {hackathon?.phases?.map((phase) => {
                  const isCompleted = phase.status === 'completed';
                  const isActive = phase.status === 'active';

                  return (
                    <div
                      key={phase.phaseId}
                      className={`p-3.5 sm:p-4 transition-colors flex items-start justify-between gap-3.5 ${
                        isActive
                          ? 'bg-white dark:bg-[#262626] text-neutral-900 dark:text-white'
                          : isCompleted
                          ? 'bg-neutral-50/40 dark:bg-transparent text-neutral-500 dark:text-neutral-400'
                          : 'bg-white/60 dark:bg-transparent text-neutral-600 dark:text-neutral-400 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-400 dark:text-neutral-600" />
                          )}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <span className={`text-xs block ${isActive ? 'font-bold text-neutral-900 dark:text-white' : 'font-semibold text-neutral-800 dark:text-neutral-200'}`}>
                            {phase.daysRange}: {phase.name}
                          </span>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: AI Assistant Tools (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Hackathon AI Tool Suite
                </h2>
                <p className="text-xs text-neutral-500">Accelerate your 48-hour delivery with AI assistance.</p>
              </div>

              {/* Tool Selector Buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => runTool('ideas')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                    activeTool === 'ideas'
                      ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                      : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Generate Ideas</span>
                </button>

                <button
                  onClick={() => runTool('architecture')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                    activeTool === 'architecture'
                      ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                      : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Architecture</span>
                </button>

                <button
                  onClick={() => runTool('code')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                    activeTool === 'code'
                      ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                      : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Scaffold Code</span>
                </button>

                <button
                  onClick={() => runTool('pitch')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                    activeTool === 'pitch'
                      ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                      : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Presentation className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Pitch Deck</span>
                </button>
              </div>

              {/* Problem Statement Prompt Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Problem Context:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-400 resize-none font-sans"
                    placeholder="Describe your hackathon problem..."
                  />
                  <button
                    onClick={() => runTool(activeTool)}
                    disabled={loadingTool}
                    className="absolute right-2.5 bottom-3 p-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    title="Generate"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tool Execution Results */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>AI Blueprint Output</span>
                  {loadingTool && <span className="text-blue-500 font-mono text-[10px]">Processing...</span>}
                </span>

                <div className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800/60 max-h-80 overflow-y-auto text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans space-y-2">
                  {loadingTool ? (
                    <div className="py-8 text-center text-neutral-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-[11px]">Generating optimal architecture blueprint...</p>
                    </div>
                  ) : toolOutput?.content ? (
                    <div className="whitespace-pre-wrap font-mono text-[11px] text-neutral-800 dark:text-neutral-300">
                      {toolOutput.content}
                    </div>
                  ) : (
                    <p className="text-neutral-400 text-center py-4">Click any tool above to synthesize technical deliverables.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

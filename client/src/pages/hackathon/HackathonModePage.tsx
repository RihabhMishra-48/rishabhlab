import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Contests');
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>(() => {
    try {
      const cached = localStorage.getItem('rishabhlabs_competitions_registered');
      if (cached) return JSON.parse(cached);
    } catch { }
    return {
      'comp-1': true,
      'comp-2': true,
    };
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
    setRegisteredMap((prev) => {
      const updated = {
        ...prev,
        [compId]: !prev[compId],
      };
      try {
        localStorage.setItem('rishabhlabs_competitions_registered', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const filteredCompetitions = selectedCategory === 'All Contests'
    ? competitions
    : competitions.filter((c) => c.category === selectedCategory);

  const currentLeaderboard = CAMPUS_LEADERBOARDS[selectedCampus] || CAMPUS_LEADERBOARDS['GLA University'];
  const topThree = currentLeaderboard.slice(0, 3);
  const remainingRankings = currentLeaderboard.slice(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Projects & Learn Workspace theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-stretch gap-4 sm:gap-5">
          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 leading-none">
                Arena & Engineering Sprints
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              <span className="text-[10px] font-semibold text-neutral-400 font-mono">
                Season 4 Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              Live Sprints & Contests
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-none">
              Compete in weekly algorithmic sprints, earn campus leaderboard ranks, and build 48-hr prototypes.
            </p>
          </div>
        </div>

        {/* User Rank Card Pill */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-card text-card-foreground border border-border/40 shadow-xs self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs font-mono flex items-center justify-center shadow-xs">
            #14
          </div>
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">GLA Cohort</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                Top 4%
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <Flame className="w-3 h-3 text-amber-500 fill-current" />
              <span>17d Streak • 1,450 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-muted/50">
        <button
          onClick={() => handleTabChange('competitions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'competitions'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Sprints & Contests</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>1 LIVE</span>
          </span>
        </button>

        <button
          onClick={() => handleTabChange('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'leaderboard'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Award className="w-3.5 h-3.5 text-blue-500" />
          <span>Campus & Global Leaderboards</span>
        </button>

        <button
          onClick={() => handleTabChange('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'builder'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>48-Hour Hackathon AI Engine</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: LIVE COMPETITIONS & SPRINTS
          ======================================================== */}
      {activeMainTab === 'competitions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Featured Live Sprint Spotlight Card */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-card text-card-foreground border border-border/40 shadow-soft dark:shadow-soft-dark space-y-6">
            {/* Ambient Background Accent Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            {/* Header / Meta Capsule */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>LIVE SPRINT HAPPENING NOW</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-muted text-muted-foreground">
                  Weekly Sprint #18
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Intermediate / Algorithms
                </span>
              </div>

              {/* Countdown timer capsule */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>3h 42m Remaining</span>
              </div>
            </div>

            {/* Title & Core Overview */}
            <div className="relative z-10 space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Weekly Code Sprint #18: High-Throughput In-Memory Cache
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Design and implement an in-memory key-value cache engine supporting TTL expiration, thread-safe LRU eviction, and sub-millisecond lookups under high concurrent simulated workload.
              </p>
            </div>

            {/* Specification & Telemetry Strip */}
            <div className="relative z-10 p-5 rounded-2xl bg-muted/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
                <span className="text-xs font-bold text-foreground flex items-center gap-2 font-mono">
                  <Code className="w-4 h-4 text-blue-500" />
                  Engineering Specification & Test Constraints
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Latency Threshold: &lt; 0.8ms p99
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background/70 font-mono text-xs text-foreground/90 leading-relaxed">
                Implement CacheEngine with <code className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">get(key)</code>, <code className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">set(key, val, ttl)</code>, and <code className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">purge()</code> handling 10,000 concurrent ops/sec with zero race conditions.
              </div>

              {/* 4 Clean Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-card/80 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-mono block">Participants</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>428 GLA Coders</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card/80 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-mono block">Prize Pool</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>₹20,000 + Referrals</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card/80 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-mono block">Runtimes</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono">
                    <FileCode className="w-3.5 h-3.5 text-purple-500" />
                    <span>TS • Python • Go</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card/80 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-mono block">Campus Impact</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>+150 XP / +4 Ranks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags & Action Bar */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {['Data Structures', 'LRU Cache', 'Concurrency', 'Thread Safety', 'Sub-ms p99'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => alert('Launching Weekly Sprint Workspace... Opening problem IDE.')}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>Enter Code Arena & Submit</span>
                </button>
                <button
                  onClick={() => handleTabChange('leaderboard')}
                  className="px-4 py-2.5 rounded-full bg-muted hover:bg-accent text-foreground font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sprint Standings</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Competitions Section Header & Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Upcoming Hackathons & Code Sprints
                </h2>
                <p className="text-xs text-muted-foreground">
                  Join national hackathons, weekly sprints, and speed runs to boost campus rank.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40">
                {['All Contests', 'Algorithm Sprint', 'Hackathon', 'Full-Stack Speed Run', 'Bug Bounty'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Competitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCompetitions.map((comp) => {
                const isReg = registeredMap[comp.id];

                return (
                  <div
                    key={comp.id}
                    className="p-5 sm:p-6 rounded-3xl bg-card text-card-foreground border border-border/40 shadow-xs flex flex-col justify-between space-y-4 transition-colors"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase inline-flex items-center gap-1.5 ${comp.status === 'live'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                          {comp.status === 'live' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>LIVE CONTEST</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{comp.remainingTime}</span>
                            </>
                          )}
                        </span>

                        <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                          {comp.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                        {comp.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>

                      {/* Specification Preview Box */}
                      <div className="p-3.5 rounded-2xl bg-muted/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                            <Code className="w-3 h-3 text-blue-500" />
                            Challenge Specification
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {comp.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-foreground/90 leading-normal">
                          {comp.problemStatementBrief}
                        </p>
                      </div>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {comp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-muted/60 text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-border/40 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-mono">Prize Pool & Perks</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>{comp.prizePool}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleRegister(comp.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${isReg
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                          }`}
                      >
                        {isReg ? 'Registered ✓' : 'Register Now'}
                      </button>
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
                className={`px-4 py-2 rounded-xl transition-all ${selectedCampus === 'GLA University'
                  ? 'bg-white dark:bg-[#262626] text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                GLA University Cohort
              </button>
              <button
                onClick={() => setSelectedCampus('Global')}
                className={`px-4 py-2 rounded-xl transition-all ${selectedCampus === 'Global'
                  ? 'bg-white dark:bg-[#262626] text-neutral-950 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                Global (All Institutes)
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
                  className={`py-3.5 px-3 flex items-center justify-between gap-4 rounded-xl transition-colors ${user.isCurrentUser
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#1f1f1f]'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-sm font-bold font-mono ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'
                      }`}>
                      #{user.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-300' : 'text-neutral-900 dark:text-white'
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
                      className={`p-3.5 sm:p-4 transition-colors flex items-start justify-between gap-3.5 ${isActive
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
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${activeTool === 'ideas'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Generate Ideas</span>
                </button>

                <button
                  onClick={() => runTool('architecture')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${activeTool === 'architecture'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Architecture</span>
                </button>

                <button
                  onClick={() => runTool('code')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${activeTool === 'code'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Scaffold Code</span>
                </button>

                <button
                  onClick={() => runTool('pitch')}
                  className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${activeTool === 'pitch'
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

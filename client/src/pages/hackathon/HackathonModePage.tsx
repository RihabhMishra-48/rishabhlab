import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { pycodeService } from '../../services/pycodeService';
import { LeaderboardModal } from '../../components/pycode/LeaderboardModal';
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
  ChevronDown,
  Shield,
  Code,
  ExternalLink,
  Target,
  Building2,
  Search,
  Zap,
  Check,
  X
} from 'lucide-react';

export const HackathonModePage: React.FC = () => {
  const { user } = useAuth();
  const userTrack = user?.fieldOfInterest || user?.targetGoal || 'Cybersecurity';
  const userCollege = user?.college || '';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'competitions';

  const [activeMainTab, setActiveMainTab] = useState<'competitions' | 'leaderboard' | 'builder'>(
    initialTab as any
  );
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<{ id: string; title?: string } | null>(null);

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

  // Sync live codeathons from PyCode engine into Contests & Arena
  useEffect(() => {
    pycodeService.fetchCodeathons('all', user?.email).then((res) => {
      if (res.codeathons && res.codeathons.length > 0) {
        const syncedItems: Competition[] = res.codeathons.map((c) => ({
          id: c.id,
          title: c.title,
          slug: `codeathon-${c.id}`,
          category: 'Algorithm Sprint',
          status: c.is_live ? 'live' : c.is_upcoming ? 'upcoming' : 'completed',
          startsAt: c.timings?.start_time ? new Date(c.timings.start_time).toLocaleDateString() : 'Live',
          endsAt: c.timings?.end_time ? new Date(c.timings.end_time).toLocaleDateString() : 'Continuous',
          remainingTime: c.timings?.duration_minutes ? `${c.timings.duration_minutes} Mins` : 'Timed',
          participantsCount: 42,
          prizePool: `${c.total_questions * 50} Pts & Badge`,
          difficulty: c.difficulty === 'hard' ? 'Advanced' : c.difficulty === 'medium' ? 'Intermediate' : 'All Levels',
          tags: ['Python', 'Codeathon', 'Proctored'],
          description: c.description || 'Live algorithmic codeathon with proctored timer, test cases, and automated test execution.',
          problemStatementBrief: `${c.total_questions} algorithmic problems with live execution & tests.`,
          sponsors: [c.creator_name || 'Codeathon Host'],
          isRegistered: Boolean(c.user_attempt?.has_attempted),
          ...(c as any),
        }));

        setCompetitions((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = syncedItems.filter((item) => !existingIds.has(item.id));
          return [...uniqueNew, ...prev];
        });
      }
    }).catch(() => {});
  }, [user?.email]);

  // Filter & Search state for Contests & Arena
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'live' | 'track' | 'Hackathon' | 'Algorithm Sprint' | 'Bug Bounty' | 'Full-Stack Speed Run'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Leaderboard state
  const [selectedCampus, setSelectedCampus] = useState<string>(user?.college || 'Global');

  // Track match helper for dynamic filtering & badge highlighting
  const isTrackMatch = (comp: Competition) => {
    const normTrack = userTrack.toLowerCase();
    const text = `${comp.title} ${comp.category} ${comp.description} ${comp.tags.join(' ')}`.toLowerCase();
    if (normTrack.includes('cyber') || normTrack.includes('security')) {
      return text.includes('bug bounty') || text.includes('cyber') || text.includes('security') || text.includes('jwt') || text.includes('idor');
    }
    if (normTrack.includes('web') || normTrack.includes('fullstack') || normTrack.includes('front') || normTrack.includes('back')) {
      return text.includes('speed run') || text.includes('web') || text.includes('react') || text.includes('next.js') || text.includes('full-stack');
    }
    if (normTrack.includes('ai') || normTrack.includes('machine') || normTrack.includes('genai')) {
      return text.includes('ai / machine learning') || text.includes('rag') || text.includes('vector') || text.includes('ai / ml') || text.includes('genai');
    }
    if (normTrack.includes('mobile') || normTrack.includes('app')) {
      return text.includes('mobile') || text.includes('app') || text.includes('flutter');
    }
    if (normTrack.includes('cloud') || normTrack.includes('devops')) {
      return text.includes('cloud & devops') || text.includes('kubernetes') || text.includes('terraform') || text.includes('docker');
    }
    if (normTrack.includes('data')) {
      return text.includes('data structures') || text.includes('cache') || text.includes('analytics');
    }
    return true;
  };

  // Pre-seed 48h Hackathon AI prompt based on student's active track
  useEffect(() => {
    if (userTrack) {
      const t = userTrack.toLowerCase();
      if (t.includes('cyber') || t.includes('security')) {
        setProblemInput('Automated API security scanner for detecting IDOR vulnerabilities, JWT misconfigurations, and privilege escalation in cloud-native microservices.');
      } else if (t.includes('web') || t.includes('fullstack')) {
        setProblemInput('Modern collaborative design canvas with real-time WebRTC synchronization, AI layout synthesis, and instant React component export.');
      } else if (t.includes('ai') || t.includes('machine')) {
        setProblemInput('Autonomous agentic pipeline that parses untidy multimodal PDFs, generates high-density vector embeddings, and answers complex queries with zero hallucination.');
      } else if (t.includes('app') || t.includes('mobile')) {
        setProblemInput('Cross-platform Flutter mobile wallet with offline biometric signatures and dynamic QR peer-to-peer settlement.');
      } else if (t.includes('cloud') || t.includes('devops')) {
        setProblemInput('Autonomous Kubernetes resource right-sizing daemon with automated canary verification and zero-downtime rollback.');
      } else if (t.includes('data')) {
        setProblemInput('Real-time clickstream analytics engine using Apache Kafka and DuckDB for sub-second behavioral cohort scoring.');
      }
    }
  }, [userTrack]);

  // Category Metadata helper for crisp visual hierarchy & domain identity
  const getCategoryMeta = (category: Competition['category']) => {
    switch (category) {
      case 'Algorithm Sprint':
        return {
          icon: Code,
          label: 'Algorithm Sprint',
          badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          accent: 'text-emerald-500',
          format: 'Timed Speed Solve',
        };
      case 'Hackathon':
        return {
          icon: Trophy,
          label: 'National Hackathon',
          badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
          accent: 'text-indigo-500',
          format: '48-Hour Build',
        };
      case 'Full-Stack Speed Run':
        return {
          icon: Flame,
          label: 'Speed Run',
          badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
          accent: 'text-orange-500',
          format: '2-Hour Blitz',
        };
      case 'Bug Bounty':
        return {
          icon: Shield,
          label: 'Bug Bounty',
          badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
          accent: 'text-rose-500',
          format: 'Live Sandbox',
        };
      default:
        return {
          icon: Target,
          label: category,
          badge: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
          accent: 'text-neutral-500',
          format: 'Contest',
        };
    }
  };

  const filteredCompetitions = competitions.filter((comp) => {
    if (selectedFilter === 'live' && comp.status !== 'live') return false;
    if (selectedFilter === 'track' && !isTrackMatch(comp)) return false;
    if (selectedFilter !== 'all' && selectedFilter !== 'live' && selectedFilter !== 'track' && comp.category !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = comp.title.toLowerCase().includes(q);
      const matchesDesc = comp.description.toLowerCase().includes(q);
      const matchesTag = comp.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = comp.category.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesTag && !matchesCategory) return false;
    }
    return true;
  });

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

  const currentLeaderboard = CAMPUS_LEADERBOARDS[selectedCampus] || CAMPUS_LEADERBOARDS['Global'] || [];
  const topThree = currentLeaderboard.slice(0, 3);
  const remainingRankings = currentLeaderboard.slice(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Platform Theme Header — Dynamic Focus Track & Campus Arena */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 shadow-xs">
            <Trophy className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Arena & Hackathons
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Season 4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Compete in weekly sprints tailored to your track, climb campus ranks, and build 48-hr prototypes.
            </p>
          </div>
        </div>

        {/* User Rank Telemetry Pill */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">

          {/* User Rank Card Pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-neutral-200/80 dark:border-neutral-800">
                #--
              </span>
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{userCollege || 'Campus'}</span>
              </div>
            </div>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{user?.streakDays ?? (user as any)?.streak_days ?? 0}d</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-neutral-900 dark:text-neutral-200 font-bold">{user?.totalPoints ?? (user as any)?.points ?? 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1 rounded-2xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => handleTabChange('competitions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'competitions'
              ? 'bg-white dark:bg-[#2b2b2b] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            <Trophy className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Weekly Sprints & Contests</span>
          </button>

          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'leaderboard'
              ? 'bg-white dark:bg-[#2b2b2b] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            <Award className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Campus Leaderboard</span>
          </button>

          <button
            onClick={() => handleTabChange('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeMainTab === 'builder'
              ? 'bg-white dark:bg-[#2b2b2b] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>48h Hackathon AI Studio</span>
          </button>
        </div>

        {/* Clean Live Status indicator matching StudentDashboard telemetry */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 mr-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-neutral-800 dark:text-neutral-200 font-bold">428 Active Coders</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-neutral-700 dark:text-neutral-300 font-semibold">Sprint #18</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>3h 42m Left</span>
        </div>
      </div>

      {/* ========================================================
          TAB 1: LIVE COMPETITIONS & SPRINTS
          ======================================================== */}
      {activeMainTab === 'competitions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Highlight Live Sprint Arena Showcase Card (Sleek Grayish Palette) */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FAFAFA] via-[#F4F4F5] to-[#E4E4E7] dark:from-[#212121] dark:via-[#1A1A1A] dark:to-[#141414] border border-neutral-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
            {/* Ambient soft neutral glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-neutral-200/60 dark:bg-neutral-800/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-slate-200/50 dark:bg-neutral-900/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Sprint Details & CTAs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>WEEKLY SPRINT #18 • LIVE ARENA</span>
                  </span>
                  <span className="text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                    Algorithm Arena
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
                    High-Throughput In-Memory Cache
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
                    Design an in-memory key-value cache engine supporting TTL expiration, thread-safe LRU eviction, and sub-millisecond lookups under high concurrent simulated workload.
                  </p>
                </div>

                {/* Cohesive Telemetry Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono font-semibold shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>3h 42m Left</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono font-semibold shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>Active Builders Enrolled</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono font-semibold shadow-2xs">
                    <Trophy className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">₹20,000 Prize Pool</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/practice/high-throughput-in-memory-cache"
                    className="px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Code className="w-4 h-4" />
                    <span>Enter Code Arena & Submit</span>
                  </Link>
                  <button
                    onClick={() => handleTabChange('leaderboard')}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-neutral-100 dark:bg-[#2b2b2b] dark:hover:bg-[#333333] text-neutral-700 dark:text-neutral-300 font-semibold text-xs border border-neutral-200/80 dark:border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View Standings</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Leaderboard Snapshot Card (5 cols) */}
              <div className="lg:col-span-5">
                <div
                  onClick={() => handleTabChange('leaderboard')}
                  className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#242424] border border-neutral-200/90 dark:border-neutral-700 shadow-md space-y-3 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                  title="Click to view full Leaderboard"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/60 dark:border-neutral-700/80">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Live Sprint Standings</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/90 dark:bg-[#1c1c1c] border border-neutral-200/70 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-mono font-bold text-xs flex items-center justify-center">
                          1
                        </span>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block leading-tight">Sahil Kumar</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">44m solve • 0 fails</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white text-xs">980 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/90 dark:bg-[#1c1c1c] border border-neutral-200/70 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold text-xs flex items-center justify-center">
                          2
                        </span>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block leading-tight">Pooja Sharma</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">51m solve • 1 retry</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300 text-xs">920 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/90 dark:bg-[#1c1c1c] border border-neutral-200/70 dark:border-neutral-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono font-bold text-xs flex items-center justify-center">
                          3
                        </span>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block leading-tight">Vikas Dubey</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">58m solve • 1 retry</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300 text-xs">870 pts</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-700/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Your Rank: <span className="text-neutral-900 dark:text-white font-bold">#14</span> <span className="text-neutral-400 dark:text-neutral-500">(720 pts)</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">+150 pts to Top 10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competitions Section Header & Filter/Search Toolbar */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Upcoming Hackathons & Code Sprints
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Join national hackathons, weekly sprints, and speed runs to boost campus rank.
                </p>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono font-semibold hidden sm:block">
                Showing {filteredCompetitions.length} of {competitions.length} Contests
              </span>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Contests', count: competitions.length },
                  { id: 'track', label: `For ${userTrack}`, count: competitions.filter(isTrackMatch).length },
                  { id: 'live', label: 'Live', count: competitions.filter((c) => c.status === 'live').length },
                  { id: 'Hackathon', label: 'Hackathons', count: competitions.filter((c) => c.category === 'Hackathon').length },
                  { id: 'Algorithm Sprint', label: 'Code Sprints', count: competitions.filter((c) => c.category === 'Algorithm Sprint').length },
                  { id: 'Full-Stack Speed Run', label: 'Speed Runs', count: competitions.filter((c) => c.category === 'Full-Stack Speed Run').length },
                  { id: 'Bug Bounty', label: 'Bug Bounty', count: competitions.filter((c) => c.category === 'Bug Bounty').length },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${selectedFilter === f.id
                      ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-2xs'
                      : 'bg-white dark:bg-[#212121] text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedFilter === f.id
                        ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-950 font-bold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Real-time Search Input */}
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, tag, or title..."
                  className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Zero State if search returns empty */}
            {filteredCompetitions.length === 0 && (
              <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  No matching contests found
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try searching with different keywords or clearing your active filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Modern, Breathable 2-Column Contest Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCompetitions.map((comp) => {
                const isReg = registeredMap[comp.id];
                const meta = getCategoryMeta(comp.category);
                const CategoryIcon = meta.icon;
                const matchesUserTrack = isTrackMatch(comp);

                return (
                  <div
                    key={comp.id}
                    className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* 1. Header: Category Badge with Accent & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
                            <CategoryIcon className="w-3.5 h-3.5" />
                            <span>{meta.label}</span>
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase border ${comp.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                            : 'bg-neutral-100 dark:bg-[#2b2b2b] text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700'
                            }`}
                        >
                          {comp.status === 'live' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span>{comp.status === 'live' ? 'Live Now' : comp.remainingTime}</span>
                        </span>
                      </div>

                      {/* 2. Main Title */}
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                        {comp.title}
                      </h3>

                      {/* 3. Concise Description */}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>

                      {/* 4. Streamlined Metadata Strip (Sleek Inline Badges, Zero Nested Boxes) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100/90 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{meta.format}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100/90 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                          <Target className="w-3 h-3 text-neutral-400" />
                          <span>{comp.difficulty}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100/90 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                          <Users className="w-3 h-3 text-neutral-400" />
                          <span>{comp.participantsCount.toLocaleString()} Enrolled</span>
                        </span>
                      </div>

                      {/* 5. Clean Tech Stack Tags */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {comp.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100/80 dark:bg-[#2b2b2b]/60 border border-neutral-200/50 dark:border-neutral-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                        {comp.tags.length > 3 && (
                          <span className="text-[10px] font-mono text-neutral-400 pl-1">
                            +{comp.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* 6. Expandable Specification Brief (Uncluttered by default) */}
                      <details className="group/details pt-1">
                        <summary className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer list-none inline-flex items-center gap-1">
                          <ChevronDown className="w-3 h-3 text-neutral-400 group-open/details:rotate-180 transition-transform" />
                          <span>View Problem Specification</span>
                        </summary>
                        <div className="mt-2 p-3 rounded-2xl bg-neutral-50/90 dark:bg-[#191919] border border-neutral-200/70 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                          {comp.problemStatementBrief}
                        </div>
                      </details>
                    </div>

                    {/* 7. Card Action Footer */}
                    <div className="pt-4 mt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase tracking-wider">
                          Prize Pool
                        </span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono flex items-center gap-1.5 truncate mt-0.5">
                          <Trophy className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 shrink-0" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold truncate">
                            {comp.prizePool.split('+')[0].trim()}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {comp.status === 'live' ? (
                          <Link
                            to="/practice/high-throughput-in-memory-cache"
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Enter Arena</span>
                          </Link>
                        ) : comp.id === 'comp-2' ? (
                          <button
                            onClick={() => handleTabChange('builder')}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Studio</span>
                          </button>
                        ) : (comp as any).attempt_url ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            {(comp as any).user_attempt?.is_completed ? (
                              <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                Submitted (Score: {(comp as any).user_attempt?.score})
                              </span>
                            ) : (comp as any).is_live ? (
                              <a
                                href={(comp as any).attempt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>Attend Codeathon →</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                disabled
                                className="px-4 py-2 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                              >
                                {(comp as any).is_upcoming ? 'Upcoming' : 'Ended'}
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedLeaderboard({ id: comp.id, title: comp.title })}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
                              title="View Leaderboard"
                            >
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              <span>Leaderboard</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleRegister(comp.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isReg
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 shadow-2xs'
                              }`}
                          >
                            {isReg ? 'Registered ✓' : 'Register Free'}
                          </button>
                        )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block font-mono">
                Official Campus Standings
              </span>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Engineering Leaderboards
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ranked by verified challenge submissions, sprint points, and streak consistency.
              </p>
            </div>

            {/* Campus Selector Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-xs font-bold">
              {userCollege && (
                <button
                  onClick={() => setSelectedCampus(userCollege)}
                  className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedCampus === userCollege
                    ? 'bg-white dark:bg-[#2b2b2b] text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/60 dark:border-neutral-700/60'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  🎓 {userCollege}
                </button>
              )}
              <button
                onClick={() => setSelectedCampus('Global')}
                className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${selectedCampus === 'Global'
                  ? 'bg-white dark:bg-[#2b2b2b] text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/60 dark:border-neutral-700/60'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
              >
                🌍 Global
              </button>
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center space-y-3.5 relative">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#2b2b2b] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-extrabold text-base border border-neutral-200/80 dark:border-neutral-700 font-mono">
                  #2
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {topThree[1].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[1].college}</span>
                  <p className="text-[11px] font-medium text-neutral-400 mt-0.5 font-mono">
                    {topThree[1].track}
                  </p>
                </div>
                <div className="w-full pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Score</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{topThree[1].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[1].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Top Leader Spotlight) */}
            {topThree[0] && (
              <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#212121] border-2 border-neutral-900 dark:border-white shadow-md flex flex-col items-center text-center space-y-3.5 relative md:-mt-4">
                <div className="absolute -top-3.5 px-3.5 py-1 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-[10px] font-mono shadow-sm flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-current" />
                  <span>CAMPUS LEADER</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-extrabold text-xl shadow-sm border border-neutral-800 dark:border-neutral-200 font-mono">
                  #1
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {topThree[0].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[0].college}</span>
                  <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 mt-0.5 font-mono">
                    {topThree[0].badge}
                  </p>
                </div>

                <div className="w-full pt-3.5 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Total Score</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">{topThree[0].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-extrabold">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{topThree[0].streakDays}d Streak</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze / Runner Up) */}
            {topThree[2] && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center space-y-3.5 relative">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#2b2b2b] text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-extrabold text-base border border-neutral-200/80 dark:border-neutral-700 font-mono">
                  #3
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {topThree[2].name}
                  </h3>
                  <span className="text-xs text-neutral-500">{topThree[2].college}</span>
                  <p className="text-[11px] font-medium text-neutral-400 mt-0.5 font-mono">
                    {topThree[2].track}
                  </p>
                </div>
                <div className="w-full pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Score</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{topThree[2].points} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{topThree[2].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Cohort Rankings Table */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Rankings 4 – 15
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                {selectedCampus} Standings
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {remainingRankings.map((user) => (
                <div
                  key={user.id}
                  className={`py-3 px-3.5 flex items-center justify-between gap-4 rounded-2xl transition-colors ${user.isCurrentUser
                    ? 'bg-neutral-100 dark:bg-[#282828] border border-neutral-300/80 dark:border-neutral-700 shadow-2xs'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]/80'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-sm font-bold font-mono ${user.isCurrentUser ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                      }`}>
                      #{user.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${user.isCurrentUser ? 'text-neutral-900 dark:text-white' : 'text-neutral-900 dark:text-white'
                          }`}>
                          {user.name}
                        </span>
                        {user.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-neutral-200 dark:bg-[#333333] text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-neutral-600">
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">{user.college} • {user.track}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-neutral-400 font-sans block">Problems</span>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">{user.problemsSolved} Solved</span>
                    </div>

                    <div className="flex items-center gap-1 text-orange-500 font-bold">
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
          TAB 3: 48-HOUR HACKATHON AI STUDIO
          ======================================================== */}
      {activeMainTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Left Column: Countdown & Timeline Phases (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Countdown Card matching RishabhLabs contest surface */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden space-y-4">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>SPRINT TIME REMAINING</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-white mt-1">
                  <span>12<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">d</span></span>
                  <span>04<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">h</span></span>
                  <span>32<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">m</span></span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                  Target: {hackathon?.hackathonName || 'Smart India Hackathon & InnovateX 2026'}
                </p>
              </div>
            </div>

            {/* Timeline Phases List */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2.5 border-b border-neutral-100 dark:border-neutral-800/80 font-mono">
                48-Hour Sprint Milestones
              </h2>

              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden">
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
                          : 'bg-white/40 dark:bg-transparent text-neutral-600 dark:text-neutral-400 opacity-75'
                        }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-neutral-950 dark:border-white flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-neutral-950 dark:bg-white"></div>
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
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Hackathon AI Tool Suite
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Accelerate your 48-hour delivery with AI assistance.</p>
              </div>

              {/* Tool Selector Buttons */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
                <button
                  onClick={() => runTool('ideas')}
                  className={`p-3.5 rounded-2xl text-left transition-colors flex items-center gap-2 cursor-pointer ${activeTool === 'ideas'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold border border-transparent shadow-2xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <Lightbulb className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                  <span>Generate Ideas</span>
                </button>

                <button
                  onClick={() => runTool('architecture')}
                  className={`p-3.5 rounded-2xl text-left transition-colors flex items-center gap-2 cursor-pointer ${activeTool === 'architecture'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold border border-transparent shadow-2xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <Layers className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                  <span>Architecture</span>
                </button>

                <button
                  onClick={() => runTool('code')}
                  className={`p-3.5 rounded-2xl text-left transition-colors flex items-center gap-2 cursor-pointer ${activeTool === 'code'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold border border-transparent shadow-2xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <FileCode className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                  <span>Scaffold Code</span>
                </button>

                <button
                  onClick={() => runTool('pitch')}
                  className={`p-3.5 rounded-2xl text-left transition-colors flex items-center gap-2 cursor-pointer ${activeTool === 'pitch'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold border border-transparent shadow-2xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                >
                  <Presentation className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                  <span>Pitch Deck</span>
                </button>
              </div>

              {/* Problem Statement Prompt Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">
                  Problem Context:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none font-sans"
                    placeholder="Describe your hackathon problem..."
                  />
                  <button
                    onClick={() => runTool(activeTool)}
                    disabled={loadingTool}
                    className="absolute right-2.5 bottom-3 p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
                    title="Generate"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tool Execution Results */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between font-mono">
                  <span>AI Blueprint Output</span>
                  {loadingTool && <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">Processing...</span>}
                </span>

                <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 max-h-80 overflow-y-auto text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans space-y-2">
                  {loadingTool ? (
                    <div className="py-8 text-center text-neutral-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
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

      {/* Live PyCode Codeathon Leaderboard Modal */}
      {selectedLeaderboard && (
        <LeaderboardModal
          codeathonId={selectedLeaderboard.id}
          codeathonTitle={selectedLeaderboard.title}
          onClose={() => setSelectedLeaderboard(null)}
          currentUserEmail={user?.email}
          currentUsername={user?.email?.split('@')[0]}
        />
      )}
    </div>
  );
};

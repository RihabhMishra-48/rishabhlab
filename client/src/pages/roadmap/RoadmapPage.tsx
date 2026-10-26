import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Roadmap, RoadmapNode } from '../../types';
import {
  getCuratedRoadmap,
  normalizeTrackName,
} from '../../data/curatedRoadmaps';
import {
  Check,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  FolderGit2,
  Clock,
  RefreshCw,
  Plus,
  X,
  Target,
  Code,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  DisplayCodeIcon,
  ChipBrainIcon,
  ShieldCheckIcon,
  MobileNotchIcon,
  ArrowTrendUpIcon
} from '../../components/icons/TrackIcons';

const TRACK_CONFIGS = [
  {
    id: 'Web Development',
    title: 'Web Development',
    icon: DisplayCodeIcon,
    badge: 'Full Stack',
    accentColor: 'blue' as const,
    desc: 'React 19, TypeScript, Next.js 15, Node.js, REST APIs & Distributed Web Systems',
    skills: ['React 19', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL'],
    hours: '120 hrs',
    projects: '8 Projects',
  },
  {
    id: 'AI / ML',
    title: 'AI & Machine Learning',
    icon: ChipBrainIcon,
    badge: 'GenAI & Deep Learning',
    accentColor: 'purple' as const,
    desc: 'Python, PyTorch, Neural Networks, Embeddings, LLMs & Production AI Serving',
    skills: ['Python', 'PyTorch', 'Vector DBs', 'LLMs', 'Model Deployment'],
    hours: '140 hrs',
    projects: '7 Projects',
  },
  {
    id: 'App Development',
    title: 'Mobile App Development',
    icon: MobileNotchIcon,
    badge: 'Cross-Platform',
    accentColor: 'cyan' as const,
    desc: 'React Native / Flutter, Mobile UI Architecture, State Machines & Device APIs',
    skills: ['React Native', 'Flutter', 'State Machines', 'Native Bridges'],
    hours: '110 hrs',
    projects: '6 Projects',
  },
  {
    id: 'Cybersecurity',
    title: 'Cyber Security',
    icon: ShieldCheckIcon,
    badge: 'Infosec & Defense',
    accentColor: 'emerald' as const,
    desc: 'Network Packet Analysis, Penetration Testing, Linux Hardening & Cryptography',
    skills: ['Wireshark', 'Kali Linux', 'Burp Suite', 'Network Protocols', 'OWASP'],
    hours: '130 hrs',
    projects: '6 Projects',
  },
  {
    id: 'Data / Analytics',
    title: 'Data & Analytics',
    icon: ArrowTrendUpIcon,
    badge: 'Data Engineering',
    accentColor: 'amber' as const,
    desc: 'SQL Mastery, Pandas, Distributed ETL Pipelines & Executive Visualizations',
    skills: ['SQL', 'Pandas', 'Apache Spark', 'ETL Pipelines', 'Power BI'],
    hours: '115 hrs',
    projects: '5 Projects',
  },
];

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTrack = searchParams.get('track');

  const primaryTrack = normalizeTrackName(
    user?.targetGoal ||
    (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) ||
    localStorage.getItem('rishabhlabs_goal') ||
    'Web Development'
  );

  // Enrolled tracks system (Same as Courses/Learn catalog)
  const [enrolledTracks, setEnrolledTracks] = useState<string[]>(() => {
    try {
      const storageKey = `rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(normalizeTrackName);
          const unique = Array.from(new Set([primaryTrack, ...normalized]));
          try {
            localStorage.setItem(storageKey, JSON.stringify(unique));
          } catch { }
          return unique;
        }
      }
    } catch { }
    return [primaryTrack];
  });

  useEffect(() => {
    // Ensure clean deduplicated tracks in state and localStorage on mount
    const storageKey = `rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`;
    setEnrolledTracks((prev) => {
      const unique = Array.from(new Set([primaryTrack, ...prev.map(normalizeTrackName)]));
      if (unique.length !== prev.length || unique.some((t, i) => t !== prev[i])) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(unique));
        } catch { }
        return unique;
      }
      return prev;
    });
  }, [primaryTrack, user?.id]);

  const [activeTrack, setActiveTrack] = useState<string>(() => {
    if (queryTrack) return normalizeTrackName(queryTrack);
    return primaryTrack;
  });

  const [roadmap, setRoadmap] = useState<Roadmap>(() => getCuratedRoadmap(activeTrack));
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showExploreModal) {
      document.body.style.overflow = 'hidden';
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowExploreModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showExploreModal]);

  // Helper to load persisted statuses from localStorage
  const applySavedStatuses = (baseRoadmap: Roadmap, track: string): Roadmap => {
    try {
      const saved = localStorage.getItem(`rishabhlabs_roadmap_${track}`);
      if (saved) {
        const statusMap: Record<string, 'completed' | 'in_progress' | 'locked'> = JSON.parse(saved);
        const updatedNodes = baseRoadmap.nodes.map((n) => ({
          ...n,
          status: statusMap[n.nodeId] || n.status,
        }));
        const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
        return {
          ...baseRoadmap,
          nodes: updatedNodes,
          completedNodes: completedCount,
        };
      }
    } catch (e) {
      // Ignore parse errors
    }
    return baseRoadmap;
  };

  const fetchRoadmap = async (trackName?: string, shouldRegenerate = false) => {
    const target = normalizeTrackName(
      trackName || activeTrack || user?.targetGoal || localStorage.getItem('rishabhlabs_goal') || 'Web Development'
    );
    const fallbackRoadmap = applySavedStatuses(getCuratedRoadmap(target), target);

    try {
      if (shouldRegenerate) setRegenerating(true);
      else setLoading(true);

      const data = await api.getRoadmap(target, shouldRegenerate);

      if (data?.roadmap?.nodes && data.roadmap.nodes.length > 0) {
        setRoadmap(data.roadmap);
        const active =
          data.roadmap.nodes.find((n: RoadmapNode) => n.status === 'in_progress') ||
          data.roadmap.nodes[0];
        setSelectedNode(active);
      } else {
        setRoadmap(fallbackRoadmap);
        const active =
          fallbackRoadmap.nodes.find((n: RoadmapNode) => n.status === 'in_progress') ||
          fallbackRoadmap.nodes[0];
        setSelectedNode(active);
      }
    } catch (err) {
      console.warn('API roadmap fetch fallback to curated roadmap:', err);
      setRoadmap(fallbackRoadmap);
      const active =
        fallbackRoadmap.nodes.find((n: RoadmapNode) => n.status === 'in_progress') ||
        fallbackRoadmap.nodes[0];
      setSelectedNode(active);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(activeTrack, false);
  }, [activeTrack]);

  const handleTrackChange = (trackName: string) => {
    const norm = normalizeTrackName(trackName);
    setActiveTrack(norm);
    setSearchParams({ track: norm });
  };

  const handleEnrollSecondary = (chosenTrack: string) => {
    const normalized = normalizeTrackName(chosenTrack);
    const updated = Array.from(new Set([...enrolledTracks, normalized]));
    setEnrolledTracks(updated);
    try {
      localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch { }
    handleTrackChange(normalized);
    setShowExploreModal(false);
  };

  const handleRemoveSecondaryTrack = (trackName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (trackName === primaryTrack) return;
    const updated = enrolledTracks.filter((t) => t !== trackName);
    setEnrolledTracks(updated);
    localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    if (activeTrack === trackName) {
      handleTrackChange(primaryTrack);
    }
  };

  const handleUpdateStatus = async (nodeId: string, status: 'completed' | 'in_progress' | 'locked') => {
    const updatedNodes = (roadmap?.nodes || []).map((n) =>
      n.nodeId === nodeId ? { ...n, status } : n
    );
    const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
    const updatedRoadmap = {
      ...roadmap,
      nodes: updatedNodes,
      completedNodes: completedCount,
    } as Roadmap;

    setRoadmap(updatedRoadmap);
    const updatedNode = updatedNodes.find((n) => n.nodeId === nodeId);
    if (updatedNode) setSelectedNode(updatedNode);

    try {
      const statusMap: Record<string, string> = {};
      updatedNodes.forEach((n) => {
        statusMap[n.nodeId] = n.status;
      });
      localStorage.setItem(`rishabhlabs_roadmap_${activeTrack}`, JSON.stringify(statusMap));
    } catch (e) {
      // Ignore
    }

    try {
      await api.updateRoadmapNodeStatus(nodeId, status);
    } catch (err) {
      console.warn('Backend node status sync note:', err);
    }
  };

  const nodes = roadmap?.nodes || [];
  const activeNode = nodes.find((n) => n.status === 'in_progress') || nodes[0];
  const completedCount = nodes.filter((n) => n.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (nodes.length || 6)) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-stretch gap-4 sm:gap-5">
          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
            <img src="/graphics/roadmap.png" alt="Roadmap" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 leading-none">
              Visual Engineering Journey
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              {activeTrack} Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-none">
              Stage-by-stage mastery pipeline from foundational concepts to production deployment.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchRoadmap(activeTrack, true)}
            disabled={regenerating}
            title="Recalibrate roadmap milestones"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Calibrating...' : 'Recalibrate'}</span>
          </button>

          {/* Progress summary badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-[#262626] text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
            <span className={`w-2 h-2 rounded-full ${completedCount > 0 ? 'bg-blue-500' : 'bg-neutral-400'}`}></span>
            <span>
              {completedCount} of {nodes.length || 6} Stages ({progressPercent}%)
            </span>
            <div className="w-16 h-2 hidden sm:flex items-center gap-1 ml-1">
              {progressPercent > 0 && (
                <div
                  style={{ flex: Math.max(progressPercent, 10) }}
                  className={`h-full rounded-full transition-all duration-300 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                    }`}
                />
              )}
              {progressPercent < 100 && (
                <div
                  style={{ flex: Math.max(100 - progressPercent, 10) }}
                  className="h-full rounded-full bg-neutral-300 dark:bg-[#383d47] transition-all duration-300"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Tracks Bar (Only shows enrolled track(s); allows adding a second track) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            Your Enrolled Track{enrolledTracks.length > 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-neutral-500">
            {enrolledTracks.length === 1 ? 'Focused Single-Track Learning' : 'Dual Track Specialization'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Array.from(new Set(enrolledTracks)).map((trk) => {
            const isSelected = activeTrack === trk;
            const isPrimary = trk === primaryTrack;

            return (
              <div
                key={trk}
                onClick={() => handleTrackChange(trk)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${isSelected
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-[#262626]'
                  }`}
              >
                <span>{trk}</span>
                {isPrimary && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${isSelected
                      ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                  >
                    Primary
                  </span>
                )}
              </div>
            );
          })}

          {/* Add Track Button — Unlimited tracks (removed 2-track max limit) */}
          {enrolledTracks.length < TRACK_CONFIGS.length && (
            <button
              onClick={() => setShowExploreModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors bg-neutral-50/50 dark:bg-transparent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Learning Journey Map (Connected SVG Metro Line & Glowing Node Stations) */}
      <div className="relative p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden space-y-6">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        {/* Top Progress Ring & Milestone Tracker */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                PIPELINE STATUS
              </span>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {completedCount === nodes.length ? 'All Milestones Mastered' : `Currently at Stage ${activeNode?.stepNumber || 1}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mt-1">
              Interactive 6-Stage Curriculum Track
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <span>Active Focus</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              <span>Upcoming</span>
            </div>
          </div>
        </div>

        {/* Connected Node Stations */}
        {loading ? (
          <div className="py-16 text-center space-y-3 relative z-10">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">
              Synthesizing your personalized {activeTrack} roadmap...
            </p>
          </div>
        ) : (
          <div className="relative z-10 pt-4 pb-2">
            {/* SVG Connecting Timeline Line behind nodes on desktop */}
            <div className="hidden lg:block absolute top-[44px] left-[7%] right-[7%] h-[3px] bg-neutral-200 dark:bg-neutral-800 pointer-events-none rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-transparent transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(10, ((completedCount + 0.5) / (nodes.length || 6)) * 100))}%`
                }}
              />
            </div>

            {/* Stages Grid / Interactive Stations */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 items-start">
              {nodes.map((node, index) => {
                const isCompleted = node.status === 'completed';
                const isInProgress = node.status === 'in_progress';
                const isSelected = selectedNode?.nodeId === node.nodeId;

                return (
                  <div
                    key={node.nodeId || index}
                    onClick={() => setSelectedNode(node)}
                    className="group flex flex-col items-center cursor-pointer relative z-10 transition-transform duration-200"
                  >
                    {/* Glowing Station Circle */}
                    <div className="relative flex items-center justify-center">
                      {isInProgress && (
                        <div className="absolute inset-0 -m-1.5 rounded-2xl bg-blue-500/15 ring-2 ring-blue-500/30 pointer-events-none"></div>
                      )}

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-md ${isSelected
                          ? 'ring-3 ring-neutral-950 dark:ring-white scale-105'
                          : isCompleted
                            ? 'ring-2 ring-emerald-500/30 shadow-emerald-500/10'
                            : isInProgress
                              ? 'ring-3 ring-blue-600/40 shadow-blue-500/20'
                              : 'border border-neutral-200 dark:border-neutral-800'
                          } ${isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 stroke-[2.5]" />
                        ) : isInProgress ? (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>

                      {/* Stage Index Pill */}
                      <span className="absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs">
                        0{node.stepNumber}
                      </span>
                    </div>

                    {/* Step Title & Status */}
                    <div className="mt-3.5 text-center px-1 max-w-[135px]">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">
                        STAGE {node.stepNumber}
                      </span>
                      <p
                        className={`text-xs font-bold leading-tight mt-0.5 line-clamp-2 transition-colors ${isSelected
                          ? 'text-neutral-950 dark:text-white'
                          : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-950 dark:group-hover:text-white'
                          }`}
                      >
                        {node.title}
                      </p>
                      <p
                        className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-neutral-400'
                          }`}
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'Active Focus' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Details Drawer / Card */}
      {selectedNode && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  STAGE {selectedNode.stepNumber}
                </span>
                <span
                  className={`text-xs font-bold ${selectedNode.status === 'completed'
                    ? 'text-emerald-500'
                    : selectedNode.status === 'in_progress'
                      ? 'text-blue-500'
                      : 'text-neutral-400'
                    }`}
                >
                  {selectedNode.status === 'completed'
                    ? 'Completed Stage'
                    : selectedNode.status === 'in_progress'
                      ? 'Active Focus'
                      : 'Upcoming Stage'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {selectedNode.title}{selectedNode.subtitle ? `: ${selectedNode.subtitle}` : ''}
              </h2>
            </div>

            {/* Stage Progress Action Controls */}
            <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
              {selectedNode.status === 'completed' ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(selectedNode.nodeId, 'in_progress')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold transition-colors"
                    title="Set back to in progress"
                  >
                    <RefreshCw className="w-3 h-3 text-neutral-400" />
                    <span>Reopen</span>
                  </button>
                </>
              ) : selectedNode.status === 'in_progress' ? (
                <button
                  onClick={() => handleUpdateStatus(selectedNode.nodeId, 'completed')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedNode.nodeId, 'in_progress')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Set Active Focus</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedNode.nodeId, 'completed')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Mark Done</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Time Commitment
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                ~{selectedNode.estimatedHours || 20} Hours
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                Interactive Lessons
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {selectedNode.lessonsCount || 8} Guided Modules
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
                <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
                Verified Artifacts
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {selectedNode.projectsCount || 1} Production Project
              </p>
            </div>
          </div>

          {/* Skills Covered Pills */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Industry Skills Covered in this Stage:
            </p>
            <div className="flex flex-wrap gap-2">
              {(selectedNode.skillsCovered || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Direct CTA Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <Link
              to={`/learn?track=${encodeURIComponent(activeTrack)}`}
              className="h-9 inline-flex items-center gap-2 px-4 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Launch Stage Lessons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/practice"
              className="h-9 inline-flex items-center gap-2 px-3.5 rounded-xl bg-neutral-100 dark:bg-[#282828] text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-[#333] transition-colors border border-neutral-200/60 dark:border-neutral-800/60"
            >
              <Code className="w-3.5 h-3.5 text-blue-500" />
              <span>Practice Problems</span>
            </Link>

            <Link
              to="/projects"
              className="h-9 inline-flex items-center gap-2 px-3.5 rounded-xl bg-neutral-100 dark:bg-[#282828] text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-[#333] transition-colors border border-neutral-200/60 dark:border-neutral-800/60"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Project Sandbox</span>
            </Link>
          </div>
        </div>
      )}

      {/* Next Up Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {activeNode?.stepNumber || 1}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active Focus
            </span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {activeNode?.title || 'Foundations'}: {activeNode?.subtitle || 'Get Started'}
            </h3>
            <p className="text-xs text-neutral-500">Pick up where you left off</p>
          </div>
        </div>

        <Link
          to={`/learn?track=${encodeURIComponent(activeTrack)}`}
          className="p-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
          title="Continue"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Explore / Add Second Track Modal */}
      {showExploreModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setShowExploreModal(false)}
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Sticky Modal Header (Solid background, no blur) */}
            <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-[#1a1a1a]">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Engineering Tracks & Specializations
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                  Focus deeply on your primary track, or enroll in other tracks to cross-train skills. Your interactive roadmap and lesson pipeline update instantly.
                </p>
              </div>

              <button
                onClick={() => setShowExploreModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Track Cards Body */}
            <div ref={scrollContainerRef} className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
              {/* Enrollment Slots Tracker Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 shrink-0">Active Enrollments:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from(new Set(enrolledTracks)).map((trk) => {
                      const isPrim = trk === primaryTrack;
                      if (isPrim) {
                        return (
                          <span
                            key={trk}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 select-none"
                            title="Primary track cannot be deselected"
                          >
                            <span>{trk}</span>
                            <span className="text-[10px] font-medium opacity-75">(Primary)</span>
                          </span>
                        );
                      }

                      return (
                        <button
                          key={trk}
                          type="button"
                          onClick={(e) => handleRemoveSecondaryTrack(trk, e)}
                          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                          title={`Click to deselect ${trk}`}
                        >
                          <span>{trk}</span>
                          <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/15 group-hover/chip:bg-rose-500/20 transition-colors">
                            <Check className="w-2.5 h-2.5 group-hover/chip:hidden text-emerald-600 dark:text-emerald-400" />
                            <X className="w-2.5 h-2.5 hidden group-hover/chip:block text-rose-600 dark:text-rose-400" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0">
                  {enrolledTracks.length} of {TRACK_CONFIGS.length} Tracks Enrolled
                </span>
              </div>

              {/* 5 Tracks Grid: 2 columns, with 5th track spanning full width (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TRACK_CONFIGS.map((tc, idx) => {
                  const Icon = tc.icon;
                  const normalizedId = normalizeTrackName(tc.id);
                  const isPrimary = normalizedId === primaryTrack;
                  const isEnrolled = enrolledTracks.includes(normalizedId);
                  const isCurrentView = normalizedId === activeTrack;
                  const isLastCard = idx === TRACK_CONFIGS.length - 1; // 5th card spans 2 columns!

                  // Theme accents per track
                  const colorStyles = {
                    blue: {
                      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
                      borderHover: 'hover:border-blue-500/50',
                    },
                    purple: {
                      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
                      borderHover: 'hover:border-purple-500/50',
                    },
                    cyan: {
                      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
                      borderHover: 'hover:border-cyan-500/50',
                    },
                    emerald: {
                      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
                      borderHover: 'hover:border-emerald-500/50',
                    },
                    amber: {
                      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
                      borderHover: 'hover:border-amber-500/50',
                    },
                  }[tc.accentColor || 'blue'];

                  return (
                    <div
                      key={tc.id}
                      className={`p-4 rounded-2xl border transition-colors relative flex flex-col justify-between gap-3 ${isLastCard ? 'sm:col-span-2' : 'sm:col-span-1'
                        } ${isCurrentView
                          ? 'bg-neutral-50/90 dark:bg-neutral-900/80 border-blue-500/50 ring-1 ring-blue-500/30'
                          : isEnrolled
                            ? 'bg-neutral-50/50 dark:bg-neutral-900/40 border-emerald-500/30'
                            : `bg-neutral-50/30 dark:bg-neutral-900/30 border-neutral-200/80 dark:border-neutral-800 ${colorStyles.borderHover}`
                        }`}
                    >
                      {/* Top Row: Icon + Title + Badge + Sub-stats + Status Pill */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorStyles.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                                {tc.title}
                              </h3>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colorStyles.badge}`}>
                                {tc.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                              6 Stages • ~{tc.hours} • {tc.projects}
                            </p>
                          </div>
                        </div>

                        {/* Status Pill in Card Header */}
                        {isPrimary ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                            Primary Track ★
                          </span>
                        ) : isEnrolled ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            Enrolled ✓
                          </span>
                        ) : null}
                      </div>

                      {/* Middle: Concise Description */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
                        {tc.desc}
                      </p>

                      {/* Bottom Row: Skills + Action Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tc.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-300 font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        <div className="shrink-0">
                          {isCurrentView ? (
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 inline-block">
                              Active Roadmap ✓
                            </span>
                          ) : isEnrolled ? (
                            <button
                              onClick={() => {
                                handleTrackChange(normalizedId);
                                setShowExploreModal(false);
                              }}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 transition-colors"
                            >
                              Switch
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnrollSecondary(normalizedId)}
                              className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Enroll Track</span>
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
        </div>,
        document.body
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Roadmap, RoadmapNode } from '../../types';
import {
  Check,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  FolderGit2,
  Clock,
  RefreshCw,
  Award,
  Terminal,
  Layers,
  Server
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTrack, setActiveTrack] = useState<string>(
    user?.targetGoal || 'AI / Machine Learning'
  );

  const fetchRoadmap = async (trackName?: string, shouldRegenerate = false) => {
    try {
      if (shouldRegenerate) setRegenerating(true);
      else setLoading(true);

      const target = trackName || activeTrack || user?.targetGoal || 'AI / Machine Learning';
      const data = await api.getRoadmap(target, shouldRegenerate);

      if (data?.roadmap?.nodes && data.roadmap.nodes.length > 0) {
        setRoadmap(data.roadmap);
        const active =
          data.roadmap.nodes.find((n: RoadmapNode) => n.status === 'in_progress') ||
          data.roadmap.nodes[0];
        setSelectedNode(active);
      }
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    const goal = user?.targetGoal || 'AI / Machine Learning';
    setActiveTrack(goal);
    fetchRoadmap(goal);
  }, [user?.targetGoal]);

  const handleTrackChange = (newTrack: string) => {
    setActiveTrack(newTrack);
    fetchRoadmap(newTrack, true);
  };

  const handleUpdateStatus = async (nodeId: string, status: string) => {
    try {
      const res = await api.updateRoadmapNodeStatus(nodeId, status);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
        const updated = res.roadmap.nodes.find((n: RoadmapNode) => n.nodeId === nodeId);
        if (updated) setSelectedNode(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nodes = roadmap?.nodes || [];
  const activeNode = nodes.find((n) => n.status === 'in_progress') || nodes[0];
  const completedCount = nodes.filter((n) => n.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 4 of Reference UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Your Roadmap
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {roadmap?.category || activeTrack} • {roadmap?.targetLevel || 'Beginner'} • {roadmap?.estimatedDailyTime || '2 hr/day'} • {roadmap?.totalDurationDays || 90} days
          </p>
        </div>

        {/* Action Controls: Track Selector & Completed Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Track Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-850 p-1 rounded-full border border-neutral-200/80 dark:border-neutral-800 text-xs">
            {['AI / Machine Learning', 'Web Development'].map((t) => {
              const isSelected = activeTrack.toLowerCase().includes(t.toLowerCase().slice(0, 3));
              return (
                <button
                  key={t}
                  disabled={regenerating}
                  onClick={() => handleTrackChange(t)}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'AI / Machine Learning' ? 'AI / ML Track' : 'Web Dev Track'}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchRoadmap(activeTrack, true)}
            disabled={regenerating}
            title="Regenerate dynamic roadmap using Google Gemini"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>

          {/* Completed summary badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
            <span className={`w-2 h-2 rounded-full ${completedCount > 0 ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
            <span>
              {completedCount} of {nodes.length || 6} Completed
            </span>
          </div>
        </div>
      </div>

      {/* 3D Stepped Connected Path Visual (Matching UI Reference Screen 4) */}
      <div className="relative py-12 px-4 sm:px-8 bg-neutral-50/70 dark:bg-[#0B0F17]/80 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">
              Synthesizing your personalized {activeTrack} roadmap with Gemini...
            </p>
            <p className="text-xs text-neutral-500">
              Adapting milestones, project scopes, and lesson hours to your timeline.
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Connecting line behind podiums on larger screens */}
            <div className="hidden lg:block absolute top-[28px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-neutral-300 dark:to-neutral-700 pointer-events-none"></div>

            {/* Stepped Podiums Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 items-end">
              {nodes.map((node, index) => {
                const isCompleted = node.status === 'completed';
                const isInProgress = node.status === 'in_progress';
                const isLocked = node.status === 'locked';
                const isSelected = selectedNode?.nodeId === node.nodeId;

                return (
                  <div
                    key={node.nodeId || index}
                    onClick={() => setSelectedNode(node)}
                    className="flex flex-col items-center cursor-pointer transition-all duration-300 group"
                  >
                    {/* 3D Sphere / Number Node Icon */}
                    <div className="relative mb-3 flex items-center justify-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-200 ${
                          isSelected
                            ? 'scale-110 ring-4 ring-blue-500/40 shadow-blue-500/30'
                            : 'group-hover:scale-105'
                        } ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : isInProgress
                            ? 'bg-blue-600 text-white shadow-blue-500/40 ring-2 ring-blue-400/50 animate-pulse'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : node.stepNumber || index + 1}
                      </div>

                      {/* Status indicator bubble */}
                      {isInProgress && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 bg-neutral-300 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Floating 3D Podium Block */}
                    <div
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-neutral-950 dark:border-white bg-white dark:bg-[#111722] shadow-md ring-2 ring-neutral-950 dark:ring-white scale-102'
                          : isCompleted
                          ? 'border-emerald-500/30 bg-white/90 dark:bg-[#0D121B] shadow-xs'
                          : isInProgress
                          ? 'border-blue-500/50 bg-white dark:bg-[#111722] shadow-sm'
                          : 'border-neutral-200/70 dark:border-neutral-800 bg-white/60 dark:bg-[#0A0E17]/60 opacity-80'
                      }`}
                    >
                      <p className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                        {node.title}
                      </p>
                      <p
                        className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isInProgress
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Locked'}
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
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  STAGE {selectedNode.stepNumber}
                </span>
                <span
                  className={`text-xs font-bold ${
                    selectedNode.status === 'completed'
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
                    : 'Locked Stage'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {selectedNode.title}{selectedNode.subtitle ? `: ${selectedNode.subtitle}` : ''}
              </h2>
            </div>

            {/* Quick Status Toggle for Demo / Testing */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 text-[11px]">Stage Status:</span>
              <button
                onClick={() => handleUpdateStatus(selectedNode.nodeId, 'completed')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  selectedNode.status === 'completed'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedNode.nodeId, 'in_progress')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  selectedNode.status === 'in_progress'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Set Active
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                Curriculum
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {selectedNode.lessonsCount || 8} Interactive Lessons
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
                <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
                Execution Artifacts
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {selectedNode.projectsCount || 1} Verified Project
              </p>
            </div>
          </div>

          {/* Skills Covered Pills */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Skills Covered in this Stage:
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

          <div className="pt-2">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Start Stage Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Next Up Card (Bottom of Screen 4 matching UI Reference) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {activeNode?.stepNumber || 1}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Next Up
            </span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {activeNode?.title || 'Foundations'}: {activeNode?.subtitle || 'Get Started'}
            </h3>
            <p className="text-xs text-neutral-500">Continue where you left off</p>
          </div>
        </div>

        <Link
          to="/learn"
          className="p-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
          title="Continue"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

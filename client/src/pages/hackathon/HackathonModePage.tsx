import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Hackathon } from '../../types';
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
  Send
} from 'lucide-react';

export const HackathonModePage: React.FC = () => {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [activeTool, setActiveTool] = useState<string>('ideas');
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [loadingTool, setLoadingTool] = useState(false);
  const [problemInput, setProblemInput] = useState(
    'Automated AI platform for evaluating student code artifacts, detecting edge case vulnerabilities, and accelerating prototype delivery.'
  );

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const data = await api.getHackathon();
        setHackathon(data);
        // Run initial tool
        runTool('ideas');
      } catch (err) {
        console.error(err);
      }
    };
    fetchHackathon();
  }, []);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Sprint Execution Environment
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Hackathon Mode
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Turn your idea into a working product.
          </p>
        </div>

        {/* Team Members Avatars */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 mr-2">Sprint Team:</span>
          <div className="flex -space-x-2">
            {hackathon?.teamMembers?.map((m, idx) => (
              <img
                key={idx}
                src={m.avatar}
                alt={m.name}
                title={`${m.name} (${m.role})`}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid matching Screen 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Countdown & Timeline Phases (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Countdown Card matching Screen 7 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-neutral-900 dark:bg-[#111722] text-white border border-neutral-800 shadow-xl overflow-hidden space-y-4">
            {/* Background 3D Low-Poly Mountain Peak & Flag Graphic */}
            <div className="absolute right-4 bottom-2 opacity-35 pointer-events-none select-none">
              <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
                <polygon points="90,15 160,135 20,135" fill="currentColor" className="text-neutral-700" />
                <polygon points="90,15 50,135 20,135" fill="currentColor" className="text-neutral-600" />
                <polygon points="90,15 130,135 160,135" fill="currentColor" className="text-neutral-800" />
                {/* Summit Flag */}
                <line x1="90" y1="15" x2="90" y2="2" stroke="#EF4444" strokeWidth="2" />
                <polygon points="90,2 105,6 90,10" fill="#EF4444" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Upcoming Hackathon Target
              </span>
              <div>
                <p className="text-xs text-neutral-400">Time Left</p>
                <div className="flex items-baseline gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                  <span>12<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">d</span></span>
                  <span>04<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">h</span></span>
                  <span>32<span className="text-sm font-sans font-normal text-neutral-400 ml-0.5">m</span></span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 max-w-sm">
                Target: {hackathon?.hackathonName || 'Smart India Hackathon & InnovateX'}
              </p>
            </div>
          </div>

          {/* Timeline Phases List matching Screen 7 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              Sprint Timeline Phases
            </h2>

            <div className="space-y-4">
              {hackathon?.phases?.map((phase) => {
                const isCompleted = phase.status === 'completed';
                const isActive = phase.status === 'active';

                return (
                  <div
                    key={phase.phaseId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? 'border-purple-500/40 bg-purple-500/5 dark:bg-purple-950/20'
                        : isCompleted
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-500'
                        : 'border-neutral-200/70 dark:border-neutral-800/60 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-purple-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {phase.daysRange}: {phase.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.2 bg-purple-500/20 text-purple-400 rounded-full font-bold">
                              Current Phase
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
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

        {/* Right Column: AI Assistant Tools matching Screen 7 (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Assistant
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                Hackathon Tool Suite
              </h2>
            </div>

            {/* Tool Selector Buttons matching Screen 7 */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => runTool('ideas')}
                className={`p-3 rounded-2xl border text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'ideas'
                    ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Generate Ideas</span>
              </button>

              <button
                onClick={() => runTool('techStack')}
                className={`p-3 rounded-2xl border text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'techStack'
                    ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Tech Stack</span>
              </button>

              <button
                onClick={() => runTool('mvpPlan')}
                className={`p-3 rounded-2xl border text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'mvpPlan'
                    ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-500 shrink-0" />
                <span>MVP Planner</span>
              </button>

              <button
                onClick={() => runTool('pitchDeck')}
                className={`p-3 rounded-2xl border text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'pitchDeck'
                    ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Presentation className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Pitch Deck</span>
              </button>

              <button
                onClick={() => runTool('judgeQuestions')}
                className={`col-span-2 p-3 rounded-2xl border text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'judgeQuestions'
                    ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Judge Question Simulator</span>
              </button>
            </div>

            {/* Tool Output Display */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              {loadingTool ? (
                <div className="p-6 text-center text-xs text-neutral-400 animate-pulse">
                  Synthesizing strategy with AI Assistant...
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {toolOutput?.type === 'ideas' && (
                    <div className="space-y-2.5">
                      <p className="font-bold text-neutral-900 dark:text-white">Generated High-Viability Angles:</p>
                      {toolOutput.items?.map((item: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                          <p className="font-bold text-neutral-900 dark:text-white">{item.title}</p>
                          <p className="text-neutral-500">{item.pitch}</p>
                          <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{item.viability}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {toolOutput?.type === 'techStack' && (
                    <div className="space-y-2.5">
                      <p className="font-bold text-neutral-900 dark:text-white">Recommended Hackathon Stack:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {toolOutput.recommended?.map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-bold font-mono text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-neutral-500 text-[11px] leading-relaxed pt-1">{toolOutput.reasoning}</p>
                    </div>
                  )}

                  {toolOutput?.type === 'mvpPlan' && (
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">48-Hour Scope Checklist:</p>
                      {toolOutput.checklist?.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {toolOutput?.type === 'pitchDeck' && (
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">7-Slide Winning Pitch Deck:</p>
                      {toolOutput.slides?.map((s: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                          <span className="font-bold text-neutral-900 dark:text-white">{s.slide}</span>
                          <p className="text-neutral-500 text-[11px]">{s.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {toolOutput?.type === 'judgeQuestions' && (
                    <div className="space-y-2.5">
                      <p className="font-bold text-neutral-900 dark:text-white">Likely Judge Curveballs & Defense:</p>
                      {toolOutput.questions?.map((q: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                          <p className="font-bold text-neutral-900 dark:text-white">Q: {q.question}</p>
                          <p className="text-neutral-500">Answer Strategy: {q.goodAnswerStrategy}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

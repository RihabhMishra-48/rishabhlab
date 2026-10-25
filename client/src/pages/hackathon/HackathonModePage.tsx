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
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
            <img src="/graphics/troph-cap.svg" alt="Hackathon" className="w-full h-full object-contain dark:invert" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Hackathon Mode
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Turn your idea into a working product.
            </p>
          </div>
        </div>

        {/* Team Squad */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {['RS', 'AK', 'PK', 'MN'].map((m) => (
              <span
                key={m}
                className="w-7 h-7 rounded-full bg-neutral-800 dark:bg-neutral-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#171717]"
              >
                {m}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              const email = prompt('Enter teammate email:');
              if (email) alert(`Invitation sent to ${email}`);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            + Invite
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Countdown & Timeline Phases (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Countdown Card */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-neutral-900 dark:bg-[#212121] text-white border border-neutral-800 shadow-xl overflow-hidden space-y-4">
            {/* Background Mountain Peak Graphic */}
            <div className="absolute right-4 bottom-2 opacity-20 pointer-events-none select-none w-36 h-28 flex items-end justify-end">
              <img src="/graphics/mountain.svg" alt="Summit Mountain" className="w-28 h-28 object-contain invert" />
            </div>

            <div className="relative z-10 space-y-3">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Time Left</p>
                <div className="flex items-baseline gap-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white mt-1">
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

          {/* Timeline Phases List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              Sprint Timeline Phases
            </h2>

            {/* Merged Timeline Container with Soft Outer Edges & No Purple */}
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

        {/* Right Column: AI Assistant Tools matching Screen 7 (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Hackathon Tool Suite
              </h2>
            </div>

            {/* Tool Selector Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => runTool('ideas')}
                className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'ideas'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Generate Ideas</span>
              </button>

              <button
                onClick={() => runTool('techStack')}
                className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'techStack'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#242424]'
                }`}
              >
                <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Tech Stack</span>
              </button>

              <button
                onClick={() => runTool('mvpPlan')}
                className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'mvpPlan'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                <span>MVP Planner</span>
              </button>

              <button
                onClick={() => runTool('pitchDeck')}
                className={`p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'pitchDeck'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Presentation className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Pitch Deck</span>
              </button>

              <button
                onClick={() => runTool('judgeQuestions')}
                className={`col-span-2 p-3 rounded-2xl text-left transition-colors flex items-center gap-2 ${
                  activeTool === 'judgeQuestions'
                    ? 'bg-neutral-900 text-white dark:bg-[#2b2b2b] dark:text-white font-bold border border-transparent shadow-xs'
                    : 'bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#242424]'
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
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">Generated Angles:</p>
                      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                        {toolOutput.items?.map((item: any, i: number) => (
                          <div key={i} className="p-3.5 space-y-1">
                            <p className="font-bold text-neutral-900 dark:text-white">{item.title}</p>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.pitch}</p>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{item.viability}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {toolOutput?.type === 'techStack' && (
                    <div className="space-y-2.5">
                      <p className="font-bold text-neutral-900 dark:text-white">Recommended Stack:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {toolOutput.recommended?.map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold font-mono text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed pt-1">{toolOutput.reasoning}</p>
                    </div>
                  )}

                  {toolOutput?.type === 'mvpPlan' && (
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">48-Hour Scope Checklist:</p>
                      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                        {toolOutput.checklist?.map((item: string, i: number) => (
                          <div key={i} className="p-3 flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {toolOutput?.type === 'pitchDeck' && (
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">7-Slide Winning Pitch Deck:</p>
                      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                        {toolOutput.slides?.map((s: any, i: number) => (
                          <div key={i} className="p-3 space-y-0.5">
                            <span className="font-bold text-neutral-900 dark:text-white">{s.slide}</span>
                            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">{s.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {toolOutput?.type === 'judgeQuestions' && (
                    <div className="space-y-2">
                      <p className="font-bold text-neutral-900 dark:text-white">Likely Judge Curveballs & Defense:</p>
                      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1a1a1a] divide-y divide-neutral-200/80 dark:divide-neutral-800 overflow-hidden shadow-2xs">
                        {toolOutput.questions?.map((q: any, i: number) => (
                          <div key={i} className="p-3.5 space-y-1">
                            <p className="font-bold text-neutral-900 dark:text-white">Q: {q.question}</p>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">Strategy: {q.goodAnswerStrategy}</p>
                          </div>
                        ))}
                      </div>
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

import React from 'react';

export const Hero3DVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg aspect-4/3 flex items-center justify-center select-none">
      {/* Soft Ambient Glow */}
      <div className="absolute w-72 h-72 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Isometric Stage Container */}
      <div className="relative w-full h-full flex items-center justify-center scale-95 sm:scale-100 transition-transform">
        {/* Floating Base Platform */}
        <div className="absolute w-72 sm:w-80 h-36 bg-white/90 dark:bg-neutral-850/90 rounded-3xl border border-neutral-200/80 dark:border-neutral-700/60 shadow-podium dark:shadow-podium-dark transform -rotate-12 skew-x-12 translate-y-8 flex items-center justify-center backdrop-blur-md">
          {/* Subtle grid lines on platform */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] rounded-3xl"></div>
        </div>

        {/* Floating Laptop / Workspace 3D Object */}
        <div className="relative z-10 w-64 sm:w-72 bg-neutral-900 rounded-2xl p-3 shadow-2xl border border-neutral-700/60 transform -rotate-6 hover:-rotate-3 transition-transform duration-500">
          {/* Laptop Screen Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Day 17 • execution.ts</span>
          </div>

          {/* Screen Content */}
          <div className="pt-2 font-mono text-[11px] leading-relaxed space-y-1">
            <p className="text-purple-400">const <span className="text-blue-400">studentMission</span> = {'{'}</p>
            <p className="pl-3 text-neutral-300">track: <span className="text-emerald-400">'Web Development'</span>,</p>
            <p className="pl-3 text-neutral-300">goal: <span className="text-emerald-400">'Build & Ship Daily'</span>,</p>
            <p className="pl-3 text-neutral-300">status: <span className="text-cyan-400">'In Progress (41%)'</span>,</p>
            <p className="pl-3 text-neutral-300">streak: <span className="text-amber-400">12</span></p>
            <p className="text-purple-400">{'}'};</p>
          </div>

          {/* Mini Execution Progress Bar */}
          <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
            <span>Next: Ship to GitHub</span>
            <span className="text-emerald-400 font-semibold">10 min</span>
          </div>
        </div>

        {/* Floating Podiums & Geometric Objects */}
        {/* Floating Node Badge 1 */}
        <div className="absolute top-8 left-4 sm:left-6 z-20 bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2.5 animate-bounce [animation-duration:4s]">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-900 dark:text-white">Foundations</p>
            <p className="text-[9px] text-neutral-500">Completed</p>
          </div>
        </div>

        {/* Floating Node Badge 2 */}
        <div className="absolute bottom-6 right-2 sm:right-6 z-20 bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2.5 animate-bounce [animation-duration:5s] [animation-delay:1s]">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-900 dark:text-white">HTML CSS JS</p>
            <p className="text-[9px] text-blue-500 font-semibold">Active Mission</p>
          </div>
        </div>

        {/* Decorative Modern Succulent / Desk Asset */}
        <div className="absolute top-12 right-10 z-10 hidden sm:flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500/40"></div>
          </div>
          <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-b-md shadow-xs"></div>
        </div>
      </div>
    </div>
  );
};

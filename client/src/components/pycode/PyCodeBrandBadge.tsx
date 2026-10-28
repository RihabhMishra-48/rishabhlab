import React from 'react';

interface PyCodeBrandBadgeProps {
  variant?: 'full' | 'compact' | 'powered-by';
  className?: string;
}

export const PyCodeBrandBadge: React.FC<PyCodeBrandBadgeProps> = ({
  variant = 'powered-by',
  className = '',
}) => {
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        {/* Clay/Terracotta Circular Logo from PyCode */}
        <div className="w-8 h-8 rounded-full bg-[#D4704B] flex items-center justify-center text-white shadow-xs shrink-0 font-mono font-bold text-xs tracking-tighter">
          &gt;_
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
            PyCode
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500 mt-0.5">
            WORKSPACE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4704B]/10 border border-[#D4704B]/20 select-none ${className}`}
      >
        <div className="w-4 h-4 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[9px] shrink-0">
          &gt;_
        </div>
        <span className="text-[11px] font-bold text-[#D4704B] dark:text-[#E28866]">
          PyCode
        </span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
          Workspace
        </span>
      </div>
    );
  }

  // Default 'powered-by' pill
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-[#202020]/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-2xs select-none ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[10px] shadow-2xs shrink-0">
        &gt;_
      </div>
      <div className="flex items-center gap-1.5 leading-none">
        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
          Powered by
        </span>
        <span className="text-xs font-bold text-neutral-900 dark:text-white">
          PyCode
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-[#D4704B]/10 text-[#D4704B]">
          Workspace
        </span>
      </div>
    </div>
  );
};


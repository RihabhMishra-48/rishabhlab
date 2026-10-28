import React from 'react';

interface PyCodeBrandBadgeProps {
  variant?: 'full' | 'compact' | 'powered-by';
  className?: string;
  showLink?: boolean;
}

export const PyCodeBrandBadge: React.FC<PyCodeBrandBadgeProps> = ({
  variant = 'powered-by',
  className = '',
  showLink = true,
}) => {
  const content = (
    <>
      {variant === 'full' && (
        <div className={`flex items-center gap-3 select-none ${className}`}>
          {/* Official PyCode Terracotta Logo */}
          <div className="w-9 h-9 rounded-2xl bg-[#D4704B] flex items-center justify-center text-white shadow-xs shrink-0 font-mono font-bold text-xs ring-4 ring-[#D4704B]/10">
            &gt;_
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                PyCode
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#D4704B]/10 text-[#D4704B] border border-[#D4704B]/20">
                Workspace
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Live Python Compiler & Assessment Engine
            </span>
          </div>
        </div>
      )}

      {variant === 'compact' && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4704B]/10 hover:bg-[#D4704B]/15 border border-[#D4704B]/25 select-none transition-colors ${className}`}
        >
          <div className="w-4 h-4 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[9px] shrink-0">
            &gt;_
          </div>
          <span className="text-xs font-bold text-[#D4704B] dark:text-[#E28866]">
            PyCode
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
            Workspace
          </span>
        </div>
      )}

      {variant === 'powered-by' && (
        <div
          className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#202024] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs select-none hover:border-[#D4704B]/40 transition-colors ${className}`}
        >
          <div className="w-5 h-5 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[10px] shadow-2xs shrink-0">
            &gt;_
          </div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Powered by
            </span>
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              PyCode
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#D4704B]/10 text-[#D4704B] border border-[#D4704B]/20">
              Workspace
            </span>
          </div>
        </div>
      )}
    </>
  );

  if (showLink) {
    return (
      <a
        href="https://pycode-student.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        title="Open Official PyCode Workspace"
        className="inline-block cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default PyCodeBrandBadge;

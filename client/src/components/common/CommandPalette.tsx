import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  CheckCircle2,
  Code2,
  FolderGit2,
  Trophy,
  Users,
  BookOpen,
  CalendarDays,
  Bug,
  Building2,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const items = [
    { title: "Today's Mission (Day 17)", category: 'Mission', path: '/missions', icon: CheckCircle2 },
    { title: 'Personalized Roadmap', category: 'Roadmap', path: '/roadmap', icon: Compass },
    { title: 'Learn: JavaScript Array Methods', category: 'Learn', path: '/learn/web-dev/javascript-array-methods', icon: BookOpen },
    { title: 'Learn: DOM Manipulation & Events', category: 'Learn', path: '/learn/web-dev/dom-manipulation-events', icon: BookOpen },
    { title: 'Practice: Filter Active Users', category: 'Coding', path: '/practice/filter-active-users', icon: Code2 },
    { title: 'Practice: Two Sum (Hash Map)', category: 'Coding', path: '/practice/two-sum', icon: Code2 },
    { title: 'Fix the Bug: Off-by-One Accumulator', category: 'Debugging', path: '/practice/fix-the-bug-off-by-one', icon: Bug },
    { title: 'Project: AI Resume Analyzer', category: 'Projects', path: '/projects/ai-resume-analyzer', icon: FolderGit2 },
    { title: 'Project: College Event Platform', category: 'Projects', path: '/projects/college-event-platform', icon: FolderGit2 },
    { title: 'Hackathon Mode (12 Days Countdown)', category: 'Hackathon', path: '/hackathon', icon: Trophy },
    { title: 'Book 1:1 Mentorship Session', category: 'Mentorship', path: '/mentorship', icon: Users },
    { title: 'Weekly Review (Week 3 Reflection)', category: 'Review', path: '/weekly-review', icon: CalendarDays },
    { title: 'GLA University College Dashboard', category: 'College', path: '/college', icon: Building2 },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger handled in parent or global
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#111722] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Type a command, lesson, project, or problem..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              No matching commands or resources found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{item.title}</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                    Jump →
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};

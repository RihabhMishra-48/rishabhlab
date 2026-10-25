import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import { Compass, CheckCircle2 } from 'lucide-react';
import { HomeChimneyIcon, UserProfileIcon } from '../icons/TrackIcons';
import { MascotCompanion } from '../common/MascotCompanion';

export const AppLayout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rishabhlabs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rishabhlabs_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FAFAFA] dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <main className="flex-1 h-full overflow-y-auto overscroll-y-contain pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Matching UI Reference Bottom Right Screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#171717]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-6 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 dark:text-white font-semibold' : 'text-neutral-500'
            }`
          }
        >
          <HomeChimneyIcon className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/roadmap"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 dark:text-white font-semibold' : 'text-neutral-500'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Roadmap</span>
        </NavLink>

        <NavLink
          to="/missions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 dark:text-white font-semibold' : 'text-neutral-500'
            }`
          }
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Missions</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 dark:text-white font-semibold' : 'text-neutral-500'
            }`
          }
        >
          <UserProfileIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>

      <MascotCompanion />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

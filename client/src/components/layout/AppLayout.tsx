import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import { Home, Compass, CheckCircle2, User as UserIcon } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Matching UI Reference Bottom Right Screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0F17]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-6 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 dark:text-white font-semibold' : 'text-neutral-500'
            }`
          }
        >
          <Home className="w-5 h-5" />
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
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

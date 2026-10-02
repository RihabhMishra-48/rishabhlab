import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  CheckCircle2,
  FolderGit2,
  Trophy,
  Users,
  User as UserIcon,
  BookOpen,
  Code2,
  CalendarDays,
  Building2,
  ShieldAlert,
  Flame,
  Bug
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const mainNavItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Roadmap', path: '/roadmap', icon: Compass },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Missions', path: '/missions', icon: CheckCircle2 },
    { label: 'Practice', path: '/practice', icon: Code2 },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Hackathon', path: '/hackathon', icon: Trophy },
    { label: 'Mentorship', path: '/mentorship', icon: Users },
    { label: 'Weekly Review', path: '/weekly-review', icon: CalendarDays },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 bg-[#0B0F17] text-neutral-300 border-r border-neutral-800/80 px-3 py-4 select-none justify-between">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-neutral-800/90 text-white shadow-sm border border-neutral-700/60 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                  }`}
                />
                <span>{item.label}</span>
                {item.label === 'Missions' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
                {item.label === 'Hackathon' && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono">
                    12d
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Specialized Labs & Portals */}
        <div className="pt-3 border-t border-neutral-800/60 space-y-1">
          <div className="px-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
            {user?.role === 'super_admin' || user?.role === 'college_admin' ? 'Portals & Labs' : 'Labs & Tools'}
          </div>
          <NavLink
            to="/debugging-lab"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`
            }
          >
            <Bug className="w-4 h-4 text-rose-400" />
            <span>Debugging Lab</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded">Fix</span>
          </NavLink>

          {(user?.role === 'college_admin' || user?.role === 'super_admin') && (
            <NavLink
              to="/college"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                }`
              }
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>College Admin</span>
              <span className="ml-auto text-[9px] text-neutral-500">Portal</span>
            </NavLink>
          )}

          {user?.role === 'super_admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Platform Admin</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Bottom User Card in Sidebar */}
      {user && (
        <div className="pt-3 border-t border-neutral-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/60">
            <img
              src={user.avatar || '/avatars/rishabh.png'}
              alt={user.name}
              className="w-9 h-9 rounded-lg object-cover border border-neutral-700"
              onError={(e: any) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user.college || user.targetGoal || 'Student'}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{(user as any).streak_days ?? (user as any).streakDays ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

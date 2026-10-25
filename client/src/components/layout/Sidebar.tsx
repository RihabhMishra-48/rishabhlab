import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';
import { BugIcon, DisplayCodeIcon } from '../icons/TrackIcons';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleItemClick = () => {
    setIsDismissed(true);
    setActiveItem(null);
    setHoveredItem(null);
    if (sidebarRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  // Helper to check if a specific item's info bar is open (strictly hover-based so it never gets stuck on focus/click)
  const isInfoBarOpen = (id: string) => {
    if (!isCollapsed || isDismissed) return false;
    return hoveredItem === id;
  };

  // Close info bars on route change
  useEffect(() => {
    setIsDismissed(true);
    setActiveItem(null);
    setHoveredItem(null);
  }, [location.pathname]);

  // Close active/focused info bar when user clicks outside or presses Escape (capture phase)
  useEffect(() => {
    const handleOutsideClick = (e: Event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsDismissed(true);
        setActiveItem(null);
        setHoveredItem(null);
        if (sidebarRef.current.contains(document.activeElement)) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDismissed(true);
        setActiveItem(null);
        setHoveredItem(null);
        if (sidebarRef.current?.contains(document.activeElement)) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick, true);
    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const mainNavItems = [
    { label: 'Home', path: '/dashboard', icon: Home, customGraphic: '/graphics/house-chimney.svg' },
    { label: 'Roadmap', path: '/roadmap', icon: Compass, customGraphic: '/graphics/roadmap.png' },
    { label: 'Learn', path: '/learn', icon: BookOpen, customGraphic: '/graphics/e-learning.svg' },
    { label: 'Missions', path: '/missions', icon: CheckCircle2, customGraphic: '/graphics/daily-calendar.svg' },
    { label: 'Practice', path: '/practice', icon: DisplayCodeIcon, customGraphic: '/graphics/display-code.svg' },
    { label: 'Projects', path: '/projects', icon: FolderGit2, customGraphic: '/graphics/support.png' },
    { label: 'Contests & Arena', path: '/hackathon', icon: Trophy, customGraphic: '/graphics/troph-cap.svg' },
    { label: 'Mentorship', path: '/mentorship', icon: Users, customGraphic: '/graphics/mentorship.png' },
    { label: 'Weekly Review', path: '/weekly-review', icon: CalendarDays, customGraphic: '/graphics/rectangle-history-circle-plus.svg' },
    { label: 'Profile', path: '/profile', icon: UserIcon, customGraphic: '/graphics/user.svg' },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:flex flex-col shrink-0 h-full relative bg-white dark:bg-[#171717] text-neutral-800 dark:text-neutral-300 border-r border-neutral-200/80 dark:border-neutral-800/80 select-none justify-between transition-all duration-300 ease-in-out z-30 overflow-visible ${isCollapsed ? 'w-[72px] px-2 py-3' : 'w-64 px-3 py-4'
        }`}
    >
      {/* Scrollable / Visible Nav Area */}
      <div
        className={`flex-1 space-y-4 pr-0.5 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'
          }`}
      >
        {/* Main Navigation Links with Info Tags on Collapsed Hover */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                onMouseEnter={() => {
                  setHoveredItem(item.path);
                  setIsDismissed(false);
                }}
                onMouseLeave={() => setHoveredItem((curr) => (curr === item.path ? null : curr))}
                onFocus={() => {
                  setActiveItem(item.path);
                  setIsDismissed(false);
                }}
                onBlur={() => setActiveItem((curr) => (curr === item.path ? null : curr))}
                className={`relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${isCollapsed
                  ? 'justify-center w-11 h-10 mx-auto'
                  : 'gap-3 px-3 py-2.5'
                  } ${isActive
                    ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs dark:bg-neutral-800 dark:text-white dark:shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/70'
                  }`}
              >
                {item.customGraphic ? (
                  <img
                    src={item.customGraphic}
                    alt={item.label}
                    className={`w-4 h-4 shrink-0 object-contain transition-all ${isActive
                      ? 'opacity-100 dark:invert'
                      : 'opacity-70 group-hover:opacity-100 dark:invert dark:opacity-60 dark:group-hover:opacity-90'
                      }`}
                  />
                ) : (
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${isActive
                      ? 'text-neutral-950 dark:text-white'
                      : 'text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white'
                      }`}
                  />
                )}

                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.label === 'Missions' && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                    )}
                  </>
                )}

                {/* Collapsed Info Tag on Hover / Focus - ONLY name text */}
                {isCollapsed && (
                  <div
                    className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${isInfoBarOpen(item.path)
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible pointer-events-none'
                      }`}
                  >
                    <div className="relative px-3 py-1.5 rounded-lg bg-neutral-900/95 dark:bg-[#262626]/95 backdrop-blur-md border border-neutral-800 dark:border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                      <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-neutral-900 dark:bg-[#262626] border-l border-b border-neutral-800 dark:border-neutral-700/80 rotate-45" />
                      <span className="font-medium text-white text-xs">{item.label}</span>
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Specialized Labs & Portals */}
        <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
          {!isCollapsed ? (
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
              {user?.role === 'super_admin' || user?.role === 'college_admin'
                ? 'Portals & Labs'
                : 'Labs & Tools'}
            </div>
          ) : (
            <div className="w-6 mx-auto border-t border-neutral-200/60 dark:border-neutral-800/60 my-2" />
          )}

          {/* Debugging Lab */}
          <NavLink
            to="/debugging-lab"
            onClick={handleItemClick}
            onMouseEnter={() => {
              setHoveredItem('/debugging-lab');
              setIsDismissed(false);
            }}
            onMouseLeave={() => setHoveredItem((curr) => (curr === '/debugging-lab' ? null : curr))}
            onFocus={() => {
              setActiveItem('/debugging-lab');
              setIsDismissed(false);
            }}
            onBlur={() => setActiveItem((curr) => (curr === '/debugging-lab' ? null : curr))}
            className={({ isActive }) =>
              `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${isCollapsed
                ? 'justify-center w-11 h-10 mx-auto'
                : 'gap-3 px-3 py-2'
              } ${isActive
                ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs dark:bg-neutral-800 dark:text-white dark:shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/70'
              }`
            }
          >
            <BugIcon className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            {!isCollapsed ? (
              <span className="truncate">Debugging Lab</span>
            ) : (
              <div
                className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${isInfoBarOpen('/debugging-lab')
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible pointer-events-none'
                  }`}
              >
                <div className="relative px-3 py-1.5 rounded-lg bg-neutral-900/95 dark:bg-[#262626]/95 backdrop-blur-md border border-neutral-800 dark:border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                  <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-neutral-900 dark:bg-[#262626] border-l border-b border-neutral-800 dark:border-neutral-700/80 rotate-45" />
                  <span className="font-medium text-white text-xs">Debugging Lab</span>
                </div>
              </div>
            )}
          </NavLink>

          {/* College Admin Portal */}
          {(user?.role === 'college_admin' || user?.role === 'super_admin') && (
            <NavLink
              to="/college"
              onClick={handleItemClick}
              onMouseEnter={() => {
                setHoveredItem('/college');
                setIsDismissed(false);
              }}
              onMouseLeave={() => setHoveredItem((curr) => (curr === '/college' ? null : curr))}
              onFocus={() => {
                setActiveItem('/college');
                setIsDismissed(false);
              }}
              onBlur={() => setActiveItem((curr) => (curr === '/college' ? null : curr))}
              className={({ isActive }) =>
                `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${isCollapsed
                  ? 'justify-center w-11 h-10 mx-auto'
                  : 'gap-3 px-3 py-2'
                } ${isActive
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs dark:bg-neutral-800 dark:text-white dark:shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/70'
                }`
              }
            >
              <Building2 className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
              {!isCollapsed ? (
                <>
                  <span className="truncate">College Admin</span>
                  <span className="ml-auto text-[9px] text-neutral-400 dark:text-neutral-500">Portal</span>
                </>
              ) : (
                <div
                  className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${isInfoBarOpen('/college')
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                  <div className="relative px-3 py-1.5 rounded-lg bg-neutral-900/95 dark:bg-[#262626]/95 backdrop-blur-md border border-neutral-800 dark:border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                    <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-neutral-900 dark:bg-[#262626] border-l border-b border-neutral-800 dark:border-neutral-700/80 rotate-45" />
                    <span className="font-medium text-white text-xs">College Admin</span>
                  </div>
                </div>
              )}
            </NavLink>
          )}

          {/* Platform Admin */}
          {user?.role === 'super_admin' && (
            <NavLink
              to="/admin"
              onClick={handleItemClick}
              onMouseEnter={() => {
                setHoveredItem('/admin');
                setIsDismissed(false);
              }}
              onMouseLeave={() => setHoveredItem((curr) => (curr === '/admin' ? null : curr))}
              onFocus={() => {
                setActiveItem('/admin');
                setIsDismissed(false);
              }}
              onBlur={() => setActiveItem((curr) => (curr === '/admin' ? null : curr))}
              className={({ isActive }) =>
                `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${isCollapsed
                  ? 'justify-center w-11 h-10 mx-auto'
                  : 'gap-3 px-3 py-2'
                } ${isActive
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs dark:bg-neutral-800 dark:text-white dark:shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/70'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
              {!isCollapsed ? (
                <span className="truncate">Platform Admin</span>
              ) : (
                <div
                  className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${isInfoBarOpen('/admin')
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                  <div className="relative px-3 py-1.5 rounded-lg bg-neutral-900/95 dark:bg-[#262626]/95 backdrop-blur-md border border-neutral-800 dark:border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                    <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-neutral-900 dark:bg-[#262626] border-l border-b border-neutral-800 dark:border-neutral-700/80 rotate-45" />
                    <span className="font-medium text-white text-xs">Platform Admin</span>
                  </div>
                </div>
              )}
            </NavLink>
          )}
        </div>
      </div>

      {/* Bottom User Card in Sidebar */}
      {user && (
        <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 shrink-0">
          {!isCollapsed ? (
            <Link
              to="/profile"
              onClick={handleItemClick}
              className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 dark:bg-neutral-900/60 dark:hover:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800/60 transition-colors outline-none focus:outline-none"
            >
              <img
                src={user.avatar || '/avatars/rishabh.png'}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                onError={(e: any) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {user.college || user.targetGoal || 'Student'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{(user as any).streak_days ?? (user as any).streakDays ?? 0}</span>
              </div>
            </Link>
          ) : (
            <div
              className="relative group flex justify-center py-1"
              onMouseEnter={() => {
                setHoveredItem('user-profile');
                setIsDismissed(false);
              }}
              onMouseLeave={() => setHoveredItem((curr) => (curr === 'user-profile' ? null : curr))}
            >
              <Link
                to="/profile"
                onClick={handleItemClick}
                onFocus={() => {
                  setActiveItem('user-profile');
                  setIsDismissed(false);
                }}
                onBlur={() => setActiveItem((curr) => (curr === 'user-profile' ? null : curr))}
                className="relative cursor-pointer block"
              >
                <img
                  src={user.avatar || '/avatars/rishabh.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 transition-colors"
                  onError={(e: any) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 rounded-full px-1 text-[8px] font-bold text-amber-600 dark:text-amber-300">
                  <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                </div>
              </Link>

              {/* Collapsed User Profile Info Tag - ONLY name text */}
              <div
                className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${isInfoBarOpen('user-profile')
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible pointer-events-none'
                  }`}
              >
                <div className="relative px-3 py-1.5 rounded-lg bg-neutral-900/95 dark:bg-[#262626]/95 backdrop-blur-md border border-neutral-800 dark:border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                  <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-neutral-900 dark:bg-[#262626] border-l border-b border-neutral-800 dark:border-neutral-700/80 rotate-45" />
                  <span className="font-medium text-white text-xs">{user.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Full-Height Separator Line & Docked Toggle Button */}
      {onToggleCollapse && (
        <div
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-0 bottom-0 w-6 cursor-pointer group/rail z-40 select-none items-center justify-center"
          title={isCollapsed ? 'Click anywhere on separator line to expand sidebar (Ctrl+B)' : 'Click anywhere on separator line to collapse sidebar (Ctrl+B)'}
        >
          {/* Subtle separator highlight line on hover — neutral tone, no blue */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-transparent group-hover/rail:bg-neutral-400/50 dark:group-hover/rail:bg-neutral-500/50 transition-colors duration-150" />

          {/* Floating Dock Toggle Button sitting directly in the vertical center of the separator line */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center text-neutral-400 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 transition-all cursor-pointer z-50 group-hover/rail:border-neutral-400 dark:group-hover/rail:border-neutral-500 group-hover/rail:text-neutral-900 dark:group-hover/rail:text-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

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
  Bug,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';
import { DisplayCodeIcon } from '../icons/TrackIcons';

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

  // Helper to check if a specific item's info bar is open
  const isInfoBarOpen = (id: string) => {
    if (!isCollapsed || isDismissed) return false;
    return hoveredItem === id || activeItem === id;
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
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Roadmap', path: '/roadmap', icon: Compass, customGraphic: '/graphics/roadmap.png' },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Missions', path: '/missions', icon: CheckCircle2, customGraphic: '/graphics/daily-calendar.svg' },
    { label: 'Practice', path: '/practice', icon: DisplayCodeIcon, customGraphic: '/graphics/display-code.svg' },
    { label: 'Projects', path: '/projects', icon: FolderGit2, customGraphic: '/graphics/support.png' },
    { label: 'Hackathon', path: '/hackathon', icon: Trophy, customGraphic: '/graphics/troph-cap.svg' },
    { label: 'Mentorship', path: '/mentorship', icon: Users, customGraphic: '/graphics/mentorship.png' },
    { label: 'Weekly Review', path: '/weekly-review', icon: CalendarDays, customGraphic: '/graphics/rectangle-history-circle-plus.svg' },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:flex flex-col shrink-0 h-full bg-[#171717] text-neutral-300 border-r border-neutral-800/80 select-none justify-between transition-all duration-300 ease-in-out z-30 ${
        isCollapsed ? 'w-[72px] px-2 py-3 overflow-visible' : 'w-64 px-3 py-4'
      }`}
    >
      {/* Scrollable / Visible Nav Area */}
      <div
        className={`flex-1 space-y-4 pr-0.5 ${
          isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'
        }`}
      >
        {/* Top Header / Toggle */}
        <div
          className={`relative group flex items-center pb-2.5 border-b border-neutral-800/60 ${
            isCollapsed ? 'justify-center' : 'justify-between px-2'
          }`}
          onMouseEnter={() => {
            setHoveredItem('toggle');
            setIsDismissed(false);
          }}
          onMouseLeave={() => setHoveredItem((curr) => (curr === 'toggle' ? null : curr))}
        >
          {!isCollapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Workspace
            </span>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              onFocus={() => {
                setActiveItem('toggle');
                setIsDismissed(false);
              }}
              onBlur={() => setActiveItem((curr) => (curr === 'toggle' ? null : curr))}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              title={isCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Collapsed Toggle Button Info Tag */}
          {isCollapsed && (
            <div
              className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                isInfoBarOpen('toggle')
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible pointer-events-none'
              }`}
            >
              <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
                <span className="font-medium text-white text-xs">Expand Sidebar</span>
              </div>
            </div>
          )}
        </div>

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
                className={`relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${
                  isCollapsed
                    ? 'justify-center w-11 h-10 mx-auto'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
              >
                {item.customGraphic ? (
                  <img
                    src={item.customGraphic}
                    alt={item.label}
                    className={`w-4 h-4 shrink-0 object-contain invert transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  />
                )}

                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.label === 'Missions' && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </>
                )}

                {/* Collapsed Info Tag on Hover / Focus - ONLY name text */}
                {isCollapsed && (
                  <div
                    className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                      isInfoBarOpen(item.path)
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible pointer-events-none'
                    }`}
                  >
                    <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                      <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
                      <span className="font-medium text-white text-xs">{item.label}</span>
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Specialized Labs & Portals */}
        <div className="pt-3 border-t border-neutral-800/60 space-y-1">
          {!isCollapsed ? (
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
              {user?.role === 'super_admin' || user?.role === 'college_admin'
                ? 'Portals & Labs'
                : 'Labs & Tools'}
            </div>
          ) : (
            <div className="w-6 mx-auto border-t border-neutral-800/60 my-2" />
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
              `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${
                isCollapsed
                  ? 'justify-center w-11 h-10 mx-auto'
                  : 'gap-3 px-3 py-2'
              } ${
                isActive
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
              }`
            }
          >
            <Bug className="w-4 h-4 shrink-0 text-rose-400" />
            {!isCollapsed ? (
              <span className="truncate">Debugging Lab</span>
            ) : (
              <div
                className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                  isInfoBarOpen('/debugging-lab')
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                  <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
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
                `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${
                  isCollapsed
                    ? 'justify-center w-11 h-10 mx-auto'
                    : 'gap-3 px-3 py-2'
                } ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`
              }
            >
              <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed ? (
                <>
                  <span className="truncate">College Admin</span>
                  <span className="ml-auto text-[9px] text-neutral-500">Portal</span>
                </>
              ) : (
                <div
                  className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                    isInfoBarOpen('/college')
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                    <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
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
                `relative group flex items-center rounded-xl text-xs font-medium transition-colors outline-none focus:outline-none ${
                  isCollapsed
                    ? 'justify-center w-11 h-10 mx-auto'
                    : 'gap-3 px-3 py-2'
                } ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed ? (
                <span className="truncate">Platform Admin</span>
              ) : (
                <div
                  className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                    isInfoBarOpen('/admin')
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                    <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
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
        <div className="pt-3 border-t border-neutral-800/80 shrink-0">
          {!isCollapsed ? (
            <Link
              to="/profile"
              onClick={handleItemClick}
              className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800/60 transition-colors outline-none focus:outline-none"
            >
              <img
                src={user.avatar || '/avatars/rishabh.png'}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover border border-neutral-700 shrink-0"
                onError={(e: any) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {user.college || user.targetGoal || 'Student'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold shrink-0">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
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
                  className="w-10 h-10 rounded-xl object-cover border border-neutral-700 group-hover:border-neutral-500 transition-colors"
                  onError={(e: any) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center bg-amber-500/20 border border-amber-500/40 rounded-full px-1 text-[8px] font-bold text-amber-300">
                  <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </div>
              </Link>

              {/* Collapsed User Profile Info Tag - ONLY name text */}
              <div
                className={`absolute left-full ml-3 inset-y-0 my-auto h-fit z-50 transition-all duration-150 ${
                  isInfoBarOpen('user-profile')
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <div className="relative px-3 py-1.5 rounded-lg bg-[#262626]/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-left whitespace-nowrap">
                  <div className="absolute -left-1 inset-y-0 my-auto h-2 w-2 bg-[#262626] border-l border-b border-neutral-700/80 rotate-45" />
                  <span className="font-medium text-white text-xs">{user.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Compass,
  CheckCircle2,
  Code2,
  FolderGit2,
  Flame,
  Users,
  Calendar,
  Sparkles,
  Building2,
  ShieldAlert,
  LogOut,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette
}) => {
  const { user, isDarkMode, toggleDarkMode, switchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Close bars on route change
  useEffect(() => {
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close active dropdowns or mobile menu when user clicks outside or presses Escape
  useEffect(() => {
    const handleOutsideClick = (e: Event) => {
      const target = e.target as Node;
      if (roleDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setRoleDropdownOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (roleDropdownOpen) setRoleDropdownOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick, true);
    document.addEventListener('mousedown', handleOutsideClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
      document.removeEventListener('mousedown', handleOutsideClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [roleDropdownOpen, mobileMenuOpen]);

  const isPublicPage = ['/', '/features', '/pricing', '/about', '/login', '/register'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 backdrop-blur-md bg-white/80 dark:bg-[#171717]/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className={`${isPublicPage ? 'max-w-7xl mx-auto' : 'w-full'} px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4`}>
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <img
              src="/logo-circle.webp"
              alt="Rishabh Labs"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 shadow-xs"
            />
            <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
              Rishabh<span className="font-medium text-neutral-500 dark:text-neutral-400">Labs</span>
            </span>
          </Link>

          {/* Public Nav Links */}
          {isPublicPage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <Link to="/" className={`hover:text-neutral-950 dark:hover:text-white transition-colors ${location.pathname === '/' ? 'text-neutral-950 dark:text-white font-semibold' : ''}`}>Home</Link>
              <Link to="/features" className={`hover:text-neutral-950 dark:hover:text-white transition-colors ${location.pathname === '/features' ? 'text-neutral-950 dark:text-white font-semibold' : ''}`}>Features</Link>
              <Link to="/pricing" className={`hover:text-neutral-950 dark:hover:text-white transition-colors ${location.pathname === '/pricing' ? 'text-neutral-950 dark:text-white font-semibold' : ''}`}>Pricing</Link>
              <Link to="/about" className={`hover:text-neutral-950 dark:hover:text-white transition-colors ${location.pathname === '/about' ? 'text-neutral-950 dark:text-white font-semibold' : ''}`}>About</Link>
            </nav>
          )}
        </div>

        {/* Center: Search / Command Palette Trigger (Hidden on public marketing pages) */}
        {!isPublicPage && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors w-64 max-w-xs justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Search missions, problems...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Command Palette Trigger (< sm) */}
          {!isPublicPage && onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="sm:hidden p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Open search command palette"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-neutral-200" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown or Real Auth CTA */}
          {user ? (
            <div className="flex items-center gap-2">
              {isPublicPage && (
                <Link
                  to={user.isOnboarded ? "/dashboard" : "/onboarding"}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-all shadow-xs"
                >
                  <span>{user.isOnboarded ? "Dashboard" : "Complete Onboarding"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  email={user.email}
                  size="sm"
                />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-600 dark:text-neutral-300 capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                  >
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setRoleDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                  >
                    <Compass className="w-3.5 h-3.5 text-neutral-400" />
                    Dashboard
                  </Link>

                  {(user.role === 'mentor' || user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      to="/mentor/sessions"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Mentor Workspace
                    </Link>
                  )}

                  {(user.role === 'college_admin' || user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      to="/college"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                    >
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      College Portal
                    </Link>
                  )}

                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center gap-2 text-neutral-700 dark:text-neutral-200"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800"></div>

                  <button
                    onClick={async () => {
                      setRoleDropdownOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-4 py-2 rounded-full transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button - Matches Sidebar hidden lg:flex */}
          <button
            ref={mobileButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#171717]/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2 text-sm font-medium max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-1"
        >
          {isPublicPage && (
            <div className="space-y-1 pb-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Home</Link>
              <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Features</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Pricing</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">About</Link>
            </div>
          )}

          {user && (
            <div className="space-y-1">
              <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800/60 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-neutral-500 font-mono truncate">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 capitalize">
                  {user.role?.replace('_', ' ') || 'Student'}
                </span>
              </div>

              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Dashboard</Link>
              <Link to="/roadmap" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Roadmap</Link>
              <Link to="/learn" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Learn Modules</Link>
              <Link to="/missions" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Daily Missions</Link>
              <Link to="/practice" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Code Practice</Link>
              <Link to="/practice/python" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Python Sandbox & PyCode</Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Projects</Link>
              <Link to="/hackathon" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Contests & Arena</Link>
              <Link to="/mentorship" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Mentorship</Link>
              <Link to="/weekly-review" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">Weekly Review</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">My Profile</Link>

              {(user.role === 'mentor' || user.role === 'admin' || user.role === 'super_admin') && (
                <Link to="/mentor/sessions" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/10">
                  Mentor Workspace →
                </Link>
              )}

              {(user.role === 'college_admin' || user.role === 'admin' || user.role === 'super_admin') && (
                <Link to="/college" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/10">
                  College Portal →
                </Link>
              )}

              {(user.role === 'admin' || user.role === 'super_admin') && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-500/10">
                  Admin Dashboard →
                </Link>
              )}

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 font-semibold text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

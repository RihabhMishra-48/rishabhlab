import React, { useState } from 'react';
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

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { user, isDarkMode, toggleDarkMode, switchRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isPublicPage = ['/', '/features', '/pricing', '/about', '/login', '/register'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0B0F17]/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm group-hover:scale-105 transition-transform">
              {/* Geometric Diamond Emblem matching reference */}
              <div className="w-3.5 h-3.5 border-2 border-current rotate-45 transform"></div>
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
              Rishabh <span className="font-medium text-neutral-500 dark:text-neutral-400">Labs</span>
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
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown or Real Auth CTA */}
          {user ? (
            <div className="flex items-center gap-2">
              {isPublicPage && (
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-all shadow-xs"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
                  }}
                />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B0F17] px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Home</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Features</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Pricing</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">About</Link>
          {user && (
            <>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800"></div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Dashboard</Link>
              <Link to="/roadmap" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Roadmap</Link>
              <Link to="/missions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Daily Mission</Link>
              <Link to="/practice" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Code Practice</Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Projects</Link>
              <Link to="/hackathon" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Hackathon Mode</Link>
              <Link to="/mentorship" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Mentorship</Link>
              <Link to="/weekly-review" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-neutral-700 dark:text-neutral-300">Weekly Review</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

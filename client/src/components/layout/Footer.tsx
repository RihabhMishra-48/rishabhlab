import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#070A0F] border-t border-neutral-200 dark:border-neutral-800/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950">
            <div className="w-2.5 h-2.5 border-2 border-current rotate-45"></div>
          </div>
          <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
            Rishabh Labs
          </span>
          <span className="text-neutral-400">|</span>
          <span className="italic">"Don't just learn. Know what to do next."</span>
        </div>

        <div className="flex flex-wrap gap-6 text-neutral-600 dark:text-neutral-400 font-medium">
          <Link to="/" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Home</Link>
          <Link to="/features" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Philosophy</Link>
          <Link to="/college" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Colleges & Campuses</Link>
          <Link to="/hackathon" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Hackathon Mode</Link>
        </div>

        <div>
          © {new Date().getFullYear()} Rishabh Labs Inc. Built for engineering students.
        </div>
      </div>
    </footer>
  );
};

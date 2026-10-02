import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Hero3DVisual } from '../../components/common/IsometricPodium';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Compass,
  CheckCircle2,
  FolderGit2,
  Trophy,
  Users,
  ArrowRight,
  Play,
  Sparkles,
  Target,
  Code2,
  Terminal,
  Cpu,
  Clock,
  Flame,
  Check
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 transition-colors flex flex-col justify-between">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Personalized Learning + Student Execution Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
              Stop asking <br className="hidden sm:inline" />
              <span className="text-neutral-400 dark:text-neutral-500">“What should I learn?”</span> <br />
              Start knowing what to do next.
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Personalized roadmaps, daily missions, real projects and mentorship — all in one place. Built specifically for ambitious college students.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={user ? (user.isOnboarded ? "/dashboard" : "/onboarding") : "/onboarding"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-all shadow-md group"
              >
                <span>{user ? (user.isOnboarded ? "Go to Dashboard" : "Complete Onboarding") : "Build My Roadmap"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {!user ? (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 transition-colors shadow-2xs"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ) : (
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 transition-colors shadow-2xs"
                >
                  <span>Explore Lessons</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              )}

              <Link
                to="/features"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400" />
                <span>Explore</span>
              </Link>
            </div>

            {!user && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-neutral-900 dark:text-white underline underline-offset-4 hover:text-amber-500 transition-colors">
                  Sign in to your account →
                </Link>
              </p>
            )}

            {/* Micro stats banner */}
            <div className="pt-6 flex items-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Zero tutorial hell</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Daily Learn-Practice-Build-Ship</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Verified Proof of Work</span>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Composition */}
          <div className="lg:col-span-5 flex justify-center">
            <Hero3DVisual />
          </div>
        </div>

        {/* 5 Core Feature Pill-Cards Below Hero (Matching UI Reference Screen 1) */}
        <div className="mt-20 pt-10 border-t border-neutral-200/80 dark:border-neutral-800/80">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              to="/roadmap"
              className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">AI Roadmaps</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Personalized for you</p>
            </Link>

            <Link
              to="/missions"
              className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Daily Missions</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">What to do today</p>
            </Link>

            <Link
              to="/projects"
              className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Projects</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Build real skills</p>
            </Link>

            <Link
              to="/hackathon"
              className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Hackathon Mode</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Prepare & participate</p>
            </Link>

            <Link
              to="/mentorship"
              className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Mentorship</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Get help from experts</p>
            </Link>
          </div>
        </div>
      </section>

      {/* The Core Execution Engine Section */}
      <section className="py-20 bg-neutral-100/60 dark:bg-[#0B0F17] border-y border-neutral-200 dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              The Execution Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              From Goal to Execution in One Cohesive Loop
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Most platforms dump 100 hours of video lectures on you. Rishabh Labs translates your available time into structured daily missions.
            </p>
          </div>

          {/* Stepped Loop Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800/80 shadow-2xs space-y-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Learn</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Concise, database-driven lessons with interactive syntax sandboxes. Zero fluff or 40-minute monologues.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800/80 shadow-2xs space-y-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Practice</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                LeetCode-style editor with Monaco, sandboxed test cases, and "I'm Stuck" progressive AI hints that guide without spoiling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800/80 shadow-2xs space-y-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Build</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Milestone checklists in real repositories. Connect frontend to backend, write schemas, and build end-to-end features.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800/80 shadow-2xs space-y-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Ship</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Commit to GitHub and deploy live. Every completed mission adds tangible evidence to your verified Proof of Work.
              </p>
            </div>
          </div>

          {/* Banner CTA */}
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-bold">Ready to know what to do next?</h3>
              <p className="text-sm text-neutral-400">Complete the 2-minute diagnostic to receive your custom 90-day execution track.</p>
            </div>
            <Link
              to={user ? (user.isOnboarded ? "/dashboard" : "/onboarding") : "/onboarding"}
              className="px-6 py-3.5 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-sm transition-colors whitespace-nowrap shadow-md"
            >
              {user ? (user.isOnboarded ? "Go to Dashboard →" : "Complete Onboarding →") : "Start Free Onboarding →"}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  Code2,
  FolderGit2,
  Trophy,
  Users,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: 'AI Roadmaps',
      tagline: 'Living, adaptive progression rather than static checklists',
      description: 'Your roadmap adapts based on real-time task velocity, quiz scores, and code submissions. Never wonder what module comes next.',
      icon: Compass,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      actionUrl: '/roadmap',
    },
    {
      title: 'Daily Missions',
      tagline: 'Day 17 • Learn, Practice, Build, Ship',
      description: 'Every morning, the execution engine delivers a focused daily mission aligned with your available time budget.',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      actionUrl: '/missions',
    },
    {
      title: 'Integrated Learning Platform',
      tagline: 'Interactive lessons with zero fluff',
      description: 'Full tracks for Web Development, AI/ML, and Data Analytics. Try syntax directly in the embedded sandbox and verify understanding with quizzes.',
      icon: BookOpen,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      actionUrl: '/learn',
    },
    {
      title: 'Monaco Code Practice & Sandboxing',
      tagline: 'LeetCode-style editor with progressive AI hints',
      description: 'Run tests against public and hidden test cases. When stuck, get Level 1-4 progressive hints that teach algorithmic patterns without leaking complete answers.',
      icon: Code2,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      actionUrl: '/practice',
    },
    {
      title: 'Production Projects Workspace',
      tagline: 'Build real products, connect GitHub, deploy live',
      description: 'Interactive milestone checklists, required specs, and verification uploads. Turn code into tangible proof of work.',
      icon: FolderGit2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      actionUrl: '/projects',
    },
    {
      title: 'Hackathon Mode (SIH & InnovateX)',
      tagline: 'Turn 48-hour sprints into winning MVPs',
      description: 'Live countdowns, phase-by-phase deliverables, AI problem analyzers, tech stack recommendations, and pitch deck simulators.',
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      actionUrl: '/hackathon',
    },
    {
      title: '1:1 Expert Mentorship',
      tagline: 'Contextual guidance from industry engineers',
      description: 'Book sessions for career direction, code reviews, and hackathon strategy right when you hit a roadblock.',
      icon: Users,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      actionUrl: '/mentorship',
    },
    {
      title: 'Verified Proof of Work',
      tagline: 'Actual artifacts over hollow certificates',
      description: 'Your public developer profile showcases real GitHub commits, passing test suites, deployed projects, and peer reviews.',
      icon: ShieldCheck,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      actionUrl: '/profile',
    },
    {
      title: 'Weekly Adaptive Review',
      tagline: 'Continuous feedback loop that protects momentum',
      description: 'Compare planned vs completed hours every Sunday. Reflect on college exam blockers and let the engine calibrate your pacing.',
      icon: CalendarDays,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      actionUrl: '/weekly-review',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>The Full Platform Suite</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Built for Execution, Not Passive Video Watching
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Every feature in Rishabh Labs is designed to move you one step closer to building, shipping, and securing high-growth engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-xl ${f.bgColor} ${f.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{f.title}</h3>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">{f.tagline}</p>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    to={f.actionUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors"
                  >
                    <span>Explore feature</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

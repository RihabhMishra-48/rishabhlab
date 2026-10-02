import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Target, Compass, Code2, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Product Philosophy
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            “Don't just learn. <br />
            Know what to do next.”
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed pt-2">
            The engineering education landscape is saturated with 50-hour tutorial playlists and generic certificates that don't prove anything. Rishabh Labs exists to solve the single largest bottleneck facing college developers: <strong>execution paralysis</strong>.
          </p>
        </div>

        <div className="space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">The Real Problem</h2>
            <p>
              Students spend weeks watching others code on YouTube or scrolling roadmaps, but when they sit down to build a project, they get stuck. They wonder:
            </p>
            <blockquote className="border-l-2 border-neutral-900 dark:border-white pl-4 italic text-neutral-800 dark:text-neutral-200 my-4">
              "Am I ready to start a project? Which framework should I pick? What should I do today? Why isn't my code working?"
            </blockquote>
            <p>
              The result is tutorial hell: high effort, zero shipped code, and zero proof of work.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Our Core Formula</h2>
            <p>
              Rishabh Labs replaces endless playlists with a continuous daily feedback loop:
            </p>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-loose">
              Goal + Current Skill Level + Available Time + Deadline + Progress <br />
              <span className="text-blue-500 font-bold">↓</span> <br />
              Personalized Roadmap → Daily Mission → Learn → Practice → Build → Ship → Review → Adaptive Roadmap
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Verified Proof of Work</h2>
            <p>
              When a recruiter or hackathon judge visits a Rishabh Labs profile, they don't see a PDF certificate of attendance. They inspect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li>Verified GitHub commit history across active project repos.</li>
              <li>Pass rates on LeetCode-style algorithmic challenges and bug fixes.</li>
              <li>Live production deployments with automated health checks.</li>
              <li>Peer reviews and mentor evaluation logs.</li>
            </ul>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-neutral-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Start your execution journey today</h3>
            <p className="text-xs text-neutral-400 mt-1">Free for college learners. No credit card required.</p>
          </div>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-full bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-200 transition-colors"
          >
            Start Diagnostic →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

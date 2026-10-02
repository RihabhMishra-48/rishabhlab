import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PricingPlan } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const data = await api.getPricingPlans();
        setPlans(data);
      } catch {
        // Fallback default pricing
        setPlans([
          {
            _id: '1',
            key: 'free',
            name: 'Free',
            priceMonthly: 0,
            priceAnnual: 0,
            currency: '₹',
            tagline: 'Foundations for every ambitious college learner.',
            features: [
              'Initial skill diagnostic assessment',
              'Personalized 90-day learning roadmap',
              'Daily missions with streak tracking',
              'Core learning curriculum (HTML, CSS, JS)',
              'Basic coding sandbox & test runner',
              'Community forum & public portfolio',
            ],
          },
          {
            _id: '2',
            key: 'pro',
            name: 'Pro',
            priceMonthly: 799,
            priceAnnual: 6999,
            currency: '₹',
            tagline: 'Accelerate your skills, projects & hackathon wins.',
            isPopular: true,
            features: [
              'Everything in Free',
              'Adaptive AI personalization engine',
              'Complete project workspaces with GitHub sync',
              'Hackathon Mode with 48-hour MVP planner',
              'Full LeetCode-style multi-language compiler',
              'Debugging Lab ("Fix the Bug" challenges)',
              'Progressive AI hints ("I\'m Stuck")',
              'Verified public Proof of Work portfolio',
            ],
          },
          {
            _id: '3',
            key: 'mentorship',
            name: 'Mentorship',
            priceMonthly: 2499,
            priceAnnual: 22999,
            currency: '₹',
            tagline: '1:1 personalized coaching from senior tech engineers.',
            features: [
              'Everything in Pro',
              'Two 1:1 mentor sessions every month',
              'Architecture & codebase reviews',
              'Hackathon pitch deck & prototype teardown',
              'Direct resume & portfolio critique',
              'Mock technical interview preparation',
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadPricing();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Invest In Your Execution</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Transparent Pricing for Modern Builders
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Start for free, upgrade when you are ready to ship projects, prepare for hackathons, and review code with mentors.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3 text-xs font-semibold">
            <span className={!billingAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              className="relative w-12 h-6 rounded-full bg-neutral-300 dark:bg-neutral-800 p-0.5 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-blue-500 shadow-sm transition-transform ${
                  billingAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
            <span className={billingAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}>
              Annual <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold ml-1">Save 25%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p) => {
            const price = billingAnnual ? Math.round(p.priceAnnual / 12) : p.priceMonthly;

            return (
              <div
                key={p.key}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  p.isPopular
                    ? 'bg-white dark:bg-[#111722] border-2 border-neutral-950 dark:border-blue-500 shadow-xl'
                    : 'bg-white dark:bg-[#0D121B] border border-neutral-200 dark:border-neutral-800/80 shadow-xs'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-950 dark:bg-blue-600 text-white text-[11px] font-bold rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{p.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                      {p.currency}{price}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">/ month</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      What's Included:
                    </p>
                    <ul className="space-y-2.5">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    to="/onboarding"
                    className={`w-full py-3 rounded-full text-xs font-bold text-center block transition-all ${
                      p.isPopular
                        ? 'bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 shadow-md'
                        : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                    }`}
                  >
                    {p.priceMonthly === 0 ? 'Get Started Free' : `Choose ${p.name}`}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise / College Plan Callout */}
        <div className="p-8 rounded-2xl bg-neutral-100 dark:bg-[#111722] border border-neutral-200 dark:border-neutral-800 text-center max-w-2xl mx-auto space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Looking for Campus or University Partnerships?</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            We partner directly with institutions like GLA University to provide cohort-wide execution tracking, faculty dashboards, and hackathon incubation.
          </p>
          <Link to="/college" className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            View College Admin Demo →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

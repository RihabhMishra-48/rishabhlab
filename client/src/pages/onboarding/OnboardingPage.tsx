import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Code,
  Cpu,
  Smartphone,
  Shield,
  BarChart3,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Compass,
  Clock,
  Target,
  Calendar
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // If user is already onboarded, send them straight to the dashboard
  React.useEffect(() => {
    if (user && user.isOnboarded) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Form State
  const [goal, setGoal] = useState('Web Development');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [availableTime, setAvailableTime] = useState('2 hours/day');
  const [desiredOutcome, setDesiredOutcome] = useState('Build projects');
  const [targetDate, setTargetDate] = useState('90 days');
  const [githubProfile, setGithubProfile] = useState('');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('Hands-on Building');

  // "Not Sure Yet?" Assessment modal / view state
  const [showNotSureAssessment, setShowNotSureAssessment] = useState(false);
  const [assessmentInterests, setAssessmentInterests] = useState<string[]>(['Visual & Web', 'Problem Solving']);
  const [assessmentComfort, setAssessmentComfort] = useState('High');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goalOptions = [
    { id: 'Web Development', label: 'Web Development', icon: Code, desc: 'Full-stack apps, React, Node.js & APIs' },
    { id: 'AI / ML', label: 'AI / ML', icon: Cpu, desc: 'Python, Neural Networks, PyTorch & LLMs' },
    { id: 'App Development', label: 'App Development', icon: Smartphone, desc: 'Cross-platform mobile apps with React Native / Flutter' },
    { id: 'Cybersecurity', label: 'Cybersecurity', icon: Shield, desc: 'Network security, penetration testing & hardening' },
    { id: 'Data / Analytics', label: 'Data / Analytics', icon: BarChart3, desc: 'SQL, Pandas, ETL pipelines & visualization' },
    { id: 'Not Sure', label: 'Not Sure', icon: HelpCircle, desc: 'Take our 4-step diagnostic assessment' },
  ];

  const levelOptions = [
    { id: 'Complete Beginner', label: 'Complete Beginner', desc: 'No prior coding experience or just started syntax' },
    { id: 'Familiar', label: 'Familiar', desc: 'Know basic loops, variables and syntax, but have not built complete apps' },
    { id: 'Building', label: 'Building', desc: 'Have built a few small projects, seeking structure and architecture' },
    { id: 'Advanced', label: 'Advanced', desc: 'Comfortable with full-stack; targeting hackathons & placement readiness' },
  ];

  const timeOptions = [
    { id: '30 minutes/day', label: '30 minutes/day', desc: 'Steady incremental micro-progress' },
    { id: '1 hour/day', label: '1 hour/day', desc: 'Balanced collegiate pace alongside college classes' },
    { id: '2 hours/day', label: '2 hours/day', desc: 'Recommended standard for shipping production projects in 90 days' },
    { id: '3+ hours/day', label: '3+ hours/day', desc: 'Intensive sprint for immediate hackathons or upcoming placement season' },
  ];

  const outcomeOptions = [
    { id: 'Learn skills', label: 'Learn skills', desc: 'Deep algorithmic and language fundamentals' },
    { id: 'Build projects', label: 'Build projects', desc: 'Ship production-ready full-stack applications' },
    { id: 'Prepare for hackathons', label: 'Prepare for hackathons', desc: 'Sprint on MVP creation, pitch decks, and SIH challenges' },
    { id: 'Internship preparation', label: 'Internship preparation', desc: 'System design, LeetCode patterns, and proof of work' },
    { id: 'Placement preparation', label: 'Placement preparation', desc: 'Complete final-year technical campus placement mastery' },
  ];

  const handleNext = () => {
    if (goal === 'Not Sure' && currentStep === 1) {
      setShowNotSureAssessment(true);
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRunAssessment = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateNotSureAssessment({
        interests: assessmentInterests,
        comfortLevel: assessmentComfort,
        preferredWork: 'Visual & Interactive Web Products',
        timeAvailability: availableTime,
      });
      setAssessmentResult(res);
      setGoal(res.recommendedPath);
    } catch {
      setAssessmentResult({
        recommendedPath: 'Web Development',
        confidenceScore: 92,
        reasoning: 'Based on your interest in building visually engaging products and seeing instant feedback in the browser, Web Development is your fastest path to high-impact projects, hackathons, and software engineering internships.',
      });
      setGoal('Web Development');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Sync directly to Supabase profile if configured
      try {
        const { supabase, isSupabaseConfigured } = await import('../../services/supabase');
        if (isSupabaseConfigured && user?.id) {
          await supabase
            .from('profiles')
            .update({
              target_goal: goal,
              current_level: currentLevel,
              available_time: availableTime,
              desired_outcome: desiredOutcome,
              skills_completed: 0,
              total_points: 0,
              streak_days: 0,
            })
            .eq('id', user.id);
        }
      } catch (sbErr) {
        console.warn('Direct Supabase profile update error:', sbErr);
      }

      await api.completeOnboarding({
        goal,
        currentLevel,
        availableTime,
        desiredOutcome,
        targetDate,
        githubProfile,
        preferredLearningStyle,
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      await refreshUser();
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-8 transition-colors">
      {/* Top Header matching Screen 2 */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-xs">
            <div className="w-3 h-3 border-2 border-current rotate-45"></div>
          </div>
          <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">
            Rishabh Labs
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-neutral-500">
            Step {currentStep} of {totalSteps}
          </span>
          {/* Progress bar */}
          <div className="w-24 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        {/* "Not Sure Yet?" Assessment View (Screen 11) */}
        {showNotSureAssessment ? (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setShowNotSureAssessment(false)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to goal selection</span>
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Not Sure Yet?
              </h2>
              <p className="text-xs text-neutral-500">
                Take a short diagnostic assessment to find the best starting path for you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  1. What kind of problems do you find exciting?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Visual & Interactive Interfaces', 'Algorithms & Mathematical Logic', 'Data Trends & Insights', 'Security & System Hardening'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAssessmentInterests([item])}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        assessmentInterests.includes(item)
                          ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-850 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  2. Current comfort with college computer science subjects:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Beginner', 'Moderate', 'Confident'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAssessmentComfort(lvl)}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        assessmentComfort === lvl
                          ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-850 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {assessmentResult ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Recommended Starting Path ({assessmentResult.confidenceScore}% Match)
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {assessmentResult.recommendedPath}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {assessmentResult.reasoning}
                  </p>
                  <button
                    onClick={() => {
                      setGoal(assessmentResult.recommendedPath);
                      setShowNotSureAssessment(false);
                      setCurrentStep(2);
                    }}
                    className="w-full py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold"
                  >
                    Accept Path & Continue →
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleRunAssessment}
                  className="w-full py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEvaluating ? 'Evaluating your responses...' : 'Start Assessment →'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Goal (Screen 2 matching UI reference) */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Tell us about your goal
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Choose what you want to achieve. You can always change this later.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {goalOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = goal === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setGoal(opt.id);
                          if (opt.id === 'Not Sure') {
                            setShowNotSureAssessment(true);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-neutral-950 dark:border-white bg-neutral-50/80 dark:bg-[#111722] shadow-xs ring-1 ring-neutral-950 dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0D121B]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Current Level */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    What is your current skill level?
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    We calibrate your starting mission so you never feel bored or overwhelmed.
                  </p>
                </div>

                <div className="space-y-3">
                  {levelOptions.map((opt) => {
                    const isSelected = currentLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCurrentLevel(opt.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-neutral-950 dark:border-white bg-neutral-50/80 dark:bg-[#111722] shadow-xs ring-1 ring-neutral-950 dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0D121B]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Available Time */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    How much time can you dedicate daily?
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Realistic consistency beats erratic weekend cramming.
                  </p>
                </div>

                <div className="space-y-3">
                  {timeOptions.map((opt) => {
                    const isSelected = availableTime === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvailableTime(opt.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-neutral-950 dark:border-white bg-neutral-50/80 dark:bg-[#111722] shadow-xs ring-1 ring-neutral-950 dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0D121B]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                        </div>
                        {isSelected && <Clock className="w-4 h-4 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Desired Outcome */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    What is your primary desired outcome?
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    This determines whether your daily missions emphasize portfolio building, hackathon MVPs, or interview problems.
                  </p>
                </div>

                <div className="space-y-3">
                  {outcomeOptions.map((opt) => {
                    const isSelected = desiredOutcome === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDesiredOutcome(opt.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-neutral-950 dark:border-white bg-neutral-50/80 dark:bg-[#111722] shadow-xs ring-1 ring-neutral-950 dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0D121B]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                        </div>
                        {isSelected && <Target className="w-4 h-4 text-purple-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Target Deadline & GitHub Handle */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Target timeline & GitHub profile
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Connect your GitHub to track your commits and build your verified Proof of Work.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Target Completion Timeline
                    </label>
                    <select
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="60 days">60 Days (Sprint Pace)</option>
                      <option value="90 days">90 Days (Standard 1 Quarter)</option>
                      <option value="120 days">120 Days (Full Semester)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      GitHub Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={githubProfile}
                      onChange={(e) => setGithubProfile(e.target.value)}
                      placeholder="e.g. rishabh-labs"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Your public repositories and daily commits will sync into your developer profile.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Preferred Learning Style
                    </label>
                    <select
                      value={preferredLearningStyle}
                      onChange={(e) => setPreferredLearningStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                    >
                      <option value="Hands-on Building">Hands-on Building (Build features immediately)</option>
                      <option value="Algorithmic First">Algorithmic First (Deep computer science & data structures)</option>
                      <option value="Visual Project Sprints">Visual Project Sprints (UI/UX + Full-stack)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Action Bar matching Screen 2 */}
      {!showNotSureAssessment && (
        <footer className="max-w-3xl mx-auto w-full flex items-center justify-between py-4 border-t border-neutral-100 dark:border-neutral-800/80">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Choose your learning track to build your roadmap
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{currentStep === totalSteps ? (isSubmitting ? 'Generating Roadmap...' : 'Generate Roadmap →') : 'Next →'}</span>
          </button>
        </footer>
      )}
    </div>
  );
};

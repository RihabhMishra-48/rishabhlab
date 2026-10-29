import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  Target,
  Shield,
  Code,
  Cpu,
  Smartphone,
  Cloud,
  BarChart3,
  Check,
  Building2,
  Award
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();
  const { user, refreshUser, loading } = useAuth();

  // If unauthenticated, redirect to login; if privileged or already onboarded, redirect to appropriate workspace
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'mentor') {
        navigate('/mentor/sessions', { replace: true });
      } else if (user.role === 'college_admin') {
        navigate('/college', { replace: true });
      } else if (user.isOnboarded || user.role === 'super_admin' || user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Account role is default student for all learners
  const role = 'student';

  // Step 1: Field of Interest (The Primary Anchor)
  const [fieldOfInterest, setFieldOfInterest] = useState('Cybersecurity');

  // Step 2: Identity & Academic Background
  const [fullName, setFullName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year || '2nd Year (Sophomore)');
  const [campusPassCode, setCampusPassCode] = useState('');
  const [verifiedCollege, setVerifiedCollege] = useState<string | null>(
    localStorage.getItem('rishabhlabs_college_verified') || null
  );

  // Step 3: Experience Level & Learning Goals
  const [currentLevel, setCurrentLevel] = useState('Complete Beginner');
  const [availableTime, setAvailableTime] = useState('2 hours/day');
  const [desiredOutcome, setDesiredOutcome] = useState('Build projects');

  // Assessment Diagnostic Modal
  const [showNotSureAssessment, setShowNotSureAssessment] = useState(false);
  const [assessmentInterests, setAssessmentInterests] = useState<string[]>([
    'Security & Threat Defense (Ethical Hacking, Network Hardening)',
  ]);
  const [assessmentComfort, setAssessmentComfort] = useState('Beginner');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
    if (user?.college && !college) {
      setCollege(user.college);
    }
    if (user?.degree && !degree) {
      setDegree(user.degree);
    }
    if (user?.fieldOfInterest) {
      setFieldOfInterest(user.fieldOfInterest);
    }
  }, [user]);

  const interestOptions = [
    {
      id: 'Cybersecurity',
      label: 'Cybersecurity',
      icon: Shield,
      accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badge: 'High Demand',
      desc: 'Network defense, penetration testing, threat hunting & ethical security engineering.',
      skills: ['Wireshark', 'Burp Suite', 'Linux', 'Cryptography', 'SOC Analysis'],
    },
    {
      id: 'Web Development',
      label: 'Web Development',
      icon: Code,
      accent: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badge: 'Core Foundation',
      desc: 'Full-stack applications, modern React, Next.js, Node.js, databases & REST/GraphQL APIs.',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    },
    {
      id: 'AI / ML',
      label: 'AI & Machine Learning',
      icon: Cpu,
      accent: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badge: 'Cutting Edge',
      desc: 'Deep learning, neural networks, PyTorch, Large Language Models & intelligent agents.',
      skills: ['Python', 'PyTorch', 'LLMs', 'Scikit-Learn', 'Vector DBs'],
    },
    {
      id: 'App Development',
      label: 'Mobile App Development',
      icon: Smartphone,
      accent: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Mobile Standard',
      desc: 'Cross-platform native iOS & Android applications with Flutter, React Native & mobile SDKs.',
      skills: ['Flutter', 'React Native', 'Kotlin', 'Mobile UI/UX', 'Offline DB'],
    },
    {
      id: 'Cloud & DevOps',
      label: 'Cloud & DevOps',
      icon: Cloud,
      accent: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      badge: 'Infrastructure',
      desc: 'Containerization, Kubernetes, AWS/GCP, CI/CD pipelines & automated cloud deployment.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions', 'Terraform'],
    },
    {
      id: 'Data / Analytics',
      label: 'Data Science & Analytics',
      icon: BarChart3,
      accent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badge: 'Business Intel',
      desc: 'Data extraction, SQL mastery, ETL pipelines, Pandas analysis & executive visualization.',
      skills: ['SQL', 'Pandas', 'PowerBI', 'Data Pipelines', 'Statistics'],
    },
  ];

  const degreeOptions = [
    'B.Tech Computer Science',
    'BCA (Computer Applications)',
    'MCA (Master of Computer Apps)',
    'B.Tech Information Technology',
    'B.Tech AI & Data Science',
    'B.Sc Computer Science',
    'M.Tech Computer Science',
  ];

  const yearOptions = [
    '1st Year (Freshman)',
    '2nd Year (Sophomore)',
    '3rd Year (Junior)',
    '4th Year (Senior / Final)',
    'Recent Graduate',
  ];

  const levelOptions = [
    { id: 'Complete Beginner', label: 'Complete Beginner', desc: 'Starting from fundamental syntax and core concepts' },
    { id: 'Familiar', label: 'Familiar with Basics', desc: 'Know loops & syntax, ready to build structured applications' },
    { id: 'Building', label: 'Intermediate Builder', desc: 'Have built small projects, now targeting real-world architecture' },
    { id: 'Advanced', label: 'Advanced', desc: 'Comfortable with full engineering stacks, targeting placements & hackathons' },
  ];

  const timeOptions = [
    { id: '1 hour/day', label: '1 hour / day', desc: 'Consistent foundation & theory pace' },
    { id: '2 hours/day', label: '2 hours / day', desc: 'Recommended sprint velocity (Optimal)' },
    { id: '4+ hours/day', label: '4+ hours / day', desc: 'Intensive immersion & bootcamp focus' },
  ];

  const outcomeOptions = [
    { id: 'Build projects', label: 'Build Production Projects', desc: 'Ship real, verifiable full-stack applications with proof of work' },
    { id: 'Placement preparation', label: 'Placement & Job Preparation', desc: 'Technical campus placements, LeetCode patterns & mock interviews' },
    { id: 'Prepare for hackathons', label: 'Hackathons & SIH Competitions', desc: 'Sprint on MVP creation, system design & high-stakes problem statements' },
    { id: 'Learn skills', label: 'Deep Fundamentals & Research', desc: 'Comprehensive conceptual understanding and algorithmic mastery' },
  ];

  const handleNext = () => {
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

  const handleVerifyCampusPass = () => {
    const cleanCode = campusPassCode.trim();
    if (cleanCode === '123456') {
      const university = 'GLA University';
      setVerifiedCollege(university);
      setCollege(university);
      localStorage.setItem('rishabhlabs_college_verified', university);
    } else if (cleanCode) {
      alert('Invalid campus code. For testing, use demo code: 123456');
    }
  };

  const handleRunAssessment = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateNotSureAssessment({
        interests: assessmentInterests,
        comfortLevel: assessmentComfort,
        preferredWork: 'Security & Interactive Applications',
        timeAvailability: availableTime,
      });
      setAssessmentResult(res);
      setFieldOfInterest(res.recommendedPath || 'Cybersecurity');
    } catch {
      setAssessmentResult({
        recommendedPath: 'Cybersecurity',
        confidenceScore: 94,
        reasoning: 'Your responses emphasize defensive systems, structural problem solving, and resilient architecture. Cybersecurity provides immediate hands-on labs and elite career trajectories.',
      });
      setFieldOfInterest('Cybersecurity');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const userKey = user?.id || 'active';
      const effectiveUserRole = (user?.role && user.role !== 'student') ? user.role : 'student';
      localStorage.setItem(`rishabhlabs_onboarded_${userKey}`, 'true');
      localStorage.setItem(`rishabhlabs_goal_${userKey}`, fieldOfInterest);
      localStorage.setItem(`rishabhlabs_role_${userKey}`, effectiveUserRole);
      localStorage.setItem('rishabhlabs_onboarded', 'true');
      localStorage.setItem('rishabhlabs_goal', fieldOfInterest);
      localStorage.setItem('rishabhlabs_role', effectiveUserRole);
      localStorage.setItem('rishabhlabs_onboarding_date', new Date().toISOString());

      // 1. Sync to Supabase directly if configured
      try {
        const { supabase, isSupabaseConfigured } = await import('../../services/supabase');
        if (isSupabaseConfigured && user?.id) {
          const profilePayload: any = {
            full_name: fullName.trim() || user?.name || 'Engineer',
            role: effectiveUserRole,
            target_goal: fieldOfInterest,
            field_of_interest: fieldOfInterest,
            college_name: college.trim() ? college.trim() : null,
            degree: degree.trim() ? degree.trim() : null,
            year_of_study: yearOfStudy.trim() ? yearOfStudy.trim() : null,
            current_level: currentLevel,
            available_time: availableTime,
            desired_outcome: desiredOutcome,
            verification_status: 'approved',
            is_onboarded: true,
          };

          const { error: updateErr } = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', user.id);

          if (updateErr) {
            await supabase
              .from('profiles')
              .update({
                full_name: fullName.trim() || user?.name || 'Engineer',
                role: effectiveUserRole,
                target_goal: fieldOfInterest,
                college_name: college.trim() ? college.trim() : null,
                degree: degree.trim() ? degree.trim() : null,
                year_of_study: yearOfStudy.trim() ? yearOfStudy.trim() : null,
                current_level: currentLevel,
                available_time: availableTime,
                desired_outcome: desiredOutcome,
                is_onboarded: true,
              })
              .eq('id', user.id);
          }
        }
      } catch (sbErr) {
        console.warn('Supabase profile direct sync note:', sbErr);
      }

      // 2. Submit to Backend REST API
      try {
        await api.completeOnboarding({
          role: 'student',
          fieldOfInterest,
          goal: fieldOfInterest,
          name: fullName.trim(),
          college: college.trim(),
          degree: degree.trim(),
          year: yearOfStudy.trim(),
          currentLevel,
          availableTime,
          desiredOutcome,
        });
      } catch (apiErr) {
        console.warn('Backend onboarding API sync note:', apiErr);
      }

      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Onboarding finalization note:', err);
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-8 transition-colors select-none">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm">
            <div className="w-3.5 h-3.5 border-2 border-current rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white leading-none">
              RishabhLabs
            </span>
            <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
              Personalized Execution OS
            </span>
          </div>
        </div>

        {/* Multi-Step Platform Progress Line */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 whitespace-nowrap">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="w-16 xs:w-24 sm:w-32 h-2 flex items-center gap-1.5 shrink-0">
            {currentStep > 0 && (
              <div
                style={{ flex: currentStep }}
                className="h-full rounded-full bg-neutral-950 dark:bg-white transition-all duration-300"
              />
            )}
            {currentStep < totalSteps && (
              <div
                style={{ flex: totalSteps - currentStep }}
                className="h-full rounded-full bg-neutral-200 dark:bg-[#383d47] transition-all duration-300"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Wizard Form Body */}
      <main className="max-w-4xl mx-auto w-full my-auto py-6 sm:py-8">
        {showNotSureAssessment ? (
          /* Diagnostic Modal View */
          <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Domain Diagnostic
              </span>
              <button
                type="button"
                onClick={() => setShowNotSureAssessment(false)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Close Diagnostic
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Find Your Ideal Domain
              </h2>
              <p className="text-xs text-neutral-500">
                Answer these 2 questions to identify the best starting field of interest for you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  1. What problem space excites you most?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Security & Threat Defense (Ethical Hacking, Network Hardening)',
                    'Building Fast Interactive Products (Web & Full-Stack Apps)',
                    'Intelligent Systems & Neural Models (AI / Machine Learning)',
                    'Mobile & Device Architecture (iOS & Android Native Apps)',
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAssessmentInterests([item])}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        assessmentInterests.includes(item)
                          ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 font-semibold text-neutral-900 dark:text-white shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  2. Current comfort with programming languages & logical design:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Beginner', 'Moderate', 'Confident'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAssessmentComfort(lvl)}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        assessmentComfort === lvl
                          ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 font-semibold text-neutral-900 dark:text-white shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {assessmentResult ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Recommended: {assessmentResult.recommendedPath} ({assessmentResult.confidenceScore}% Match)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {assessmentResult.reasoning}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFieldOfInterest(assessmentResult.recommendedPath);
                      setShowNotSureAssessment(false);
                      setCurrentStep(2);
                    }}
                    className="w-full py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold"
                  >
                    Set as Primary Field & Continue →
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
                  <span>{isEvaluating ? 'Evaluating...' : 'Diagnose Best Field'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-4 sm:p-10 space-y-6 sm:space-y-8">
            {/* STEP 1: FIELD OF INTEREST (PRIMARY ANCHOR) */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Step 1 of 4 · Primary Track
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                      Select your primary field of interest
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500">
                      The entire platform — daily missions, coding labs, roadmap & mentor matching — adapts around this choice.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNotSureAssessment(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Not sure yet? Diagnostic</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {interestOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = fieldOfInterest === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFieldOfInterest(opt.id)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-colors flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-sm text-neutral-900 dark:text-white'
                            : 'bg-neutral-50/60 dark:bg-[#18181a]/80 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-[#202024]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${opt.accent}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                                {opt.label}
                              </h4>
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                              {opt.desc}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {opt.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-[9px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: IDENTITY & ACADEMIC BACKGROUND */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 2 of 4 · Academic Profile
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Tell us about your college and degree
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Customize your academic profile. Optional fields can be updated anytime in your profile settings.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rishabh Mishra"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      College / University
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology / GLA / BITS / SRM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['GLA University', 'IIT / NIT', 'State Technical University', 'Autonomous Institute'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCollege(c)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                            college === c
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-transparent font-medium'
                              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Course / Degree
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {degreeOptions.slice(0, 4).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDegree(d)}
                          className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                            degree === d
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-transparent font-medium'
                              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Current Year of Study
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {yearOptions.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYearOfStudy(y)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                            yearOfStudy === y
                              ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 font-semibold text-neutral-900 dark:text-white shadow-xs'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* College / Campus Pass Verification Card */}
                  <div className="mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1c] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">College / Campus Pass</p>
                          <p className="text-[11px] text-neutral-500">Have a partner campus code? (Demo code: 123456)</p>
                        </div>
                      </div>

                      {verifiedCollege && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={campusPassCode}
                        onChange={(e) => setCampusPassCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="w-36 px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono text-center outline-none focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCampusPass}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                      >
                        Verify Pass
                      </button>
                    </div>

                    {verifiedCollege && (
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        Campus pass unlocked: {verifiedCollege} partner curriculum & lab benefits applied.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE LEVEL, DAILY VELOCITY & PRIMARY TARGET */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 3 of 4 · Level & Velocity
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    What is your starting level and daily commitment?
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    This calibrates your daily roadmap tasks, coding challenges, and weekly milestone velocity.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Experience Level */}
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white mb-2 block">
                      1. Current Experience in {fieldOfInterest}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {levelOptions.map((opt) => {
                        const isSelected = currentLevel === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setCurrentLevel(opt.id)}
                            className={`cursor-pointer p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-xs text-neutral-900 dark:text-white font-semibold'
                                : 'bg-white/60 dark:bg-[#1a1a1c]/60 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#242427]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Commitment */}
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white mb-2 block">
                      2. Daily Time Commitment
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {timeOptions.map((opt) => {
                        const isSelected = availableTime === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setAvailableTime(opt.id)}
                            className={`cursor-pointer p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-xs text-neutral-900 dark:text-white font-semibold'
                                : 'bg-white/60 dark:bg-[#1a1a1c]/60 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#242427]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                              </div>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Goal */}
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white mb-2 block">
                      3. Primary Target Goal
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {outcomeOptions.map((opt) => {
                        const isSelected = desiredOutcome === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setDesiredOutcome(opt.id)}
                            className={`cursor-pointer p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-xs text-neutral-900 dark:text-white font-semibold'
                                : 'bg-white/60 dark:bg-[#1a1a1c]/60 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#242427]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                            </div>
                            {isSelected && <Target className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PERSONALIZED WORKSPACE INITIALIZATION */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 4 of 4 · Final Confirmation
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Personalizing your workspace
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Everything is prepared. Confirm your setup to generate your tailored track.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {fullName || user?.name || 'Engineer'}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {college ? `${college} · ` : ''}{degree || 'Student'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                        Student Account
                      </span>
                      {verifiedCollege && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          {verifiedCollege} Pass
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200/80 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block">Primary Track</span>
                      <span className="font-bold text-neutral-900 dark:text-white mt-0.5 block truncate">{fieldOfInterest}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200/80 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block">Experience Level</span>
                      <span className="font-bold text-neutral-900 dark:text-white mt-0.5 block truncate">{currentLevel}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200/80 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block">Daily Velocity</span>
                      <span className="font-bold text-neutral-900 dark:text-white mt-0.5 block truncate">{availableTime}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200/80 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block">Target Goal</span>
                      <span className="font-bold text-neutral-900 dark:text-white mt-0.5 block truncate">{desiredOutcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-4">
                {currentStep > 1 && currentStep < totalSteps && (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors hidden sm:inline-block"
                  >
                    Skip with defaults →
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                  className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></span>
                      Generating Track...
                    </span>
                  ) : currentStep === totalSteps ? (
                    <>
                      <span>Enter {fieldOfInterest} Track</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Continue to Step {currentStep + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4">
        <p className="text-[11px] text-neutral-400">
          RishabhLabs Platform · Dynamic Track OS · You can switch your primary track anytime in Profile settings.
        </p>
      </footer>
    </div>
  );
};

export default OnboardingPage;

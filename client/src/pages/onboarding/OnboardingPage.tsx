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
  GraduationCap,
  Briefcase,
  Shield,
  Code,
  Cpu,
  Smartphone,
  Cloud,
  BarChart3,
  Building2,
  Linkedin,
  FileCheck,
  Check,
  CheckCheck
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // If user is already onboarded, send them straight to dashboard
  useEffect(() => {
    if (user && user.isOnboarded) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Step 1: Role Selection ('student' or 'mentor')
  const [role, setRole] = useState<'student' | 'mentor'>('student');

  // Step 2: Field of Interest (The Primary Anchor)
  const [fieldOfInterest, setFieldOfInterest] = useState('Cybersecurity');

  // Step 3: Identity & Background
  const [fullName, setFullName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year || '');

  // Mentor-specific fields
  const [mentorOrg, setMentorOrg] = useState(user?.mentorOrganization || '');
  const [mentorExperience, setMentorExperience] = useState(user?.mentorExperienceYears || 2);
  const [mentorLinkedin, setMentorLinkedin] = useState(user?.mentorLinkedin || '');
  const [mentorBio, setMentorBio] = useState(user?.bio || '');

  // Step 4: Level & Target
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [availableTime, setAvailableTime] = useState('2 hours/day');
  const [desiredOutcome, setDesiredOutcome] = useState('Build projects');

  // Assessment Modal
  const [showNotSureAssessment, setShowNotSureAssessment] = useState(false);
  const [assessmentInterests, setAssessmentInterests] = useState<string[]>(['Security & Network Hardening']);
  const [assessmentComfort, setAssessmentComfort] = useState('Moderate');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
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
      localStorage.setItem(`rishabhlabs_onboarded_${userKey}`, 'true');
      localStorage.setItem(`rishabhlabs_goal_${userKey}`, fieldOfInterest);
      localStorage.setItem(`rishabhlabs_role_${userKey}`, role);
      localStorage.setItem('rishabhlabs_onboarded', 'true');
      localStorage.setItem('rishabhlabs_goal', fieldOfInterest);
      localStorage.setItem('rishabhlabs_role', role);

      // 1. Sync to Supabase directly if configured
      try {
        const { supabase, isSupabaseConfigured } = await import('../../services/supabase');
        if (isSupabaseConfigured && user?.id) {
          const profilePayload: any = {
            full_name: fullName.trim() || user?.name || 'Engineer',
            role,
            target_goal: fieldOfInterest,
            college_name: role === 'student' && college.trim() ? college.trim() : null,
            degree: role === 'student' && degree.trim() ? degree.trim() : null,
            year_of_study: role === 'student' && yearOfStudy.trim() ? yearOfStudy.trim() : null,
            current_level: currentLevel,
            available_time: availableTime,
            desired_outcome: desiredOutcome,
            verification_status: role === 'mentor' ? 'pending' : 'approved',
            mentor_organization: role === 'mentor' && mentorOrg.trim() ? mentorOrg.trim() : null,
            mentor_experience_years: role === 'mentor' ? Number(mentorExperience) : null,
            mentor_linkedin: role === 'mentor' && mentorLinkedin.trim() ? mentorLinkedin.trim() : null,
            is_onboarded: true,
          };

          const { error: updateErr } = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', user.id);

          // Fallback if extended migration columns are not yet cached
          if (updateErr) {
            await supabase
              .from('profiles')
              .update({
                full_name: fullName.trim() || user?.name || 'Engineer',
                role,
                target_goal: fieldOfInterest,
                college_name: role === 'student' && college.trim() ? college.trim() : null,
                degree: role === 'student' && degree.trim() ? degree.trim() : null,
                year_of_study: role === 'student' && yearOfStudy.trim() ? yearOfStudy.trim() : null,
                current_level: currentLevel,
                available_time: availableTime,
                desired_outcome: desiredOutcome,
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
          role,
          fieldOfInterest,
          goal: fieldOfInterest,
          name: fullName.trim(),
          college: role === 'student' ? college.trim() : '',
          degree: role === 'student' ? degree.trim() : '',
          year: role === 'student' ? yearOfStudy.trim() : '',
          currentLevel,
          availableTime,
          desiredOutcome,
          mentorOrganization: role === 'mentor' ? mentorOrg.trim() : '',
          mentorExperienceYears: role === 'mentor' ? Number(mentorExperience) : 0,
          mentorLinkedin: role === 'mentor' ? mentorLinkedin.trim() : '',
          mentorBio: role === 'mentor' ? mentorBio.trim() : '',
          mentorExpertise: [fieldOfInterest],
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

        {/* Multi-Step Platform Progress Line (Dual-Segment Pill Standard) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="w-24 sm:w-32 h-2 flex items-center gap-1.5">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6 animate-in fade-in">
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
                      setCurrentStep(3);
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
          <div className="bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-6 sm:p-10 space-y-8">
            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 1 of 5 · Account Role
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    How are you joining RishabhLabs?
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Select your primary profile. Students enjoy instant access; Mentors undergo advance verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Option */}
                  <div
                    onClick={() => setRole('student')}
                    className={`cursor-pointer p-6 rounded-2xl border transition-colors relative flex flex-col justify-between ${
                      role === 'student'
                        ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-sm text-neutral-900 dark:text-white'
                        : 'bg-neutral-50/60 dark:bg-[#18181a]/80 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-[#202024]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors ${
                        role === 'student'
                          ? 'bg-neutral-200/80 dark:bg-white/15 border-neutral-300/80 dark:border-white/20 text-neutral-900 dark:text-white'
                          : 'bg-neutral-100 dark:bg-[#202023] border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-bold transition-colors ${
                          role === 'student' ? 'text-neutral-950 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          I am a Student / Learner
                        </h3>
                        <p className={`text-xs mt-1 leading-relaxed transition-colors ${
                          role === 'student' ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          Master high-demand tech skills, complete daily execution missions, build verified production projects, and crack placement & hackathons.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span className={`flex items-center gap-1.5 font-medium transition-colors ${
                        role === 'student' ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Instant Full Access
                      </span>
                      {role === 'student' ? (
                        <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700" />
                      )}
                    </div>
                  </div>

                  {/* Teacher / Mentor Option */}
                  <div
                    onClick={() => setRole('mentor')}
                    className={`cursor-pointer p-6 rounded-2xl border transition-colors relative flex flex-col justify-between ${
                      role === 'mentor'
                        ? 'bg-neutral-100 dark:bg-white/[0.12] border-neutral-300 dark:border-white/20 shadow-sm text-neutral-900 dark:text-white'
                        : 'bg-neutral-50/60 dark:bg-[#18181a]/80 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-[#202024]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors ${
                        role === 'mentor'
                          ? 'bg-neutral-200/80 dark:bg-white/15 border-neutral-300/80 dark:border-white/20 text-neutral-900 dark:text-white'
                          : 'bg-neutral-100 dark:bg-[#202023] border-neutral-200/60 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400'
                      }`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base font-bold transition-colors ${
                          role === 'mentor' ? 'text-neutral-950 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          I am a Teacher / Mentor
                        </h3>
                        <p className={`text-xs mt-1 leading-relaxed transition-colors ${
                          role === 'mentor' ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          Guide aspiring student developers, conduct 1:1 code architecture reviews, host live mentorship hours, and share industry experience.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                      <span className={`flex items-center gap-1.5 font-medium transition-colors ${
                        role === 'mentor' ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        <FileCheck className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" /> Advance Verification Required
                      </span>
                      {role === 'mentor' ? (
                        <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FIELD OF INTEREST (PRIMARY ANCHOR) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Step 2 of 5 · Primary Focus
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
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                              {opt.label}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: IDENTITY & BACKGROUND (ADAPTIVE BASED ON ROLE) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 3 of 5 · {role === 'mentor' ? 'Mentor Credentials' : 'Academic Profile'}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {role === 'mentor' ? 'Your Professional Background' : 'Tell us about your college and degree'}
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    {role === 'mentor'
                      ? 'Mentors provide verified experience to guide students effectively.'
                      : 'Customize your academic profile. Optional fields can be updated anytime.'}
                  </p>
                </div>

                {role === 'student' ? (
                  /* Student Form */
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
                        placeholder="e.g. Indian Institute of Technology / BITS / SRM"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['IIT / NIT', 'State Technical University', 'Autonomous Institute', 'Deemed University'].map((c) => (
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
                  </div>
                ) : (
                  /* Mentor Form */
                  <div className="space-y-4 max-w-xl">
                    <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#222225] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2.5">
                      <FileCheck className="w-4 h-4 shrink-0 mt-0.5 text-neutral-400 dark:text-neutral-500" />
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white">Advance Verification Protocol:</span> Mentors undergo credential verification before their profile is marked as verified. You can access the platform and set up your availability right away.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Rishabh Mishra / Mentor"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Organization / College
                        </label>
                        <input
                          type="text"
                          value={mentorOrg}
                          onChange={(e) => setMentorOrg(e.target.value)}
                          placeholder="e.g. Microsoft / Tech Institute / Google"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          value={mentorExperience}
                          onChange={(e) => setMentorExperience(Number(e.target.value))}
                          min={1}
                          max={35}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                        <span>LinkedIn Profile URL (For Verification)</span>
                        <span className="text-[10px] text-neutral-400 font-normal">Required for Verification</span>
                      </label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={mentorLinkedin}
                          onChange={(e) => setMentorLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Short Bio / Specialization
                      </label>
                      <textarea
                        value={mentorBio}
                        onChange={(e) => setMentorBio(e.target.value)}
                        placeholder={`Senior ${fieldOfInterest} practitioner passionate about architecture reviews, security auditing, and student placements.`}
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: EXPERIENCE LEVEL & PRIMARY TARGET */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 4 of 5 · Level & Objectives
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    What is your starting level and target?
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    This calibrates your daily roadmap tasks, coding challenges, and weekly milestone velocity.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-900 dark:text-white mb-2 block">
                      Current Experience in {fieldOfInterest}
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

                  <div className="pt-2">
                    <label className="text-xs font-bold text-neutral-900 dark:text-white mb-2 block">
                      Primary Target Goal
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

            {/* STEP 5: REVIEW & PERSONALIZED WORKSPACE INITIALIZATION */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Step 5 of 5 · Final Confirmation
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
                          {role === 'mentor' ? mentorOrg : college} · {role === 'mentor' ? `${mentorExperience} yrs exp` : degree}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                        {role === 'mentor' ? 'Mentor Account' : 'Student Account'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-neutral-200/80 dark:border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block">Primary Domain</span>
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

                  {role === 'mentor' && (
                    <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#252528] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
                      <span className="font-bold text-neutral-900 dark:text-white">Verification Status:</span> Once submitted, your profile will be marked as &quot;Pending Verification&quot; while you explore the workspace and manage mentorship requests.
                    </div>
                  )}
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

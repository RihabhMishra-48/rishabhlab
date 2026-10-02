import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Lesson } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Play,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

export const LessonDetailPage: React.FC = () => {
  const { track, slug } = useParams<{ track: string; slug: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [prevLesson, setPrevLesson] = useState<any>(null);
  const [sandboxCode, setSandboxCode] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await api.getLessonBySlug(slug || 'javascript-array-methods');
        setLesson(data.lesson);
        setNextLesson(data.nextLesson);
        setPrevLesson(data.prevLesson);
        setModuleLessons(data.moduleLessons || []);
        if (data.lesson?.interactiveSandbox?.initialCode) {
          setSandboxCode(data.lesson.interactiveSandbox.initialCode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  const handleRunSandbox = () => {
    try {
      // Safe client-side execution for interactive sandbox demo
      let logs = '';
      const customConsole = {
        log: (...args: any[]) => {
          logs += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
        },
      };
      const runFn = new Function('console', sandboxCode);
      runFn(customConsole);
      setSandboxOutput(logs.trim() || 'Code executed successfully with zero output.');
    } catch (err: any) {
      setSandboxOutput('Error: ' + err.message);
    }
  };

  const handleResetSandbox = () => {
    if (lesson?.interactiveSandbox?.initialCode) {
      setSandboxCode(lesson.interactiveSandbox.initialCode);
      setSandboxOutput('');
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    try {
      await api.completeLesson(lesson.slug);
      setIsCompleted(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!lesson) return;
    try {
      const answersArray = (lesson.quiz || []).map((_, i) => quizAnswers[i]);
      const res = await api.submitQuiz(lesson.slug, answersArray);
      setQuizScore(res.score);
      if (res.passed) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading lesson workspace...</div>;
  }

  if (!lesson) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-neutral-500">Lesson not found.</p>
        <Link to="/learn" className="text-xs font-semibold text-blue-500 hover:underline">
          Back to Learn Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Learn Catalog</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{lesson.readTime}</span>
          </span>
          {isCompleted && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold">
              Completed ✓
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Architecture matching Section 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Course Navigation / Module Outline (3 cols) */}
        <div className="lg:col-span-3 space-y-4 sticky top-20">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Module Navigation
            </span>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              {lesson.moduleTitle}
            </h3>

            <div className="space-y-1.5 pt-2 text-xs max-h-[460px] overflow-y-auto pr-1">
              {moduleLessons.length > 0 ? (
                moduleLessons.map((m: any) => {
                  const isActive = m.slug === lesson.slug;
                  return (
                    <Link
                      key={m.slug}
                      to={`/learn/${m.track || track || 'cybersecurity'}/${m.slug}`}
                      className={`block p-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-70 shrink-0">
                          {String(m.order).padStart(2, '0')}.
                        </span>
                        <span className="truncate">{m.title}</span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold">
                  {lesson.order}. {lesson.title}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Lesson Content & Interactive Try It Yourself (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          {/* Overview Card */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {lesson.overview}
            </p>
          </div>

          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Key Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {lesson.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-6">
            {lesson.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {sec.heading}
                </h2>
                <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {sec.bodyMarkdown}
                </div>

                {sec.codeSnippet && (
                  <div className="rounded-2xl bg-neutral-950 dark:bg-black p-4 text-xs font-mono text-neutral-200 overflow-x-auto shadow-inner border border-neutral-800">
                    <pre>{sec.codeSnippet}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* "Try It Yourself" Embedded Code Sandbox (Matching Section 12) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Interactive Sandbox
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  Try It Yourself
                </h3>
              </div>
              <button
                onClick={handleResetSandbox}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              {lesson.interactiveSandbox?.instructions || 'Edit the code and click Run to see dynamic console output.'}
            </p>

            <textarea
              rows={7}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs focus:outline-hidden resize-none border border-neutral-800"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleRunSandbox}
                className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Sandbox</span>
              </button>
            </div>

            {sandboxOutput && (
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line">
                <span className="text-[10px] font-bold text-neutral-400 block mb-1 uppercase tracking-wider">Output:</span>
                {sandboxOutput}
              </div>
            )}
          </div>

          {/* Bottom Action Bar: Mark Complete & Next Lesson */}
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
            <button
              onClick={handleCompleteLesson}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
            </button>

            {nextLesson ? (
              <Link
                to={`/learn/${track || 'web-dev'}/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white hover:text-blue-500 transition-colors"
              >
                <span>Next Lesson: {nextLesson.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/practice/filter-active-users"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:underline"
              >
                <span>Start Practice Problems →</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Quiz & Progress Check (3 cols) */}
        <div className="lg:col-span-3 space-y-6 sticky top-20">
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Concept Check
                </span>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                  Quick Quiz
                </h3>
              </div>

              <div className="space-y-4">
                {lesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                          className={`w-full p-2.5 rounded-xl border text-left text-[11px] transition-colors ${
                            quizAnswers[qIdx] === optIdx
                              ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800 font-semibold'
                              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Verify Answers
                </button>

                {quizScore !== null && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    You scored {quizScore} / {lesson.quiz.length}!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

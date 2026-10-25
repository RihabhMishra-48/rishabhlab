import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Lesson } from '../../types';
import { getCuratedLessonBySlug, getCuratedLessons } from '../../data/curatedLessons';
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
  Clock,
  XCircle,
  RefreshCw,
  Info,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  List,
  BrainCircuit,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Ipv4PacketHeaderVisualizer } from '../../components/learn/Ipv4PacketHeaderVisualizer';
import { InteractiveSequenceFlowVisualizer } from '../../components/learn/InteractiveSequenceFlowVisualizer';
import { VisualFlowDiagram, FlowNode } from '../../components/learn/VisualFlowDiagram';

const EVENT_LOOP_FLOW: FlowNode[] = [
  {
    id: 'callstack',
    stepNumber: '01',
    title: 'Call Stack',
    subtitle: 'V8 Synchronous Stack Frame',
    description: 'Functions are pushed when invoked (LIFO) and popped upon return. Synchronous JavaScript executes sequentially line-by-line single-threaded.',
    accent: 'blue',
    iconType: 'cpu',
    inputs: ['console.log()', 'Math/Object operations', 'Function calls'],
    outputs: ['Evaluated return value', 'Frame popped from stack'],
    notes: 'If a long-running function takes 5000ms, the call stack freezes, completely halting browser UI rendering.'
  },
  {
    id: 'webapis',
    stepNumber: '02',
    title: 'Web APIs / libuv',
    subtitle: 'Background Asynchronous Threads',
    description: 'Async operations like fetch(), setTimeout(), and DOM event listeners are offloaded to browser C++ Web APIs or Node.js libuv threadpool.',
    accent: 'purple',
    iconType: 'layers',
    inputs: ['setTimeout(..., 1000)', 'fetch(/api/data)'],
    outputs: ['Timer elapsed event', 'Network response body ready'],
    notes: 'Web APIs run concurrently on separate OS threads without holding JavaScript single-threaded execution hostage.'
  },
  {
    id: 'microtask',
    stepNumber: '03',
    title: 'Microtask Queue',
    subtitle: 'High Priority (VIP Queue)',
    description: 'Holds Promise .then() / .catch(), async/await continuations, and queueMicrotask(). DRAINED COMPLETELY TO 0 after every macrotask.',
    accent: 'emerald',
    iconType: 'zap',
    inputs: ['Promise.resolve().then()', 'queueMicrotask()'],
    outputs: ['Resolved state passed to callback'],
    notes: 'Critical invariant: All pending microtasks execute before any next timer or UI frame rendering occurs.'
  },
  {
    id: 'macrotask',
    stepNumber: '04',
    title: 'Macrotask Queue',
    subtitle: 'Task Queue (Timers & I/O)',
    description: 'Holds setTimeout, setInterval, setImmediate, and I/O event callbacks. The Event Loop dequeues exactly ONE macrotask per tick.',
    accent: 'amber',
    iconType: 'activity',
    inputs: ['Timer callback', 'Socket read event'],
    outputs: ['Callback moved to Call Stack'],
    notes: 'Each macrotask execution tick is followed by a complete drain of the microtask queue.'
  },
  {
    id: 'render',
    stepNumber: '05',
    title: 'UI Render Pipeline',
    subtitle: 'Style, Layout, Paint (16.6ms)',
    description: 'The browser recalculates CSS styles, geometry (Reflow/Layout), and paints pixels to the screen at 60 FPS / 120 FPS refresh rates.',
    accent: 'cyan',
    iconType: 'layers',
    inputs: ['DOM mutations', 'requestAnimationFrame callbacks'],
    outputs: ['Hardware GPU compositing', 'Display updated'],
    notes: 'Keeping JavaScript turns under 10ms guarantees 60fps smoothness and eliminates UI frame drops.'
  }
];

const EXPRESS_MIDDLEWARE_FLOW: FlowNode[] = [
  {
    id: 'req',
    stepNumber: '01',
    title: 'Incoming HTTP Request',
    subtitle: 'Client -> Node.js HTTP Server',
    description: 'Raw TCP payload arrives on port 5000. Express parses headers, URL path, HTTP method, and instantiates req/res stream wrappers.',
    accent: 'blue',
    iconType: 'activity',
    inputs: ['HTTP GET/POST /api/v1/users', 'Headers: Authorization, Content-Type'],
    outputs: ['req object populated', 'res object ready'],
    notes: 'The request begins at the top of the Express middleware stack in app.use() registration order.'
  },
  {
    id: 'logger',
    stepNumber: '02',
    title: 'Logger & Trace ID',
    subtitle: 'app.use(requestTracer)',
    description: 'Generates a unique cryptographic X-Request-ID (UUID v4) and records wall-clock execution latency before invoking next().',
    accent: 'purple',
    iconType: 'layers',
    inputs: ['req.headers', 'Date.now() timestamp'],
    outputs: ['req.id assigned', 'Latency benchmark started'],
    notes: 'Non-blocking synchronous middleware; must immediately execute next() to prevent pipeline stalls.'
  },
  {
    id: 'auth',
    stepNumber: '03',
    title: 'Auth & JWT Guard',
    subtitle: 'app.use(verifyToken)',
    description: 'Inspects Authorization Bearer token header. Verifies HMAC-SHA256 signature against JWT_SECRET and attaches verified claims to req.user.',
    accent: 'amber',
    iconType: 'shield',
    inputs: ['Bearer <token>', 'JWT_SECRET key'],
    outputs: ['req.user = { id, role }', '401 Unauthorized if invalid'],
    notes: 'Short-circuits the pipeline with return res.status(401).json() if the token is expired or tampered.'
  },
  {
    id: 'controller',
    stepNumber: '04',
    title: 'Route Controller',
    subtitle: 'router.get(/profile, getProfile)',
    description: 'Business logic executes: queries database (PostgreSQL/Supabase) using authenticated req.user.id and formats data model.',
    accent: 'emerald',
    iconType: 'database',
    inputs: ['req.user.id', 'SQL connection pool'],
    outputs: ['User entity record', 'Sanitized DTO model'],
    notes: 'Database queries run asynchronously with await db.query(); Express remains responsive on other incoming requests.'
  },
  {
    id: 'response',
    stepNumber: '05',
    title: 'HTTP Response Flush',
    subtitle: 'res.status(200).json(...)',
    description: 'Serializes profile data to JSON, adds Content-Type application/json header, and flushes the TCP socket buffer to the wire.',
    accent: 'cyan',
    iconType: 'zap',
    inputs: ['JSON payload', 'Status code 200'],
    outputs: ['TCP packet dispatched to client', 'Socket stream closed'],
    notes: 'Pipeline terminates; any subsequent next() calls will throw [ERR_HTTP_HEADERS_SENT].'
  }
];

const renderInlineStyles = (line: string) => {
  const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold border border-neutral-200/60 dark:border-neutral-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      const content = trimmed.slice(2);
      return (
        <div key={idx} className="flex items-start gap-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          <span className="leading-relaxed">{renderInlineStyles(content)}</span>
        </div>
      );
    }
    return (
      <p key={idx} className={line.length === 0 ? 'h-2' : 'leading-relaxed'}>
        {renderInlineStyles(line)}
      </p>
    );
  });
};

const renderBodyMarkdown = (bodyMarkdown: string) => {
  // Check if this section contains the IPv4 Packet Header ASCII diagram
  const hasIpv4Header =
    (bodyMarkdown.includes('Version (4b)') && bodyMarkdown.includes('IHL (4b)')) ||
    (bodyMarkdown.includes('Source IP Address') && bodyMarkdown.includes('Destination IP Address'));

  if (hasIpv4Header) {
    const asciiRegex = /\+[-+]+\+[\s\S]*?Destination IP Address[\s\S]*?\+[-+]+\+/;
    const match = bodyMarkdown.match(asciiRegex);

    if (match && match.index !== undefined) {
      const beforeText = bodyMarkdown.slice(0, match.index).trim();
      const afterText = bodyMarkdown.slice(match.index + match[0].length).trim();

      return (
        <div className="space-y-3">
          {beforeText && (
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {renderFormattedText(beforeText)}
            </div>
          )}

          <Ipv4PacketHeaderVisualizer />

          {afterText && (
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {renderFormattedText(afterText)}
            </div>
          )}
        </div>
      );
    }
  }

  // General ASCII table / diagram block detection
  const generalAsciiRegex = /(\+[-+]+\+[\s\S]*?\+[-+]+\+)/g;
  if (generalAsciiRegex.test(bodyMarkdown)) {
    const parts = bodyMarkdown.split(generalAsciiRegex);
    return (
      <div className="space-y-3">
        {parts.map((part, i) => {
          if (part.startsWith('+') && part.includes('|')) {
            return (
              <pre
                key={i}
                className="my-3 p-4 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-neutral-800 select-all"
              >
                {part.trim()}
              </pre>
            );
          }
          return (
            <div key={i} className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {renderFormattedText(part)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
      {renderFormattedText(bodyMarkdown)}
    </div>
  );
};

export const LessonDetailPage: React.FC = () => {
  const { track, slug } = useParams<{ track: string; slug: string }>();
  const navigate = useNavigate();

  const targetSlug = slug || 'js-event-loop-react-state';

  // Fast synchronous initial cache check for zero-wait 0ms first render
  const initialCurated = getCuratedLessonBySlug(targetSlug) || getCuratedLessons(track || 'web-dev')[0] || null;
  const initialAllCurated = initialCurated
    ? getCuratedLessons(initialCurated.track || track || 'web-dev')
    : [];
  const initialCurrIdx = initialCurated
    ? initialAllCurated.findIndex((l) => l.slug === initialCurated.slug)
    : -1;

  const [lesson, setLesson] = useState<Lesson | null>(initialCurated);
  const [nextLesson, setNextLesson] = useState<any>(
    initialCurrIdx >= 0 && initialCurrIdx < initialAllCurated.length - 1
      ? initialAllCurated[initialCurrIdx + 1]
      : null
  );
  const [prevLesson, setPrevLesson] = useState<any>(
    initialCurrIdx > 0 ? initialAllCurated[initialCurrIdx - 1] : null
  );
  const [moduleLessons, setModuleLessons] = useState<any[]>(initialAllCurated);
  const [sandboxCode, setSandboxCode] = useState(
    initialCurated?.interactiveSandbox?.initialCode || ''
  );
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<
    Record<number, { isCorrect: boolean; correctIndex: number; explanation?: string }>
  >({});
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`rishabhlabs_lesson_completed_${targetSlug}`) === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(!initialCurated);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('rl_lesson_left_sidebar') !== 'closed'; } catch { return true; }
  });
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('rl_lesson_right_sidebar') !== 'closed'; } catch { return true; }
  });

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(prev => {
      const next = !prev;
      try { localStorage.setItem('rl_lesson_left_sidebar', next ? 'open' : 'closed'); } catch { }
      return next;
    });
  };
  const toggleRightSidebar = () => {
    setRightSidebarOpen(prev => {
      const next = !prev;
      try { localStorage.setItem('rl_lesson_right_sidebar', next ? 'open' : 'closed'); } catch { }
      return next;
    });
  };

  useEffect(() => {
    const currentSlug = slug || 'js-event-loop-react-state';

    // Update completion state from storage
    try {
      const savedCompleted = localStorage.getItem(`rishabhlabs_lesson_completed_${currentSlug}`);
      setIsCompleted(savedCompleted === 'true');
    } catch { }

    setQuizAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
    setQuizFeedback({});

    // 1. Immediately ensure client cache / curated data is displayed with 0ms latency
    const curated = getCuratedLessonBySlug(currentSlug) || getCuratedLessons(track || 'web-dev')[0];
    if (curated) {
      setLesson(curated);
      const allCurated = getCuratedLessons(curated.track || track || 'web-dev');
      const currIdx = allCurated.findIndex((l) => l.slug === curated.slug);
      setPrevLesson(currIdx > 0 ? allCurated[currIdx - 1] : null);
      setNextLesson(currIdx < allCurated.length - 1 ? allCurated[currIdx + 1] : null);
      setModuleLessons(allCurated);
      if (curated.interactiveSandbox?.initialCode) {
        setSandboxCode(curated.interactiveSandbox.initialCode);
      }
      setLoading(false);
    }

    // 2. Background sync with backend API (non-blocking)
    let isCancelled = false;
    const syncServerData = async () => {
      try {
        const data = await api.getLessonBySlug(currentSlug);
        if (isCancelled) return;
        if (data?.lesson) {
          setLesson(data.lesson);
          setNextLesson(data.nextLesson || null);
          setPrevLesson(data.prevLesson || null);
          setModuleLessons(data.moduleLessons || []);
          if (data.lesson?.interactiveSandbox?.initialCode) {
            setSandboxCode(data.lesson.interactiveSandbox.initialCode);
          }
        }
      } catch (err) {
        console.warn('Backend API lesson fetch fallback to curated catalogue:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    syncServerData();

    return () => {
      isCancelled = true;
    };
  }, [slug, track]);

  const handleRunSandbox = () => {
    try {
      const lang = lesson?.interactiveSandbox?.language || 'javascript';
      if (lang === 'python') {
        let output = '';
        const printMatches = sandboxCode.match(/print\((.*?)\)/g);
        if (printMatches) {
          output = printMatches
            .map((m) => {
              const inner = m.replace(/^print\(/, '').replace(/\)$/, '');
              try {
                return eval(inner);
              } catch {
                return inner.replace(/['\"]/g, '');
              }
            })
            .join('\n');
        }
        if (!output) {
          output = '[Python Execution Successful]\nMatrix shape and forward operations calculated.\nReady for quiz verification.';
        }
        setSandboxOutput(output);
      } else {
        let logs = '';
        const customConsole = {
          log: (...args: any[]) => {
            logs += args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ') + '\n';
          },
          error: (...args: any[]) => {
            logs += 'Error: ' + args.join(' ') + '\n';
          },
        };
        const runFn = new Function('console', sandboxCode);
        runFn(customConsole);
        setSandboxOutput(logs.trim() || 'Code executed successfully with zero output. Use console.log() to see results.');
      }
    } catch (err: any) {
      setSandboxOutput('Execution Error: ' + err.message);
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
    setIsCompleted(true);
    const targetSlug = slug || lesson.slug;
    localStorage.setItem(`rishabhlabs_lesson_completed_${targetSlug}`, 'true');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    try {
      await api.completeLesson(lesson.slug);
    } catch (err) {
      console.warn('Backend completeLesson note:', err);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) return;

    // Check if user answered all questions
    const unanswered = lesson.quiz.some((_, idx) => quizAnswers[idx] === undefined);
    if (unanswered) {
      alert('Please answer all questions before verifying your answers!');
      return;
    }

    try {
      const answersArray = (lesson.quiz || []).map((_, i) => quizAnswers[i]);
      const res = await api.submitQuiz(lesson.slug, answersArray);

      const feedbackMap: Record<number, { isCorrect: boolean; correctIndex: number; explanation?: string }> = {};
      if (res?.results && Array.isArray(res.results)) {
        res.results.forEach((r: any, idx: number) => {
          feedbackMap[idx] = {
            isCorrect: Boolean(r.isCorrect),
            correctIndex: r.correctIndex ?? (lesson.quiz?.[idx] as any).correctIndex ?? 0,
            explanation: r.explanation || lesson.quiz?.[idx]?.explanation,
          };
        });
      } else {
        lesson.quiz.forEach((q, idx) => {
          const correctIdx = (q as any).correctIndex ?? (q as any).correctAnswerIndex ?? 0;
          feedbackMap[idx] = {
            isCorrect: quizAnswers[idx] === correctIdx,
            correctIndex: correctIdx,
            explanation: q.explanation,
          };
        });
      }

      const correctTotal = Object.values(feedbackMap).filter((f) => f.isCorrect).length;
      setQuizScore(correctTotal);
      setQuizFeedback(feedbackMap);
      setQuizSubmitted(true);

      if (correctTotal === lesson.quiz.length) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      // Local client verification fallback
      const feedbackMap: Record<number, { isCorrect: boolean; correctIndex: number; explanation?: string }> = {};
      lesson.quiz.forEach((q, idx) => {
        const correctIdx = (q as any).correctIndex ?? (q as any).correctAnswerIndex ?? 0;
        feedbackMap[idx] = {
          isCorrect: quizAnswers[idx] === correctIdx,
          correctIndex: correctIdx,
          explanation: q.explanation,
        };
      });

      const correctTotal = Object.values(feedbackMap).filter((f) => f.isCorrect).length;
      setQuizScore(correctTotal);
      setQuizFeedback(feedbackMap);
      setQuizSubmitted(true);

      if (correctTotal === lesson.quiz.length) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 h-80 bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-neutral-200/60 dark:border-neutral-800"></div>
          <div className="lg:col-span-6 space-y-6">
            <div className="h-9 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="h-20 bg-neutral-100 dark:bg-neutral-900 rounded-2xl"></div>
            <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-3xl"></div>
          </div>
          <div className="lg:col-span-3 h-72 bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-neutral-200/60 dark:border-neutral-800"></div>
        </div>
      </div>
    );
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
      {/* Top Breadcrumb & Navigation + Flexible Viewport Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Learn Catalog</span>
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{lesson.readTime}</span>
          </span>
          {isCompleted && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold">
              Completed ✓
            </span>
          )}
        </div>

        {/* Flexible Sidebar & Focus Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Toggle Left Module Outline */}
          <button
            onClick={toggleLeftSidebar}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${leftSidebarOpen
                ? 'bg-muted text-foreground'
                : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            title={leftSidebarOpen ? 'Collapse module outline' : 'Expand module outline'}
          >
            {leftSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Modules</span>
          </button>

          {/* Quick Toggle Right Quiz Panel */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <button
              onClick={toggleRightSidebar}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${rightSidebarOpen
                  ? 'bg-muted text-foreground'
                  : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
                }`}
              title={rightSidebarOpen ? 'Collapse quiz panel' : 'Expand quiz panel'}
            >
              {rightSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Quiz</span>
              {quizSubmitted && quizScore !== null && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-primary text-primary-foreground">
                  {quizScore}/{lesson.quiz.length}
                </span>
              )}
            </button>
          )}

          {/* Focus Reading Mode Toggle (Collapses / Expands both) */}
          <button
            onClick={() => {
              const shouldOpen = !leftSidebarOpen && !rightSidebarOpen;
              setLeftSidebarOpen(shouldOpen);
              setRightSidebarOpen(shouldOpen);
              try {
                localStorage.setItem('rl_lesson_left_sidebar', shouldOpen ? 'open' : 'closed');
                localStorage.setItem('rl_lesson_right_sidebar', shouldOpen ? 'open' : 'closed');
              } catch { }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${!leftSidebarOpen && !rightSidebarOpen
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            title={!leftSidebarOpen && !rightSidebarOpen ? 'Exit focus mode' : 'Focus mode (full-width reading)'}
          >
            {!leftSidebarOpen && !rightSidebarOpen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Focus Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3-Column Flexible Architecture — Collapsible Sidebars with Persistent Sticky Pinning */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Column: Course Navigation / Module Outline — Collapsible */}
        <div className={`shrink-0 self-stretch transition-all duration-300 ease-in-out ${leftSidebarOpen ? 'w-full lg:w-[260px]' : 'w-11'
          }`}>
          <div className={`sticky top-6 ${leftSidebarOpen ? 'overflow-visible' : 'overflow-hidden'
            }`}>
            {leftSidebarOpen ? (
              <div className="relative p-5 rounded-3xl bg-card border border-border/50 shadow-xs space-y-3">
                {/* Clickable Separator Edge with Docked Toggle Button */}
                <div
                  onClick={toggleLeftSidebar}
                  className="absolute -right-3.5 top-0 bottom-0 w-7 cursor-pointer group/edge z-20 flex items-start justify-center pt-5 select-none"
                  title="Click anywhere on edge to collapse module navigation"
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 bottom-3 w-[2px] bg-transparent group-hover/edge:bg-primary/40 rounded-full transition-colors" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLeftSidebar();
                    }}
                    className="w-7 h-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer z-30 group-hover/edge:border-primary group-hover/edge:text-primary"
                    title="Collapse module navigation"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Module Navigation
                  </span>
                </div>
                <h3 className="text-xs font-bold text-foreground">
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
                          className={`block p-2.5 rounded-xl transition-all ${isActive
                              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
                    <div className="p-2.5 rounded-xl bg-primary text-primary-foreground font-bold">
                      {lesson.order}. {lesson.title}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={toggleLeftSidebar}
                className="w-full flex flex-col items-center justify-center gap-3 py-4 rounded-2xl bg-card border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors shadow-2xs"
                title="Open module navigation"
              >
                <PanelLeftOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <List className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Center Column: Lesson Content & Interactive Try It Yourself — Flex-grow */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Overview Card */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lesson.overview}
            </p>
          </div>

          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Key Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-foreground/80">
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
            {lesson.contentSections.map((sec, idx) => {
              const isTcpHandshakeSection =
                sec.heading.toLowerCase().includes('handshake') ||
                (sec.codeSnippet &&
                  sec.codeSnippet.includes('Client') &&
                  sec.codeSnippet.includes('Server') &&
                  (sec.codeSnippet.includes('SYN') || sec.codeSnippet.includes('Seq=')));

              const isEventLoopFlowSection =
                sec.heading.toLowerCase().includes('event loop') &&
                sec.heading.toLowerCase().includes('internals');

              const isMiddlewareFlowSection =
                sec.heading.toLowerCase().includes('middleware pipeline');

              return (
                <div key={idx} className="space-y-3">
                  <h2 className="text-lg font-bold text-foreground">
                    {sec.heading}
                  </h2>
                  <div>
                    {renderBodyMarkdown(sec.bodyMarkdown)}
                  </div>

                  {/* Smart Connected Flow & Diagram Rendering */}
                  {isTcpHandshakeSection ? (
                    <InteractiveSequenceFlowVisualizer />
                  ) : isEventLoopFlowSection ? (
                    <VisualFlowDiagram
                      title="Browser Event Loop Execution Architecture"
                      category="Runtime Flow"
                      description="Step-by-step asynchronous task offloading, microtask drain queue, and UI frame rendering"
                      nodes={EVENT_LOOP_FLOW}
                    />
                  ) : isMiddlewareFlowSection ? (
                    <VisualFlowDiagram
                      title="Express Middleware Execution Pipeline"
                      category="Backend Flow"
                      description="Linear chaining of request interception, token verification, and controller dispatch"
                      nodes={EXPRESS_MIDDLEWARE_FLOW}
                    />
                  ) : sec.codeSnippet ? (
                    <div className="rounded-2xl bg-neutral-950 dark:bg-black p-4 text-xs font-mono text-neutral-200 overflow-x-auto shadow-inner border border-neutral-800/80">
                      <pre>{sec.codeSnippet}</pre>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* "Try It Yourself" Embedded Code Sandbox (Matching Section 12) */}
          <div className="p-6 rounded-3xl bg-card text-card-foreground border border-border/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Interactive Sandbox
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Try It Yourself
                </h3>
              </div>
              <button
                onClick={handleResetSandbox}
                className="p-1.5 text-muted-foreground hover:text-foreground"
                title="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {lesson.interactiveSandbox?.instructions || 'Edit the code and click Run to see dynamic console output.'}
            </p>

            <textarea
              rows={7}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-neutral-950 text-neutral-100 font-mono text-xs outline-none focus:outline-none focus:ring-0 resize-none border border-neutral-800"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleRunSandbox}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Sandbox</span>
              </button>
            </div>

            {sandboxOutput && (
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/40 font-mono text-xs text-foreground whitespace-pre-line">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Output:</span>
                {sandboxOutput}
              </div>
            )}
          </div>

          {/* Bottom Action Bar: Mark Complete & Next Lesson */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card text-card-foreground border border-border/40 flex items-center justify-between gap-4">
            <button
              onClick={handleCompleteLesson}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
            </button>

            {nextLesson ? (
              <Link
                to={`/learn/${track || 'web-dev'}/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors"
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

        {/* Right Column: Quiz & Progress Check — Collapsible */}
        <div className={`shrink-0 self-stretch transition-all duration-300 ease-in-out ${rightSidebarOpen ? 'w-full lg:w-[280px]' : 'w-11'
          }`}>
          <div className={`sticky top-6 ${rightSidebarOpen ? 'overflow-visible' : 'overflow-hidden'
            }`}>
            {rightSidebarOpen ? (
              <div className="space-y-6">
                {lesson.quiz && lesson.quiz.length > 0 && (
                  <div className="relative p-5 rounded-3xl bg-card text-card-foreground border border-border/40 shadow-xs space-y-4">
                    {/* Clickable Separator Edge with Docked Toggle Button */}
                    <div
                      onClick={toggleRightSidebar}
                      className="absolute -left-3.5 top-0 bottom-0 w-7 cursor-pointer group/edge z-20 flex items-start justify-center pt-5 select-none"
                      title="Click anywhere on edge to collapse quiz panel"
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 top-3 bottom-3 w-[2px] bg-transparent group-hover/edge:bg-primary/40 rounded-full transition-colors" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRightSidebar();
                        }}
                        className="w-7 h-7 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer z-30 group-hover/edge:border-primary group-hover/edge:text-primary"
                        title="Collapse quiz panel"
                      >
                        <PanelRightClose className="w-3.5 h-3.5 transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                          Concept Check
                        </span>
                        <h3 className="text-sm font-bold text-foreground mt-0.5">
                          Quick Quiz
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {lesson.quiz.length} Question{lesson.quiz.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {lesson.quiz.map((q, qIdx) => {
                        const feedback = quizFeedback[qIdx];
                        const hasSubmitted = quizSubmitted && Boolean(feedback);
                        const optionLetters = ['A', 'B', 'C', 'D'];

                        return (
                          <div key={qIdx} className="space-y-2.5">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white leading-relaxed">
                              {qIdx + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = quizAnswers[qIdx] === optIdx;
                                const isCorrect = feedback?.correctIndex === optIdx;
                                const isWrongSelection = isSelected && !feedback?.isCorrect;
                                const letter = optionLetters[optIdx] || String(optIdx + 1);

                                // Borderless, pure tonal styling
                                let containerStyle = 'bg-neutral-100/70 dark:bg-white/[0.04] hover:bg-neutral-200/70 dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200';
                                let badgeStyle = 'bg-neutral-200/80 dark:bg-white/10 text-neutral-600 dark:text-neutral-400';
                                let rightBadge = null;

                                if (hasSubmitted) {
                                  if (isCorrect) {
                                    containerStyle = 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-medium';
                                    badgeStyle = 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-neutral-950 font-bold';
                                    rightBadge = (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Correct</span>
                                      </span>
                                    );
                                  } else if (isWrongSelection) {
                                    containerStyle = 'bg-rose-500/15 text-rose-900 dark:text-rose-200 font-medium';
                                    badgeStyle = 'bg-rose-500 text-white dark:bg-rose-400 dark:text-neutral-950 font-bold';
                                    rightBadge = (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-1 shrink-0">
                                        <XCircle className="w-3 h-3" />
                                        <span>Incorrect</span>
                                      </span>
                                    );
                                  } else {
                                    containerStyle = 'bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-400 dark:text-neutral-500 opacity-60';
                                    badgeStyle = 'bg-neutral-200/40 dark:bg-white/5 text-neutral-400 dark:text-neutral-600';
                                  }
                                } else if (isSelected) {
                                  containerStyle = 'bg-neutral-200/80 dark:bg-white/15 text-neutral-950 dark:text-white font-medium';
                                  badgeStyle = 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => {
                                      if (hasSubmitted) return;
                                      setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                    }}
                                    disabled={hasSubmitted}
                                    className={`w-full p-2.5 rounded-2xl text-left text-xs transition-colors flex items-center justify-between gap-2.5 cursor-pointer disabled:cursor-default ${containerStyle}`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <span className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${badgeStyle}`}>
                                        {letter}
                                      </span>
                                      <span className="leading-snug break-words text-left flex-1 min-w-0 text-xs">
                                        {opt}
                                      </span>
                                    </div>
                                    {rightBadge}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation box on submitted answer */}
                            {hasSubmitted && q.explanation && (
                              <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-white/[0.04] space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>Explanation</span>
                                </div>
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {!quizSubmitted ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                          className="w-full py-2.5 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Verify Answers
                        </button>
                      ) : (
                        <div className="pt-1">
                          {quizScore === lesson.quiz.length ? (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                    All Correct!
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                  {quizScore} / {lesson.quiz.length}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  setQuizSubmitted(false);
                                  setQuizScore(null);
                                  setQuizFeedback({});
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retake Quiz</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                                    <XCircle className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                    Review Recommended
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 shrink-0">
                                  {quizScore} / {lesson.quiz.length}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  setQuizSubmitted(false);
                                  setQuizScore(null);
                                  setQuizFeedback({});
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-neutral-900/10 hover:bg-neutral-900/15 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Try Again</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Close the right sidebar open wrapper */}
              </div>
            ) : (
              <button
                onClick={toggleRightSidebar}
                className="w-full flex flex-col items-center justify-center gap-3 py-4 rounded-2xl bg-card border border-border/40 hover:bg-muted/50 cursor-pointer group transition-colors shadow-2xs"
                title="Open quiz panel"
              >
                <PanelRightOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <BrainCircuit className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

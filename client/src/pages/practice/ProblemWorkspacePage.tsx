import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { CodingProblem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Play,
  Send,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Terminal,
  Bug,
  ChevronDown
} from 'lucide-react';

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDarkMode } = useAuth();

  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Execution state
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'output'>('testcases');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [executionSummary, setExecutionSummary] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);

  // Progressive "I'm Stuck" Hints (Level 1, 2, 3, 4)
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState<1 | 2 | 3 | 4>(1);
  const [activeHintData, setActiveHintData] = useState<any>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await api.getProblemBySlug(slug || 'filter-active-users');
        setProblem(data);
        if (data.starterCode?.[selectedLanguage]) {
          setCode(data.starterCode[selectedLanguage]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // When language switches, update code if untouched
  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'cpp' | 'java') => {
    setSelectedLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setActiveBottomTab('output');
    try {
      const res = await api.runCode(problem.id, code, selectedLanguage);
      setExecutionStatus(res.status);
      setExecutionSummary(res.summaryMessage);
      setTestResults(res.testResults || []);
      setConsoleOutput(
        res.testResults?.map((t: any) => `Test ${t.testCaseId}: ${t.passed ? 'PASSED' : 'FAILED'} -> Output: ${t.actualOutput}`).join('\n') || ''
      );
      if (res.status === 'Accepted') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      setExecutionStatus('Runtime Error');
      setExecutionSummary(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setActiveBottomTab('output');
    try {
      const res = await api.submitCode(problem.id, code, selectedLanguage);
      setExecutionStatus(res.status);
      setExecutionSummary(res.summaryMessage);
      setTestResults(res.testResults || []);
      if (res.status === 'Accepted') {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setExecutionStatus('Runtime Error');
      setExecutionSummary(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchHint = async (level: 1 | 2 | 3 | 4) => {
    if (!problem) return;
    setCurrentHintLevel(level);
    setLoadingHint(true);
    try {
      const res = await api.getCodeHint(problem.title, level, code);
      setActiveHintData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHint(false);
    }
  };

  const openHintModal = () => {
    setHintModalOpen(true);
    handleFetchHint(1);
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading code editor workspace...</div>;
  }

  if (!problem) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-neutral-500">Problem not found.</p>
        <Link to="/practice" className="text-xs font-semibold text-blue-500 hover:underline">
          Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 overflow-hidden">
      {/* Top Workspace Header Bar */}
      <header className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B0F17] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/practice"
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-xs">
            {problem.title}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-500/10 text-emerald-500'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Progressive Hint Button ("I'm Stuck") */}
          <button
            onClick={openHintModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>I'm Stuck</span>
          </button>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e: any) => handleLanguageChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
          >
            <option value="javascript">JavaScript (Node 20)</option>
            <option value="python">Python 3.11</option>
            <option value="cpp">C++ (GCC 12)</option>
            <option value="java">Java 17</option>
          </select>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Problem Spec (5 cols), Right Monaco Editor + Test Cases (7 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Problem Statement & Examples (5 cols) */}
        <div className="lg:col-span-5 h-full overflow-y-auto border-r border-neutral-200 dark:border-neutral-800 p-6 space-y-6 bg-white dark:bg-[#0B0F17]">
          {problem.isDebuggingChallenge && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Bug className="w-4 h-4" />
                <span>Fix the Bug Challenge</span>
              </div>
              <p>{problem.brokenBugExplanation}</p>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Description
            </h2>
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {problem.descriptionMarkdown}
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Examples
            </h3>
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1.5"
              >
                <div>
                  <span className="text-neutral-400">Input: </span>
                  <span className="text-neutral-800 dark:text-neutral-200">{ex.input}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Output: </span>
                  <span className="text-emerald-500 font-bold">{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className="text-[11px] text-neutral-500 pt-1 font-sans">
                    Explanation: {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Constraints
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Monaco Editor (Top) & Test Case Runner (Bottom) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-neutral-900">
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[320px]">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Bottom Execution Panel (LeetCode Style) */}
          <div className="h-72 border-t border-neutral-700 bg-[#0E121A] text-neutral-200 flex flex-col overflow-hidden">
            {/* Tab Header Bar */}
            <div className="h-10 px-4 border-b border-neutral-800 bg-[#0A0D14] flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBottomTab('testcases')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    activeBottomTab === 'testcases'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Testcase</span>
                </button>
                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    activeBottomTab === 'output'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>Test Result</span>
                  {testResults.length > 0 && (
                    <span className={`w-2 h-2 rounded-full ${executionStatus === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  )}
                </button>
              </div>

              {executionStatus && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold font-mono text-xs px-2.5 py-0.5 rounded-md ${
                        executionStatus === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {executionStatus}
                    </span>
                    {executionSummary && (
                      <span className="text-[11px] text-neutral-400 font-mono">{executionSummary}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-4">
              {activeBottomTab === 'testcases' ? (
                /* Pre-execution Testcases View */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {problem.publicTestCases?.map((tc, idx) => (
                      <button
                        key={tc.testCaseId || idx}
                        onClick={() => setSelectedTestCaseIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors ${
                          selectedTestCaseIdx === idx
                            ? 'bg-neutral-800 text-white border border-neutral-700'
                            : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.publicTestCases?.[selectedTestCaseIdx] && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                          Input =
                        </label>
                        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-xs">
                          {problem.publicTestCases[selectedTestCaseIdx].input}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                          Expected Output =
                        </label>
                        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono text-xs">
                          {problem.publicTestCases[selectedTestCaseIdx].expectedOutput}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Post-execution Results View (LeetCode style) */
                <div className="space-y-4">
                  {testResults.length === 0 ? (
                    <div className="text-neutral-500 text-xs py-6 text-center space-y-2">
                      <p>You must run your code first to see execution results.</p>
                      <button
                        onClick={handleRunCode}
                        className="px-4 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-sans font-semibold hover:bg-neutral-700"
                      >
                        Run Code Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Case Pills with Pass/Fail status */}
                      <div className="flex items-center gap-2">
                        {testResults.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIdx(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors flex items-center gap-1.5 ${
                              selectedTestCaseIdx === idx
                                ? 'bg-neutral-800 text-white border border-neutral-700'
                                : 'bg-neutral-900/60 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${tc.passed ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span>Case {idx + 1}</span>
                          </button>
                        ))}
                      </div>

                      {/* Selected Case Inspection */}
                      {testResults[selectedTestCaseIdx] && (
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                            <span className="font-sans font-bold flex items-center gap-1.5">
                              {testResults[selectedTestCaseIdx].passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              )}
                              <span className={testResults[selectedTestCaseIdx].passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {testResults[selectedTestCaseIdx].passed ? 'Passed' : 'Wrong Answer'}
                              </span>
                            </span>
                            <span className="text-neutral-400 text-[11px]">
                              {testResults[selectedTestCaseIdx].runtimeMs ? `${testResults[selectedTestCaseIdx].runtimeMs} ms` : '12 ms'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-neutral-400 font-sans text-[11px] block mb-0.5">Input:</span>
                              <div className="p-2.5 rounded-lg bg-neutral-950 text-neutral-200">
                                {testResults[selectedTestCaseIdx].input}
                              </div>
                            </div>

                            <div>
                              <span className="text-neutral-400 font-sans text-[11px] block mb-0.5">Actual Output:</span>
                              <div className={`p-2.5 rounded-lg bg-neutral-950 ${testResults[selectedTestCaseIdx].passed ? 'text-emerald-400' : 'text-rose-400 font-bold'}`}>
                                {testResults[selectedTestCaseIdx].actualOutput || '(no return value)'}
                              </div>
                            </div>

                            {testResults[selectedTestCaseIdx].expectedOutput && (
                              <div>
                                <span className="text-neutral-400 font-sans text-[11px] block mb-0.5">Expected Output:</span>
                                <div className="p-2.5 rounded-lg bg-neutral-950 text-emerald-400">
                                  {testResults[selectedTestCaseIdx].expectedOutput}
                                </div>
                              </div>
                            )}

                            {testResults[selectedTestCaseIdx].stdout && (
                              <div>
                                <span className="text-neutral-400 font-sans text-[11px] block mb-0.5">Stdout:</span>
                                <div className="p-2.5 rounded-lg bg-neutral-950 text-neutral-300 whitespace-pre-wrap">
                                  {testResults[selectedTestCaseIdx].stdout}
                                </div>
                              </div>
                            )}

                            {testResults[selectedTestCaseIdx].error && (
                              <div>
                                <span className="text-rose-400 font-sans text-[11px] block mb-0.5">Error:</span>
                                <div className="p-2.5 rounded-lg bg-rose-950/40 text-rose-300 whitespace-pre-wrap">
                                  {testResults[selectedTestCaseIdx].error}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progressive AI "I'm Stuck" Hint Modal (Matching Section 15) */}
      {hintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#111722] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Progressive AI Learning Assistant
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                "I'm Stuck" — Step-by-Step Guidance
              </h3>
              <p className="text-xs text-neutral-500">
                We guide your thinking without spoiling the answer so you build genuine problem-solving muscles.
              </p>
            </div>

            {/* Level Selector Pills */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleFetchHint(lvl as any)}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    currentHintLevel === lvl
                      ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>

            {/* Hint Content Display */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 min-h-[100px] flex items-center">
              {loadingHint ? (
                <div className="text-xs text-neutral-400 animate-pulse w-full text-center">
                  Synthesizing Level {currentHintLevel} conceptual guidance...
                </div>
              ) : (
                <div className="space-y-2 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {activeHintData?.title || `Level ${currentHintLevel}`}
                  </p>
                  <p>{activeHintData?.hint || 'Review the problem constraints and edge cases.'}</p>
                  {activeHintData?.recommendBooking && (
                    <div className="pt-2">
                      <Link
                        to="/mentorship"
                        onClick={() => setHintModalOpen(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs"
                      >
                        <span>Book 15-min Review Session →</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-neutral-400">
                {currentHintLevel < 4 ? 'Need more help? Try the next level.' : 'Final tier reached.'}
              </span>
              <button
                onClick={() => setHintModalOpen(false)}
                className="px-5 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

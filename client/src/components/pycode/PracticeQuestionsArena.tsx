import React, { useState, useEffect, useMemo } from 'react';
import { pycodeService } from '../../services/pycodeService';
import { pycodeCache } from '../../services/pycodeCache';
import { PracticeQuestion, QuestionCategory } from '../../types/pycode';
import {
  Search,
  Filter,
  Play,
  Eye,
  X,
  Code2,
  ExternalLink,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface QuestionReviewModalProps {
  question: PracticeQuestion | null;
  onClose: () => void;
}

const cleanPyCodeHtml = (html: string): string => {
  if (!html) return '';
  return html
    // Escape isolated comparison markers that might trip up HTML parsers
    .replace(/<(\d+)/g, '&lt;$1')
    .trim();
};

export const QuestionReviewModal: React.FC<QuestionReviewModalProps> = ({ question, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!question) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, onClose]);

  if (!question) return null;

  const handleCopyStarter = () => {
    if (!question.starter_code) return;
    navigator.clipboard.writeText(question.starter_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sandboxUrl =
    question.start_url ||
    question.practice_url ||
    `https://pycode-student.vercel.app/practice/${question.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#18181b] border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-[#1f1f23]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* PyCode Brand Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4704B]/10 text-[#D4704B] border border-[#D4704B]/20">
              <div className="w-3.5 h-3.5 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[7px] shrink-0">
                &gt;_
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                PYCODE
              </span>
            </div>

            {/* Category */}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {question.category_name || question.category}
            </span>

            {/* Difficulty Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                question.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : question.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  question.difficulty === 'easy'
                    ? 'bg-emerald-500'
                    : question.difficulty === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              {question.difficulty}
            </span>

            {/* Points */}
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60">
              {question.points} Pts
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Title & Metadata */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-snug">
              {question.title}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              PyCode Python Sandbox Problem #{question.id}
            </p>
          </div>

          {/* Formatted Problem Statement Content */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1f1f23] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
            <div
              className="pycode-review-content"
              dangerouslySetInnerHTML={{ __html: cleanPyCodeHtml(question.description) }}
            />
          </div>

          {/* Starter Code Section (if available) */}
          {question.starter_code && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>solution.py (Starter Code Template)</span>
                </span>
                <button
                  onClick={handleCopyStarter}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f0f11] dark:bg-[#0c0c0e] text-emerald-400 dark:text-emerald-300 font-mono text-xs overflow-x-auto border border-neutral-800 shadow-inner select-all leading-relaxed">
                <pre><code>{question.starter_code}</code></pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-[#1f1f23]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <a
            href={sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Practice in Live Python Sandbox</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_CATEGORIES: QuestionCategory[] = [
  { id: 'python-ifelse', name: '1. If / Else & Decision Making', description: 'Conditionals, nested decisions, logical operators, and threshold testing', total_questions: 16 },
  { id: 'python-loops', name: '2. Loops & Math Logic', description: 'For/while iterations, primes, Fibonacci, and number properties', total_questions: 29 },
  { id: 'python-patterns', name: '3. Pattern Printing', description: 'Nested loops generating stars, numbers, and character grids', total_questions: 22 },
  { id: 'python-strings', name: '4. String Methods & Algorithms', description: 'Slicing, splits, joins, substring indexing, and string algorithms', total_questions: 22 },
  { id: 'python-lists-arrays', name: '5. Lists & Array Algorithms', description: 'List comprehensions, rotation, chunking, binary search, sorting, two-pointer techniques', total_questions: 40 },
  { id: 'python-dicts', name: '6. Dictionaries & Sets', description: 'Frequency count, hash maps, key-value lookup operations', total_questions: 8 },
  { id: 'python-oop', name: '7. OOP, Lambdas & Exceptions', description: 'Classes, encapsulation, inheritance, property decorators, dunders, custom errors', total_questions: 14 },
  { id: 'numpy', name: '8. NumPy Scientific Computing', description: 'N-dimensional arrays, mathematical vectorization, matrix transformations', total_questions: 2 },
  { id: 'pandas', name: '9. Pandas Data Science & Analysis', description: 'DataFrames, null handling, indexing, group-by, merging, filtering datasets', total_questions: 120 },
  { id: 'matplotlib-seaborn', name: '10. Matplotlib & Seaborn Visuals', description: 'Bar plots, line charts, scatter plots, canvas styling, and distributions', total_questions: 6 }
];

export const PracticeQuestionsArena: React.FC = () => {
  const [categories, setCategories] = useState<QuestionCategory[]>(() => {
    const cached = pycodeCache.getQuestions('all_all_all_');
    return cached?.categories && cached.categories.length > 0 ? cached.categories : DEFAULT_CATEGORIES;
  });

  // Master questions pool containing all PyCode questions for zero-latency local filtering
  const [allPyCodeQuestions, setAllPyCodeQuestions] = useState<PracticeQuestion[]>(() => {
    const cached = pycodeCache.getQuestions('all_all_all_');
    return cached?.questions || [];
  });

  const [loading, setLoading] = useState(() => {
    const cached = pycodeCache.getQuestions('all_all_all_');
    return !cached || !cached.questions || cached.questions.length === 0;
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal state
  const [reviewingQuestion, setReviewingQuestion] = useState<PracticeQuestion | null>(null);

  // Fetch PyCode Questions from API / Cache on mount and background revalidate
  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      try {
        const res = await pycodeService.fetchQuestions({ limit: 300 });
        if (!isMounted) return;

        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
        if (res.questions && res.questions.length > 0) {
          setAllPyCodeQuestions(res.questions);
        }
      } catch (err) {
        console.warn('PyCode questions load note:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter questions based on selected category, difficulty & live search
  const filteredQuestions = useMemo(() => {
    let pool: PracticeQuestion[] = allPyCodeQuestions;

    // Apply category filter
    if (selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      pool = pool.filter((q) => {
        if (!q.category) return false;
        const qCat = q.category.toLowerCase();
        return (
          q.category === selectedCategory ||
          qCat === catLower ||
          (catLower === 'numpy' && qCat.includes('numpy')) ||
          (catLower === 'pandas' && qCat.includes('pandas')) ||
          (catLower.includes('matplotlib') && (qCat.includes('matplotlib') || qCat.includes('seaborn')))
        );
      });
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      pool = pool.filter((q) => q.difficulty === selectedDifficulty);
    }

    // Apply live search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      pool = pool.filter((q) => {
        const inTitle = q.title?.toLowerCase().includes(query);
        const inDesc = q.description?.toLowerCase().includes(query);
        const inCategory = q.category_name?.toLowerCase().includes(query);
        return inTitle || inDesc || inCategory;
      });
    }

    return pool;
  }, [allPyCodeQuestions, selectedCategory, selectedDifficulty, searchQuery]);

  const totalProblemCount = categories.reduce((acc, c) => acc + (c.total_questions || 0), 0) || allPyCodeQuestions.length || 280;

  return (
    <div className="space-y-6">
      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200/80 dark:bg-[#1a1a1e] dark:hover:bg-[#25252a] text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Problems</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            selectedCategory === 'all'
              ? 'bg-white/20 dark:bg-neutral-900/20'
              : 'bg-neutral-200/80 dark:bg-neutral-800'
          }`}>
            {totalProblemCount}
          </span>
        </button>

        {/* PyCode Upstream Python Categories */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200/80 dark:bg-[#1a1a1e] dark:hover:bg-[#25252a] text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <span>{cat.name}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              selectedCategory === cat.id
                ? 'bg-white/20 dark:bg-neutral-900/20'
                : 'bg-neutral-200/80 dark:bg-neutral-800'
            }`}>
              {cat.total_questions}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search problems by name or concept (e.g., primes, fibonacci, palindrome, dataframe)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-[13px] bg-neutral-50 dark:bg-[#222226] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hidden md:inline">
            Showing <span className="font-bold font-mono text-neutral-900 dark:text-neutral-200">{filteredQuestions.length}</span> problems
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Difficulty:</span>
            </span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-50 dark:bg-[#222226] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer transition-all"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Row-wise Table / List (Matching Coding Sandbox & Practice) */}
      <div className="bg-white dark:bg-[#1a1a1e] rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs overflow-hidden">
        {loading && filteredQuestions.length === 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="space-y-2">
                    <div className="w-48 h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="w-24 h-3 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="w-24 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Code2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No questions found</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Try adjusting your search query or selecting a different category from the filter tabs above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {filteredQuestions.map((question) => {
              const sandboxUrl =
                question.start_url ||
                question.practice_url ||
                `https://pycode-student.vercel.app/practice/${question.id}`;

              const isEasy = question.difficulty === 'easy';
              const isMedium = question.difficulty === 'medium';

              return (
                <div
                  key={question.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 dark:hover:bg-[#25252a] transition-colors group"
                >
                  {/* Left: Terminal Icon + Title & Category */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#25252a] border border-neutral-200/70 dark:border-neutral-700/70 flex items-center justify-center shrink-0">
                      <div className="w-5 h-5 rounded-md bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[9px] shadow-2xs">
                        &gt;_
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {question.title}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-[#D4704B]/10 text-[#D4704B] border border-[#D4704B]/20">
                          PYCODE
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-xs">
                          {question.category_name || question.category}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                          {question.points} Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Difficulty badge + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 capitalize ${
                        isEasy
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                          : isMedium
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
                      }`}
                    >
                      {question.difficulty}
                    </span>

                    <button
                      onClick={() => setReviewingQuestion(question)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="hidden md:inline">Review Problem</span>
                      <span className="md:hidden">Review</span>
                    </button>

                    <a
                      href={sandboxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start in Sandbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <QuestionReviewModal
        question={reviewingQuestion}
        onClose={() => setReviewingQuestion(null)}
      />
    </div>
  );
};

export default PracticeQuestionsArena;

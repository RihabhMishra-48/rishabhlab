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
                  <Code2 className="w-4 h-4 text-[#D4704B]" />
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
            className="px-5 py-2.5 rounded-xl bg-[#D4704B] hover:bg-[#c2613d] active:bg-[#b05332] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
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
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-[13px] bg-neutral-50 dark:bg-[#222226] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4704B]/20 focus:border-[#D4704B] transition-all"
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
              className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-50 dark:bg-[#222226] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#D4704B]/20 cursor-pointer transition-all"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {loading && filteredQuestions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/80 dark:border-neutral-800/80 animate-pulse space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-28 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="w-16 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="w-3/4 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="w-1/2 h-4 rounded bg-neutral-100 dark:bg-neutral-800/60" />
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex justify-between">
                <div className="w-24 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                <div className="w-28 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
          <Code2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No questions found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query or selecting a different category from the filter tabs above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filteredQuestions.map((question) => {
            const sandboxUrl =
              question.start_url ||
              question.practice_url ||
              `https://pycode-student.vercel.app/practice/${question.id}`;

            return (
              <div
                key={question.id}
                className="group p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:border-[#D4704B]/50 dark:hover:border-[#D4704B]/40 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header: PyCode Logo + Category + Difficulty + Points */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                      <div className="w-4 h-4 rounded-full bg-[#D4704B] flex items-center justify-center text-white font-mono font-bold text-[8px] shrink-0">
                        &gt;_
                      </div>
                      <span className="text-[11px] font-bold text-[#D4704B] uppercase tracking-wide shrink-0">
                        PYCODE
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700 font-bold">·</span>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                        {question.category_name || question.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          question.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : question.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
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

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60">
                        {question.points} Pts
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] sm:text-base font-bold text-neutral-900 dark:text-neutral-50 leading-snug tracking-tight group-hover:text-[#D4704B] dark:group-hover:text-[#E28866] transition-colors line-clamp-2">
                    {question.title}
                  </h3>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80">
                  <button
                    onClick={() => setReviewingQuestion(question)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Review Problem</span>
                  </button>

                  <a
                    href={sandboxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4704B] hover:bg-[#c2613d] active:bg-[#b05332] text-white flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start in Sandbox</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <QuestionReviewModal
        question={reviewingQuestion}
        onClose={() => setReviewingQuestion(null)}
      />
    </div>
  );
};

export default PracticeQuestionsArena;

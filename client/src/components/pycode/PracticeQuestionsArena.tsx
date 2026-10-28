import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { pycodeService } from '../../services/pycodeService';
import { pycodeCache } from '../../services/pycodeCache';
import { PracticeQuestion, QuestionCategory } from '../../types/pycode';
import { CURATED_PROBLEMS } from '../../data/curatedProblems';
import {
  Search,
  Filter,
  Play,
  Eye,
  X,
  Code2,
  ExternalLink,
  Tag,
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';

interface QuestionReviewModalProps {
  question: PracticeQuestion | null;
  onClose: () => void;
}

export const QuestionReviewModal: React.FC<QuestionReviewModalProps> = ({ question, onClose }) => {
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

  const isCurated = question.source === 'curated';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#202020]">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                question.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : question.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {question.difficulty}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {question.category_name || question.category}
            </span>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              {question.points} Pts
            </span>
            {isCurated ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                RishabhLabs Lab
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PyCode Sandbox
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Problem Statement & Rendered HTML */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              {question.title}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {isCurated ? 'RishabhLabs Engineering Challenge' : 'PyCode Python Sandbox Problem'} #{question.id}
            </p>
          </div>

          {/* Formatted HTML Description */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/80 dark:border-neutral-800/80 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed space-y-3 prose dark:prose-invert max-w-none">
            <div
              className="pycode-description whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          </div>

          {/* Starter Code Preview */}
          {question.starter_code && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-500" />
                Starter Template Preview
              </span>
              <div className="p-4 rounded-2xl bg-[#111111] text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
                <pre><code>{question.starter_code}</code></pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#202020]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>

          {isCurated && question.slug ? (
            <Link
              to={`/practice/problem/${question.slug}`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Open in Full IDE Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <a
              href={question.start_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Practice in Live Python Sandbox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
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
  { id: 'python-basics', name: '3. Pattern Printing & Basics', description: 'Fundamental algorithm logic and triangular patterns', total_questions: 1 },
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

  // 1. Transform RishabhLabs 53 Curated Problems into PracticeQuestion format
  const curatedQuestions: PracticeQuestion[] = useMemo(() => {
    return CURATED_PROBLEMS.map((p) => {
      const diffLower = (p.difficulty?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard';
      const pts = diffLower === 'easy' ? 20 : diffLower === 'medium' ? 40 : 80;
      const catSlug = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general';

      return {
        id: p.id,
        title: p.title,
        difficulty: diffLower,
        points: pts,
        category: catSlug,
        category_name: p.category,
        category_description: `RishabhLabs Engineering Challenge · ${p.category}`,
        description: `${p.descriptionMarkdown}${
          p.constraints?.length
            ? `\n\n**Constraints:**\n${p.constraints.map((c) => `- ${c}`).join('\n')}`
            : ''
        }`,
        starter_code: p.starterCode?.python || p.starterCode?.javascript || '',
        start_url: `/practice/problem/${p.slug}`,
        source: 'curated',
        slug: p.slug,
      };
    });
  }, []);

  // 2. Fetch PyCode Questions from API / Cache on mount and background revalidate
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

  // 3. Combine both collections based on selected category & difficulty
  const combinedQuestions = useMemo(() => {
    let pool: PracticeQuestion[] = [];

    if (selectedCategory === 'all') {
      // Include both PyCode questions and Curated questions
      pool = [...curatedQuestions, ...allPyCodeQuestions];
    } else if (selectedCategory === 'curated') {
      pool = curatedQuestions;
    } else if (
      [
        'web-development',
        'ai-machine-learning',
        'mobile-app-development',
        'cybersecurity',
        'data-analytics',
      ].includes(selectedCategory)
    ) {
      pool = curatedQuestions.filter((q) => q.category === selectedCategory);
    } else {
      // PyCode category selected
      const matching = allPyCodeQuestions.filter((q) => {
        if (!q.category) return false;
        return (
          q.category === selectedCategory ||
          q.category.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategory === 'numpy' && q.category.includes('numpy')) ||
          (selectedCategory === 'pandas' && q.category.includes('pandas')) ||
          (selectedCategory.includes('matplotlib') &&
            (q.category.includes('matplotlib') || q.category.includes('seaborn')))
        );
      });
      pool = matching.length > 0 ? matching : allPyCodeQuestions;
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
  }, [curatedQuestions, allPyCodeQuestions, selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          All Problems ({curatedQuestions.length + (categories.reduce((acc, c) => acc + (c.total_questions || 0), 0) || allPyCodeQuestions.length || 280)})
        </button>

        {/* Curated Track Badges */}
        <button
          onClick={() => setSelectedCategory('curated')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'curated'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>RishabhLabs Engineering ({curatedQuestions.length})</span>
        </button>

        <button
          onClick={() => setSelectedCategory('web-development')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'web-development'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>Web & React</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800">
            {curatedQuestions.filter((q) => q.category === 'web-development').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('ai-machine-learning')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'ai-machine-learning'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>AI & ML</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800">
            {curatedQuestions.filter((q) => q.category === 'ai-machine-learning').length}
          </span>
        </button>

        {/* PyCode Upstream Categories */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>{cat.name}</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800">
              {cat.total_questions}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search problems by name or concept (e.g., debounce, primes, tensor, lru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#242424] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-50 dark:bg-[#242424] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-3"
            >
              <div className="w-3/4 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="w-1/2 h-4 rounded bg-neutral-100 dark:bg-neutral-800/60" />
              <div className="w-full h-8 rounded bg-neutral-100 dark:bg-neutral-800/40" />
            </div>
          ))}
        </div>
      ) : combinedQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800">
          <Code2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No questions found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category from above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinedQuestions.map((question) => {
            const isCurated = question.source === 'curated';

            return (
              <div
                key={question.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  {/* Header: Category Badge + Source + Difficulty + Points */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                      {isCurated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                          RishabhLabs Lab
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          PyCode Sandbox
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-neutral-500 truncate">
                        {question.category_name || question.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          question.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : question.difficulty === 'medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {question.points} Pts
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                    {question.title}
                  </h3>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <button
                    onClick={() => setReviewingQuestion(question)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Review Problem</span>
                  </button>

                  {isCurated && question.slug ? (
                    <Link
                      to={`/practice/problem/${question.slug}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start in IDE</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <a
                      href={question.start_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Sandbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
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

import {
  MentorshipSyncPayload,
  PracticeQuestion,
  QuestionCategory,
  AvailableCodeathon,
  CodeathonLeaderboardResponse,
} from '../types/pycode';
import { pycodeCache } from './pycodeCache';

// Secure server-side proxy route: API key is held privately on the backend and never revealed to the client
const PROXY_BASE_URL = '/api/pycode';

class PyCodeService {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Synchronously retrieve instant cached snapshot (profile picture, student name, and workspace files).
   * Note: "position" / live rankings are strictly excluded to ensure position is always real-time.
   */
  getCachedUserData(email?: string | null): MentorshipSyncPayload | null {
    if (!email) return null;
    return pycodeCache.getCachedUserData(email);
  }

  /**
   * Fetch synced student profile, stats, activity heatmap, workspace python files, and codeathon history.
   * Updates cached avatar, name, and workspace files for fast subsequent loads.
   */
  async fetchUserData(email: string): Promise<MentorshipSyncPayload> {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return {
        success: false,
        not_found: true,
        error: 'Email is required',
        user: null as any,
        workspace: { total_files: 0, folders: [], files: [], file_tree: [] },
        heatmap: { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] },
        tests_and_assessments: { total_attempts: 0, past_attempts: [], available_codeathons: [] },
      };
    }

    let payload: MentorshipSyncPayload | null = null;

    try {
      // Fetch securely through server proxy (quietly authenticated server-side)
      const proxyRes = await fetch(`${PROXY_BASE_URL}/user-data?email=${encodeURIComponent(cleanEmail)}`, {
        headers: this.getHeaders(),
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data && data.success && data.user) {
          payload = data;
        } else if (data && data.not_found) {
          // Explicitly not registered on PyCode: Purge stale cache & return genuine empty status
          pycodeCache.clearUserCache(cleanEmail);
          return {
            success: false,
            not_found: true,
            user: null as any,
            workspace: { total_files: 0, folders: [], files: [], file_tree: [] },
            heatmap: { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] },
            tests_and_assessments: { total_attempts: 0, past_attempts: [], available_codeathons: [] },
          };
        }
      }
    } catch (err) {
      console.warn('PyCode user data proxy note:', err);
    }

    // If still not available or account doesn't exist on PyCode yet, return clean empty state
    if (!payload || !payload.success || !payload.user) {
      pycodeCache.clearUserCache(cleanEmail);
      return {
        success: false,
        not_found: true,
        user: null as any,
        workspace: { total_files: 0, folders: [], files: [], file_tree: [] },
        heatmap: { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] },
        tests_and_assessments: { total_attempts: 0, past_attempts: [], available_codeathons: [] },
      };
    }

    // Ensure workspace object is clean and has genuine user files (do NOT inject fake starter workspace)
    if (!payload.workspace) {
      payload.workspace = { total_files: 0, folders: [], files: [], file_tree: [] };
    }

    // Ensure heatmap object is valid without injecting fake streaks or dates
    if (!payload.heatmap) {
      payload.heatmap = { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] };
    }

    // Aggregate genuine daily counts from past test attempts if available
    if (
      payload.tests_and_assessments?.past_attempts?.length &&
      (!payload.heatmap.daily_counts || Object.keys(payload.heatmap.daily_counts).length === 0)
    ) {
      const counts: Record<string, number> = {};
      for (const attempt of payload.tests_and_assessments.past_attempts) {
        const rawDate = attempt.completed_at || attempt.started_at;
        if (rawDate) {
          const dateStr = rawDate.slice(0, 10);
          const solved = attempt.questions_answered || 1;
          counts[dateStr] = (counts[dateStr] || 0) + solved;
        }
      }
      payload.heatmap.daily_counts = counts;
    }

    // Cache static assets: Genuine Profile picture, Student Name, Workspace Files
    if (payload.user) {
      pycodeCache.setProfile(cleanEmail, payload.user);
      if (payload.user.avatar_url) {
        pycodeCache.setAvatar(cleanEmail, payload.user.avatar_url);
      }
    }
    if (payload.workspace && Array.isArray(payload.workspace.files) && payload.workspace.files.length > 0) {
      pycodeCache.setWorkspace(cleanEmail, payload.workspace);
    }

    return payload;
  }

  /**
   * Fetch Python practice questions filtered by category, difficulty, or keyword.
   * Uses cached questions when available for instant category switching.
   */
  async fetchQuestions(params: {
    topic?: string;
    category?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
    skipCache?: boolean;
  } = {}): Promise<{ categories: QuestionCategory[]; questions: PracticeQuestion[]; total_questions?: number }> {
    const cacheKey = `${params.topic || 'all'}_${params.category || 'all'}_${params.difficulty || 'all'}_${params.search || ''}`;

    // 1. Check client cache first unless explicitly skipped
    if (!params.search && !params.skipCache) {
      const cached = pycodeCache.getQuestions(cacheKey);
      if (cached && cached.questions && cached.questions.length > 0) {
        return {
          categories: cached.categories,
          questions: cached.questions,
          total_questions: cached.total_questions,
        };
      }
    }

    const qs = new URLSearchParams();
    if (params.topic && params.topic !== 'all') qs.set('topic', params.topic);
    if (params.category && params.category !== 'all') qs.set('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') qs.set('difficulty', params.difficulty);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    let result: { categories: QuestionCategory[]; questions: PracticeQuestion[]; total_questions?: number } | null = null;

    try {
      // Fetch securely through server proxy (authenticated server-side)
      const proxyRes = await fetch(`${PROXY_BASE_URL}/questions?${qs.toString()}`, {
        headers: this.getHeaders(),
      });
      if (proxyRes.ok) {
        result = await proxyRes.json();
      }
    } catch (err) {
      console.warn('PyCode questions proxy error:', err);
    }

    // Persist to cache only when valid questions are returned
    if (result && result.questions && result.questions.length > 0) {
      pycodeCache.setQuestions(cacheKey, result);
      return result;
    }

    // Resilient fallback: If proxy temporarily returned empty or errored, check master cache 'all_all_all_'
    const masterCached = pycodeCache.getQuestions('all_all_all_');
    if (masterCached && masterCached.questions && masterCached.questions.length > 0) {
      let filtered = [...masterCached.questions];
      if (params.category && params.category !== 'all') {
        const cat = params.category.toLowerCase();
        filtered = filtered.filter(
          (q) =>
            q.category === params.category ||
            q.category?.toLowerCase() === cat ||
            (cat === 'numpy' && q.category?.includes('numpy')) ||
            (cat === 'pandas' && q.category?.includes('pandas')) ||
            (cat.includes('matplotlib') &&
              (q.category?.includes('matplotlib') || q.category?.includes('seaborn')))
        );
      }
      if (params.difficulty && params.difficulty !== 'all') {
        filtered = filtered.filter((q) => q.difficulty === params.difficulty);
      }
      return {
        categories: masterCached.categories,
        questions: filtered,
        total_questions: masterCached.total_questions,
      };
    }

    return result || { categories: [], questions: [] };
  }

  /**
   * Fetch all live, upcoming, and past codeathons.
   */
  async fetchCodeathons(status = 'all', email?: string): Promise<{ codeathons: AvailableCodeathon[]; total_codeathons?: number }> {
    const qs = new URLSearchParams();
    qs.set('status', status);
    if (email) qs.set('email', email);

    try {
      // Fetch securely through server proxy (authenticated server-side)
      const proxyRes = await fetch(`${PROXY_BASE_URL}/codeathons?${qs.toString()}`, {
        headers: this.getHeaders(),
      });
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch (err) {
      console.warn('PyCode codeathons proxy error:', err);
    }

    return { codeathons: [], total_codeathons: 0 };
  }

  /**
   * Fetch real-time codeathon leaderboard rankings and participant breakdown.
   * Position continuously updates so it is always fetched live.
   */
  async fetchLeaderboard(codeathonId: string): Promise<CodeathonLeaderboardResponse> {
    const cleanId = codeathonId.trim();
    if (!cleanId) {
      return {
        success: false,
        error: 'Codeathon ID is required',
        codeathon: { id: '', title: '', total_participants: 0, total_questions: 0 },
        leaderboard: [],
      };
    }

    try {
      // Fetch securely through server proxy (authenticated server-side)
      const proxyRes = await fetch(`${PROXY_BASE_URL}/codeathons/${encodeURIComponent(cleanId)}/leaderboard`, {
        headers: this.getHeaders(),
      });
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch (err) {
      console.warn('PyCode leaderboard proxy error:', err);
    }

    return {
      success: false,
      error: 'Unable to load leaderboard',
      codeathon: { id: cleanId, title: '', total_participants: 0, total_questions: 0 },
      leaderboard: [],
    };
  }
}

export const pycodeService = new PyCodeService();

import { MentorshipSyncPayload, PracticeQuestion, QuestionCategory, AvailableCodeathon } from '../types/pycode';
import { pycodeCache } from './pycodeCache';

const VITE_PYCODE_BASE_URL = import.meta.env.VITE_PYCODE_BASE_URL || 'https://pycode-student.vercel.app';
const VITE_PYCODE_API_KEY = import.meta.env.VITE_PYCODE_API_KEY || '';

class PyCodeService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (VITE_PYCODE_API_KEY) {
      headers['x-api-key'] = VITE_PYCODE_API_KEY;
    }
    return headers;
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
        user: {} as any,
        workspace: { total_files: 0, folders: [], files: [], file_tree: [] },
        heatmap: { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] },
        tests_and_assessments: { total_attempts: 0, past_attempts: [], available_codeathons: [] },
      };
    }

    let payload: MentorshipSyncPayload | null = null;

    try {
      // 1. Try server proxy first
      const proxyRes = await fetch(`/api/pycode/user-data?email=${encodeURIComponent(cleanEmail)}`);
      if (proxyRes.ok) {
        payload = await proxyRes.json();
      }
    } catch {
      // Fall through to direct call
    }

    if (!payload) {
      // 2. Direct PyCode upstream fallback
      const directUrl = `${VITE_PYCODE_BASE_URL}/api/mentorship/user-data?email=${encodeURIComponent(cleanEmail)}`;
      const res = await fetch(directUrl, { headers: this.getHeaders() });
      payload = await res.json();
    }

    // Cache static assets: Profile picture, Student Name, Workspace Files
    // Dynamic position / live rank is NOT cached and remains real-time
    if (payload?.success && payload.user) {
      pycodeCache.setProfile(cleanEmail, payload.user);
      if (payload.user.avatar_url) {
        pycodeCache.setAvatar(cleanEmail, payload.user.avatar_url);
      }
      if (payload.workspace) {
        pycodeCache.setWorkspace(cleanEmail, payload.workspace);
      }
    }

    return payload || {
      success: false,
      not_found: true,
      error: 'Failed to retrieve student records',
      user: {} as any,
      workspace: { total_files: 0, folders: [], files: [], file_tree: [] },
      heatmap: { daily_counts: {}, current_streak: 0, longest_streak: 0, solved_questions: [] },
      tests_and_assessments: { total_attempts: 0, past_attempts: [], available_codeathons: [] },
    };
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
    const cacheKey = `${params.topic || 'core-python'}_${params.category || 'all'}_${params.difficulty || 'all'}_${params.search || ''}`;

    // 1. Check client cache first unless explicitly skipped
    if (!params.skipCache && !params.search) {
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
    qs.set('topic', params.topic || 'core-python');
    if (params.category && params.category !== 'all') qs.set('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') qs.set('difficulty', params.difficulty);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    let result: { categories: QuestionCategory[]; questions: PracticeQuestion[]; total_questions?: number } | null = null;

    try {
      // Try server proxy
      const proxyRes = await fetch(`/api/pycode/questions?${qs.toString()}`);
      if (proxyRes.ok) {
        result = await proxyRes.json();
      }
    } catch {
      // Fall through
    }

    if (!result) {
      // Direct PyCode upstream fallback
      const directUrl = `${VITE_PYCODE_BASE_URL}/api/questions?${qs.toString()}`;
      const res = await fetch(directUrl, { headers: this.getHeaders() });
      result = await res.json();
    }

    // Persist to cache
    if (result && result.questions) {
      pycodeCache.setQuestions(cacheKey, result);
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
      // 1. Try server proxy
      const proxyRes = await fetch(`/api/pycode/codeathons?${qs.toString()}`);
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch {
      // Fall through
    }

    // 2. Direct PyCode upstream fallback
    const directUrl = `${VITE_PYCODE_BASE_URL}/api/codeathons?${qs.toString()}`;
    const res = await fetch(directUrl, { headers: this.getHeaders() });
    return await res.json();
  }
}

export const pycodeService = new PyCodeService();

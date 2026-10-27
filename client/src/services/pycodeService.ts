import { MentorshipSyncPayload, PracticeQuestion, QuestionCategory, AvailableCodeathon } from '../types/pycode';

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
   * Fetch synced student profile, stats, activity heatmap, workspace python files, and codeathon history.
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

    try {
      // 1. Try server proxy first
      const proxyRes = await fetch(`/api/pycode/user-data?email=${encodeURIComponent(cleanEmail)}`);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return data;
      }
    } catch {
      // Fall through to direct call
    }

    // 2. Direct PyCode upstream fallback
    const directUrl = `${VITE_PYCODE_BASE_URL}/api/mentorship/user-data?email=${encodeURIComponent(cleanEmail)}`;
    const res = await fetch(directUrl, { headers: this.getHeaders() });
    const data = await res.json();
    return data;
  }

  /**
   * Fetch Python practice questions filtered by category, difficulty, or keyword.
   */
  async fetchQuestions(params: {
    topic?: string;
    category?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ categories: QuestionCategory[]; questions: PracticeQuestion[]; total_questions?: number }> {
    const qs = new URLSearchParams();
    qs.set('topic', params.topic || 'core-python');
    if (params.category && params.category !== 'all') qs.set('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') qs.set('difficulty', params.difficulty);
    if (params.search) qs.set('search', params.search);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));

    try {
      // 1. Try server proxy
      const proxyRes = await fetch(`/api/pycode/questions?${qs.toString()}`);
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch {
      // Fall through
    }

    // 2. Direct PyCode upstream fallback
    const directUrl = `${VITE_PYCODE_BASE_URL}/api/questions?${qs.toString()}`;
    const res = await fetch(directUrl, { headers: this.getHeaders() });
    return await res.json();
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

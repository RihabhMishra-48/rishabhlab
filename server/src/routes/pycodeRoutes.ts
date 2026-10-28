import { Router, Request, Response } from 'express';

const router = Router();

const PYCODE_BASE_URL = process.env.PYCODE_BASE_URL || 'https://pycode-student.vercel.app';
const PYCODE_API_KEY = process.env.PYCODE_API_KEY || process.env.VITE_PYCODE_API_KEY || 'pycode_mentor_live_8f3d1b9a2c7e456';

import fs from 'fs';
import path from 'path';

// Load offline snapshot so questions NEVER fail even if upstream has network hiccups
let snapshotData: {
  categories: any[];
  questions: any[];
  total_questions: number;
} | null = null;

try {
  const snapshotPath = path.resolve(__dirname, '../data/pycodeQuestionsSnapshot.json');
  if (fs.existsSync(snapshotPath)) {
    snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[PyCode] Could not load questions snapshot:', e);
}

// In-memory cache for static practice questions (10 minute TTL)
interface ServerCacheEntry<T> {
  data: T;
  expiresAt: number;
}
const serverQuestionsCache = new Map<string, ServerCacheEntry<any>>();

function filterSnapshot(params: {
  category?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  if (!snapshotData || !snapshotData.questions) {
    return {
      success: true,
      total_questions: 0,
      filtered_count: 0,
      limit: params.limit || 300,
      offset: params.offset || 0,
      categories: [],
      questions: [],
    };
  }

  let filtered = [...snapshotData.questions];

  if (params.category && params.category !== 'all') {
    const catLower = params.category.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.category === params.category ||
        (q.category && q.category.toLowerCase() === catLower) ||
        (catLower === 'numpy' && q.category?.includes('numpy')) ||
        (catLower === 'pandas' && q.category?.includes('pandas')) ||
        (catLower.includes('matplotlib') &&
          (q.category?.includes('matplotlib') || q.category?.includes('seaborn')))
    );
  }

  if (params.difficulty && params.difficulty !== 'all') {
    filtered = filtered.filter((q) => q.difficulty === params.difficulty);
  }

  if (params.search && params.search.trim()) {
    const s = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (q) =>
        q.title?.toLowerCase().includes(s) ||
        q.description?.toLowerCase().includes(s) ||
        q.category_name?.toLowerCase().includes(s)
    );
  }

  const totalFiltered = filtered.length;
  const offset = params.offset || 0;
  const limit = params.limit || 300;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    success: true,
    total_questions: snapshotData.total_questions || snapshotData.questions.length,
    filtered_count: totalFiltered,
    limit,
    offset,
    categories: snapshotData.categories || [],
    questions: paginated,
    is_snapshot_fallback: true,
  };
}

// Helper for making authenticated requests to PyCode engine
async function forwardToPyCode(endpoint: string, res: Response, fallbackData?: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${PYCODE_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'x-api-key': PYCODE_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    // If PyCode returns 404 with not_found, pass it cleanly
    if (response.status === 404) {
      return res.status(200).json(data.not_found ? data : { success: false, not_found: true, ...data });
    }

    if (!response.ok) {
      if (fallbackData !== undefined) {
        return res.status(200).json(fallbackData);
      }
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[PyCode Proxy Error] Failed calling ${endpoint}:`, err.message);
    if (fallbackData !== undefined) {
      return res.status(200).json(fallbackData);
    }
    return res.status(500).json({ success: false, error: 'PyCode upstream proxy failed: ' + err.message });
  }
}

// 1. GET /api/pycode/user-data?email=...
router.get('/user-data', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email query parameter is required.' });
  }
  return forwardToPyCode(`/api/mentorship/user-data?email=${encodeURIComponent(email)}`, res, {
    success: true,
    not_found: true,
    message: 'User profile not found upstream. Using local student profile.',
  });
});

// 2. GET /api/pycode/questions?topic=core-python&category=...&difficulty=...&search=...&limit=...&offset=...
router.get('/questions', async (req: Request, res: Response) => {
  const query = new URLSearchParams();
  if (req.query.topic && req.query.topic !== 'all') {
    query.set('topic', req.query.topic as string);
  }
  if (req.query.category && req.query.category !== 'all') query.set('category', req.query.category as string);
  if (req.query.difficulty && req.query.difficulty !== 'all') query.set('difficulty', req.query.difficulty as string);
  if (req.query.search) query.set('search', req.query.search as string);
  if (req.query.limit) query.set('limit', req.query.limit as string);
  if (req.query.offset) query.set('offset', req.query.offset as string);

  const cacheKey = query.toString();
  const cached = serverQuestionsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  const category = req.query.category as string | undefined;
  const difficulty = req.query.difficulty as string | undefined;
  const search = req.query.search as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 300;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `${PYCODE_BASE_URL}/api/questions?${query.toString()}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'x-api-key': PYCODE_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.questions && data.questions.length > 0) {
      serverQuestionsCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
      return res.status(response.status).json(data);
    }

    // Upstream returned non-OK or empty: fallback to verified snapshot
    console.warn(`[PyCode Questions] Upstream returned status ${response.status}. Serving from verified snapshot.`);
    const fallback = filterSnapshot({ category, difficulty, search, limit, offset });
    return res.json(fallback);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[PyCode Proxy Note] Upstream /api/questions unreachable (${err.message}). Serving from verified snapshot.`);
    const fallback = filterSnapshot({ category, difficulty, search, limit, offset });
    serverQuestionsCache.set(cacheKey, {
      data: fallback,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return res.json(fallback);
  }
});

// 3. GET /api/pycode/codeathons?status=all&email=...
router.get('/codeathons', async (req: Request, res: Response) => {
  const query = new URLSearchParams();
  query.set('status', (req.query.status as string) || 'all');
  if (req.query.email) query.set('email', req.query.email as string);

  return forwardToPyCode(`/api/codeathons?${query.toString()}`, res, {
    codeathons: [],
    total_codeathons: 0,
  });
});

// 4. GET /api/pycode/codeathons/:id/leaderboard
router.get('/codeathons/:id/leaderboard', async (req: Request, res: Response) => {
  const codeathonId = req.params.id;
  if (!codeathonId) {
    return res.status(400).json({ success: false, error: 'Codeathon ID is required.' });
  }
  return forwardToPyCode(`/api/codeathons/${encodeURIComponent(codeathonId)}/leaderboard`, res, {
    leaderboard: [],
  });
});

export default router;

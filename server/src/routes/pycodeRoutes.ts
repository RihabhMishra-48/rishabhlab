import { Router, Request, Response } from 'express';

const router = Router();

const PYCODE_BASE_URL = process.env.PYCODE_BASE_URL || 'https://pycode-student.vercel.app';
const PYCODE_API_KEY = process.env.PYCODE_API_KEY || process.env.VITE_PYCODE_API_KEY || 'pycode_mentor_live_8f3d1b9a2c7e456';

// Helper for making authenticated requests to PyCode engine
async function forwardToPyCode(endpoint: string, res: Response) {
  try {
    const url = `${PYCODE_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'x-api-key': PYCODE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));

    // If PyCode returns 404 with not_found, pass it cleanly
    if (response.status === 404) {
      return res.status(200).json(data.not_found ? data : { success: false, not_found: true, ...data });
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err: any) {
    console.error(`[PyCode Proxy Error] Failed calling ${endpoint}:`, err.message);
    return res.status(500).json({ success: false, error: 'PyCode upstream proxy failed: ' + err.message });
  }
}

// 1. GET /api/pycode/user-data?email=...
router.get('/user-data', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email query parameter is required.' });
  }
  return forwardToPyCode(`/api/mentorship/user-data?email=${encodeURIComponent(email)}`, res);
});

// In-memory cache for static practice questions (10 minute TTL)
interface ServerCacheEntry<T> {
  data: T;
  expiresAt: number;
}
const serverQuestionsCache = new Map<string, ServerCacheEntry<any>>();

// 2. GET /api/pycode/questions?topic=core-python&category=...&difficulty=...&search=...&limit=...&offset=...
router.get('/questions', async (req: Request, res: Response) => {
  const query = new URLSearchParams();
  query.set('topic', (req.query.topic as string) || 'core-python');
  if (req.query.category) query.set('category', req.query.category as string);
  if (req.query.difficulty) query.set('difficulty', req.query.difficulty as string);
  if (req.query.search) query.set('search', req.query.search as string);
  if (req.query.limit) query.set('limit', req.query.limit as string);
  if (req.query.offset) query.set('offset', req.query.offset as string);

  const cacheKey = query.toString();
  const cached = serverQuestionsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  try {
    const url = `${PYCODE_BASE_URL}/api/questions?${query.toString()}`;
    const response = await fetch(url, {
      headers: {
        'x-api-key': PYCODE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.questions) {
      serverQuestionsCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    }

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error(`[PyCode Proxy Error] Failed calling /api/questions:`, err.message);
    return res.status(500).json({ success: false, error: 'PyCode upstream proxy failed: ' + err.message });
  }
});

// 3. GET /api/pycode/codeathons?status=all&email=...
router.get('/codeathons', async (req: Request, res: Response) => {
  const query = new URLSearchParams();
  query.set('status', (req.query.status as string) || 'all');
  if (req.query.email) query.set('email', req.query.email as string);

  return forwardToPyCode(`/api/codeathons?${query.toString()}`, res);
});

// 4. GET /api/pycode/codeathons/:id/leaderboard
router.get('/codeathons/:id/leaderboard', async (req: Request, res: Response) => {
  const codeathonId = req.params.id;
  if (!codeathonId) {
    return res.status(400).json({ success: false, error: 'Codeathon ID is required.' });
  }
  return forwardToPyCode(`/api/codeathons/${encodeURIComponent(codeathonId)}/leaderboard`, res);
});

export default router;

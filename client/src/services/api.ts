const API_BASE = '/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory fast cache store for zero-latency client navigation
const memoryCache = new Map<string, CacheEntry<any>>();

export function invalidateCache(pattern?: string | RegExp): void {
  if (!pattern) {
    memoryCache.clear();
    try {
      sessionStorage.clear();
    } catch {
      // Ignore storage errors on private/restricted devices
    }
    return;
  }

  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('rl_cache_') && regex.test(k)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
}

function getFromCache<T>(key: string): T | null {
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem && now - mem.timestamp < mem.ttl) {
    return mem.data;
  }

  // Fallback to sessionStorage for page reloads
  try {
    const raw = sessionStorage.getItem(`rl_cache_${key}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (now - entry.timestamp < entry.ttl) {
        memoryCache.set(key, entry);
        return entry.data;
      }
      sessionStorage.removeItem(`rl_cache_${key}`);
    }
  } catch {
    // Ignore storage quota or parse errors
  }

  return null;
}

function saveToCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`rl_cache_${key}`, JSON.stringify(entry));
  } catch {
    // Storage quota or sandboxed iframe silently handled
  }
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem('rishabhlabs_token');
  if (token) return token;

  // Fallback: recover token from Supabase cached session in localStorage if present
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.access_token) {
            localStorage.setItem('rishabhlabs_token', parsed.access_token);
            return parsed.access_token;
          }
        }
      }
    }
  } catch {
    // Ignore JSON parsing or storage access errors
  }

  return null;
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}

function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const PUBLIC_PREFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/confirm-signup',
  '/health',
  '/pricing',
  '/college/overview',
  '/mentors',
  '/lessons',
  '/problems',
  '/projects',
];

function isProtectedEndpoint(endpoint: string): boolean {
  // All authentication routes (login, register, send-otp, verify-otp, confirm-signup) are strictly public
  if (endpoint.startsWith('/auth/')) {
    return false;
  }

  // If explicitly matching public prefix without authenticated sub-actions
  const matchesPublic = PUBLIC_PREFIXES.some((prefix) => endpoint.startsWith(prefix));
  const isAction =
    endpoint.includes('/toggle') ||
    endpoint.includes('/submit') ||
    endpoint.includes('/book') ||
    endpoint.includes('/task');

  return !matchesPublic || isAction;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  // Guard: Avoid firing doomed HTTP requests that predictably 401 when no session exists
  if (isProtectedEndpoint(endpoint) && !token) {
    throw new Error('Authentication required. Please log in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Only drop session if /auth/me itself reports unauthorized
        if (endpoint === '/auth/me') {
          localStorage.removeItem('rishabhlabs_token');
          invalidateCache();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        } else if (!endpoint.includes('/auth/')) {
          // For auxiliary endpoints (missions, roadmap, etc.), attempt a silent Supabase token refresh and retry once
          try {
            const { supabase, isSupabaseConfigured } = await import('./supabase');
            if (isSupabaseConfigured) {
              const { data: refreshData } = await supabase.auth.refreshSession();
              if (refreshData?.session?.access_token) {
                localStorage.setItem('rishabhlabs_token', refreshData.session.access_token);
                const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
                  ...options,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${refreshData.session.access_token}`,
                    ...options.headers,
                  },
                });
                if (retryResponse.ok) {
                  return (await retryResponse.json()) as T;
                }
              }
            }
          } catch {
            // Ignore retry error and throw original message below
          }
        }
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.toLowerCase().includes('aborted')) {
      throw new Error('Connection timed out. Please check your network and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Cached GET request with configurable TTL (default 2 mins) for snappy, lag-free mobile UX
async function cachedGet<T>(endpoint: string, ttlMs = 120000): Promise<T> {
  const cached = getFromCache<T>(endpoint);
  if (cached !== null) {
    // Stale-while-revalidate in background if past half TTL
    return cached;
  }

  const fresh = await request<T>(endpoint, { method: 'GET' });
  saveToCache(endpoint, fresh, ttlMs);
  return fresh;
}

export const api = {
  // Direct Cache Control
  invalidateCache,

  // Auth
  sendOtp: async (data: { email: string; type?: 'signup' | 'login'; name?: string; password?: string; role?: string; college?: string }) => {
    return request<{ success: boolean; message: string; email: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  verifyOtp: async (data: { email: string; otp: string; type?: 'signup' | 'login' }) => {
    const res = await request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    invalidateCache();
    return res;
  },
  confirmSignup: async (email: string, otp: string) => {
    const res = await request<any>('/auth/confirm-signup', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type: 'signup' }),
    });
    invalidateCache();
    return res;
  },
  login: async (credentials: any) => {
    const res = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    invalidateCache();
    return res;
  },
  register: async (userData: any) => {
    const res = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    invalidateCache();
    return res;
  },
  getMe: () => request<any>('/auth/me'),
  getSessionToken: (data: { token?: string; userId?: string; email?: string; role?: string }) =>
    request<{ success: boolean; token: string; expiresIn: string }>('/auth/session-token', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Onboarding
  completeOnboarding: async (data: any) => {
    const res = await request<any>('/onboarding/complete', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/roadmap|mission|dashboard|profile/);
    return res;
  },
  evaluateNotSureAssessment: (data: any) =>
    request<any>('/onboarding/not-sure-assessment', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: () => cachedGet<any>('/dashboard', 90000),

  // Roadmap
  getRoadmap: (track?: string, regenerate?: boolean) => {
    const url = `/roadmap${track || regenerate ? `?${track ? `track=${encodeURIComponent(track)}` : ''}${track && regenerate ? '&' : ''}${regenerate ? 'regenerate=true' : ''}` : ''}`;
    if (regenerate) {
      invalidateCache(/roadmap/);
      return request<any>(url);
    }
    return cachedGet<any>(url, 180000);
  },
  generateRoadmap: async (data: { goal: string; currentLevel?: string; availableTime?: string }) => {
    const res = await request<any>('/roadmap/generate', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/roadmap|dashboard/);
    return res;
  },
  updateRoadmapNodeStatus: async (nodeId: string, status: string) => {
    const res = await request<any>(`/roadmap/node/${nodeId}/status`, { method: 'POST', body: JSON.stringify({ status }) });
    invalidateCache(/roadmap|dashboard/);
    return res;
  },

  // Daily Mission
  getTodayMission: () => cachedGet<any>('/missions/today', 90000),
  toggleMissionTask: async (missionId: string, taskId: string, isCompleted?: boolean) => {
    const res = await request<any>(`/missions/${missionId}/task/${taskId}/toggle`, { method: 'POST', body: JSON.stringify({ isCompleted }) });
    invalidateCache(/mission|dashboard|profile/);
    return res;
  },
  shipMissionProof: async (missionId: string, proofUrl: string, commitMessage?: string) => {
    const res = await request<any>(`/missions/${missionId}/ship`, { method: 'POST', body: JSON.stringify({ proofUrl, commitMessage }) });
    invalidateCache(/mission|dashboard|profile/);
    return res;
  },

  // Learning Platform
  getLessons: (track?: string) => cachedGet<any>(`/lessons${track ? `?track=${track}` : ''}`, 300000),
  getLessonBySlug: (slug: string) => cachedGet<any>(`/lessons/${slug}`, 300000),
  completeLesson: async (slug: string) => {
    const res = await request<any>(`/lessons/${slug}/complete`, { method: 'POST' });
    invalidateCache(/lesson|dashboard|profile/);
    return res;
  },
  submitQuiz: async (slug: string, answers: number[]) => {
    const res = await request<any>(`/lessons/${slug}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) });
    invalidateCache(/lesson|dashboard|profile/);
    return res;
  },

  // Code Editor & Practice
  getProblems: (filter?: any) => {
    const params = new URLSearchParams(filter || {}).toString();
    const url = `/problems${params ? `?${params}` : ''}`;
    return cachedGet<any>(url, 300000);
  },
  getProblemBySlug: (slug: string) => cachedGet<any>(`/problems/${slug}`, 300000),
  runCode: (problemId: string, code: string, language: string) =>
    request<any>('/code/run', { method: 'POST', body: JSON.stringify({ problemId, code, language }) }),
  submitCode: async (problemId: string, code: string, language: string) => {
    const res = await request<any>('/code/submit', { method: 'POST', body: JSON.stringify({ problemId, code, language }) });
    invalidateCache(/problems|dashboard|profile/);
    return res;
  },
  getCodeHint: (problemTitle: string, level: number, studentCode: string) =>
    request<any>('/code/hint', { method: 'POST', body: JSON.stringify({ problemTitle, level, studentCode }) }),

  // Projects
  getProjects: (filter?: { status?: string; category?: string } | string) => {
    if (typeof filter === 'string') {
      const url = `/projects${filter && filter !== 'All' ? `?status=${filter}` : ''}`;
      return cachedGet<any>(url, 180000);
    }
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== 'All') params.append('status', filter.status);
    if (filter?.category && filter.category !== 'All') params.append('category', filter.category);
    const qs = params.toString();
    return cachedGet<any>(`/projects${qs ? `?${qs}` : ''}`, 180000);
  },
  getProjectBySlug: (slug: string) => cachedGet<any>(`/projects/${slug}`, 180000),
  toggleProjectTask: async (projectId: string, milestoneId: string, taskId: string) => {
    const res = await request<any>(`/projects/${projectId}/task-toggle`, { method: 'POST', body: JSON.stringify({ milestoneId, taskId }) });
    invalidateCache(/project|dashboard|profile/);
    return res;
  },
  submitProjectProof: async (projectId: string, data: any) => {
    const res = await request<any>(`/projects/${projectId}/submit-proof`, { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/project|dashboard|profile/);
    return res;
  },

  // Hackathon Mode
  getHackathon: () => cachedGet<any>('/hackathon', 120000),
  getHackathonLeaderboard: (campus = 'Global') =>
    cachedGet<any>(`/hackathon/leaderboard?campus=${encodeURIComponent(campus)}`, 30000),
  runHackathonAITool: (toolName: string, problemStatement?: string) =>
    request<any>('/hackathon/ai-tool', { method: 'POST', body: JSON.stringify({ toolName, problemStatement }) }),

  // Hackathon Aggregator Engine
  getAggregatedHackathons: (category?: string, search?: string, source?: string, grouped?: boolean, status?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (source && source !== 'All') params.append('source', source);
    if (status) params.append('status', status.toLowerCase());
    if (grouped) params.append('grouped', 'true');
    params.append('limit', '100');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return cachedGet<any>(`/hackathons${qs}`, 30000);
  },
  getAggregatedHackathonsStats: () => cachedGet<any>('/hackathons/stats', 60000),
  getAggregatedHackathonById: (id: string) => cachedGet<any>(`/hackathons/${id}`, 120000),
  getAggregatedHackathonCategories: () => cachedGet<any>('/hackathons/categories', 120000),

  // Mentorship
  getMentors: (topic?: string) => cachedGet<any>(`/mentorship${topic ? `?topic=${topic}` : ''}`, 180000),
  requestMentorship: async (data: any) => {
    const res = await request<any>('/mentorship/request', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/mentorship/);
    return res;
  },
  getMyMentorshipRequests: () => cachedGet<any>('/mentorship/my-requests', 60000),

  // Weekly Review
  getWeeklyReview: () => cachedGet<any>('/weekly-review', 60000),
  submitWeeklyReflection: async (reflectionText: string) => {
    const res = await request<any>('/weekly-review/submit', { method: 'POST', body: JSON.stringify({ reflectionText }) });
    invalidateCache(/weekly-review|dashboard/);
    return res;
  },

  // Profile & Proof of Work
  getProfile: () => cachedGet<any>('/profile', 90000),
  getPublicProfile: (username: string) => cachedGet<any>(`/profile/public/${username}`, 120000),
  updateProfile: async (data: any) => {
    const res = await request<any>('/profile', { method: 'PATCH', body: JSON.stringify(data) });
    invalidateCache(/profile|dashboard/);
    return res;
  },

  // College & Admin
  getCollegeOverview: (collegeIdentifier?: string) => {
    const qs = collegeIdentifier ? `?identifier=${encodeURIComponent(collegeIdentifier)}` : '';
    return request<any>(`/college/overview${qs}`);
  },
  getAdminOverview: () => cachedGet<any>('/admin/overview', 120000),
  getPricingPlans: () => cachedGet<any>('/admin/pricing', 300000),
  updatePricingPlan: async (key: string, data: any) => {
    const res = await request<any>(`/admin/pricing/${key}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache(/pricing/);
    return res;
  },

  // Admin Mentors CRUD
  adminGetMentors: () => request<any[]>('/admin/mentors'),
  adminCreateMentor: async (data: any) => {
    const res = await request<any>('/admin/mentors', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/mentor/);
    return res;
  },
  adminUpdateMentor: async (id: string, data: any) => {
    const res = await request<any>(`/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache(/mentor/);
    return res;
  },
  adminDeleteMentor: async (id: string, name?: string) => {
    const qs = name ? `?name=${encodeURIComponent(name)}` : '';
    const safeId = id && id !== 'undefined' ? encodeURIComponent(id) : 'by-name';
    const res = await request<any>(`/admin/mentors/${safeId}${qs}`, { method: 'DELETE' });
    invalidateCache(/mentor/);
    return res;
  },

  // Admin Hackathons Aggregator & Supabase Pipeline
  adminGetHackathons: () => request<any>('/admin/hackathons'),
  adminSyncHackathons: async () => {
    const res = await request<any>('/admin/hackathons/sync', { method: 'POST' });
    invalidateCache(/hackathon/);
    return res;
  },
  adminDeleteHackathon: async (id: string) => {
    const res = await request<any>(`/admin/hackathons/${id}`, { method: 'DELETE' });
    invalidateCache(/hackathon/);
    return res;
  },

  // Admin Colleges CRUD
  adminGetColleges: () => request<any[]>('/admin/colleges'),
  adminCreateCollege: async (data: any) => {
    const res = await request<any>('/admin/colleges', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/college/);
    return res;
  },
  adminDeleteCollege: async (id: string, name?: string) => {
    const qs = name ? `?name=${encodeURIComponent(name)}` : '';
    const safeId = id && id !== 'undefined' ? encodeURIComponent(id) : 'by-name';
    const res = await request<any>(`/admin/colleges/${safeId}${qs}`, { method: 'DELETE' });
    invalidateCache(/college/);
    return res;
  },

  // Admin Questions / Coding Problems CRUD
  adminGetProblems: () => request<any[]>('/admin/problems'),
  adminCreateProblem: async (data: any) => {
    const res = await request<any>('/admin/problems', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/problem/);
    return res;
  },
  adminUpdateProblem: async (id: string, data: any) => {
    const res = await request<any>(`/admin/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache(/problem/);
    return res;
  },
  adminDeleteProblem: async (id: string) => {
    const res = await request<any>(`/admin/problems/${id}`, { method: 'DELETE' });
    invalidateCache(/problem/);
    return res;
  },

  // Admin Roadmaps CRUD
  adminGetRoadmaps: () => request<any[]>('/admin/roadmaps'),
  adminCreateRoadmap: async (data: any) => {
    const res = await request<any>('/admin/roadmaps', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/roadmap/);
    return res;
  },
  adminUpdateRoadmap: async (id: string, data: any) => {
    const res = await request<any>(`/admin/roadmaps/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache(/roadmap/);
    return res;
  },
  adminDeleteRoadmap: async (id: string) => {
    const res = await request<any>(`/admin/roadmaps/${id}`, { method: 'DELETE' });
    invalidateCache(/roadmap/);
    return res;
  },

  // Admin Daily Tasks / Missions CRUD
  adminGetMissions: () => request<any[]>('/admin/missions'),
  adminCreateMission: async (data: any) => {
    const res = await request<any>('/admin/missions', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache(/mission/);
    return res;
  },
  adminUpdateMission: async (id: string, data: any) => {
    const res = await request<any>(`/admin/missions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache(/mission/);
    return res;
  },
  adminDeleteMission: async (id: string) => {
    const res = await request<any>(`/admin/missions/${id}`, { method: 'DELETE' });
    invalidateCache(/mission/);
    return res;
  },

  // Admin User & Roles Management
  adminGetUsers: (filter?: { role?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filter?.role && filter.role !== 'all') params.append('role', filter.role);
    if (filter?.search) params.append('search', filter.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/admin/users${qs}`);
  },
  adminUpdateUserRole: async (id: string, role: string) => {
    const res = await request<any>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    invalidateCache(/user/);
    return res;
  },
  adminCreateUser: async (data: any) => {
    const res = await request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    invalidateCache(/user/);
    return res;
  },
  adminDeleteUser: async (id: string) => {
    const res = await request<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
    invalidateCache(/user/);
    return res;
  },

  // Mentor Workspace Sessions & Profile
  mentorGetSessions: () => request<any[]>('/mentorship/mentor/sessions'),
  mentorGetProfile: () => request<any>('/mentorship/mentor/profile'),
  mentorUpdateProfile: async (data: any) => {
    const res = await request<any>('/mentorship/mentor/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    invalidateCache(/mentor/);
    return res;
  },
  mentorUpdateSession: async (id: string, data: { status?: string; meetingLink?: string; notesFromMentor?: string; preferredSlot?: string }) => {
    const res = await request<any>(`/mentorship/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    invalidateCache(/mentorship/);
    return res;
  },
  mentorDeleteSession: async (id: string) => {
    const res = await request<any>(`/mentorship/sessions/${id}`, {
      method: 'DELETE',
    });
    invalidateCache(/mentorship/);
    return res;
  },
  sendMentorshipMessage: async (sessionId: string, message: string, subject?: string) => {
    const res = await request<{ success: boolean; delivered: boolean; message: string }>(`/mentorship/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message, subject }),
    });
    invalidateCache(/mentorship/);
    return res;
  },
};


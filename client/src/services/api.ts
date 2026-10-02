const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('rishabhlabs_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request<any>('/auth/me'),
  switchDemoRole: (role: string) => request<any>('/auth/switch-demo-role', { method: 'POST', body: JSON.stringify({ role }) }),

  // Onboarding
  completeOnboarding: (data: any) => request<any>('/onboarding/complete', { method: 'POST', body: JSON.stringify(data) }),
  evaluateNotSureAssessment: (data: any) => request<any>('/onboarding/not-sure-assessment', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),

  // Roadmap
  getRoadmap: (track?: string, regenerate?: boolean) =>
    request<any>(`/roadmap${track || regenerate ? `?${track ? `track=${encodeURIComponent(track)}` : ''}${track && regenerate ? '&' : ''}${regenerate ? 'regenerate=true' : ''}` : ''}`),
  generateRoadmap: (data: { goal: string; currentLevel?: string; availableTime?: string }) =>
    request<any>('/roadmap/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateRoadmapNodeStatus: (nodeId: string, status: string) =>
    request<any>(`/roadmap/node/${nodeId}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  // Daily Mission
  getTodayMission: () => request<any>('/missions/today'),
  toggleMissionTask: (missionId: string, taskId: string, isCompleted?: boolean) =>
    request<any>(`/missions/${missionId}/task/${taskId}/toggle`, { method: 'POST', body: JSON.stringify({ isCompleted }) }),
  shipMissionProof: (missionId: string, proofUrl: string, commitMessage?: string) =>
    request<any>(`/missions/${missionId}/ship`, { method: 'POST', body: JSON.stringify({ proofUrl, commitMessage }) }),

  // Learning Platform
  getLessons: (track?: string) => request<any>(`/lessons${track ? `?track=${track}` : ''}`),
  getLessonBySlug: (slug: string) => request<any>(`/lessons/${slug}`),
  completeLesson: (slug: string) => request<any>(`/lessons/${slug}/complete`, { method: 'POST' }),
  submitQuiz: (slug: string, answers: number[]) =>
    request<any>(`/lessons/${slug}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Code Editor & Practice
  getProblems: (filter?: any) => {
    const params = new URLSearchParams(filter || {}).toString();
    return request<any>(`/problems${params ? `?${params}` : ''}`);
  },
  getProblemBySlug: (slug: string) => request<any>(`/problems/${slug}`),
  runCode: (problemId: string, code: string, language: string) =>
    request<any>('/code/run', { method: 'POST', body: JSON.stringify({ problemId, code, language }) }),
  submitCode: (problemId: string, code: string, language: string) =>
    request<any>('/code/submit', { method: 'POST', body: JSON.stringify({ problemId, code, language }) }),
  getCodeHint: (problemTitle: string, level: number, studentCode: string) =>
    request<any>('/code/hint', { method: 'POST', body: JSON.stringify({ problemTitle, level, studentCode }) }),

  getProjects: (filter?: { status?: string; category?: string } | string) => {
    if (typeof filter === 'string') {
      return request<any>(`/projects${filter && filter !== 'All' ? `?status=${filter}` : ''}`);
    }
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== 'All') params.append('status', filter.status);
    if (filter?.category && filter.category !== 'All') params.append('category', filter.category);
    const qs = params.toString();
    return request<any>(`/projects${qs ? `?${qs}` : ''}`);
  },
  getProjectBySlug: (slug: string) => request<any>(`/projects/${slug}`),
  toggleProjectTask: (projectId: string, milestoneId: string, taskId: string) =>
    request<any>(`/projects/${projectId}/task-toggle`, { method: 'POST', body: JSON.stringify({ milestoneId, taskId }) }),
  submitProjectProof: (projectId: string, data: any) =>
    request<any>(`/projects/${projectId}/submit-proof`, { method: 'POST', body: JSON.stringify(data) }),

  // Hackathon Mode
  getHackathon: () => request<any>('/hackathon'),
  runHackathonAITool: (toolName: string, problemStatement?: string) =>
    request<any>('/hackathon/ai-tool', { method: 'POST', body: JSON.stringify({ toolName, problemStatement }) }),

  // Mentorship
  getMentors: (topic?: string) => request<any>(`/mentorship${topic ? `?topic=${topic}` : ''}`),
  requestMentorship: (data: any) => request<any>('/mentorship/request', { method: 'POST', body: JSON.stringify(data) }),
  getMyMentorshipRequests: () => request<any>('/mentorship/my-requests'),

  // Weekly Review
  getWeeklyReview: () => request<any>('/weekly-review'),
  submitWeeklyReflection: (reflectionText: string) =>
    request<any>('/weekly-review/submit', { method: 'POST', body: JSON.stringify({ reflectionText }) }),

  // Profile & Proof of Work
  getProfile: () => request<any>('/profile'),
  getPublicProfile: (username: string) => request<any>(`/profile/public/${username}`),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // College & Admin
  getCollegeOverview: () => request<any>('/college/overview'),
  getAdminOverview: () => request<any>('/admin/overview'),
  getPricingPlans: () => request<any>('/admin/pricing'),
  updatePricingPlan: (key: string, data: any) => request<any>(`/admin/pricing/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
};

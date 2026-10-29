import {
  WorkspaceFile,
  FileTreeNode,
  PracticeQuestion,
  QuestionCategory,
  PyCodeUser,
  MentorshipSyncPayload,
} from '../types/pycode';

export interface CachedProfile {
  full_name?: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string;
  email?: string;
  updated_at: number;
}

export interface CachedWorkspace {
  total_files: number;
  folders: string[];
  files: WorkspaceFile[];
  file_tree: FileTreeNode[];
  updated_at: number;
}

export interface CachedQuestions {
  categories: QuestionCategory[];
  questions: PracticeQuestion[];
  total_questions?: number;
  updated_at: number;
}

/**
 * PyCodeCache: High-performance caching layer with Memory + LocalStorage fallback.
 *
 * CACHED ITEMS:
 * 1. Profile Picture (avatar_url) - instant rendering across avatars, navbar & headers
 * 2. Student Name & bio (full_name, username, bio) - zero layout shift
 * 3. Files & Workspace (folders, files list, file tree, file source codes) - instant code viewer
 * 4. Practice Questions & Categories - fast category switching with TTL
 *
 * EXCLUSION INVARIANT:
 * "Lekin position continuously update hoti rahegi, isliye usko cache mein nahi rakh sakte."
 * Live leaderboard positions, codeathon rank standings, real-time assessment status, and dynamic positions
 * are strictly NEVER cached or frozen. They are always fetched live from the API.
 */
class PyCodeCache {
  private memCache = new Map<string, any>();

  private getStorageKey(type: string, id: string): string {
    return `rishabhlabs_pycode_${type}_${id.toLowerCase().trim()}`;
  }

  private readStorage<T>(key: string): T | null {
    if (this.memCache.has(key)) {
      return this.memCache.get(key) as T;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      this.memCache.set(key, parsed);
      return parsed as T;
    } catch {
      return null;
    }
  }

  private writeStorage<T>(key: string, data: T): void {
    this.memCache.set(key, data);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('[PyCodeCache] Failed to persist to localStorage:', err);
    }
  }

  // ==========================================
  // 1. PROFILE PICTURE (AVATAR) CACHE
  // ==========================================
  getAvatar(email?: string | null): string | null {
    if (!email) return null;
    const key = this.getStorageKey('avatar', email);
    const cached = this.readStorage<{ url: string; updated_at: number }>(key);
    return cached?.url || null;
  }

  setAvatar(email: string, avatarUrl: string | null | undefined): void {
    if (!email || !avatarUrl) return;
    const clean = avatarUrl.trim();
    if (!clean || clean.includes('rishabh.webp') || clean.includes('unsplash.com')) return;
    const key = this.getStorageKey('avatar', email);
    this.writeStorage(key, { url: clean, updated_at: Date.now() });
  }

  // ==========================================
  // 2. STUDENT NAME & BASIC PROFILE CACHE
  // ==========================================
  getName(email?: string | null): string | null {
    if (!email) return null;
    const key = this.getStorageKey('name', email);
    const cached = this.readStorage<{ name: string; updated_at: number }>(key);
    return cached?.name || null;
  }

  setName(email: string, name: string): void {
    if (!email || !name) return;
    const key = this.getStorageKey('name', email);
    this.writeStorage(key, { name: name.trim(), updated_at: Date.now() });
  }

  getProfile(email?: string | null): CachedProfile | null {
    if (!email) return null;
    const key = this.getStorageKey('profile', email);
    return this.readStorage<CachedProfile>(key);
  }

  setProfile(email: string, profile: Partial<PyCodeUser>): void {
    if (!email || !profile) return;
    const key = this.getStorageKey('profile', email);
    const payload: CachedProfile = {
      full_name: profile.full_name || '',
      username: profile.username || '',
      avatar_url: profile.avatar_url || null,
      bio: profile.bio || '',
      email: profile.email || email,
      updated_at: Date.now(),
    };
    this.writeStorage(key, payload);

    if (profile.avatar_url) this.setAvatar(email, profile.avatar_url);
    if (profile.full_name) this.setName(email, profile.full_name);
  }

  // ==========================================
  // 3. FILES & WORKSPACE CACHE
  // ==========================================
  getWorkspace(email?: string | null): CachedWorkspace | null {
    if (!email) return null;
    const key = this.getStorageKey('workspace', email);
    return this.readStorage<CachedWorkspace>(key);
  }

  setWorkspace(
    email: string,
    workspace: {
      total_files: number;
      folders: string[];
      files: WorkspaceFile[];
      file_tree: FileTreeNode[];
    }
  ): void {
    if (!email || !workspace) return;
    const key = this.getStorageKey('workspace', email);
    const payload: CachedWorkspace = {
      total_files: workspace.total_files || 0,
      folders: workspace.folders || [],
      files: workspace.files || [],
      file_tree: workspace.file_tree || [],
      updated_at: Date.now(),
    };
    this.writeStorage(key, payload);

    // Cache each file's code individually for instant access
    if (Array.isArray(workspace.files)) {
      workspace.files.forEach((file) => {
        if (file.filename && file.code) {
          this.setFileCode(email, file.filename, file.code);
        }
      });
    }
  }

  getFileCode(email: string, filename: string): string | null {
    if (!email || !filename) return null;
    const key = this.getStorageKey('file', `${email}_${filename}`);
    const cached = this.readStorage<{ code: string; updated_at: number }>(key);
    return cached?.code || null;
  }

  setFileCode(email: string, filename: string, code: string): void {
    if (!email || !filename) return;
    const key = this.getStorageKey('file', `${email}_${filename}`);
    this.writeStorage(key, { code, updated_at: Date.now() });
  }

  // ==========================================
  // 4. INSTANT CACHED USER DATA SNAPSHOT (SWR)
  // Position is STRICTLY omitted from cache!
  // ==========================================
  getCachedUserData(email?: string | null): MentorshipSyncPayload | null {
    if (!email) return null;
    const profile = this.getProfile(email);
    const workspace = this.getWorkspace(email);

    if (!profile && !workspace) return null;

    // Detect and purge legacy poisoned mock cache (auto-hydrated 16 starter files or generated bio)
    if (workspace && Array.isArray(workspace.files)) {
      const isMockWorkspace = workspace.files.some(
        (f) => f.filename === 'BinarySearch.py' || f.name === 'BinarySearch.py' || f.name === 'Plotly.py'
      );
      if (isMockWorkspace && workspace.total_files === 16) {
        this.clearUserCache(email);
        return null;
      }
    }
    if (profile && (profile.username?.startsWith('student_') || profile.bio?.includes('Active Python developer practicing'))) {
      this.clearUserCache(email);
      return null;
    }

    const cachedAvatar = profile?.avatar_url || this.getAvatar(email) || null;
    const cachedName = profile?.full_name || this.getName(email) || '';

    return {
      success: true,
      is_cached_snapshot: true,
      user: {
        id: '',
        email: profile?.email || email,
        username: profile?.username || email.split('@')[0],
        full_name: cachedName,
        avatar_url: cachedAvatar,
        bio: profile?.bio || '',
        created_at: '',
        stats: {
          questions_solved_count: 0,
          total_submissions: 0,
          tests_attempted_count: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
        },
      },
      workspace: workspace
        ? {
            total_files: workspace.total_files,
            folders: workspace.folders,
            files: workspace.files,
            file_tree: workspace.file_tree,
          }
        : {
            total_files: 0,
            folders: [],
            files: [],
            file_tree: [],
          },
      heatmap: {
        daily_counts: {},
        current_streak: 0,
        longest_streak: 0,
        solved_questions: [],
      },
      tests_and_assessments: {
        total_attempts: 0,
        past_attempts: [],
        available_codeathons: [],
        // Position / live ranking is strictly omitted; it continuously updates from fresh network
      },
    };
  }

  // ==========================================
  // 5. PRACTICE QUESTIONS CACHE (TTL: 15 mins)
  // ==========================================
  getQuestions(queryKey: string, ttlMs = 15 * 60 * 1000): CachedQuestions | null {
    const key = this.getStorageKey('questions', queryKey);
    const cached = this.readStorage<CachedQuestions>(key);
    if (!cached) return null;
    if (Date.now() - cached.updated_at > ttlMs) {
      return null;
    }
    return cached;
  }

  setQuestions(
    queryKey: string,
    data: {
      categories: QuestionCategory[];
      questions: PracticeQuestion[];
      total_questions?: number;
    }
  ): void {
    const key = this.getStorageKey('questions', queryKey);
    this.writeStorage(key, {
      categories: data.categories || [],
      questions: data.questions || [],
      total_questions: data.total_questions,
      updated_at: Date.now(),
    });
  }

  // ==========================================
  // CACHE CLEARING UTILITY
  // ==========================================
  clearUserCache(email: string): void {
    if (!email) return;
    const clean = email.toLowerCase().trim();
    // 1. Purge matching keys from memCache
    for (const key of Array.from(this.memCache.keys())) {
      if (key.includes(clean)) {
        this.memCache.delete(key);
      }
    }
    // 2. Purge all matching keys from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('rishabhlabs_pycode_') || key.startsWith('rishabhlabs_workspace_')) && key.includes(clean)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }
}

export const pycodeCache = new PyCodeCache();

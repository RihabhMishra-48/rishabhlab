// types/pycode.ts

export interface PyCodeUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  stats: {
    questions_solved_count: number;
    total_submissions: number;
    tests_attempted_count: number;
    current_streak_days: number;
    longest_streak_days: number;
  };
}

export interface WorkspaceFile {
  name: string;
  filename: string;
  folder: string | null;
  code: string;
  last_modified: string;
  open_editor_url?: string;
  share_url?: string;
}

export interface FolderDetail {
  name: string;
  files_count: number;
  open_editor_url?: string;
  share_url?: string;
}

export interface FileTreeNode {
  type: 'folder' | 'file';
  name: string;
  path?: string;
  code?: string;
  last_modified?: string;
  open_editor_url?: string;
  share_url?: string;
  children?: FileTreeNode[];
}

export interface SolvedQuestionRecord {
  question_id: number;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  code: string;
  passed_cases: number;
  total_cases: number;
  solved_at: string;
  practice_url: string;
}

export interface CodeathonAttempt {
  test_id: string;
  test_title: string;
  test_description: string;
  score: number;
  score_percentage: number;
  status: 'completed' | 'in_progress' | 'disqualified';
  is_disqualified: boolean;
  warnings_count: number;
  started_at: string;
  completed_at: string;
  questions_answered: number;
  leaderboard_url?: string;
}

export interface AvailableCodeathon {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  creator_name?: string;
  total_questions: number;
  timings: {
    start_time: string;
    end_time: string;
    duration_minutes: number | null;
  };
  status: 'live' | 'upcoming' | 'ended';
  status_label: string;
  is_live: boolean;
  is_upcoming: boolean;
  is_ended?: boolean;
  has_already_attempted?: boolean;
  attempt_url: string;
  leaderboard_url?: string;
  user_attempt?: {
    has_attempted: boolean;
    score?: number;
    is_completed?: boolean;
    is_disqualified?: boolean;
  } | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string | null;
  roll_number?: string;
  course?: string;
  section?: string;
  score: number;
  score_percentage: number;
  accuracy?: number;
  passed_cases: number;
  total_cases: number;
  time_taken_formatted: string;
  warnings_count: number;
  is_disqualified: boolean;
}

export interface CodeathonLeaderboardResponse {
  success: boolean;
  error?: string;
  codeathon: {
    id: string;
    title: string;
    total_participants: number;
    total_questions: number;
  };
  leaderboard: LeaderboardEntry[];
}

export interface MentorshipSyncPayload {
  success: boolean;
  not_found?: boolean;
  is_cached_snapshot?: boolean;
  error?: string;
  user: PyCodeUser;
  workspace: {
    total_files: number;
    folders: string[];
    folder_details?: FolderDetail[];
    files: WorkspaceFile[];
    file_tree: FileTreeNode[];
  };
  heatmap: {
    daily_counts: Record<string, number>;
    current_streak: number;
    longest_streak: number;
    solved_questions: SolvedQuestionRecord[];
  };
  tests_and_assessments: {
    total_attempts: number;
    past_attempts: CodeathonAttempt[];
    available_codeathons: AvailableCodeathon[];
  };
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  total_questions: number;
}

export interface PracticeQuestion {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  category_name: string;
  category_description?: string;
  description: string; // Rich pre-rendered HTML containing Problem Statement, Schema, Constraints, Examples
  starter_code: string;
  start_url: string;
  practice_url?: string;
}

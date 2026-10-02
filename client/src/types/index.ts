export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'college_admin' | 'super_admin';
  college?: string;
  degree?: string;
  year?: string;
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  targetGoal?: string;
  isOnboarded: boolean;
}

export interface MissionTask {
  taskId: string;
  type: 'learn' | 'practice' | 'build' | 'ship';
  title: string;
  durationMinutes: number;
  durationText: string;
  description: string;
  isCompleted: boolean;
  actionUrl: string;
  proofRequired: boolean;
  proofSubmitted?: string;
  completedAt?: string;
}

export interface DailyMission {
  _id: string;
  dayNumber: number;
  trackTitle: string;
  dateString: string;
  quote: string;
  tasks: MissionTask[];
  isAllCompleted: boolean;
  completedTasksCount: number;
}

export interface RoadmapNode {
  nodeId: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  status: 'completed' | 'in_progress' | 'locked';
  estimatedHours: number;
  skillsCovered: string[];
  lessonsCount: number;
  projectsCount: number;
  iconName: string;
}

export interface Roadmap {
  _id: string;
  title: string;
  slug: string;
  category: string;
  targetLevel: string;
  estimatedDailyTime: string;
  totalDurationDays: number;
  totalNodes: number;
  completedNodes: number;
  nodes: RoadmapNode[];
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  tasks: ProjectTask[];
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
  estimatedHours: number;
  progressPercent: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  githubRepoUrl?: string;
  liveDeployUrl?: string;
  demoVideoUrl?: string;
  screenshots: string[];
  requirements: string[];
  milestones: ProjectMilestone[];
  proofOfWorkSubmitted: boolean;
  mentorFeedback?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  isDebuggingChallenge?: boolean;
  brokenBugExplanation?: string;
  descriptionMarkdown: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  publicTestCases: Array<{
    testCaseId: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  tags: string[];
  acceptanceRate: number;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  track: string;
  moduleTitle: string;
  order: number;
  readTime: string;
  overview: string;
  keyTakeaways: string[];
  contentSections: Array<{
    heading: string;
    bodyMarkdown: string;
    codeSnippet?: string;
    codeLanguage?: string;
    note?: string;
  }>;
  interactiveSandbox: {
    instructions: string;
    initialCode: string;
    solutionCode: string;
    language: string;
    expectedOutput: string;
  };
  quiz: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface Mentor {
  _id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  hourlyRate: string;
  topics: string[];
  availability: string[];
  isAvailableToday: boolean;
  domain?: string;
}

export interface Hackathon {
  _id: string;
  hackathonName: string;
  targetEventDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  problemStatement: string;
  selectedTrack: string;
  teamMembers: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  phases: Array<{
    phaseId: string;
    name: string;
    daysRange: string;
    status: 'completed' | 'active' | 'upcoming';
    description: string;
    deliverables: string[];
  }>;
}

export interface WeeklyReview {
  _id: string;
  weekLabel: string;
  dateRange: string;
  plannedHours: number;
  completedHours: number;
  completedMinutes: number;
  completionPercentage: number;
  completedItems: string[];
  nextWeekItems: string[];
  reflectionText: string;
  mentorFeedback?: string;
  aiAdaptiveAdjustment?: string;
}

export interface College {
  _id: string;
  name: string;
  code: string;
  location: string;
  logo: string;
  totalStudents: number;
  activeStudents: number;
  averageExecutionRate: number;
  skillDistribution: {
    webDev: number;
    aiMl: number;
    dataAnalytics: number;
    cybersecurity: number;
  };
  topProjectsCount: number;
  activeHackathonTeamsCount: number;
}

export interface PricingPlan {
  _id: string;
  key: 'free' | 'pro' | 'mentorship';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  tagline: string;
  features: string[];
  isPopular?: boolean;
}

import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboarding extends Document {
  userId: mongoose.Types.ObjectId;
  goal: string; // 'Web Development' | 'AI/ML' | 'App Development' | 'Cybersecurity' | 'Data / Analytics' | 'Not Sure Yet'
  currentLevel: string; // 'Complete Beginner' | 'Familiar' | 'Building' | 'Advanced'
  availableTime: string; // '30 minutes/day' | '1 hour/day' | '2 hours/day' | '3+ hours/day'
  desiredOutcome: string; // 'Learn skills' | 'Build projects' | 'Prepare for hackathons' | 'Internship preparation' | 'Placement preparation'
  targetDate: string;
  existingSkills: string[];
  githubProfile?: string;
  preferredLearningStyle?: string;
  status: 'completed' | 'draft';
}

const OnboardingSchema = new Schema<IOnboarding>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: String, required: true },
    currentLevel: { type: String, required: true },
    availableTime: { type: String, required: true },
    desiredOutcome: { type: String, required: true },
    targetDate: { type: String, default: '90 days' },
    existingSkills: [{ type: String }],
    githubProfile: { type: String },
    preferredLearningStyle: { type: String, default: 'Hands-on Building' },
    status: { type: String, enum: ['completed', 'draft'], default: 'completed' },
  },
  { timestamps: true }
);

export const Onboarding = mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  targetGoal: string;
  level?: string;
  verifiedSkills?: string[];
  streakDays: number;
  totalPoints: number;
  activeRoadmapId?: mongoose.Types.ObjectId;
  progressPercent: number;
  skillsCompleted: number;
  totalSkills: number;
  projectsCompleted: number;
  totalProjects: number;
  githubStats: {
    connected: boolean;
    username: string;
    totalCommits: number;
    reposCount: number;
    recentActivities: Array<{
      repo: string;
      message: string;
      timestamp: Date;
    }>;
  };
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetGoal: { type: String, default: '' },
    streakDays: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    activeRoadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    progressPercent: { type: Number, default: 0 },
    skillsCompleted: { type: Number, default: 0 },
    totalSkills: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    githubStats: {
      connected: { type: Boolean, default: false },
      username: { type: String, default: '' },
      totalCommits: { type: Number, default: 0 },
      reposCount: { type: Number, default: 0 },
      recentActivities: [],
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

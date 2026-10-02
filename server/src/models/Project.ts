import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectTask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface IProjectMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  tasks: IProjectTask[];
}

export interface IProject extends Document {
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
  milestones: IProjectMilestone[];
  requirements: string[];
  proofOfWorkSubmitted: boolean;
  mentorFeedback?: string;
  assignedUserId?: mongoose.Types.ObjectId;
}

const ProjectTaskSchema = new Schema<IProjectTask>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  isCompleted: { type: Boolean, default: false },
});

const ProjectMilestoneSchema = new Schema<IProjectMilestone>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  tasks: [ProjectTaskSchema],
});

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, default: 'Web Development' },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    techStack: [{ type: String }],
    estimatedHours: { type: Number, default: 24 },
    progressPercent: { type: Number, default: 0 },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'In Progress' },
    githubRepoUrl: { type: String },
    liveDeployUrl: { type: String },
    demoVideoUrl: { type: String },
    screenshots: [{ type: String }],
    milestones: [ProjectMilestoneSchema],
    requirements: [{ type: String }],
    proofOfWorkSubmitted: { type: Boolean, default: false },
    mentorFeedback: { type: String },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

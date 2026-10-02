import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapNode {
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
  lessonIds?: mongoose.Types.ObjectId[];
}

export interface IRoadmap extends Document {
  title: string;
  slug: string;
  category: string;
  targetLevel: string;
  estimatedDailyTime: string;
  totalDurationDays: number;
  totalNodes: number;
  completedNodes: number;
  nodes: IRoadmapNode[];
  isCustomGenerated: boolean;
  userId?: mongoose.Types.ObjectId;
}

const RoadmapNodeSchema = new Schema<IRoadmapNode>({
  nodeId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  category: { type: String },
  status: { type: String, enum: ['completed', 'in_progress', 'locked'], default: 'locked' },
  estimatedHours: { type: Number, default: 20 },
  skillsCovered: [{ type: String }],
  lessonsCount: { type: Number, default: 6 },
  projectsCount: { type: Number, default: 1 },
  iconName: { type: String, default: 'Code' },
  lessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, required: true },
    targetLevel: { type: String, default: 'Beginner' },
    estimatedDailyTime: { type: String, default: '2 hr/day' },
    totalDurationDays: { type: Number, default: 90 },
    totalNodes: { type: Number, default: 6 },
    completedNodes: { type: Number, default: 1 },
    nodes: [RoadmapNodeSchema],
    isCustomGenerated: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);

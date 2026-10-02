import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyReview extends Document {
  userId: mongoose.Types.ObjectId;
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
  submittedAt?: Date;
}

const WeeklyReviewSchema = new Schema<IWeeklyReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekLabel: { type: String, default: 'Week 3' },
    dateRange: { type: String, default: '7 Apr - 13 Apr' },
    plannedHours: { type: Number, default: 8 },
    completedHours: { type: Number, default: 6 },
    completedMinutes: { type: Number, default: 40 },
    completionPercentage: { type: Number, default: 84 },
    completedItems: [{ type: String }],
    nextWeekItems: [{ type: String }],
    reflectionText: { type: String, default: '' },
    mentorFeedback: { type: String },
    aiAdaptiveAdjustment: { type: String },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export const WeeklyReview = mongoose.model<IWeeklyReview>('WeeklyReview', WeeklyReviewSchema);

export interface ICollege extends Document {
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

const CollegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, default: 'Mathura, Uttar Pradesh' },
    logo: { type: String, default: '/avatars/gla.png' },
    totalStudents: { type: Number, default: 2450 },
    activeStudents: { type: Number, default: 1980 },
    averageExecutionRate: { type: Number, default: 64 },
    skillDistribution: {
      webDev: { type: Number, default: 42 },
      aiMl: { type: Number, default: 28 },
      dataAnalytics: { type: Number, default: 18 },
      cybersecurity: { type: Number, default: 12 },
    },
    topProjectsCount: { type: Number, default: 142 },
    activeHackathonTeamsCount: { type: Number, default: 18 },
  },
  { timestamps: true }
);

export const College = mongoose.model<ICollege>('College', CollegeSchema);

export interface IPricingPlan extends Document {
  key: 'free' | 'pro' | 'mentorship';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  tagline: string;
  features: string[];
  isPopular?: boolean;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    key: { type: String, enum: ['free', 'pro', 'mentorship'], required: true, unique: true },
    name: { type: String, required: true },
    priceMonthly: { type: Number, required: true },
    priceAnnual: { type: Number, required: true },
    currency: { type: String, default: '₹' },
    tagline: { type: String, required: true },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PricingPlan = mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);

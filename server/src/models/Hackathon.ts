import mongoose, { Schema, Document } from 'mongoose';
import { HACKATHON_CATEGORIES, SOURCE_PLATFORMS, HackathonCategory, SourcePlatform } from '../config/scraperConfig';

export interface IHackathonTimelineItem {
  stage: string;
  date: string;
  description?: string;
}

export interface IHackathonPrizeTier {
  place?: string;
  amount?: string;
  perks?: string;
}

export interface IHackathonPrizes {
  total?: string;
  currency?: string;
  breakdown?: IHackathonPrizeTier[];
  rawText?: string;
}

export interface IHackathonDocument extends Document {
  id: string; // Deterministic system hash
  title: string;
  sourcePlatform: SourcePlatform;
  sourceId: string;
  category: HackathonCategory;
  registrationUrl: string;
  summary: string;
  description: string;
  prizes: IHackathonPrizes | string;
  timeline: IHackathonTimelineItem[];
  scrapedAt: Date;
  applicationDeadline?: Date | null;
  location?: string;
  bannerUrl?: string;
  eligibility?: string;
  organization?: string;
  tags: string[];
  status: 'open' | 'upcoming' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const TimelineItemSchema = new Schema<IHackathonTimelineItem>(
  {
    stage: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
  },
  { _id: false }
);

const HackathonSchema = new Schema<IHackathonDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    sourcePlatform: {
      type: String,
      required: true,
      enum: SOURCE_PLATFORMS,
      index: true,
    },
    sourceId: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: HACKATHON_CATEGORIES,
      index: true,
    },
    registrationUrl: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    prizes: { type: Schema.Types.Mixed, default: () => ({ total: 'TBD', breakdown: [] }) },
    timeline: { type: [TimelineItemSchema], default: [] },
    scrapedAt: { type: Date, default: Date.now, index: true },
    applicationDeadline: { type: Date, default: null, index: true },
    location: { type: String, default: 'Online / Virtual' },
    bannerUrl: { type: String, default: '' },
    eligibility: { type: String, default: 'Open to all builders and students globally.' },
    organization: { type: String, default: '' },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['open', 'upcoming', 'closed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on sourcePlatform + sourceId to prevent duplicates at the DB level
HackathonSchema.index({ sourcePlatform: 1, sourceId: 1 }, { unique: true });
HackathonSchema.index({ category: 1, applicationDeadline: 1 });

export const Hackathon = mongoose.model<IHackathonDocument>('Hackathon', HackathonSchema);

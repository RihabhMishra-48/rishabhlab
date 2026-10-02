import mongoose, { Schema, Document } from 'mongoose';

export interface IMentor extends Document {
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

const MentorSchema = new Schema<IMentor>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 48 },
    bio: { type: String, required: true },
    hourlyRate: { type: String, default: 'Free for Pro' },
    topics: [{ type: String }],
    availability: [{ type: String }],
    isAvailableToday: { type: Boolean, default: true },
    domain: { type: String, default: 'General' },
  },
  { timestamps: true }
);

export const Mentor = mongoose.model<IMentor>('Mentor', MentorSchema);

export interface IMentorshipRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  topic: string;
  contextType: 'general' | 'stuck_in_coding' | 'roadmap_review' | 'hackathon_mvp' | 'project_review';
  message: string;
  preferredSlot: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  notesFromMentor?: string;
  meetingLink?: string;
}

const MentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
    topic: { type: String, required: true },
    contextType: {
      type: String,
      enum: ['general', 'stuck_in_coding', 'roadmap_review', 'hackathon_mvp', 'project_review'],
      default: 'general',
    },
    message: { type: String, required: true },
    preferredSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    notesFromMentor: { type: String },
    meetingLink: { type: String },
  },
  { timestamps: true }
);

export const MentorshipRequest = mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema);

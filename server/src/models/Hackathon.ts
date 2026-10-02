import mongoose, { Schema, Document } from 'mongoose';

export interface IHackathonPhase {
  phaseId: string;
  name: string;
  daysRange: string;
  status: 'completed' | 'active' | 'upcoming';
  description: string;
  deliverables: string[];
}

export interface IHackathon extends Document {
  userId: mongoose.Types.ObjectId;
  hackathonName: string;
  targetEventDate: Date;
  daysRemaining: number;
  hoursRemaining: number;
  problemStatement: string;
  selectedTrack: string;
  teamMembers: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  phases: IHackathonPhase[];
  aiOutputs: {
    ideas: Array<{ title: string; pitch: string; viability: string }>;
    problemAnalysis: string;
    techStackRecommendation: string[];
    mvpChecklist: string[];
    pitchDeckOutline: Array<{ slide: string; content: string }>;
    judgeQuestions: Array<{ question: string; goodAnswerStrategy: string }>;
  };
}

const HackathonPhaseSchema = new Schema<IHackathonPhase>({
  phaseId: { type: String, required: true },
  name: { type: String, required: true },
  daysRange: { type: String, required: true },
  status: { type: String, enum: ['completed', 'active', 'upcoming'], default: 'upcoming' },
  description: { type: String },
  deliverables: [{ type: String }],
});

const HackathonSchema = new Schema<IHackathon>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    hackathonName: { type: String, default: 'Smart India Hackathon & InnovateX' },
    targetEventDate: { type: Date, default: () => new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000 + 32 * 60 * 1000) },
    daysRemaining: { type: Number, default: 12 },
    hoursRemaining: { type: Number, default: 4 },
    problemStatement: {
      type: String,
      default: 'Automated AI platform for evaluating student code artifacts, detecting edge case vulnerabilities, and accelerating prototype delivery.',
    },
    selectedTrack: { type: String, default: 'Smart Education & AI' },
    teamMembers: [
      {
        name: { type: String },
        role: { type: String },
        avatar: { type: String },
      },
    ],
    phases: [HackathonPhaseSchema],
    aiOutputs: {
      ideas: [{ title: { type: String }, pitch: { type: String }, viability: { type: String } }],
      problemAnalysis: { type: String },
      techStackRecommendation: [{ type: String }],
      mvpChecklist: [{ type: String }],
      pitchDeckOutline: [{ slide: { type: String }, content: { type: String } }],
      judgeQuestions: [{ question: { type: String }, goodAnswerStrategy: { type: String } }],
    },
  },
  { timestamps: true }
);

export const Hackathon = mongoose.model<IHackathon>('Hackathon', HackathonSchema);

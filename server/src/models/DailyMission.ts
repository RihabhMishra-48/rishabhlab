import mongoose, { Schema, Document } from 'mongoose';

export interface IMissionTask {
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
  completedAt?: Date;
}

export interface IDailyMission extends Document {
  userId: mongoose.Types.ObjectId;
  dayNumber: number;
  trackTitle: string;
  dateString: string;
  quote: string;
  tasks: IMissionTask[];
  isAllCompleted: boolean;
  completedTasksCount: number;
}

const MissionTaskSchema = new Schema<IMissionTask>({
  taskId: { type: String, required: true },
  type: { type: String, enum: ['learn', 'practice', 'build', 'ship'], required: true },
  title: { type: String, required: true },
  durationMinutes: { type: Number, default: 20 },
  durationText: { type: String, default: '20 min' },
  description: { type: String },
  isCompleted: { type: Boolean, default: false },
  actionUrl: { type: String, default: '/learn' },
  proofRequired: { type: Boolean, default: false },
  proofSubmitted: { type: String },
  completedAt: { type: Date },
});

const DailyMissionSchema = new Schema<IDailyMission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dayNumber: { type: Number, default: 17 },
    trackTitle: { type: String, default: 'Web Development' },
    dateString: { type: String, default: '12 Apr, 2026' },
    quote: { type: String, default: 'Small steps every day lead to big results.' },
    tasks: [MissionTaskSchema],
    isAllCompleted: { type: Boolean, default: false },
    completedTasksCount: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const DailyMission = mongoose.model<IDailyMission>('DailyMission', DailyMissionSchema);

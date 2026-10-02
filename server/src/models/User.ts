import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'mentor' | 'college_admin' | 'super_admin';
  college?: string;
  degree?: string;
  year?: string;
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  targetGoal?: string;
  streakDays?: number;
  totalPoints?: number;
  skillsCompleted?: number;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['student', 'mentor', 'college_admin', 'super_admin'],
      default: 'student',
    },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    year: { type: String, default: '' },
    avatar: { type: String, default: '/avatars/rishabh.png' },
    bio: { type: String, default: '' },
    githubUsername: { type: String, default: '' },
    targetGoal: { type: String, default: '' },
    streakDays: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    skillsCompleted: { type: Number, default: 0 },
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

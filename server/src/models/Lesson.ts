import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ILessonSandbox {
  instructions: string;
  initialCode: string;
  solutionCode: string;
  language: string;
  expectedOutput: string;
}

export interface ILesson extends Document {
  title: string;
  slug: string;
  track: string; // 'web-dev' | 'ai-ml' | 'data-analytics'
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
  interactiveSandbox: ILessonSandbox;
  quiz: ILessonQuiz[];
  isCompletedBy: mongoose.Types.ObjectId[];
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    track: { type: String, required: true },
    moduleTitle: { type: String, required: true },
    order: { type: Number, required: true },
    readTime: { type: String, default: '15 min' },
    overview: { type: String, required: true },
    keyTakeaways: [{ type: String }],
    contentSections: [
      {
        heading: { type: String, required: true },
        bodyMarkdown: { type: String, required: true },
        codeSnippet: { type: String },
        codeLanguage: { type: String, default: 'javascript' },
        note: { type: String },
      },
    ],
    interactiveSandbox: {
      instructions: { type: String },
      initialCode: { type: String },
      solutionCode: { type: String },
      language: { type: String, default: 'javascript' },
      expectedOutput: { type: String },
    },
    quiz: [
      {
        question: { type: String },
        options: [{ type: String }],
        correctIndex: { type: Number },
        explanation: { type: String },
      },
    ],
    isCompletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);

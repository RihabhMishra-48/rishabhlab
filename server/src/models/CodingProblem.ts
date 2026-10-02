import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface ICodingProblem extends Document {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  isDebuggingChallenge: boolean; // For "Fix the Bug" lab
  brokenBugExplanation?: string;
  descriptionMarkdown: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: {
    level1Concept: string;
    level2Stronger: string;
    level3Approach: string;
    level4Mentor: string;
  };
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  testCases: ITestCase[];
  tags: string[];
  acceptanceRate: number;
}

const TestCaseSchema = new Schema<ITestCase>({
  testCaseId: { type: String, required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String },
});

const CodingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    category: { type: String, required: true },
    isDebuggingChallenge: { type: Boolean, default: false },
    brokenBugExplanation: { type: String },
    descriptionMarkdown: { type: String, required: true },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    constraints: [{ type: String }],
    hints: {
      level1Concept: { type: String, required: true },
      level2Stronger: { type: String, required: true },
      level3Approach: { type: String, required: true },
      level4Mentor: { type: String, default: 'Would you like to book a 15-min code review session with a mentor to walk through this pattern?' },
    },
    starterCode: {
      javascript: { type: String, required: true },
      python: { type: String, default: '# Write your code here\ndef solution(input):\n    pass' },
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
    },
    testCases: [TestCaseSchema],
    tags: [{ type: String }],
    acceptanceRate: { type: Number, default: 78.4 },
  },
  { timestamps: true }
);

export const CodingProblem = mongoose.model<ICodingProblem>('CodingProblem', CodingProblemSchema);

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number;
  testResults: Array<{
    testCaseId: string;
    passed: boolean;
    input: string;
    actualOutput: string;
    expectedOutput?: string;
    error?: string;
    isHidden: boolean;
  }>;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'],
      required: true,
    },
    passedTestCases: { type: Number, required: true },
    totalTestCases: { type: Number, required: true },
    runtimeMs: { type: Number, default: 42 },
    testResults: [
      {
        testCaseId: { type: String },
        passed: { type: Boolean },
        input: { type: String },
        actualOutput: { type: String },
        expectedOutput: { type: String },
        error: { type: String },
        isHidden: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);

import crypto from 'crypto';
import mongoose, { Schema, Document } from 'mongoose';

export interface PendingSignupPayload {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
  college?: string;
}

interface OtpRecord {
  email: string;
  otp: string;
  type: 'signup' | 'login';
  expiresAt: number;
  attempts: number;
  createdAt: number;
  payload?: PendingSignupPayload;
}

// In-memory zero-latency cache for immediate mobile responsiveness
const inMemoryOtpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryOtpStore.entries()) {
    if (record.expiresAt < now) {
      inMemoryOtpStore.delete(key);
    }
  }
}, 60000);

// Optional MongoDB Mongoose model for cross-process persistence if Mongo is running
interface IOtpDoc extends Document {
  email: string;
  otp: string;
  type: 'signup' | 'login';
  expiresAt: Date;
  attempts: number;
  payload?: any;
}

const OtpSchema = new Schema<IOtpDoc>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    type: { type: String, default: 'signup' },
    expiresAt: { type: Date, required: true, expires: 600 }, // MongoDB TTL index 10 mins
    attempts: { type: Number, default: 0 },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

let OtpModel: mongoose.Model<IOtpDoc> | null = null;
try {
  OtpModel = mongoose.model<IOtpDoc>('OtpVerification', OtpSchema);
} catch {
  OtpModel = (mongoose.models.OtpVerification as mongoose.Model<IOtpDoc>) || null;
}

/**
 * Generate cryptographically secure 8-digit numeric OTP
 */
export function generate8DigitOtp(): string {
  // Generates between 10000000 and 99999999 (always 8 digits)
  return crypto.randomInt(10000000, 100000000).toString();
}

/**
 * Check if user is allowed to request/resend OTP (rate-limiting: min 30s between requests)
 */
export function canRequestOtp(email: string): { allowed: boolean; waitSeconds?: number } {
  const cleanEmail = email.toLowerCase().trim();
  const existing = inMemoryOtpStore.get(cleanEmail);
  if (existing) {
    const elapsedSeconds = Math.floor((Date.now() - existing.createdAt) / 1000);
    if (elapsedSeconds < 30) {
      return { allowed: false, waitSeconds: 30 - elapsedSeconds };
    }
  }
  return { allowed: true };
}

/**
 * Save newly generated 8-digit OTP
 */
export async function saveOtp(
  email: string,
  otp: string,
  type: 'signup' | 'login',
  payload?: PendingSignupPayload
): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  const record: OtpRecord = {
    email: cleanEmail,
    otp,
    type,
    expiresAt,
    attempts: 0,
    createdAt: now,
    payload,
  };

  inMemoryOtpStore.set(cleanEmail, record);

  // If MongoDB is connected, persist as well
  if (mongoose.connection.readyState === 1 && OtpModel) {
    try {
      await OtpModel.deleteMany({ email: cleanEmail, type });
      await OtpModel.create({
        email: cleanEmail,
        otp,
        type,
        expiresAt: new Date(expiresAt),
        attempts: 0,
        payload,
      });
    } catch (err: any) {
      console.warn('⚠️ [OTP Mongo save notice]:', err.message);
    }
  }
}

/**
 * Verify 8-digit OTP
 */
export async function verifyOtp(
  email: string,
  inputOtp: string,
  type: 'signup' | 'login' = 'signup'
): Promise<{ valid: boolean; message?: string; payload?: PendingSignupPayload }> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = inputOtp.trim();

  if (!cleanOtp || cleanOtp.length !== 8) {
    return { valid: false, message: 'Please enter a valid 8-digit verification code.' };
  }

  // Check in-memory store first
  let record = inMemoryOtpStore.get(cleanEmail);

  // Fallback to MongoDB if not in memory (e.g. serverless instance switch)
  if (!record && mongoose.connection.readyState === 1 && OtpModel) {
    try {
      const doc = await OtpModel.findOne({ email: cleanEmail, type }).sort({ createdAt: -1 });
      if (doc) {
        record = {
          email: doc.email,
          otp: doc.otp,
          type: doc.type as any,
          expiresAt: doc.expiresAt.getTime(),
          attempts: doc.attempts,
          createdAt: doc.get('createdAt') ? new Date(doc.get('createdAt')).getTime() : Date.now(),
          payload: doc.payload,
        };
      }
    } catch (err: any) {
      console.warn('⚠️ [OTP Mongo lookup notice]:', err.message);
    }
  }

  if (!record) {
    return { valid: false, message: 'Verification code not found or expired. Please request a new code.' };
  }

  if (record.type !== type) {
    return { valid: false, message: 'Invalid verification context. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    inMemoryOtpStore.delete(cleanEmail);
    return { valid: false, message: 'Verification code has expired. Please request a new code.' };
  }

  if (record.attempts >= 5) {
    inMemoryOtpStore.delete(cleanEmail);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  record.attempts += 1;

  if (record.otp !== cleanOtp) {
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      message: `Incorrect code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code locked. Please resend.'}`,
    };
  }

  // Successfully verified!
  const savedPayload = record.payload;
  inMemoryOtpStore.delete(cleanEmail);

  if (mongoose.connection.readyState === 1 && OtpModel) {
    try {
      await OtpModel.deleteMany({ email: cleanEmail });
    } catch {
      // Ignore
    }
  }

  return { valid: true, payload: savedPayload };
}

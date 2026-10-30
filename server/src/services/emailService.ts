import { Resend } from 'resend';
import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith('re_') ? process.env.SMTP_PASS : null);
  if (key) {
    resendClient = new Resend(key.trim());
  }
  return resendClient;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || (process.env.RESEND_API_KEY ? 'smtp.resend.com' : undefined);
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || (process.env.RESEND_API_KEY ? 'resend' : process.env.GMAIL_USER);
  const pass = process.env.SMTP_PASS || process.env.RESEND_API_KEY || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

/**
 * Universal HTML Email Dispatcher
 * Primary delivery via official Resend API (SDK)
 */
export async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string,
  contextLabel = 'Email'
): Promise<boolean> {
  if (!to || !to.includes('@')) {
    console.warn(`⚠️ [Email Service] Invalid recipient address provided: "${to}"`);
    return false;
  }

  // 1. Primary Engine: Official Resend API
  const client = getResendClient();
  if (client) {
    try {
      const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'Rishabhlabs <rishabhlabs@vrindopnishad.in>';
      const { data, error } = await client.emails.send({
        from,
        to: [to],
        subject,
        html,
      });

      if (!error && data?.id) {
        console.log(`✅ [Email Service: Resend API] ${contextLabel} successfully delivered to ${to} (ID: ${data.id})`);
        return true;
      }
      if (error) {
        console.warn(`⚠️ [Email Service: Resend API] Delivery issue for ${to}:`, error);
      }
    } catch (sdkErr: any) {
      console.warn(`⚠️ [Email Service: Resend API] Exception sending to ${to}:`, sdkErr.message);
    }
  }

  // 2. Secondary Engine: Nodemailer SMTP Fallback
  const activeTransporter = getTransporter();
  if (activeTransporter) {
    try {
      const from = process.env.SMTP_FROM || process.env.RESEND_FROM || `"Rishabhlabs" <${process.env.SMTP_USER || 'rishabhlabs@vrindopnishad.in'}>`;
      await activeTransporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`✅ [Email Service: SMTP Fallback] ${contextLabel} successfully delivered via SMTP to ${to}`);
      return true;
    } catch (err: any) {
      console.error(`⚠️ [Email Service: SMTP Fallback] SMTP send failed:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`ℹ️ [EMAIL SERVICE DISPATCH LOG]`);
  console.log(`📌 Type: ${contextLabel}`);
  console.log(`📨 To: ${to}`);
  console.log(`📋 Subject: ${subject}`);
  console.log(`==================================================\n`);
  return true;
}

// ============================================================================
// 1. AUTH OTP VERIFICATION EMAIL
// ============================================================================

export async function sendOtpEmail(email: string, otp: string, type: 'signup' | 'login' = 'signup'): Promise<boolean> {
  const isSignup = type === 'signup';
  const subject = isSignup
    ? `${otp} is your RishabhLabs registration verification code`
    : `${otp} is your RishabhLabs login code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; background-color: #0f172a; border-radius: 12px; text-align: center; line-height: 44px; color: #ffffff; font-weight: 700; font-size: 20px;">
                RL
              </div>
              <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                ${isSignup ? 'Confirm Your Account' : 'Verify Your Identity'}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                ${isSignup ? 'Enter this 8-digit verification code to complete your signup.' : 'Use this 8-digit code to log in to your account.'}
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding: 16px 32px 24px; text-align: center;">
              <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 16px; padding: 20px; text-align: center;">
                <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #0f172a; display: block;">
                  ${otp}
                </span>
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-top: 8px; display: block;">
                  Valid for 10 minutes
                </span>
              </div>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 12px; color: #64748b; line-height: 1.6;">
                Never share this verification code with anyone. RishabhLabs staff will never ask for your code.
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                  © 2026 RishabhLabs. Student Engineering Execution & Career Roadmap Platform.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendHtmlEmail(email, subject, html, `Auth OTP (${type})`);
}

// ============================================================================
// 2. MENTOR NOTIFICATION: NEW CONSULTATION BOOKING
// ============================================================================

export interface MentorBookingEmailParams {
  mentorEmail: string;
  mentorName: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentCollege?: string;
  topic: string;
  preferredSlot: string;
  requirements?: string;
  bookingCode: string;
  sessionId?: string;
}

export async function sendMentorBookingNotificationEmail(params: MentorBookingEmailParams): Promise<boolean> {
  const {
    mentorEmail,
    mentorName,
    studentName,
    studentEmail,
    studentPhone,
    studentCollege,
    topic,
    preferredSlot,
    requirements,
    bookingCode,
  } = params;

  const appUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://rishabhlabs.vercel.app';
  const workspaceUrl = `${appUrl}/mentor/sessions`;
  const subject = `New 1:1 Mentorship Request from ${studentName} [${bookingCode}]`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
          
          <!-- Top Brand Banner -->
          <tr>
            <td style="background-color: #0b0f19; padding: 32px 32px 28px; text-align: left; border-bottom: 2px solid #10b981;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Rishabh<span style="color: #10b981;">Labs</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Mentor Operations Portal
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #10b981;">
                      New Booking
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">
                Hi ${mentorName || 'Mentor'},
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                A student has submitted a new 1:1 consultation request on RishabhLabs. Please review their discussion topic, scheduled window, and confirm your availability.
              </p>

              <!-- Session Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569;">
                      Session Overview • ${bookingCode}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="36%" style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Focus Topic
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                          ${topic}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Requested Slot
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #059669;">
                          ${preferredSlot}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Student Name
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                          ${studentName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Student Email
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #2563eb;">
                          <a href="mailto:${studentEmail}" style="color: #2563eb; text-decoration: none;">${studentEmail}</a>
                        </td>
                      </tr>
                      ${studentPhone ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Mobile / WhatsApp
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #059669;">
                          <a href="tel:${studentPhone}" style="color: #059669; text-decoration: none;">${studentPhone}</a>
                          <span style="font-size: 11px; font-weight: 500; color: #64748b; margin-left: 8px;">
                            (<a href="https://wa.me/${studentPhone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #10b981; text-decoration: underline;">WhatsApp</a>)
                          </span>
                        </td>
                      </tr>` : ''}
                      ${studentCollege ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Institution
                        </td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">
                          ${studentCollege}
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Student Problem Description -->
              <div style="margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
                  Student Requirements & Context:
                </span>
                <div style="background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 14px 18px; font-size: 13px; color: #334155; line-height: 1.6; font-style: italic;">
                  ${requirements ? `"${requirements.replace(/\n/g, '<br/>')}"` : 'No additional note provided by the student.'}
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${workspaceUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  Open Mentor Workspace & Confirm Slot →
                </a>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
                You can attach a Google Meet or Zoom link, provide preparation guidelines, and message the student directly through the platform.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #64748b;">
                RishabhLabs • Student Execution & Engineering Mentorship Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Automated notification sent to verified mentors. Manage preferences in your workspace.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendHtmlEmail(mentorEmail, subject, html, `Mentor Booking Request (${bookingCode})`);
}

// ============================================================================
// 3. STUDENT NOTIFICATION: BOOKING ACCEPTED / CONFIRMED
// ============================================================================

export interface StudentAcceptanceEmailParams {
  studentEmail: string;
  studentName: string;
  mentorName: string;
  mentorTitle?: string;
  topic: string;
  confirmedSlot: string;
  meetingLink?: string;
  mentorNotes?: string;
  bookingCode: string;
  sessionId?: string;
}

export async function sendStudentBookingAcceptedEmail(params: StudentAcceptanceEmailParams): Promise<boolean> {
  const {
    studentEmail,
    studentName,
    mentorName,
    mentorTitle,
    topic,
    confirmedSlot,
    meetingLink,
    mentorNotes,
    bookingCode,
  } = params;

  const appUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://rishabhlabs.vercel.app';
  const portalUrl = `${appUrl}/mentorship`;
  const subject = `Confirmed: Your 1:1 Mentorship Session with ${mentorName} is Scheduled! [${bookingCode}]`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
          
          <!-- Top Brand Banner -->
          <tr>
            <td style="background-color: #0b0f19; padding: 32px 32px 28px; text-align: left; border-bottom: 2px solid #10b981;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Rishabh<span style="color: #10b981;">Labs</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Student Mentorship Network
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #10b981;">
                      ✓ Confirmed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">
                Hi ${studentName || 'Learner'},
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.6;">
                Great news! Your mentor, <strong style="color: #0f172a;">${mentorName}</strong>, has confirmed your 1:1 mentorship consultation. Your booking details are ready below.
              </p>

              <!-- Session Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569;">
                      Consultation Pass • ${bookingCode}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="36%" style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Mentor
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                          ${mentorName} ${mentorTitle ? `<span style="font-size: 12px; font-weight: 500; color: #64748b;">(${mentorTitle})</span>` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Scheduled Time
                        </td>
                        <td style="padding: 6px 0; font-size: 15px; font-weight: 800; color: #059669;">
                          ${confirmedSlot}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                          Topic
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                          ${topic}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Video Call Highlight Card -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46; margin-bottom: 8px;">
                  📹 Live Video Call Link
                </span>
                ${meetingLink ? `
                  <a href="${meetingLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-bottom: 8px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">
                    Join Video Call →
                  </a>
                  <span style="display: block; font-size: 11px; color: #047857; font-family: monospace; word-break: break-all;">
                    ${meetingLink}
                  </span>
                ` : `
                  <p style="margin: 0; font-size: 13px; color: #047857; font-weight: 600;">
                    Your mentor will post the direct video call link shortly before your session time. You can also access it live in your dashboard.
                  </p>
                `}
              </div>

              <!-- Mentor Preparation Notes -->
              ${mentorNotes ? `
              <div style="margin-bottom: 24px;">
                <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
                  Notes From Mentor:
                </span>
                <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; padding: 14px 18px; font-size: 13px; color: #1e293b; line-height: 1.6;">
                  ${mentorNotes.replace(/\n/g, '<br/>')}
                </div>
              </div>` : ''}

              <!-- Session Checklist -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 8px;">
                  💡 Tips to get the most out of your session:
                </span>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.8;">
                  <li>Join 3–5 minutes early to test your audio & video.</li>
                  <li>Have your GitHub repository, architecture diagram, or queries ready to share.</li>
                  <li>Take notes during the review and follow up with the actionable roadmap steps.</li>
                </ul>
              </div>

              <!-- Portal Link -->
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="${portalUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px;">
                  View in Mentorship Portal →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #64748b;">
                RishabhLabs • Student Execution & Engineering Mentorship Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Have questions before your call? Reply to this email or send a message directly via your platform dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendHtmlEmail(studentEmail, subject, html, `Student Session Confirmation (${bookingCode})`);
}

// ============================================================================
// 4. PLATFORM COMMUNICATION: REPLIES & MESSAGES BETWEEN MENTOR & STUDENT
// ============================================================================

export interface MentorshipCommunicationEmailParams {
  toEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: 'mentor' | 'student';
  bookingCode: string;
  topic: string;
  slot?: string;
  message: string;
  replyUrl?: string;
}

export async function sendMentorshipCommunicationEmail(params: MentorshipCommunicationEmailParams): Promise<boolean> {
  const {
    toEmail,
    recipientName,
    senderName,
    senderRole,
    bookingCode,
    topic,
    slot,
    message,
  } = params;

  const appUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'https://rishabhlabs.vercel.app';
  const actionUrl = senderRole === 'mentor' ? `${appUrl}/mentorship` : `${appUrl}/mentor/sessions`;
  const roleTitle = senderRole === 'mentor' ? 'Mentor' : 'Student';
  const subject = `New Message from ${senderName} (${roleTitle}) • Consultation ${bookingCode}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
          
          <!-- Top Brand Banner -->
          <tr>
            <td style="background-color: #0b0f19; padding: 28px 32px; text-align: left; border-bottom: 2px solid ${senderRole === 'mentor' ? '#10b981' : '#3b82f6'};">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Rishabh<span style="color: ${senderRole === 'mentor' ? '#10b981' : '#3b82f6'};">Labs</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Direct Consultation Communication
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: ${senderRole === 'mentor' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'}; border: 1px solid ${senderRole === 'mentor' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${senderRole === 'mentor' ? '#10b981' : '#3b82f6'};">
                      ${bookingCode}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                Hi ${recipientName || 'there'},
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                <strong style="color: #0f172a;">${senderName}</strong> (${roleTitle}) has sent you a direct message regarding your consultation on <strong style="color: #0f172a;">${topic}</strong>.
              </p>

              <!-- Message Speech Bubble -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${senderRole === 'mentor' ? '#10b981' : '#3b82f6'}; border-radius: 0 16px 16px 0; padding: 20px 24px; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ${senderRole === 'mentor' ? '#059669' : '#2563eb'}; margin-bottom: 8px;">
                  Message from ${senderName}:
                </span>
                <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.7; white-space: pre-wrap;">
${message.replace(/\n/g, '<br/>')}
                </p>
              </div>

              <!-- Context Pill -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 24px; padding: 12px 16px;">
                <tr>
                  <td style="font-size: 12px; color: #475569;">
                    <strong>Topic:</strong> ${topic} ${slot ? `• <strong>Slot:</strong> ${slot}` : ''}
                  </td>
                </tr>
              </table>

              <!-- Reply Action Button -->
              <div style="text-align: center; margin-bottom: 16px;">
                <a href="${actionUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  Open Platform & Send Reply →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #64748b;">
                RishabhLabs • Student Execution & Engineering Mentorship Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Direct message initiated through the RishabhLabs portal. All communications are logged for platform safety.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendHtmlEmail(toEmail, subject, html, `Direct Mentorship Message (${bookingCode})`);
}

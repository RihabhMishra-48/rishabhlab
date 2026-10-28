import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

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

  // Always log OTP in server console for visibility
  console.log(`\n==================================================`);
  console.log(`🔑 [EMAIL OTP VERIFICATION]`);
  console.log(`📨 Recipient: ${email}`);
  console.log(`🔢 8-Digit OTP: ${otp}`);
  console.log(`⏳ Action: ${type}`);
  console.log(`==================================================\n`);

  const activeTransporter = getTransporter();
  if (activeTransporter) {
    try {
      const from = process.env.SMTP_FROM || `"RishabhLabs Auth" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'auth@rishabhlabs.com'}>`;
      await activeTransporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });
      console.log(`✅ [Email Service] OTP successfully delivered via SMTP to ${email}`);
      return true;
    } catch (err: any) {
      console.error(`⚠️ [Email Service] SMTP send failed:`, err.message);
      // Fallback: console OTP was already logged
      return false;
    }
  } else {
    console.log(`ℹ️ [Email Service] SMTP credentials not configured in server/.env (SMTP_USER/PASS or GMAIL_USER/PASS). OTP logged above for instant testing.`);
    return true;
  }
}

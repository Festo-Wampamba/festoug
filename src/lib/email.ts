import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Reset your FestoUG password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #D6E4F0; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #5D7A9A; font-size: 14px; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #5BA4CF; color: #0B1120; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Reset Password
        </a>
        <p style="color: #5D7A9A; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

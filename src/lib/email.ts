import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

/**
 * Escape characters with HTML meaning so user-supplied values cannot
 * inject markup into an email body (e.g. phishing links via a ban reason).
 */
function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  const resend = getResend();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Your FestoUG password reset code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#D6E4F0;margin-bottom:16px;">Password reset code</h2>
        <p style="color:#5D7A9A;font-size:14px;line-height:1.6;">
          Use the code below to reset your password. It expires in 5 minutes.
        </p>
        <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
          <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#5BA4CF;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#5D7A9A;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationOTPEmail(email: string, otp: string) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/auth/verify-email?email=${encodeURIComponent(email)}&code=${otp}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Verify your FestoUG email address",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#D6E4F0;margin-bottom:16px;">Verify your email</h2>
        <p style="color:#5D7A9A;font-size:14px;line-height:1.6;">
          Thanks for signing up! Enter the code below, or click the button to verify your email.
          It expires in 5 minutes.
        </p>
        <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
          <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#5BA4CF;font-family:monospace;">${otp}</span>
        </div>
        <a href="${verifyUrl}" style="display:inline-block;background:#5BA4CF;color:#0B1120;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#5D7A9A;font-size:12px;margin-top:24px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const resend = getResend();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Reset your FestoUG password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #D6E4F0; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #5D7A9A; font-size: 14px; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in 5 minutes.
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

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  const resend = getResend();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Verify your FestoUG email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #D6E4F0; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #5D7A9A; font-size: 14px; line-height: 1.6;">
          Thanks for signing up! Click the button below to verify your email address.
          This link expires in 5 minutes.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #5BA4CF; color: #0B1120; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Verify Email
        </a>
        <p style="color: #5D7A9A; font-size: 12px; margin-top: 24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendTrialWelcomeEmail(
  email: string,
  name: string,
  plan: string,
  trialEndsAt: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard/subscription`;
  const endDate = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  const safeName = escapeHtml(name);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Your 14-day free trial has started — ${plan} Plan`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">Welcome, ${safeName}! 🎉</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your <strong style="color:#10b981;">${plan} Plan</strong> free trial is now active.
          You have full access until <strong style="color:#f1f5f9;">${endDate}</strong>.
        </p>
        <h3 style="color:#f1f5f9;margin-top:28px;margin-bottom:12px;">What's included:</h3>
        <ul style="color:#94a3b8;font-size:13px;line-height:2;padding-left:20px;">
          ${plan === "PRO"
            ? "<li>Monthly updates</li><li>Security monitoring</li><li>Uptime checks</li><li>Server management</li><li>Performance tuning</li><li>Priority support</li><li>Monthly report</li>"
            : "<li>Monthly updates</li><li>Security monitoring</li><li>Uptime checks</li><li>Email support</li>"
          }
        </ul>
        <a href="${dashboardUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">
          View Your Trial →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">
          Questions? Reply to this email — I read every one.
        </p>
      </div>
    `,
  });
}

export async function sendTrialReminderEmail(
  email: string,
  name: string,
  plan: string,
  trialId: string,
  trialEndsAt: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subscribeUrl = `${appUrl}/trial/subscribe?id=${trialId}`;
  const endDate = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Your free trial ends in 2 days — subscribe to keep access`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">Your trial ends ${endDate}</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Hey ${escapeHtml(name)}, your <strong style="color:#10b981;">${plan} Plan</strong> trial is almost up.
          Subscribe now to keep your site protected and up to date — no interruption.
        </p>
        <a href="${subscribeUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:24px;font-size:15px;">
          Subscribe Now →
        </a>
        <p style="color:#475569;font-size:13px;margin-top:20px;">
          If you decide not to continue, your trial will simply expire on ${endDate}. No charge, ever.
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  name: string,
  plan: string,
  billingCycle: string,
  nextRenewal: Date
) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard/subscription`;
  const renewalDate = nextRenewal.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
  const price = plan === "PRO"
    ? (billingCycle === "ANNUAL" ? "$990/year" : "$99/month")
    : (billingCycle === "ANNUAL" ? "$290/year" : "$29/month");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to:   email,
    subject: `Subscription confirmed — ${plan} Plan (${billingCycle})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">You're all set, ${escapeHtml(name)}! ✅</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your <strong style="color:#10b981;">${plan} Plan</strong> subscription is now active at
          <strong style="color:#f1f5f9;">${price}</strong>. Next renewal: ${renewalDate}.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">
          View Subscription →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">
          To cancel or make changes, reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentAcknowledgmentEmail(inquiry: {
  name: string;
  email: string;
  plan: string;
  paymentStatus: string;
  paymentNote?: string | null;
}) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isDeposit = inquiry.paymentStatus === "DEPOSIT_RECEIVED";
  const safeName = escapeHtml(inquiry.name);
  const safePlan = escapeHtml(inquiry.plan);
  const safeNote = escapeHtml(inquiry.paymentNote);
  const subject = isDeposit
    ? `Deposit received — your project is confirmed`
    : `Payment received in full — let's get started!`;
  const heading = isDeposit
    ? `Deposit Received, ${safeName}!`
    : `Full Payment Received, ${safeName}!`;
  const body = isDeposit
    ? `I've received your deposit for the <strong style="color:#fbbf24;">${safePlan}</strong>. Your project is now confirmed and I'll be in touch within 24 hours to kick things off.`
    : `I've received your full payment for the <strong style="color:#fbbf24;">${safePlan}</strong>. Development begins now — I'll reach out shortly with next steps and timelines.`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: inquiry.email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">${heading} ✅</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">${body}</p>
        ${safeNote ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;margin-top:20px;"><p style="color:#94a3b8;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;">Note from Festo</p><p style="color:#e2e8f0;font-size:13px;margin:0;">${safeNote}</p></div>` : ""}
        <a href="${appUrl}/get-started" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:28px;">
          View Project Brief →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">Questions? Reply to this email — I read every one.</p>
      </div>
    `,
  });
}

export async function sendEmailVerifiedEmail(email: string, name: string | null) {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard`;
  const displayName = escapeHtml(name) || "there";
  const safeEmail = escapeHtml(email);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Your FestoUG email has been verified",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:8px;">Email verified, ${displayName}! ✅</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your email address <strong style="color:#f1f5f9;">${safeEmail}</strong> has been successfully verified.
          Your account is now fully active.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">
          Go to Dashboard →
        </a>
        <p style="color:#334155;font-size:12px;margin-top:32px;">
          Questions? Reply to this email — I read every one.
        </p>
      </div>
    `,
  });
}

export async function sendAccountBannedEmail(
  email: string,
  name: string | null,
  reason: string
) {
  const resend = getResend();
  const displayName = escapeHtml(name) || "there";
  const safeEmail = escapeHtml(email);
  const safeReason = escapeHtml(reason);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: email,
    subject: "Your FestoUG account has been suspended",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f87171;margin-bottom:8px;">Account Suspended, ${displayName}</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">
          Your FestoUG account associated with <strong style="color:#f1f5f9;">${safeEmail}</strong> has been permanently suspended.
        </p>
        <div style="background:#1c0a0a;border:1px solid #7f1d1d;border-radius:10px;padding:14px;margin-top:20px;">
          <p style="color:#94a3b8;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;">Reason</p>
          <p style="color:#fca5a5;font-size:13px;margin:0;">${safeReason}</p>
        </div>
        <p style="color:#475569;font-size:13px;margin-top:24px;">
          If you believe this is a mistake, reply to this email to appeal.
        </p>
      </div>
    `,
  });
}

export async function sendProjectInquiryNotification(inquiry: {
  name: string;
  email: string;
  company?: string | null;
  plan: string;
  timeline: string;
  vision: string;
}) {
  const resend = getResend();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "festotechug@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safeCompany = escapeHtml(inquiry.company);
  const safePlan = escapeHtml(inquiry.plan);
  const safeTimeline = escapeHtml(inquiry.timeline);
  const safeVision = escapeHtml(inquiry.vision).replace(/\n/g, "<br/>");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FestoUG <onboarding@resend.dev>",
    to: adminEmail,
    subject: `New Project Inquiry — ${inquiry.plan} from ${inquiry.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#080c14;color:#e2e8f0;">
        <h2 style="color:#f8fafc;margin-bottom:4px;">New Project Inquiry</h2>
        <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Someone just submitted a project brief via <strong style="color:#fbbf24;">${safePlan}</strong>.</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:120px;">Name</td><td style="padding:8px 0;color:#f1f5f9;font-size:13px;">${safeName}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${safeEmail}" style="color:#fb923c;">${safeEmail}</a></td></tr>
          ${safeCompany ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Company</td><td style="padding:8px 0;color:#f1f5f9;font-size:13px;">${safeCompany}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Plan</td><td style="padding:8px 0;color:#fbbf24;font-size:13px;font-weight:700;">${safePlan}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Timeline</td><td style="padding:8px 0;color:#f1f5f9;font-size:13px;">${safeTimeline}</td></tr>
        </table>

        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="color:#94a3b8;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Vision / Requirements</p>
          <p style="color:#e2e8f0;font-size:14px;line-height:1.7;margin:0;">${safeVision}</p>
        </div>

        <a href="${appUrl}/admin/inquiries" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          View in Admin →
        </a>
      </div>
    `,
  });
}

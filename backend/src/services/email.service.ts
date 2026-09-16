/**
 * Minimal email stub. No SMTP/email-provider credentials were configured for
 * this project, so this logs the message instead of sending it. Swap the body
 * of this function for a real provider (Resend, SendGrid, Postmark, SES...)
 * before shipping password-reset emails to real users.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  console.log(
    [
      "──────────────────────────────────────────",
      `Password reset requested for: ${to}`,
      `Reset link (valid 30 minutes): ${resetUrl}`,
      "(No email provider configured — printing instead of sending.)",
      "──────────────────────────────────────────",
    ].join("\n"),
  );
}

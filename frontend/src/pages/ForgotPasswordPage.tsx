import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Banner } from "../components/ui/Banner";
import { requestPasswordReset } from "../services/authService";
import { ApiRequestError } from "../services/api";
import { isValidEmail } from "../utils/validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to get back in.">
      {sent ? (
        <Banner variant="success">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </Banner>
      ) : (
        <>
          {error && <Banner variant="error">{error}</Banner>}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
              Send reset link
            </Button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        <Link to="/login" className="font-medium text-[var(--color-brand)] hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}

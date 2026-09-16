import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Banner } from "../components/ui/Banner";
import { resetPassword } from "../services/authService";
import { ApiRequestError } from "../services/api";
import { getPasswordError } from "../utils/validation";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link">
        <Banner variant="error">This password reset link is missing its token.</Banner>
        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          <Link to="/forgot-password" className="font-medium text-[var(--color-brand)] hover:underline">
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: Record<string, string> = {};
    const passwordError = getPasswordError(password);
    if (passwordError) errors.password = passwordError;
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      navigate("/login", { state: { justReset: true } });
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Set a new password">
      {formError && <Banner variant="error">{formError}</Banner>}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}

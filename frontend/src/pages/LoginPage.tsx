import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Banner } from "../components/ui/Banner";
import { useAuth } from "../hooks/useAuth";
import { ApiRequestError } from "../services/api";
import { isValidEmail } from "../utils/validation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: Record<string, string> = {};
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email, password, remember);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back to Storage Doc.">
      {formError && <Banner variant="error">{formError}</Banner>}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-[var(--color-brand)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-[var(--color-brand)] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

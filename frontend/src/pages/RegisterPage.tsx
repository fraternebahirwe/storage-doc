import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Button";
import { Banner } from "../components/ui/Banner";
import { useAuth } from "../hooks/useAuth";
import { ApiRequestError } from "../services/api";
import { getPasswordError, isValidEmail } from "../utils/validation";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Full name is required.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    const passwordError = getPasswordError(password);
    if (passwordError) errors.password = passwordError;
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email, password, confirmPassword);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === "EMAIL_TAKEN") {
          setFieldErrors((prev) => ({ ...prev, email: err.message }));
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start storing your files in minutes.">
      {formError && <Banner variant="error">{formError}</Banner>}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[var(--color-brand)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

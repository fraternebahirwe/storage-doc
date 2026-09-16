import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-4 text-center">
      <Logo size={36} />
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/dashboard" className="text-sm font-medium text-[var(--color-brand)] hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

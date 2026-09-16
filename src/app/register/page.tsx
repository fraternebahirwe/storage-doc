"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created, but automatic login failed. Please log in.");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-neutral-900">Create account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            type="text"
            placeholder="Name (optional)"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

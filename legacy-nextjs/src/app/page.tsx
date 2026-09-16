import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">Storage Doc</h1>
      <p className="max-w-md text-neutral-600">
        Upload and keep your pictures, videos, and documents in one place.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}

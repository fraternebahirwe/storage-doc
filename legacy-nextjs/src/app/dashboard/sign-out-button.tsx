"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
      }}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
    >
      Sign out
    </button>
  );
}

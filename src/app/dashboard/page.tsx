import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import { FileManager } from "./file-manager";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Storage Doc</h1>
          <p className="text-sm text-neutral-500">{session.user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <FileManager />
    </main>
  );
}

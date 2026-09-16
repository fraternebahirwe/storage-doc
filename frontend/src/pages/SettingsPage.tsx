import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { StorageMeter } from "../components/ui/StorageMeter";
import { Button } from "../components/ui/Button";
import { fetchStorageSummary, type StorageSummary } from "../services/fileService";
import { formatBytes } from "../utils/format";

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="text-sm font-medium text-[var(--color-text)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<StorageSummary | null>(null);

  useEffect(() => {
    void fetchStorageSummary().then(setSummary);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Settings</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard title="Profile">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Name</dt>
              <dd className="text-[var(--color-text)]">{user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Email</dt>
              <dd className="text-[var(--color-text)]">{user?.email}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">Editing your profile is coming in a later phase.</p>
        </SettingsCard>

        <SettingsCard title="Storage">
          <StorageMeter usedBytes={summary?.usedBytes ?? 0} limitBytes={summary?.limitBytes ?? user?.storageLimit ?? 0} />
          {summary && (
            <dl className="mt-4 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Photos</dt>
                <dd className="text-[var(--color-text)]">{formatBytes(summary.breakdown.photos)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Videos</dt>
                <dd className="text-[var(--color-text)]">{formatBytes(summary.breakdown.videos)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Documents</dt>
                <dd className="text-[var(--color-text)]">{formatBytes(summary.breakdown.documents)}</dd>
              </div>
            </dl>
          )}
        </SettingsCard>

        <SettingsCard title="Appearance">
          <p className="text-sm text-[var(--color-text-muted)]">
            Storage Doc currently follows your system's light/dark setting automatically. A manual toggle is coming in
            a later phase.
          </p>
        </SettingsCard>

        <SettingsCard title="Security">
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">You're logged in as {user?.email}.</p>
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </SettingsCard>
      </div>
    </div>
  );
}

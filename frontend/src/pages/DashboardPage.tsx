import { useNavigate } from "react-router-dom";
import { Upload, FolderPlus, Image, Video, FileText, Files, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { StorageMeter } from "../components/ui/StorageMeter";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // File upload and storage accounting land in Phase 2 — for now every
  // user genuinely has zero files, so the dashboard reflects that honestly
  // rather than showing placeholder numbers.
  const usedBytes = 0;
  const stats = { total: 0, photos: 0, videos: 0, documents: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Here's what's happening with your storage.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-2">
          <h2 className="text-sm font-medium text-[var(--color-text)]">Storage summary</h2>
          <div className="mt-3">
            <StorageMeter usedBytes={usedBytes} limitBytes={user?.storageLimit ?? 0} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text)]">Quick actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="primary" onClick={() => navigate("/files")}>
              <Upload size={16} /> Upload files
            </Button>
            <Button variant="secondary" onClick={() => navigate("/files")}>
              <FolderPlus size={16} /> Create folder
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Files} label="Total files" value={stats.total} />
        <StatCard icon={Image} label="Photos" value={stats.photos} />
        <StatCard icon={Video} label="Videos" value={stats.videos} />
        <StatCard icon={FileText} label="Documents" value={stats.documents} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--color-text)]">Recent files</h2>
        <EmptyState
          icon={Clock}
          title="No files yet."
          description="Files you upload will show up here so you can pick up where you left off."
          action={
            <Button variant="secondary" onClick={() => navigate("/files")}>
              <Upload size={16} /> Upload your first file
            </Button>
          }
        />
      </div>
    </div>
  );
}

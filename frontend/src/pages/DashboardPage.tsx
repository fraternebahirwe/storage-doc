import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FolderPlus, Image, Video, FileText, Files, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { StorageMeter } from "../components/ui/StorageMeter";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { RecentFileTile } from "../components/files/RecentFileTile";
import * as fileService from "../services/fileService";
import type { FileRecord, StorageSummary } from "../services/fileService";

export function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [summaryResult, recentResult] = await Promise.all([
      fileService.fetchStorageSummary(),
      fileService.fetchRecentFiles(),
    ]);
    setSummary(summaryResult);
    setRecentFiles(recentResult.files);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
            <StorageMeter usedBytes={summary?.usedBytes ?? 0} limitBytes={summary?.limitBytes ?? user?.storageLimit ?? 0} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--color-text)]">Quick actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="primary" onClick={() => navigate("/files")}>
              <Upload size={16} /> Upload files
            </Button>
            <Button variant="secondary" onClick={() => showToast("Folders are coming in a later phase.")}>
              <FolderPlus size={16} /> Create folder
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Files} label="Total files" value={summary?.totalFiles ?? 0} />
        <StatCard icon={Image} label="Photos" value={summary?.photos ?? 0} />
        <StatCard icon={Video} label="Videos" value={summary?.videos ?? 0} />
        <StatCard icon={FileText} label="Documents" value={summary?.documents ?? 0} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--color-text)]">Recent files</h2>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : recentFiles.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {recentFiles.map((file) => (
              <RecentFileTile key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

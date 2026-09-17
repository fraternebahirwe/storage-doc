import { Navigate, Route, Routes } from "react-router-dom";
import { Image, Video, FileText, Star, Clock, Share2, Trash2 } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastViewport } from "./components/ui/ToastViewport";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MyFilesPage } from "./pages/MyFilesPage";
import { FileBrowserPage } from "./pages/FileBrowserPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/files" element={<MyFilesPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route
                path="/photos"
                element={
                  <FileBrowserPage
                    key="photos"
                    title="Photos"
                    category="image"
                    emptyIcon={Image}
                    emptyDescription="Photos you upload will show up here."
                  />
                }
              />
              <Route
                path="/videos"
                element={
                  <FileBrowserPage
                    key="videos"
                    title="Videos"
                    category="video"
                    emptyIcon={Video}
                    emptyDescription="Videos you upload will show up here."
                  />
                }
              />
              <Route
                path="/documents"
                element={
                  <FileBrowserPage
                    key="documents"
                    title="Documents"
                    category="document"
                    emptyIcon={FileText}
                    emptyDescription="PDFs, spreadsheets, and other documents will show up here."
                  />
                }
              />
              <Route
                path="/favorites"
                element={<ComingSoonPage title="Favorites" icon={Star} description="A dedicated view of files you've starred is coming in a later phase." />}
              />
              <Route
                path="/recent"
                element={<ComingSoonPage title="Recent" icon={Clock} description="A full activity timeline is coming in a later phase." />}
              />
              <Route
                path="/shared"
                element={<ComingSoonPage title="Shared" icon={Share2} description="Files you've shared with a link." />}
              />
              <Route
                path="/trash"
                element={<ComingSoonPage title="Trash" icon={Trash2} description="Deleted files, kept here until you restore or remove them for good." />}
              />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastViewport />
      </ToastProvider>
    </AuthProvider>
  );
}

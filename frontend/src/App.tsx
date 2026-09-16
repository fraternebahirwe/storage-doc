import { Navigate, Route, Routes } from "react-router-dom";
import { FolderClosed, Image, Video, FileText, Star, Clock, Share2, Trash2 } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
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
            <Route
              path="/files"
              element={<ComingSoonPage title="My Files" icon={FolderClosed} description="Upload, organize, and browse every file you own." />}
            />
            <Route
              path="/photos"
              element={<ComingSoonPage title="Photos" icon={Image} description="All your uploaded photos in one place." />}
            />
            <Route
              path="/videos"
              element={<ComingSoonPage title="Videos" icon={Video} description="All your uploaded videos in one place." />}
            />
            <Route
              path="/documents"
              element={<ComingSoonPage title="Documents" icon={FileText} description="PDFs, spreadsheets, and other documents." />}
            />
            <Route
              path="/favorites"
              element={<ComingSoonPage title="Favorites" icon={Star} description="Files you've marked as favorites." />}
            />
            <Route
              path="/recent"
              element={<ComingSoonPage title="Recent" icon={Clock} description="Files you've recently uploaded, opened, or edited." />}
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
    </AuthProvider>
  );
}

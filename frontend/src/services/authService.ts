import { apiRequest } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  storageLimit: number;
  createdAt: string;
};

export function fetchCurrentUser() {
  return apiRequest<{ user: User }>("/api/auth/me");
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return apiRequest<{ user: User }>("/api/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string; remember: boolean }) {
  return apiRequest<{ user: User }>("/api/auth/login", { method: "POST", body: input });
}

export function logout() {
  return apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(input: { token: string; password: string; confirmPassword: string }) {
  return apiRequest<{ message: string }>("/api/auth/reset-password", { method: "POST", body: input });
}

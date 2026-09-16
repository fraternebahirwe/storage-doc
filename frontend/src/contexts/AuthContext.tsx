import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authService from "../services/authService";
import type { User } from "../services/authService";
import { ApiRequestError } from "../services/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authService
      .fetchCurrentUser()
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch((err) => {
        if (!cancelled && !(err instanceof ApiRequestError && err.status === 401)) {
          console.error("Failed to load session", err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const { user } = await authService.login({ email, password, remember });
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, confirmPassword: string) => {
    const { user } = await authService.registerAccount({ name, email, password, confirmPassword });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { useEffect, useState, useCallback } from "react";

export type AuthUser = { name: string; email: string };

const KEY = "oneplaylist:user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const signIn = useCallback((u: AuthUser) => {
    setUser(u);
    try {
      localStorage.setItem(KEY, JSON.stringify(u));
    } catch {
      /* noop */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  }, []);

  return { user, signIn, signOut, isAuthed: !!user };
}

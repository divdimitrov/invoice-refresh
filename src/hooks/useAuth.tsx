import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthState {
  authenticated: boolean;
  pinId: string | null;
  mustChange: boolean;
}

interface AuthContextType extends AuthState {
  login: (pinId: string, mustChange: boolean) => void;
  logout: () => void;
  clearMustChange: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "pin_auth";

function loadSession(): AuthState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.authenticated) return parsed;
    }
  } catch {}
  return { authenticated: false, pinId: null, mustChange: false };
}

function saveSession(state: AuthState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadSession);

  const login = useCallback((pinId: string, mustChange: boolean) => {
    const next: AuthState = { authenticated: true, pinId, mustChange };
    setState(next);
    saveSession(next);
  }, []);

  const logout = useCallback(() => {
    const next: AuthState = { authenticated: false, pinId: null, mustChange: false };
    setState(next);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const clearMustChange = useCallback(() => {
    setState(prev => {
      const next = { ...prev, mustChange: false };
      saveSession(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearMustChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

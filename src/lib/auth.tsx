import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "productor" | "minisuper" | "transportista" | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  productor: "Productor",
  minisuper: "Comprador",
  transportista: "Transportista",
  admin: "Admin",
};

export const ROLE_ROUTES: Record<Role, string> = {
  productor: "/productor",
  minisuper: "/minisuper",
  transportista: "/transportista",
  admin: "/admin",
};

/** Paneles visibles por rol en el menú superior. */
export const ROLE_ACCESS: Record<Role, Role[]> = {
  productor: ["productor", "minisuper"],
  minisuper: ["minisuper"],
  transportista: ["transportista"],
  admin: ["productor", "minisuper", "transportista", "admin"],
};

export type Session = {
  token: string;
  tenantId: string;
  role: Role;
  email: string;
};

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  saveSession: (s: Session) => void;
  logout: () => void;
};

// Mantener un único contexto aunque el módulo se recargue en caliente (HMR).
const g = globalThis as unknown as { __mangoAuthCtx?: React.Context<AuthContextValue | null> };
const AuthContext = (g.__mangoAuthCtx ??= createContext<AuthContextValue | null>(null));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenantId");
    const role = localStorage.getItem("role") as Role | null;
    const email = localStorage.getItem("email") ?? "";
    if (token && role) setSession({ token, tenantId: tenantId ?? "", role, email });
    setReady(true);
  }, []);

  const saveSession = useCallback((s: Session) => {
    localStorage.setItem("token", s.token);
    localStorage.setItem("tenantId", s.tenantId);
    localStorage.setItem("role", s.role);
    localStorage.setItem("email", s.email);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    ["token", "tenantId", "role", "email"].forEach((k) => localStorage.removeItem(k));
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, ready, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

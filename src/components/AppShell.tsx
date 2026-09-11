import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Leaf } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ROLE_LABELS, ROLE_ROUTES, useAuth, type Role } from "@/lib/auth";

export function Spinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
      <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function AppShell({
  role,
  title,
  subtitle,
  children,
  fullBleed = false,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const { session, ready, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/", replace: true });
  }, [ready, session, navigate]);

  if (!ready || !session) return <Spinner />;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-brand text-primary-foreground shadow-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Leaf className="size-5" />
            Mango App
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <Link
                key={r}
                to={ROLE_ROUTES[r]}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  r === role ? "bg-background/25 font-medium" : "hover:bg-background/15"
                }`}
              >
                {ROLE_LABELS[r]}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden opacity-90 sm:inline">
              {session.email} · Tenant {session.tenantId || "—"}
            </span>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/", replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1.5 font-medium transition-colors hover:bg-background/30"
            >
              <LogOut className="size-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className={fullBleed ? "" : "mx-auto max-w-7xl px-5 py-8"}>
        {!fullBleed && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

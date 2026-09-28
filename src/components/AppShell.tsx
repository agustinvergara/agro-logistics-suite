import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Leaf } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ROLE_ROUTES, useAuth, type Role } from "@/lib/auth";

export function Spinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
      <span className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const ROLE_NAV_LINKS: Record<Role, { label: string; to: string }[]> = {
  productor: [
    { label: "Panel de Productor", to: "/productor/publish" },
    { label: "Marketplace", to: "/minisuper" },
    { label: "Admin", to: "/admin" },
  ],
  minisuper: [
    { label: "Marketplace", to: "/minisuper" },
    { label: "Admin", to: "/admin" },
  ],
  transportista: [
    { label: "Mapa & Rutas", to: "/transportista" },
    { label: "Admin", to: "/admin" },
  ],
  admin: [
    { label: "Admin", to: "/admin" },
  ],
};

export function AppShell({
  role,
  title,
  subtitle,
  children,
  fullBleed = false,
}: {
  role: Role; // Rol al que pertenece la vista conceptualmente
  title: string;
  subtitle?: string;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const { session, ready, logout } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      navigate({ to: "/", replace: true });
      return;
    }

    // Seguridad: verificar si el rol del usuario tiene permiso para ver esta ruta
    const allowedLinks = ROLE_NAV_LINKS[session.role] || [];
    const isAllowed = allowedLinks.some((link) => currentPath.startsWith(link.to));

    if (!isAllowed) {
      // Si intenta entrar a un área prohibida, lo pateamos a su ruta base
      navigate({ to: ROLE_ROUTES[session.role], replace: true });
    }
  }, [ready, session, navigate, currentPath]);

  if (!ready || !session) return <Spinner />;

  const myLinks = ROLE_NAV_LINKS[session.role] || [];

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-brand text-primary-foreground shadow-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Leaf className="size-5" />
            Mango App
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {myLinks.map((link) => {
              const isActive = currentPath.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    isActive ? "bg-background/25 font-medium" : "hover:bg-background/15"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
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

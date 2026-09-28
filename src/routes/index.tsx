import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { ROLE_LABELS, ROLE_ROUTES, useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mango App — Logística agrícola B2B" },
      {
        name: "description",
        content:
          "Plataforma multi-tenant que conecta productores, minisúperes y transportistas con pagos en escrow.",
      },
      { property: "og:title", content: "Mango App — Logística agrícola B2B" },
      {
        property: "og:description",
        content: "Marketplace de perecederos, viajes en tiempo real y pagos protegidos en escrow.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("productor");
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        toast.error("Credenciales inválidas");
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const userRole = data.role as Role;
      
      saveSession({
        token: data.token,
        tenantId: String(data.tenantId),
        role: userRole,
        email,
      });
      
      toast.success("Sesión iniciada");
      navigate({ to: ROLE_ROUTES[userRole] });
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-brand hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Leaf className="size-6" />
          Mango App
        </div>
        <div>
          <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
            Del campo al anaquel, con pagos protegidos.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/85">
            Marketplace de perecederos, logística en tiempo real y escrow para cada operación entre
            productores, minisúperes y transportistas.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">Plataforma multi-tenant B2B</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-14">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Iniciar Sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede a tu panel según tu rol en la cadena de suministro.
          </p>

          <label className="mt-8 block text-sm font-medium text-foreground">
            Correo Electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-foreground">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/auth/registro" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

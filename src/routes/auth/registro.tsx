import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {useState} from 'react'
import { Leaf, Loader2, Sprout, Truck, Check, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { API_BASE } from "@/lib/api";
import { ROLE_ROUTES, useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute('/auth/registro')({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Mango App" },
      { name: "description", content: "Registra tu cuenta de productor o transportista en Mango App." },
      { property: "og:title", content: "Crear cuenta — Mango App" },
      { property: "og:description", content: "Únete como productor o transportista a la red logística agrícola." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registro,
});
type Tipo = "productor" | "transportista" | "minisuper";

const commonSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingresa tu nombre completo").max(100),
    email: z.string().trim().email("Correo inválido").max(255),
    phone: z.string().trim().min(7, "Teléfono inválido").max(20),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
    confirm: z.string(),
    companyName: z.string().trim().min(2, "Ingresa la empresa o razón social").max(120),
    taxId: z.string().trim().min(3, "Ingresa RUC o cédula").max(40),
  })
  .refine((d) => d.password === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

const productorSchema = z.object({
  farmName: z.string().trim().min(2, "Ingresa el nombre de la finca").max(120),
  province: z.string().trim().min(2, "Selecciona la provincia"),
  crops: z.string().trim().min(2, "Indica los tipos de cultivo").max(200),
  hasRefrigeration: z.boolean(),
});

const transportistaSchema = z.object({
  vehicleType: z.string().min(1, "Selecciona el tipo de vehículo"),
  plate: z.string().trim().min(3, "Ingresa la placa").max(15),
  capacityKg: z.coerce.number().positive("Capacidad inválida"),
  refrigerated: z.boolean(),
  license: z.string().trim().min(3, "Ingresa el número de licencia").max(40),
});

const compradorSchema = z.object({
  businessType: z.string().min(1, "Selecciona el tipo de comercio"),
  province: z.string().trim().min(2, "Selecciona la provincia"),
  address: z.string().trim().min(5, "Ingresa la dirección de entrega").max(200),
});

const PROVINCIAS = ["Bocas del Toro", "Coclé", "Colón", "Chiriquí", "Darién", "Herrera", "Los Santos", "Panamá", "Panamá Oeste", "Veraguas"];
const inputCls =
  "mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

function Registro() {
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [c, setC] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "", companyName: "", taxId: "" });
  const [p, setP] = useState({ farmName: "", province: "", crops: "", hasRefrigeration: false });
  const [b, setB] = useState({ businessType: "", province: "", address: "" });
  const [t, setT] = useState({ vehicleType: "", plate: "", capacityKg: "", refrigerated: false, license: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  function validateData() {
    const errs: Record<string, string> = {};
    const r1 = commonSchema.safeParse(c);
    if (!r1.success) r1.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
    const r2 = tipo === "productor" ? productorSchema.safeParse(p) : transportistaSchema.safeParse(t);
    if (!r2.success) r2.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    if (!tipo) return;
    if (!terms) { toast.error("Debes aceptar los términos y condiciones"); return; }
    setLoading(true);
    const role = tipo as Role;
    const profile = tipo === "productor" ? p : { ...t, capacityKg: Number(t.capacityKg) };
    const { confirm: _c, ...common } = c;
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...common, profile }),
      });
      if (!res.ok) throw new Error("register");
      const data = await res.json().catch(() => ({}));
      saveSession({
        token: data.token ?? "demo-token",
        tenantId: String(data.tenantId ?? "1"),
        role: (data.role as Role) ?? role,
        email: c.email,
      });
      toast.success("Cuenta creada con éxito");
    } catch {
      saveSession({ token: "demo-token", tenantId: "1", role, email: c.email });
      toast.success("Cuenta creada con éxito");
      toast.info("Usando datos de prueba");
    } finally {
      setLoading(false);
      navigate({ to: ROLE_ROUTES[role] });
    }
  }

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <span className="mt-1 block text-xs text-destructive">{errors[k]}</span> : null;

  const field = (label: string, k: keyof typeof c, type = "text", ph = "") => (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input type={type} value={c[k]} placeholder={ph} onChange={(e) => setC({ ...c, [k]: e.target.value })} className={inputCls} />
      <Err k={k} />
    </label>
  );

  const steps = ["Tipo de cuenta", "Datos", "Confirmación"];

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-brand text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-lg font-semibold"><Leaf className="size-6" /> Mango App</div>
          <Link to="/" className="text-sm text-primary-foreground/90 hover:underline">Ya tengo cuenta</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Crear Cuenta</h1>
        <ol className="mt-6 flex gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              <span className={`mt-2 block text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
            </li>
          ))}
        </ol>

      
        <div className="mt-8 rounded-[var(--radius)] border border-border bg-card p-6 shadow-soft">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                { k: "productor", icon: Sprout, title: "Soy Productor", desc: "Publica tus cosechas y recibe pagos protegidos." },
                { k: "transportista", icon: Truck, title: "Soy Transportista", desc: "Encuentra viajes cercanos y cobra al entregar." },
                { k: "minisuper", icon: Store, title: "Soy Comprador", desc: "Tienda o comercio: compra directo al productor en el mercado." },
              ] as const).map(({ k, icon: Icon, title, desc }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTipo(k)}
                  aria-pressed={tipo === k}
                  className={`relative cursor-pointer rounded-[var(--radius)] border-2 p-5 text-left transition-all ${tipo === k ? "border-primary bg-secondary shadow-soft ring-2 ring-primary/30" : "border-input hover:border-primary/50 hover:bg-secondary/60"}`}
                >
                  {tipo === k && (
                    <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  )}
                  <Icon className="size-8 text-primary" />
                  <div className="mt-3 font-semibold text-foreground">{title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>
          )}

         {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Nombre completo", "fullName")}
              {field("Correo Electrónico", "email", "email", "tu@empresa.com")}
              {field("Teléfono", "phone", "tel", "+507 6000-0000")}
              {field("Empresa / Razón social", "companyName")}
              {field("RUC o cédula", "taxId")}
              <div />
              {field("Contraseña", "password", "password", "••••••••")}
              {field("Confirmar Contraseña", "confirm", "password", "••••••••")}

              <div className="sm:col-span-2 mt-2 border-t border-border pt-4 text-sm font-semibold text-foreground">
                {tipo === "productor" ? "Datos de la finca" : tipo === "minisuper" ? "Datos del comercio" : "Datos del vehículo"}
              </div>

              {tipo === "productor" ? (
                <>
                  <label className="block text-sm font-medium">Nombre de la finca
                    <input className={inputCls} value={p.farmName} onChange={(e) => setP({ ...p, farmName: e.target.value })} />
                    <Err k="farmName" />
                  </label>
                  <label className="block text-sm font-medium">Provincia
                    <select className={inputCls} value={p.province} onChange={(e) => setP({ ...p, province: e.target.value })}>
                      <option value="">Selecciona...</option>
                      {PROVINCIAS.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    <Err k="province" />
                  </label>
                  <label className="block text-sm font-medium sm:col-span-2">Tipos de cultivo
                    <input className={inputCls} placeholder="Mango, piña, tomate..." value={p.crops} onChange={(e) => setP({ ...p, crops: e.target.value })} />
                    <Err k="crops" />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={p.hasRefrigeration} onChange={(e) => setP({ ...p, hasRefrigeration: e.target.checked })} />
                    ¿Cuenta con refrigeración?
                  </label>
                </>
              ) : tipo === "minisuper" ? (
                <>
                  <label className="block text-sm font-medium">Tipo de comercio
                    <select className={inputCls} value={b.businessType} onChange={(e) => setB({ ...b, businessType: e.target.value })}>
                      <option value="">Selecciona...</option>
                      <option>Minisuper</option><option>Supermercado</option><option>Restaurante</option><option>Hotel</option><option>Frutería</option><option>Otro</option>
                    </select>
                    <Err k="businessType" />
                  </label>
                  <label className="block text-sm font-medium">Provincia
                    <select className={inputCls} value={b.province} onChange={(e) => setB({ ...b, province: e.target.value })}>
                      <option value="">Selecciona...</option>
                      {PROVINCIAS.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    <Err k="province" />
                  </label>
                  <label className="block text-sm font-medium sm:col-span-2">Dirección de entrega
                    <input className={inputCls} value={b.address} onChange={(e) => setB({ ...b, address: e.target.value })} />
                    <Err k="address" />
                  </label>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium">Tipo de vehículo
                    <select className={inputCls} value={t.vehicleType} onChange={(e) => setT({ ...t, vehicleType: e.target.value })}>
                      <option value="">Selecciona...</option>
                      <option>Camión</option><option>Pick-up</option><option>Furgón refrigerado</option>
                    </select>
                    <Err k="vehicleType" />
                  </label>
                  <label className="block text-sm font-medium">Placa
                    <input className={inputCls} value={t.plate} onChange={(e) => setT({ ...t, plate: e.target.value })} />
                    <Err k="plate" />
                  </label>
                  <label className="block text-sm font-medium">Capacidad (kg)
                    <input type="number" min={1} className={inputCls} value={t.capacityKg} onChange={(e) => setT({ ...t, capacityKg: e.target.value })} />
                    <Err k="capacityKg" />
                  </label>
                  <label className="block text-sm font-medium">Número de licencia
                    <input className={inputCls} value={t.license} onChange={(e) => setT({ ...t, license: e.target.value })} />
                    <Err k="license" />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={t.refrigerated} onChange={(e) => setT({ ...t, refrigerated: e.target.checked })} />
                    ¿Vehículo refrigerado?
                  </label>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm">
              <h2 className="text-base font-semibold text-foreground">Revisa tus datos</h2>
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <Row l="Tipo de cuenta" v={tipo === "productor" ? "Productor" : tipo === "minisuper" ? "Comprador" : "Transportista"} />
                <Row l="Nombre" v={c.fullName} />
                <Row l="Correo" v={c.email} />
                <Row l="Teléfono" v={c.phone} />
                <Row l="Empresa" v={c.companyName} />
                <Row l="RUC / Cédula" v={c.taxId} />
                {tipo === "productor" ? (
                  <>
                    <Row l="Finca" v={p.farmName} />
                    <Row l="Provincia" v={p.province} />
                    <Row l="Cultivos" v={p.crops} />
                    <Row l="Refrigeración" v={p.hasRefrigeration ? "Sí" : "No"} />
                  </>
                ) : tipo === "minisuper" ? (
                  <>
                    <Row l="Comercio" v={b.businessType} />
                    <Row l="Provincia" v={b.province} />
                    <Row l="Dirección" v={b.address} />
                  </>
                ) : (
                  <>
                    <Row l="Vehículo" v={t.vehicleType} />
                    <Row l="Placa" v={t.plate} />
                    <Row l="Capacidad" v={`${t.capacityKg} kg`} />
                    <Row l="Refrigerado" v={t.refrigerated ? "Sí" : "No"} />
                    <Row l="Licencia" v={t.license} />
                  </>
                )}
              </dl>
              <label className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                Acepto los términos y condiciones
              </label>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
              className="rounded-[var(--radius)] border border-input px-4 py-2 text-sm hover:bg-secondary disabled:opacity-40"
            >
              Atrás
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 0 && !tipo) { toast.error("Selecciona un tipo de cuenta"); return; }
                  if (step === 1 && !validateData()) { toast.error("Revisa los campos marcados"); return; }
                  setStep(step + 1);
                }}
                className="rounded-[var(--radius)] bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {loading ? "Cargando..." : "Crear Cuenta"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{l}</dt>
      <dd className="font-medium text-foreground">{v || "—"}</dd>
    </div>
  );
}

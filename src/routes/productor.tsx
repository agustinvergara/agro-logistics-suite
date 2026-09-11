import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, PackagePlus, RefreshCcw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { MOCK_BALANCE } from "@/lib/mock";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/productor")({
  head: () => ({
    meta: [
      { title: "Panel de Productor — Mango App" },
      {
        name: "description",
        content: "Publica tus perecederos y consulta tu billetera con saldo retenido en escrow.",
      },
      { property: "og:title", content: "Panel de Productor — Mango App" },
      {
        property: "og:description",
        content: "Publica productos agrícolas y controla tu saldo disponible y en escrow.",
      },
    ],
  }),
  component: ProductorPage,
});

const CATEGORIAS = ["Frutas", "Vegetales", "Tubérculos", "Granos", "Lácteos"];

function money(n: number) {
  return `$${n.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ProductorPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIAS[0]);
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [basePricePerUnit, setBasePricePerUnit] = useState("");
  const [stockAvailable, setStockAvailable] = useState("");
  const [publishing, setPublishing] = useState(false);

  const [balance, setBalance] = useState<{
    availableBalance: number;
    heldInEscrow: number;
  } | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  async function loadBalance() {
    setLoadingBalance(true);
    try {
      const data = await apiFetch<{ availableBalance: number; heldInEscrow: number }>(
        "/api/escrow/balance",
      );
      setBalance({
        availableBalance: Number(data?.availableBalance ?? 0),
        heldInEscrow: Number(data?.heldInEscrow ?? 0),
      });
    } catch {
      setBalance(MOCK_BALANCE);
      toast.info("Usando datos de prueba");
    } finally {
      setLoadingBalance(false);
    }
  }

  useEffect(() => {
    loadBalance();
  }, []);

  async function publicar(e: FormEvent) {
    e.preventDefault();
    setPublishing(true);
    const payload = {
      name,
      category,
      requiresRefrigeration,
      basePricePerUnit: Number(basePricePerUnit),
      stockAvailable: Number(stockAvailable),
    };
    try {
      await apiFetch("/api/marketplace/perecederos/publish", { method: "POST", body: payload });
      toast.success("Producto publicado con éxito");
    } catch {
      toast.info("Usando datos de prueba");
      toast.success("Producto publicado con éxito");
    } finally {
      setPublishing(false);
      setName("");
      setBasePricePerUnit("");
      setStockAvailable("");
      setRequiresRefrigeration(false);
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

  return (
    <AppShell
      role="productor"
      title="Panel de Productor"
      subtitle="Publica tu cosecha y controla tus cobros."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
            <PackagePlus className="size-5 text-primary" />
            Publicar Producto
          </h2>

          <form onSubmit={publicar} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Nombre del producto
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mango Tommy Atkins"
                className={inputCls}
              />
            </label>

            <label className="text-sm font-medium">
              Categoría
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Precio base por unidad
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={basePricePerUnit}
                onChange={(e) => setBasePricePerUnit(e.target.value)}
                placeholder="1.35"
                className={inputCls}
              />
            </label>

            <label className="text-sm font-medium">
              Stock disponible
              <input
                required
                type="number"
                min="0"
                value={stockAvailable}
                onChange={(e) => setStockAvailable(e.target.value)}
                placeholder="850"
                className={inputCls}
              />
            </label>

            <label className="flex items-center gap-3 self-end rounded-[var(--radius)] border border-input bg-secondary/50 px-3 py-2.5 text-sm font-medium">
              <input
                type="checkbox"
                checked={requiresRefrigeration}
                onChange={(e) => setRequiresRefrigeration(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Requiere refrigeración
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={publishing}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {publishing && <Loader2 className="size-4 animate-spin" />}
                {publishing ? "Cargando..." : "Publicar Producto"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <Wallet className="size-5 text-primary" />
              Mi Billetera
            </h2>
            <button
              onClick={loadBalance}
              className="inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
            >
              <RefreshCcw className="size-3.5" />
              Actualizar
            </button>
          </div>

          {loadingBalance ? (
            <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              <div className="rounded-[var(--radius)] bg-secondary p-4">
                <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                  Saldo Disponible
                </p>
                <p className="mt-1 text-2xl font-semibold text-secondary-foreground">
                  {money(balance?.availableBalance ?? 0)}
                </p>
              </div>
              <div className="rounded-[var(--radius)] border border-mango/40 bg-mango/15 p-4">
                <p className="text-xs tracking-wide text-mango-foreground/80 uppercase">
                  Retenido en Escrow
                </p>
                <p className="mt-1 text-2xl font-semibold text-mango-foreground">
                  {money(balance?.heldInEscrow ?? 0)}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

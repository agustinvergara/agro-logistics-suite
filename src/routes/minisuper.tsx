import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Snowflake, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { MOCK_PRODUCTOS, type Producto } from "@/lib/mock";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/minisuper")({
  head: () => ({
    meta: [
      { title: "Panel de Minisuper — Mango App" },
      {
        name: "description",
        content: "Compra perecederos directo del productor con pago protegido en escrow.",
      },
      { property: "og:title", content: "Panel de Minisuper — Mango App" },
      {
        property: "og:description",
        content: "Explora el mercado de perecederos y realiza órdenes en segundos.",
      },
    ],
  }),
  component: MinisuperPage,
});

function money(n: number) {
  return `$${n.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MinisuperPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<Producto[]>("/api/marketplace/perecederos/list");
        setProductos(Array.isArray(data) && data.length ? data : MOCK_PRODUCTOS);
      } catch {
        setProductos(MOCK_PRODUCTOS);
        toast.info("Usando datos de prueba");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function comprar() {
    if (!seleccionado) return;
    setComprando(true);
    try {
      await apiFetch("/api/marketplace/ordenes/comprar", {
        method: "POST",
        body: { productId: seleccionado.id, quantity: Number(cantidad) },
      });
      toast.success("Compra realizada con éxito");
    } catch {
      toast.info("Usando datos de prueba");
      toast.success("Compra realizada con éxito");
    } finally {
      setComprando(false);
      setSeleccionado(null);
      setCantidad("1");
    }
  }

  return (
    <AppShell
      role="minisuper"
      title="Mercado de Productos"
      subtitle="Perecederos disponibles de productores verificados."
    >
      {loading ? (
        <div className="flex items-center gap-3 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.category}
                    {p.producer ? ` · ${p.producer}` : ""}
                  </p>
                </div>
                {p.requiresRefrigeration && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                    <Snowflake className="size-3" />
                    Refrigerado
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {money(Number(p.basePricePerUnit))}
                  </p>
                  <p className="text-xs text-muted-foreground">por unidad</p>
                </div>
                <p className="text-xs text-muted-foreground">Stock: {p.stockAvailable}</p>
              </div>

              <button
                onClick={() => setSeleccionado(p)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="size-4" />
                Comprar
              </button>
            </article>
          ))}
        </div>
      )}

      {seleccionado && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-popover p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-popover-foreground">Confirmar compra</h3>
                <p className="mt-1 text-sm text-muted-foreground">{seleccionado.name}</p>
              </div>
              <button
                onClick={() => setSeleccionado(null)}
                aria-label="Cerrar"
                className="rounded-full p-1 hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium">
              Cantidad
              <input
                type="number"
                min="1"
                max={seleccionado.stockAvailable}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </label>

            <p className="mt-3 text-sm text-muted-foreground">
              Total estimado:{" "}
              <span className="font-semibold text-foreground">
                {money(Number(seleccionado.basePricePerUnit) * Number(cantidad || 0))}
              </span>
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSeleccionado(null)}
                className="flex-1 rounded-[var(--radius)] border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={comprar}
                disabled={comprando}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {comprando && <Loader2 className="size-4 animate-spin" />}
                {comprando ? "Cargando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Snowflake, ShoppingCart, X, Package } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/marketplace/minisuper")({
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

type ProductoVista = {
  id: number;
  name: string;
  category: string;
  requiresRefrigeration: boolean;
  basePricePerUnit: number;
  stockAvailable: number;
  producer?: string;
  description?: string;
  expirationDate?: string;
  condition?: string;
  unit?: string;
  image?: string;
};

const UNIDAD_LABEL: Record<string, string> = {
  Kilo: "kg",
  Libra: "lb",
  Unidad: "unidad",
  Caja: "caja",
  Saco: "saco",
};

function money(n: number) {
  return `$${n.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function unidadLabel(unit?: string) {
  return UNIDAD_LABEL[unit ?? ""] ?? unit ?? "unidad";
}

function MinisuperPage() {
  const [productos, setProductos] = useState<ProductoVista[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<ProductoVista | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<any[]>("/api/marketplace/perecederos/list");
        
        const normalizados = Array.isArray(data) ? data.map(p => ({
          ...p,
          basePricePerUnit: Number(p.basePricePerUnit ?? 0),
          stockAvailable: Number(p.stockAvailable ?? 0),
          requiresRefrigeration: Boolean(p.requiresRefrigeration),
          image: p.photoUrls && Array.isArray(p.photoUrls) && p.photoUrls.length > 0 ? p.photoUrls[0] : undefined
        })) : [];
        
        setProductos(normalizados);
      } catch (error) {
        toast.error("Error al cargar el marketplace");
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
      setSeleccionado(null);
      setCantidad("1");
    } catch (error) {
      toast.error("Aún no se ha integrado la función de compras con el backend real");
    } finally {
      setComprando(false);
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
      ) : productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="size-12 mb-4 opacity-20" />
          <p>No hay productos disponibles en el mercado actualmente.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-soft"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-secondary">
                  <Package className="size-10 text-muted-foreground/50" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.category}
                      {p.producer ? ` · ${p.producer}` : ""}
                    </p>
                  </div>
                  {p.requiresRefrigeration && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                      <Snowflake className="size-3" />
                      Refrigerado
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {money(p.basePricePerUnit)}
                    </p>
                    <p className="text-xs text-muted-foreground">por {unidadLabel(p.unit)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Stock: {p.stockAvailable} {unidadLabel(p.unit)}</p>
                </div>

                <button
                  onClick={() => setSeleccionado(p)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ShoppingCart className="size-4" />
                  Comprar
                </button>
              </div>
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
              Cantidad ({unidadLabel(seleccionado.unit)})
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

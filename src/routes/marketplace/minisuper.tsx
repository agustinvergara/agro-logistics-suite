import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Calendar, Loader2, Minus, Plus, Snowflake, ShoppingCart, X, Package } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
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
  images?: string[];
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

function fecha(d?: string) {
  if (!d) return null;
  const parsed = new Date(`${d}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toLocaleDateString("es-PA", { day: "numeric", month: "short", year: "numeric" });
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
        
        const normalizados = Array.isArray(data) ? data.map(p => {
          let urls = [];
          try {
            urls = typeof p.photoUrls === 'string' ? JSON.parse(p.photoUrls) : (p.photoUrls || []);
          } catch (e) {}
          
          return {
            ...p,
            basePricePerUnit: Number(p.basePricePerUnit ?? 0),
            stockAvailable: Number(p.stockAvailable ?? 0),
            requiresRefrigeration: Boolean(p.requiresRefrigeration),
            images: Array.isArray(urls) ? urls : []
          };
        }) : [];
        
        setProductos(normalizados);
      } catch (error) {
        toast.error("Error al cargar el marketplace");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { addItem } = useCart();

  async function agregarAlCarrito() {
    if (!seleccionado) return;
    setComprando(true);
    try {
      await addItem(seleccionado, Number(cantidad));
      toast.success("Producto agregado al carrito");
      setSeleccionado(null);
      setCantidad("1");
    } catch (error) {
      toast.error("Error al agregar al carrito");
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
              <div className="h-40 w-full relative">
                <ImageCarousel images={p.images} alt={p.name} className="h-40 w-full" />
              </div>

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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius)] border border-border bg-popover shadow-soft">
            <div className="h-56 w-full relative">
              <ImageCarousel images={seleccionado.images} alt={seleccionado.name} className="h-56 w-full rounded-t-[var(--radius)]" />
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-popover-foreground">
                    {seleccionado.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {seleccionado.category}
                    {seleccionado.producer ? ` · ${seleccionado.producer}` : ""}
                  </p>
                  {seleccionado.requiresRefrigeration && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-mango/40 bg-mango/15 px-3 py-1.5 text-xs font-medium text-mango-foreground">
                      <Snowflake className="size-3.5" />
                      Requiere refrigeración
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSeleccionado(null)}
                  aria-label="Cerrar"
                  className="rounded-full p-1 hover:bg-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>

              {seleccionado.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {seleccionado.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius)] bg-secondary p-3">
                  <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                    Precio por {unidadLabel(seleccionado.unit)}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                    {money(Number(seleccionado.basePricePerUnit))}
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-secondary p-3">
                  <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                    Stock disponible
                  </p>
                  <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                    {seleccionado.stockAvailable.toLocaleString("es-PA")}{" "}
                    {unidadLabel(seleccionado.unit)}
                  </p>
                </div>
                {seleccionado.condition && (
                  <div className="rounded-[var(--radius)] bg-secondary p-3">
                    <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                      Estado del producto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                      {seleccionado.condition}
                    </p>
                  </div>
                )}
                {fecha(seleccionado.expirationDate) && (
                  <div className="rounded-[var(--radius)] bg-secondary p-3">
                    <p className="flex items-center gap-1.5 text-xs tracking-wide text-secondary-foreground/70 uppercase">
                      <Calendar className="size-3.5" />
                      Expira
                    </p>
                    <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                      {fecha(seleccionado.expirationDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-popover-foreground">Cantidad a comprar</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad(String(Math.max(1, (Number(cantidad) || 1) - 1)))
                    }
                    disabled={(Number(cantidad) || 1) <= 1}
                    aria-label="Disminuir cantidad"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={seleccionado.stockAvailable}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    aria-label="Cantidad"
                    className="w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-center text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad(
                        String(
                          Math.min(
                            seleccionado.stockAvailable,
                            (Number(cantidad) || 1) + 1,
                          ),
                        ),
                      )
                    }
                    disabled={(Number(cantidad) || 0) >= seleccionado.stockAvailable}
                    aria-label="Aumentar cantidad"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between rounded-[var(--radius)] bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Total estimado</p>
                <p className="text-2xl font-semibold text-popover-foreground">
                  {money(Number(seleccionado.basePricePerUnit) * (Number(cantidad) || 0))}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setSeleccionado(null)}
                  className="flex-1 rounded-[var(--radius)] border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarAlCarrito}
                  disabled={comprando}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {comprando ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
                  {comprando ? "Agregando..." : "Agregar al carrito"}
                </button>
              </div>

              <Link
                to="/marketplace/carrito"
                className="mt-3 block text-center text-sm font-medium text-primary hover:underline"
              >
                Ver carrito
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

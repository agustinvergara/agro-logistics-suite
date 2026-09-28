import { useEffect, useState } from "react";
import { Calendar, Loader2, Package, PackageCheck, Snowflake, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { MOCK_PRODUCTOS } from "@/lib/mock";

export const PRODUCTO_PUBLICADO_EVENT = "mango:producto-publicado";

export type ProductoPublicadoDetalle = {
  name: string;
  category: string;
  requiresRefrigeration: boolean;
  basePricePerUnit: number;
  stockAvailable: number;
  unit: string;
  description: string;
  expirationDate: string;
  condition: string;
  photos: string[];
};

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

function fecha(d?: string) {
  if (!d) return null;
  const parsed = new Date(`${d}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toLocaleDateString("es-PA", { day: "numeric", month: "short", year: "numeric" });
}

function normalize(p: ProductoVista): ProductoVista {
  return {
    ...p,
    basePricePerUnit: Number(p.basePricePerUnit ?? 0),
    stockAvailable: Number(p.stockAvailable ?? 0),
  };
}

export function MyProducts() {
  const [productos, setProductos] = useState<ProductoVista[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<ProductoVista | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<any[]>("/api/marketplace/perecederos/list");
        
        // El backend ahora devuelve los campos exactos con camelCase
        const normalizados = Array.isArray(data) ? data.map(p => ({
          ...p,
          basePricePerUnit: Number(p.basePricePerUnit ?? 0),
          stockAvailable: Number(p.stockAvailable ?? 0),
          requiresRefrigeration: Boolean(p.requiresRefrigeration),
          // Si tuviéramos fotos reales en S3
          image: p.photoUrls && Array.isArray(p.photoUrls) && p.photoUrls.length > 0 ? p.photoUrls[0] : undefined
        })) : [];
        
        setProductos(normalizados);
      } catch (error) {
        toast.error("Error al cargar mis productos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    function onPublicado(e: Event) {
      const detail = (e as CustomEvent<ProductoPublicadoDetalle>).detail;
      if (!detail) return;
      const nuevo: ProductoVista = {
        id: Date.now(),
        producer: "Mi finca",
        ...detail,
      };
      if (detail.photos[0]) nuevo.image = detail.photos[0];
      setProductos((prev) => [normalize(nuevo), ...prev]);
    }
    window.addEventListener(PRODUCTO_PUBLICADO_EVENT, onPublicado);
    return () => window.removeEventListener(PRODUCTO_PUBLICADO_EVENT, onPublicado);
  }, []);

  return (
    <section className="mt-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <PackageCheck className="size-5 text-primary" />
          Mis Productos Publicados
          {!loading && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {productos.length}
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDetalle(p)}
              className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-left shadow-soft transition-shadow hover:shadow-md"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="h-40 w-full object-cover transition-transform group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-secondary">
                  <Package className="size-10 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-card-foreground">{p.name}</h3>
                  {p.requiresRefrigeration && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      <Snowflake className="size-3" />
                      Refrigerado
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.category}
                  {p.condition ? ` · ${p.condition}` : ""}
                </p>
                {p.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {money(p.basePricePerUnit)}
                    </p>
                    <p className="text-xs text-muted-foreground">por {unidadLabel(p.unit)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stock: {p.stockAvailable.toLocaleString("es-PA")} {unidadLabel(p.unit)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-foreground/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius)] border border-border bg-popover shadow-soft">
            {detalle.image ? (
              <img
                src={detalle.image}
                alt={detalle.name}
                className="h-56 w-full rounded-t-[var(--radius)] object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-secondary">
                <Package className="size-10 text-muted-foreground" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-popover-foreground">{detalle.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {detalle.category}
                    {detalle.producer ? ` · ${detalle.producer}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetalle(null)}
                  aria-label="Cerrar"
                  className="rounded-full p-1 hover:bg-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>

              {detalle.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {detalle.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius)] bg-secondary p-3">
                  <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                    Precio por {unidadLabel(detalle.unit)}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                    {money(detalle.basePricePerUnit)}
                  </p>
                </div>
                <div className="rounded-[var(--radius)] bg-secondary p-3">
                  <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                    Stock disponible
                  </p>
                  <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                    {detalle.stockAvailable.toLocaleString("es-PA")} {unidadLabel(detalle.unit)}
                  </p>
                </div>
                {detalle.condition && (
                  <div className="rounded-[var(--radius)] bg-secondary p-3">
                    <p className="text-xs tracking-wide text-secondary-foreground/70 uppercase">
                      Estado del producto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                      {detalle.condition}
                    </p>
                  </div>
                )}
                {fecha(detalle.expirationDate) && (
                  <div className="rounded-[var(--radius)] bg-secondary p-3">
                    <p className="flex items-center gap-1.5 text-xs tracking-wide text-secondary-foreground/70 uppercase">
                      <Calendar className="size-3.5" />
                      Expira
                    </p>
                    <p className="mt-1 text-lg font-semibold text-secondary-foreground">
                      {fecha(detalle.expirationDate)}
                    </p>
                  </div>
                )}
              </div>

              {detalle.requiresRefrigeration && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-mango/40 bg-mango/15 px-3 py-1.5 text-xs font-medium text-mango-foreground">
                  <Snowflake className="size-3.5" />
                  Requiere refrigeración
                </p>
              )}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setDetalle(null)}
                  className="w-full rounded-[var(--radius)] border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

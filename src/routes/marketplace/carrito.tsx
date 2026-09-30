import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from "react";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute('/marketplace/carrito')({
    head: () => ({
    meta: [
      { title: "Carrito de Compras — Mango App" },
      {
        name: "description",
        content: "Revisa tu carrito y confirma la orden de compra al productor.",
      },
      { property: "og:title", content: "Carrito de Compras — Mango App" },
      {
        property: "og:description",
        content: "Revisa los productos agregados y confirma tu orden de compra.",
      },
    ],
  }),
  component: CarritoPage,
})


function money(n: number) {
  return `$${n.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function CarritoPage() {

  const { items, total, totalItems, updateCantidad, removeItem, clearCart } = useCart();
  const [confirmando, setConfirmando] = useState(false);

  async function confirmarOrden() {
    if (!items.length) return;
    setConfirmando(true);
    try {
      await apiFetch("/api/marketplace/ordenes/checkout", {
        method: "POST",
      });
      toast.success("Orden de compra generada con éxito");
      await clearCart(); // Llama al backend para limpiar todo
    } catch (error) {
      toast.error("Error al procesar la compra");
    } finally {
      setConfirmando(false);
    }
  }

  return (
      <AppShell
      role="minisuper"
      title="Carrito de Compras"
      subtitle="Revisa los productos y confirma tu orden de compra al productor."
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius)] border border-dashed border-border bg-card py-16 text-center">
          <ShoppingCart className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega productos desde el mercado para crear tu orden.
            </p>
          </div>
          <Link
            to="/marketplace/minisuper"
            className="rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ir al Mercado
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map(({ producto, cantidad }) => (
              <article
                key={producto.id}
                className="flex gap-4 rounded-[var(--radius)] border border-border bg-card p-4 shadow-soft"
              >
                {producto.image ? (
                  <img
                    src={producto.image}
                    alt={producto.name}
                    className="size-20 shrink-0 rounded-[var(--radius)] object-cover"
                  />
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary">
                    <ShoppingCart className="size-6 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{producto.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {producto.category}
                        {producto.producer ? ` · ${producto.producer}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(producto.id)}
                      aria-label="Quitar del carrito"
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCantidad(producto.id, cantidad - 1)}
                        disabled={cantidad <= 1}
                        aria-label="Disminuir cantidad"
                        className="flex size-8 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary disabled:opacity-40"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{cantidad}</span>
                      <button
                        onClick={() => updateCantidad(producto.id, cantidad + 1)}
                        disabled={cantidad >= producto.stockAvailable}
                        aria-label="Aumentar cantidad"
                        className="flex size-8 items-center justify-center rounded-full border border-input transition-colors hover:bg-secondary disabled:opacity-40"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {producto.unit ? producto.unit.toLowerCase() : "unidad"}(s) · Stock:{" "}
                        {producto.stockAvailable}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {money(cantidad * Number(producto.basePricePerUnit))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {money(Number(producto.basePricePerUnit))} c/u
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[var(--radius)] border border-border bg-card p-5 shadow-soft lg:sticky lg:top-6">
            <h3 className="font-semibold text-card-foreground">Resumen de la orden</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Productos</dt>
                <dd className="font-medium">{items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Unidades totales</dt>
                <dd className="font-medium">{totalItems}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="font-medium text-foreground">Total estimado</dt>
                <dd className="text-lg font-semibold text-foreground">{money(total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              El pago quedará retenido en escrow hasta confirmar la entrega.
            </p>
            <button
              onClick={confirmarOrden}
              disabled={confirmando}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {confirmando && <Loader2 className="size-4 animate-spin" />}
              {confirmando ? "Cargando..." : "Confirmar Orden de Compra"}
            </button>
            <button
              onClick={clearCart}
              className="mt-2 w-full rounded-[var(--radius)] border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Vaciar carrito
            </button>
          </aside>
        </div>
      )}
    </AppShell>
  )
}

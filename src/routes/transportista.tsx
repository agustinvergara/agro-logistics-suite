import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MapPin, Snowflake, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { MOCK_VIAJES, type Viaje } from "@/lib/mock";
import { AppShell, Spinner } from "@/components/AppShell";

const CarrierMap = lazy(() => import("@/components/CarrierMap"));

export const Route = createFileRoute("/transportista")({
  head: () => ({
    meta: [
      { title: "Panel de Transportista — Mango App" },
      {
        name: "description",
        content: "Viajes cercanos en mapa, aceptación de rutas y liberación de escrow con PIN.",
      },
      { property: "og:title", content: "Panel de Transportista — Mango App" },
      {
        property: "og:description",
        content: "Encuentra viajes cercanos, acepta rutas y completa entregas verificadas.",
      },
    ],
  }),
  component: TransportistaPage,
});

const CURRENT_LAT = 9.0833;
const CURRENT_LNG = -79.5167;

function money(n: number) {
  return `$${n.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TransportistaPage() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [aceptando, setAceptando] = useState<number | null>(null);
  const [pinViaje, setPinViaje] = useState<Viaje | null>(null);
  const [pin, setPin] = useState("1234");
  const [liberando, setLiberando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<Viaje[]>(
          `/api/logistica/viajes/cercanos?currentLat=${CURRENT_LAT}&currentLng=${CURRENT_LNG}`,
        );
        setViajes(Array.isArray(data) && data.length ? data : MOCK_VIAJES);
      } catch {
        setViajes(MOCK_VIAJES);
        toast.info("Usando datos de prueba");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function aceptar(v: Viaje) {
    setAceptando(v.id);
    try {
      await apiFetch(`/api/logistica/viajes/${v.id}/aceptar?vehicleId=1`, { method: "POST" });
      toast.success("Viaje aceptado");
    } catch {
      toast.info("Usando datos de prueba");
      toast.success("Viaje aceptado");
    } finally {
      setAceptando(null);
      setViajes((prev) => prev.filter((t) => t.id !== v.id));
      setPinViaje(v);
    }
  }

  async function liberarEscrow() {
    if (!pinViaje) return;
    setLiberando(true);
    try {
      await apiFetch("/api/escrow/release", {
        method: "POST",
        body: { orderId: pinViaje.orderId, releasePin: pin },
      });
      toast.success("Entrega completada y pago liberado");
    } catch {
      toast.info("Usando datos de prueba");
      toast.success("Entrega completada y pago liberado");
    } finally {
      setLiberando(false);
      setPinViaje(null);
      setPin("1234");
    }
  }

  return (
    <AppShell role="transportista" title="Panel de Transportista" fullBleed>
      <div className="relative h-[calc(100vh-68px)] w-full">
        <ClientOnly fallback={<Spinner />}>
          <Suspense fallback={<Spinner />}>
            <CarrierMap center={[CURRENT_LAT, CURRENT_LNG]} viajes={viajes} />
          </Suspense>
        </ClientOnly>

        <aside className="absolute top-4 left-4 z-[1000] flex max-h-[calc(100%-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card/95 shadow-soft backdrop-blur">
          <div className="bg-brand px-4 py-3 text-primary-foreground">
            <h2 className="flex items-center gap-2 font-semibold">
              <Truck className="size-4" />
              Viajes Disponibles
            </h2>
            <p className="mt-0.5 text-xs text-primary-foreground/85">
              Cerca de {CURRENT_LAT}, {CURRENT_LNG}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando...
              </div>
            ) : viajes.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No hay viajes disponibles por ahora.
              </p>
            ) : (
              viajes.map((v) => (
                <div key={v.id} className="rounded-[var(--radius)] border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-card-foreground">{v.description}</p>
                    {v.requiresRefrigeration && (
                      <Snowflake className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {v.distanceKm} km · Pago {money(v.payout)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => aceptar(v)}
                      disabled={aceptando === v.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius)] bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {aceptando === v.id && <Loader2 className="size-3.5 animate-spin" />}
                      {aceptando === v.id ? "Cargando..." : "Aceptar Viaje"}
                    </button>
                    <button
                      onClick={() => setPinViaje(v)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] border border-input px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Completar Entrega
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {pinViaje && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-popover p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-popover-foreground">
                  Completar Entrega
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Orden #{pinViaje.orderId} · {pinViaje.description}
                </p>
              </div>
              <button
                onClick={() => setPinViaje(null)}
                aria-label="Cerrar"
                className="rounded-full p-1 hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium">
              PIN de entrega
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="Ingresa el PIN del comprador"
                className="mt-1.5 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </label>

            <button
              onClick={liberarEscrow}
              disabled={liberando}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {liberando && <Loader2 className="size-4 animate-spin" />}
              {liberando ? "Cargando..." : "Liberar pago en escrow"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

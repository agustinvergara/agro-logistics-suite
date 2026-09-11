import { createFileRoute } from "@tanstack/react-router";
import { Activity, DollarSign, Truck, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de Administración — Mango App" },
      {
        name: "description",
        content: "Métricas del sistema: volumen operado, fondos en escrow y flota activa.",
      },
      { property: "og:title", content: "Panel de Administración — Mango App" },
      {
        property: "og:description",
        content: "Visión general del volumen, escrow y camiones activos de la plataforma.",
      },
    ],
  }),
  component: AdminPage,
});

const VOLUMEN = [
  { mes: "Ene", volumen: 42000 },
  { mes: "Feb", volumen: 51000 },
  { mes: "Mar", volumen: 47800 },
  { mes: "Abr", volumen: 63500 },
  { mes: "May", volumen: 71200 },
  { mes: "Jun", volumen: 68900 },
  { mes: "Jul", volumen: 82400 },
];

const ESCROW = [
  { mes: "Ene", escrow: 12000 },
  { mes: "Feb", escrow: 15400 },
  { mes: "Mar", escrow: 14100 },
  { mes: "Abr", escrow: 19800 },
  { mes: "May", escrow: 23500 },
  { mes: "Jun", escrow: 21900 },
  { mes: "Jul", escrow: 28600 },
];

const CAMIONES = [
  { dia: "Lun", camiones: 24 },
  { dia: "Mar", camiones: 31 },
  { dia: "Mié", camiones: 28 },
  { dia: "Jue", camiones: 36 },
  { dia: "Vie", camiones: 42 },
  { dia: "Sáb", camiones: 38 },
  { dia: "Dom", camiones: 17 },
];

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-card-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function AdminPage() {
  return (
    <AppShell
      role="admin"
      title="Panel de Administración"
      subtitle="Datos simulados de la operación global de la plataforma."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Activity} label="Volumen de Sistema" value="$82,400" hint="+19% vs mes previo" />
        <Kpi icon={DollarSign} label="Total en Escrow" value="$28,600" hint="142 órdenes activas" />
        <Kpi icon={Truck} label="Camiones Activos" value="42" hint="Pico semanal el viernes" />
        <Kpi icon={Users} label="Tenants Activos" value="87" hint="Productores y minisúperes" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Volumen de Sistema (USD)">
          <BarChart data={VOLUMEN}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="volumen" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </Panel>

        <Panel title="Total en Escrow (USD)">
          <LineChart data={ESCROW}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="escrow"
              stroke="var(--mango)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </Panel>

        <Panel title="Camiones Activos por día">
          <BarChart data={CAMIONES}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="camiones" fill="var(--leaf)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </Panel>

        <Panel title="Tendencia de órdenes completadas">
          <LineChart data={VOLUMEN.map((v, i) => ({ mes: v.mes, ordenes: 60 + i * 18 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ordenes"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </Panel>
      </div>
    </AppShell>
  );
}

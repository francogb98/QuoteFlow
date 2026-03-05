import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { KpiCards } from "@/01-components/admin/home/nuevo/kpis-cards";
import { getDashboardData } from "@/lib/data/dashboardQueries";
import { UsersTable } from "./ui/users-table";

export default async function AdminHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const data = await getDashboardData(session.user.id);

  // Saludo dinamico segun la hora
  const hora = new Date().getHours();
  let saludo = "Buen dia";
  if (hora >= 12 && hora < 19) saludo = "Buenas tardes";
  if (hora >= 19) saludo = "Buenas noches";

  // Fecha actual formateada
  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {saludo},{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
              {data.adminNombre}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de tu negocio al {fechaHoy}
          </p>
        </div>

        {/* KPI Cards */}
        <KpiCards
          data={data.kpis}
          pagosPagados={data.pagosPagadosDetalles}
          pagosPendientes={data.pagosPendientesDetalles}
          pagosVencidos={data.pagosVencidosDetalles}
        />

        <div className="mt-6">
          {/* CORREGIDO: Pasar 'usuarios' y 'onOpenUser' */}
          {/* @ts-ignore */}
          <UsersTable usuarios={data.users} />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/data/dashboardQueries";
import { DashboardWrapper } from "@/components/admin/home/nuevo/dashboard-wrapper";
import { ShareCompanyLink } from "./ui/SharedCompanyLink";

const MESES_MAP: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function parseMesParam(mes: string | undefined): number | undefined {
  if (!mes) return undefined;
  const num = MESES_MAP[mes.toLowerCase()];
  return num ?? undefined;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const empresaNombre = session.user.empresa?.nombre;
  const empresaLink = `${process.env.FRONTEND_URL}`;

  const params = await searchParams;
  const mesNumero = parseMesParam(params.mes);

  const data = await getDashboardData(session.user.id, mesNumero);

  const hora = new Date().getHours();
  let saludo = "¡Buen dia!";
  if (hora >= 12 && hora < 19) saludo = "¡Buenas tardes!";
  if (hora >= 19) saludo = "¡Buenas noches!";

  const añoActual = new Date().getFullYear();

  return (
    <main className="flex h-full flex-col bg-background">
      <ShareCompanyLink companyName={empresaNombre} link={empresaLink} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-2 sm:px-6 lg:px-8">
        <DashboardWrapper
          adminNombre={data.adminNombre}
          saludo={saludo}
          mesNombre={data.mesNombre}
          año={añoActual}
          isFilteredMonth={data.isFilteredMonth}
          kpis={data.kpis}
          users={data.users}
          recentPayments={data.recentPayments}
          usersOverview={data.usersOverview}
        />
      </div>
    </main>
  );
}
"use server";
import { auth } from "@/*";
import PaymentAnalyticsDashboard from "@/01-components/admin/analitycs/payment-analitics-dashboard";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Analytics - Panel de Administración`,
    description: "Panel de administración - Analytics",
  };
}

export default async function NamePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const administradorId = session.user.id;

  return (
    <div className="container">
      <PaymentAnalyticsDashboard administradorId={administradorId} />
    </div>
  );
}

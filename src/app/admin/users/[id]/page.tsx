import { redirect } from "next/navigation";
import { FormEditUser } from "./ui/FormEditUser";
import type { Metadata } from "next";
import { getUser } from "@/actions/users";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUser(resolvedParams.id);
  return {
    title: `Usuario | ${user.nombre} ${user.apellido}`,
    description: `Información del usuario ${user.nombre} ${user.apellido}`,
  };
}

export default async function NamePage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    redirect("/users/list");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">{id && <FormEditUser id={id} />}</div>
    </div>
  );
}

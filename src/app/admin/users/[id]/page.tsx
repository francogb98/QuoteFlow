import { redirect } from "next/navigation";
import { FormEditUser } from "./ui/FormEditUser";
import type { Metadata } from "next";
import { getUser } from "@/actions/users";

interface Props {
  // params ahora es una Promesa en Next.js 15+
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Debes await params para resolver la promesa y acceder a sus propiedades
  const resolvedParams = await params;
  const user = await getUser(resolvedParams.id);
  return {
    title: `User | ${user.nombre}  ${user.apellido}`,
    description: `Informacion del usuario ${user.nombre} ${user.apellido}`,
  };
}

export default async function NamePage({ params }: Props) {
  // Debes await params para resolver la promesa y acceder a sus propiedades
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    redirect("/users/list");
  }

  return <div>{id && <FormEditUser id={id} />}</div>;
}

import { auth } from "@/auth.config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { Lista } from "./ui/Lista";
import NotAllowed from "./ui/NotAllowed";
import { ModalCreateUser } from "../new/ui/ModalCreateUser";

export default async function NamePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const { user } = session;

  return (
    <div className="flex flex-col gap-5">
      {!user.configuracionTarifa ? (
        <NotAllowed />
      ) : (
        <ModalCreateUser administradorId={user.id} />
      )}

      {session.user?.id && <Lista />}
    </div>
  );
}

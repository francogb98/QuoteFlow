import { auth } from "@/auth.config";
import { redirect } from "next/navigation";
import { UserDashboard } from "./ui/UserDashboard";
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

      {session.user?.id && <UserDashboard />}
    </div>
  );
}

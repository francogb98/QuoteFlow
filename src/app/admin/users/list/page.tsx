import { auth } from "@/auth.config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { Lista } from "./ui/Lista";
import NotAllowed from "./ui/NotAllowed";

export default async function NamePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const { user } = session;

  return (
    <div className="flex flex-col gap-5">
      {!user.configuracionTarifa ? (
        <NotAllowed />
      ) : (
        <Link
          href="/admin/users/new"
          className="bg-indigo-600 p-2 text-white w-[200px] rounded shadow-md flex items-center justify-center gap-2 mt-4 mx-auto"
        >
          {" "}
          <IoAdd size={20} />
          <span>Agregar Usuario </span>
        </Link>
      )}

      {session.user?.id && <Lista />}
    </div>
  );
}

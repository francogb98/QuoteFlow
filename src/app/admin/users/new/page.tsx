import { auth } from "@/*";
import { FormCreate } from "./ui/FormCreate";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { redirect } from "next/navigation";

export default async function NamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div>
      <Link
        href="/admin/users/list"
        className="bg-indigo-600 p-2 text-white w-[200px] rounded shadow-md flex items-center justify-center gap-2 mt-4 mx-auto"
      >
        {" "}
        <IoArrowBack size={20} />
        <span>Volver a la lista </span>
      </Link>

      <div className="mt-3">
        {session.user?.id && <FormCreate administradorId={session!.user!.id} />}
      </div>
    </div>
  );
}

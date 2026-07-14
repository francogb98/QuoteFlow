import { auth } from "@/auth.config";
import { isSuperAdminRole } from "@/lib/auth/isSuperAdmin";
import type { Session } from "next-auth";

type SuperAdminAccessResult =
  | {
      ok: true;
      session: Session;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function getSuperAdminAccess(): Promise<SuperAdminAccessResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      error: "No autenticado",
    };
  }

  if (!isSuperAdminRole(session.user.rol)) {
    return {
      ok: false,
      status: 403,
      error: "No autorizado",
    };
  }

  return {
    ok: true,
    session,
  };
}

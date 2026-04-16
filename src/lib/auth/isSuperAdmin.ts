import { auth } from "@/auth.config";

/**
 * Returns true if the currently authenticated user has the SUPER_ADMIN role.
 * Use this in server actions and API routes to gate super-admin-only logic.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.rol === "SUPER_ADMIN";
}

/**
 * Synchronous check — use when you already have the role value from session/token.
 */
export function isSuperAdminRole(rol: string | undefined | null): boolean {
  return rol === "SUPER_ADMIN";
}

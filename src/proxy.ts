// proxy.ts
import { auth } from "@/*";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSuperAdminRole } from "./lib/auth/isSuperAdmin";
import { tieneAccesoEmpresa } from "./lib/auth/tieneAcceso";

export async function proxy(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // SUPER_ADMIN bypasses all subscription/billing restrictions
  if (isSuperAdminRole(session.user.rol)) {
    return NextResponse.next();
  }

  //@ts-ignore
  const resultado = tieneAccesoEmpresa(session.user.empresa.suscripcion);

  if (!resultado.tieneAcceso) {
    return NextResponse.redirect(new URL("/suscripcion", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

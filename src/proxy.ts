// proxy.ts
import { auth } from "@/*";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { tieneAccesoEmpresa } from "./lib/auth/tieneAcceso";

export async function proxy(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
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

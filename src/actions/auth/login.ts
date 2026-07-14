"use server";

import { signIn } from "@/auth.config";
import { AuthError } from "next-auth";

export async function login(
  documento: string,
  password: string,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    await signIn("credentials", {
      documento,
      password,
      redirect: false,
    });

    return { ok: true, url: "/admin/home" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, error: "Credenciales inválidas" };
      }
      return { ok: false, error: "Error desconocido" };
    }

    return { ok: false, error: "Error al iniciar sesión" };
  }
}

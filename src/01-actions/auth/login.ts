"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function login(
  documento: string,
  password: string,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    // 🔴 Limpiar sesión anterior SI EXISTE
    await signOut({ redirect: false });

    const result = await signIn("credentials", {
      documento,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { ok: false, error: "Credenciales inválidas" };
    }

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

"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(
  documento: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await signIn("credentials", {
      documento,
      password,
      redirect: false,
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Credenciales inválidas" };
        default:
          return { ok: false, error: "Error desconocido" };
      }
    }
    return { ok: false, error: "Error al iniciar sesión" };
  }
}

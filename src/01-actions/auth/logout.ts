"use server";

import { signOut } from "@/auth.config";

export const logout = async () => {
  try {
    await signOut({ redirect: false });

    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
};

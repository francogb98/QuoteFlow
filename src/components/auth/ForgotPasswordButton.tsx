import React from "react";
import Link from "next/link";

export default function ForgotPasswordButton() {
  return (
    <div
      style={{ marginTop: 8 }}
      className="text-center text-emerald-400 hover:text-emerald-500 transition-colors"
    >
      <Link href="/auth/forgot-password">¿Olvidaste tu contraseña?</Link>
    </div>
  );
}

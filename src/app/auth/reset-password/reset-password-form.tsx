"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body?.error || "No se pudo cambiar la contraseña.");
        return;
      }

      setMessage("Contraseña actualizada. Redirigiendo al login...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* tu formulario igual */}
    </form>
  );
}

export default ResetPasswordForm;

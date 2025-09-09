"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveUserEmail } from "@/01-actions/public/user/editEmailUser";

interface Props {
  userId: string;
}

export const UserEmailForm = ({ userId }: Props) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: saveUserEmail,
    onSuccess: (data) => {
      if (data.ok) {
        // Invalida la caché para que la página principal se vuelva a renderizar con el email
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
        // Opcionalmente, puedes forzar una recarga para asegurar el renderizado
        router.refresh();
      } else {
        //@ts-ignore
        setError(data.error);
      }
    },
    onError: () => {
      setError("Error inesperado. Intente nuevamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Por favor, ingrese un email válido.");
      return;
    }
    setError(null);
    mutate({ userId, email });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        ¡Hola!
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Para acceder a tus pagos, necesitamos verificar tu correo electrónico.
        <br />
        Por favor, ingresa tu dirección de email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            required
            placeholder="ejemplo@correo.com"
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar y Continuar
        </button>
      </form>
    </div>
  );
};

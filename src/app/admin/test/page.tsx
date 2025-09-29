"use client";
import { revisarPagosUsuarios } from "@/01-actions/admin/test/controlarPagos";
import {
  revertirVencidosDelMesSiguiente,
  pagosMontoCero,
  simularCorreccionMontosPagosPendientes,
  corregirMontosPagosPendientes,
} from "@/01-actions/admin/test/editarPagos";
import { processDailyComplete } from "@/lib/cron/01-payments/daily";

import { useMutation } from "@tanstack/react-query";

export default function NamePage() {
  const fetch = useMutation({
    mutationFn: async () => {
      const resp = await revisarPagosUsuarios();
      return resp;
    },
  });

  const handleSubmit = async () => {
    await fetch.mutateAsync();
  };

  return (
    <>
      <form action={handleSubmit} className="p-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ejecutar Test
        </button>
        {fetch.isPending ? (
          <p className="mt-4 text-gray-700">Procesando...</p>
        ) : fetch.isError ? (
          <p className="mt-4 text-red-500">Error: {fetch.error.message}</p>
        ) : null}
      </form>
      {fetch.data && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          <h2 className="text-lg font-bold mb-2">Resultado:</h2>
          {/* <pre>{JSON.stringify(fetch.data, null, 2)}</pre> */}
        </div>
      )}
    </>
  );
}

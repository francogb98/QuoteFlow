"use client";
import { useMutation } from "@tanstack/react-query";

export default function NamePage() {
  const runCron = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/test/run-daily-cron", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error ejecutando cron");
      return json;
    },
  });

  const handleSubmit = async () => {
    await runCron.mutateAsync();
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="p-4"
      >
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ejecutar Cron Diario (Test)
        </button>
      </form>

      {runCron.data && (
        <div className="p-4 bg-white rounded shadow mt-4">
          <h2 className="text-lg font-bold mb-2">Resultado del Cron</h2>

          <div className="mb-3 text-sm">
            <strong>Usuarios revisados:</strong>{" "}
            {runCron.data.result?.checked ??
              runCron.data.result?.totalUsuariosEncontros ??
              "-"}
          </div>

          {runCron.data.result?.failures &&
          runCron.data.result.failures.length > 0 ? (
            <div>
              <h3 className="font-medium mb-2">
                Fallos al generar pagos ({runCron.data.result.failures.length})
              </h3>
              <div className="overflow-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Usuario</th>
                      <th className="px-2 py-1 text-left">Admin</th>
                      <th className="px-2 py-1 text-left">Inicio (fecha)</th>
                      <th className="px-2 py-1 text-left">Último Pago</th>
                      <th className="px-2 py-1 text-left">
                        Configuración (resumen)
                      </th>
                      <th className="px-2 py-1 text-left">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runCron.data.result.failures.map((f: any, idx: number) => (
                      <tr key={idx} className="even:bg-white odd:bg-gray-50">
                        <td className="px-2 py-1">
                          {f.usuarioNombre ?? f.usuarioId}
                        </td>
                        <td className="px-2 py-1">
                          {f.adminNombre ?? f.adminId ?? "-"}
                        </td>
                        <td className="px-2 py-1">
                          {/* mostrar inicio si viene en configuracion u otro campo; si no, "-" */}
                          {f.usuarioInicio
                            ? new Date(f.usuarioInicio).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-2 py-1">
                          {f.ultimoPago
                            ? `${f.ultimoPago.mes}/${f.ultimoPago.año} (${f.ultimoPago.estado}) $${Number(f.ultimoPago.monto ?? 0).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-2 py-1">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(f.configuracion ?? {}, null, 2)}
                          </pre>
                        </td>
                        <td className="px-2 py-1">{f.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-green-700">
              No hubo fallos al generar pagos.
            </div>
          )}

          {/* raw JSON para debugging */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm">
              Mostrar JSON completo
            </summary>
            <pre className="text-xs mt-2">
              {JSON.stringify(runCron.data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </>
  );
}

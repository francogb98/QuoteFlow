"use client";
import React, { useState } from "react";

export default function FixPaymentsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [monthsText, setMonthsText] = useState<string>(
    String(new Date().getMonth() + 1)
  ); // "9,10,11,12" ejemplo
  const [adminId, setAdminId] = useState<string>("");
  const [onlyPending, setOnlyPending] = useState<boolean>(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const months = monthsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 12);

      const body = { year, months, adminId: adminId || undefined, onlyPending };
      const res = await fetch("/api/admin/fix-payments", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error ejecutando fix");
      setResult(json.result);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Fix montos de pagos (prioriza monto del usuario)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="flex flex-col">
          <span className="text-sm">Año</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Meses (csv, 1-12)</span>
          <input
            value={monthsText}
            onChange={(e) => setMonthsText(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Filtrar por adminId (opcional)</span>
          <input
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </label>

        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          <span className="text-sm">Solo pagos PENDIENTE</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          disabled={running}
          onClick={run}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          {running ? "Ejecutando..." : "Ejecutar corrección"}
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">Error: {error}</div>}

      {result && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <h2 className="font-medium">Resumen</h2>
          <p>Pagos revisados: {result.checked}</p>
          <p>Pagos corregidos: {result.corrected}</p>

          {result.corrections && result.corrections.length > 0 && (
            <div className="mt-3">
              <h3 className="font-medium">Correcciones</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">PagoId</th>
                    <th className="px-2 py-1 text-left">Usuario</th>
                    <th className="px-2 py-1 text-left">AdminId</th>
                    <th className="px-2 py-1 text-left">Old</th>
                    <th className="px-2 py-1 text-left">New</th>
                    <th className="px-2 py-1 text-left">Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.corrections.map((c: any) => (
                    <tr key={c.pagoId}>
                      <td className="px-2 py-1">{c.pagoId}</td>
                      <td className="px-2 py-1">{c.usuarioId}</td>
                      <td className="px-2 py-1">{c.adminId ?? "-"}</td>
                      <td className="px-2 py-1">${c.oldMonto.toFixed(2)}</td>
                      <td className="px-2 py-1">${c.newMonto.toFixed(2)}</td>
                      <td className="px-2 py-1">
                        {c.mes}/{c.año}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

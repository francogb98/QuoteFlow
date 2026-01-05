"use client";
import React, { useEffect, useState } from "react";

type Admin = { id: string; nombre: string };
type UsuarioRow = {
  id: string;
  nombre: string;
  administrador: { id: string; nombre: string } | null;
  inicio?: string | null; // ISO date string from fechaInicioMembresia
  pagosByMonth: Record<string, { estado: string; monto: number } | null>;
};

type UsuarioDetail = any;

export default function UsersReportPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string | "">("");
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UsuarioDetail | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [tarifa, setTarifa] = useState<any | null>(null);

  const months = [
    { m: 9, label: "Sep" },
    { m: 10, label: "Oct" },
    { m: 11, label: "Nov" },
    { m: 12, label: "Dic" },
  ];

  const fetchData = async (adminId?: string | "") => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("year", String(year));
      if (adminId) q.set("adminId", adminId);
      const res = await fetch(`/api/admin/users-report?${q.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error fetching report");
      setAdmins(json.admins ?? []);
      setTarifa(json.tarifa ?? null);
      setUsuarios(json.usuarios ?? []);
    } catch (err) {
      console.error("Error fetching report:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    fetchData(selectedAdmin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdmin]);

  const formatInicio = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  async function loadUserDetail(userId: string) {
    setSelectedUserId(userId);
    setLoadingUser(true);
    setSelectedUser(null);
    try {
      const res = await fetch(`/api/admin/user/${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error fetching user");
      setSelectedUser(json.user ?? null);
    } catch (err) {
      console.error("Error fetching user detail:", err);
      setSelectedUser({ error: String(err) });
    } finally {
      setLoadingUser(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Reporte de Usuarios y Pagos (Sep-Dic)
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <span className="text-sm">Año</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded w-24"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm">Filtrar por admin</span>
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Todos</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => fetchData(selectedAdmin)}
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>

      {selectedAdmin && tarifa && (
        <div className="border rounded mb-6 p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">
            Tarifa del Administrador
          </h2>

          <div className="text-sm mb-2">
            <strong>Tipo de configuración:</strong>{" "}
            {tarifa.tipoConfiguracion ?? "-"}
          </div>

          {/* RANGOS */}
          {tarifa.rangos?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Rangos de Tarifa</h3>
              <table className="min-w-full table-auto text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Nombre</th>
                    <th className="px-2 py-1 text-left">Día Inicio</th>
                    <th className="px-2 py-1 text-left">Día Fin</th>
                    <th className="px-2 py-1 text-left">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifa.rangos.map((r: any) => (
                    <tr key={r.id} className="even:bg-white odd:bg-gray-50">
                      <td className="px-2 py-1">{r.nombre}</td>
                      <td className="px-2 py-1">{r.diaInicio}</td>
                      <td className="px-2 py-1">{r.diaFin}</td>
                      <td className="px-2 py-1">${r.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DINÁMICAS */}
          {tarifa.dinamicas?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Dinámicas de Tarifa</h3>
              <table className="min-w-full table-auto text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Nombre</th>
                    <th className="px-2 py-1 text-left">Monto base</th>
                    <th className="px-2 py-1 text-left">Días gracia</th>
                    <th className="px-2 py-1 text-left">Recargo</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifa.dinamicas.map((d: any) => (
                    <tr key={d.id} className="even:bg-white odd:bg-gray-50">
                      <td className="px-2 py-1">{d.nombre}</td>
                      <td className="px-2 py-1">${d.montoBase.toFixed(2)}</td>
                      <td className="px-2 py-1">{d.diasGracia}</td>
                      <td className="px-2 py-1">
                        ${d.montoRecargo.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RAW JSON opcional */}
          <details>
            <summary className="cursor-pointer text-xs text-gray-600">
              Mostrar JSON tarifa
            </summary>
            <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(tarifa, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Admin</th>
              <th className="px-4 py-2 text-left">Inicio</th>
              {months.map((c) => (
                <th key={c.m} className="px-4 py-2 text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">
                  Cargando...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">
                  No hay usuarios para mostrar
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="even:bg-white odd:bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => loadUserDetail(u.id)}
                >
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2">
                    {u.administrador?.nombre ?? "-"}
                  </td>
                  <td className="px-4 py-2">{formatInicio(u.inicio)}</td>
                  {months.map((c) => {
                    const p = u.pagosByMonth[String(c.m)];
                    return (
                      <td key={c.m} className="px-4 py-2">
                        {p ? (
                          <span
                            className={` ${
                              p.estado === "PAGADO" ? "text-green-600" : ""
                            } ${
                              p.estado === "PENDIENTE" ? "text-yellow-600" : ""
                            } ${p.estado === "VENCIDO" ? "text-red-600" : ""}`}
                          >
                            {p.estado} — ${p.monto.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle del usuario seleccionado */}
      <div className="mt-6">
        {selectedUserId && (
          <div className="mb-2 text-sm">
            <strong>Usuario seleccionado:</strong> {selectedUserId}
            <button
              onClick={() => {
                setSelectedUserId(null);
                setSelectedUser(null);
              }}
              className="ml-4 text-sm text-gray-600 hover:text-gray-800"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="border rounded p-4 bg-white">
          {loadingUser ? (
            <div>Cargando usuario...</div>
          ) : selectedUser ? (
            selectedUser.error ? (
              <div className="text-red-600">Error: {selectedUser.error}</div>
            ) : (
              <div className="text-sm">
                <h2 className="font-medium mb-2">
                  {selectedUser.nombre ?? selectedUser.id}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <strong>Id:</strong> {selectedUser.id}
                  </div>
                  <div>
                    <strong>Admin:</strong>{" "}
                    {selectedUser.administrador?.nombre ?? "-"} (
                    {selectedUser.administrador?.id ?? "-"})
                  </div>
                  <div>
                    <strong>Estado:</strong> {selectedUser.estado ?? "-"}
                  </div>
                  <div>
                    <strong>Esta activo:</strong>{" "}
                    {String(selectedUser.estaActivo ?? "-")}
                  </div>
                  <div>
                    <strong>Inicio membresía:</strong>{" "}
                    {selectedUser.fechaInicioMembresia
                      ? new Date(
                          selectedUser.fechaInicioMembresia
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Fecha creación:</strong>{" "}
                    {selectedUser.fechaCreacion
                      ? new Date(selectedUser.fechaCreacion).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <h3 className="font-medium mt-3 mb-1">
                  Configuración del admin
                </h3>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(
                    selectedUser.administrador?.configuracionTarifa ?? {},
                    null,
                    2
                  )}
                </pre>

                <h3 className="font-medium mt-3 mb-1">Últimos pagos</h3>
                <div className="overflow-auto text-xs">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">PagoId</th>
                        <th className="px-2 py-1 text-left">Periodo</th>
                        <th className="px-2 py-1 text-left">Mes/Año</th>
                        <th className="px-2 py-1 text-left">Estado</th>
                        <th className="px-2 py-1 text-left">Monto</th>
                        <th className="px-2 py-1 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedUser.pagos ?? []).map((p: any) => (
                        <tr key={p.id} className="even:bg-white odd:bg-gray-50">
                          <td className="px-2 py-1">{p.id}</td>
                          <td className="px-2 py-1">{p.periodo ?? "-"}</td>
                          <td className="px-2 py-1">
                            {p.mes}/{p.año}
                          </td>
                          <td className="px-2 py-1">{p.estado}</td>
                          <td className="px-2 py-1">
                            ${Number(p.monto ?? 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-1">
                            {p.fecha ? new Date(p.fecha).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm">
                    Mostrar JSON completo
                  </summary>
                  <pre className="text-xs mt-2">
                    {JSON.stringify(selectedUser, null, 2)}
                  </pre>
                </details>
              </div>
            )
          ) : (
            <div className="text-gray-500 text-sm">
              Hacé click en un usuario para ver detalle
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

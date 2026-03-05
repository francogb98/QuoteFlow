import React, { useState } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getUsersList } from "@/actions/admin/users";
import Link from "next/link";

const statusConfig = {
  PAGADO: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Pagado",
  },
  PENDIENTE: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: <Clock className="w-3 h-3" />,
    label: "Pendiente",
  },
  INACTIVO: {
    bg: "bg-gray-50 border-gray-200",
    text: "text-gray-800",
    icon: <XCircle className="w-3 h-3" />,
    label: "Inactivo",
  },
  VENCIDO: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: <XCircle className="w-3 h-3" />,
    label: "Vencido",
  },
};

const getYears = () => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => now.getFullYear() + 1 - i);
};

interface Props {
  profesorId?: string | null;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string | null;
  pagos: {
    mes: number;
    año: number;
    estado: "PAGADO" | "PENDIENTE" | "INACTIVO" | "VENCIDO";
  }[];
}

export function NuevaTablaDeUsuarios({ profesorId }: Props) {
  const currentDate = new Date();

  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
  const [filterEstado, setFilterEstado] = useState<
    "PAGADO" | "PENDIENTE" | "INACTIVO" | "VENCIDO" | null
  >(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [sorting, setSorting] = useState({ id: "apellido", desc: false });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["usuarios", profesorId, filterMonth, filterYear],
    queryFn: () => getUsersList(profesorId, filterMonth, filterYear),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-3xl font-sans text-gray-800">
        <h1 className="capitalize mb-6 text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-500 to-purple-600 bg-clip-text text-transparent text-center">
          {profesorId ? "Usuarios de Profesor" : "Usuarios del Sistema"}
        </h1>

        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (isError) return <div>Error al cargar usuarios: {error?.message}</div>;

  const usuarios = data?.usuarios || [];

  const getUserStatus = (user: Usuario) => {
    const pago = user.pagos.find(
      (p) => p.mes === filterMonth && p.año === filterYear,
    );
    if (!pago) return "INACTIVO";
    return pago.estado;
  };

  // Filtrado por búsqueda
  const filteredUsers = usuarios.filter((user) => {
    const searchTerm = globalFilter.toLowerCase();
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm) ||
      user.apellido.toLowerCase().includes(searchTerm) ||
      user.documento.toLowerCase().includes(searchTerm);
    //@ts-ignore
    const estadoUsuario = getUserStatus(user);
    const matchesEstado = filterEstado ? estadoUsuario === filterEstado : true;

    return matchesSearch && matchesEstado;
  });

  // Ordenamiento
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // @ts-ignore
    let aValue: any = a[sorting.id];
    // @ts-ignore
    let bValue: any = b[sorting.id];

    // Ordenamiento especial para "estado"
    if (sorting.id === "estado") {
      // @ts-ignore
      const estadoA = getUserStatus(a);
      // @ts-ignore
      const estadoB = getUserStatus(b);
      const order = ["PENDIENTE", "VENCIDO", "INACTIVO", "PAGADO"]; // orden deseado
      aValue = order.indexOf(estadoA);
      bValue = order.indexOf(estadoB);
    }

    if (aValue < bValue) return sorting.desc ? 1 : -1;
    if (aValue > bValue) return sorting.desc ? -1 : 1;
    return 0;
  });
  // Paginación
  const paginatedUsers = sortedUsers.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );
  const pageCount = Math.ceil(sortedUsers.length / pageSize);

  const handleSort = (columnId: string) => {
    setSorting((prev) => ({
      id: columnId,
      desc: prev.id === columnId ? !prev.desc : false,
    }));
  };

  const isDynamicTariff =
    data?.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO";

  return (
    <div className="py-6 bg-gray-50 rounded-3xl font-sans text-gray-800">
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        {/* Filtros */}
        <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-4 sm:p-6 border-b border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(Number(e.target.value));
                setPageIndex(0);
              }}
              className="w-32 appearance-none bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 hover:border-purple-300"
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {format(new Date(2025, i), "MMMM", { locale: es })}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(Number(e.target.value));
                setPageIndex(0);
              }}
              className="w-24 appearance-none bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 hover:border-purple-300"
            >
              {getYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-grow w-full sm:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-2 text-sm font-medium text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Tabla */}

        {paginatedUsers.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border-t border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay usuarios en este período
            </h3>
            <p className="text-gray-600 text-sm">
              No se encontraron usuarios con pagos
              {isDynamicTariff ? " que vencen" : ""} en el mes de{" "}
              {format(new Date(filterYear, filterMonth - 1), "MMMM", {
                locale: es,
              })}{" "}
              {filterYear}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-2 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => handleSort("apellido")}
                  >
                    <div className="flex items-center gap-1.5">
                      Nombre
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    DNI
                  </th>
                  {isDynamicTariff && (
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider ">
                      Vencimiento
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-2 sm:px-6 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => handleSort("estado")}
                  >
                    <div className="flex items-center gap-1.5">
                      Estado
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => {
                  //@ts-ignore
                  const estado = getUserStatus(user);
                  const config = statusConfig[estado] || statusConfig.PENDIENTE;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 sm:px-6 py-3 whitespace-nowrap font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="capitalize underline text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                        >
                          {user.apellido} {user.nombre}
                        </Link>
                      </td>
                      <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-gray-500 hidden md:table-cell">
                        {user.documento}
                      </td>
                      {isDynamicTariff && (
                        <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-gray-500 ">
                          {user.fechaInicioMembresia
                            ? format(
                                new Date(
                                  filterYear,
                                  filterMonth - 1,
                                  new Date(user.fechaInicioMembresia).getDate(),
                                ),
                                "d/MM/yyyy",
                              )
                            : "-"}
                        </td>
                      )}
                      <td className="px-2 sm:px-6 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${config.bg} ${config.text}`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700 hidden sm:block">
                Mostrando{" "}
                <span className="font-semibold">{paginatedUsers.length}</span>{" "}
                de <span className="font-semibold">{sortedUsers.length}</span>{" "}
                usuarios
              </div>
              <div className="flex-1 flex justify-center sm:justify-end items-center space-x-2">
                <button
                  onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
                  disabled={pageIndex === 0}
                  className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Página <span className="font-semibold">{pageIndex + 1}</span>{" "}
                  de <span className="font-semibold">{pageCount}</span>
                </span>
                <button
                  onClick={() =>
                    setPageIndex((old) => Math.min(old + 1, pageCount - 1))
                  }
                  disabled={pageIndex >= pageCount - 1}
                  className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

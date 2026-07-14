"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { useState, useMemo } from "react";

interface UserRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  createdAt: string;
  documento?: string;
}

interface UsersTableProps {
  users: UserRow[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVO: { label: "Activo", color: "bg-emerald-100 text-emerald-700" },
  INACTIVO: { label: "Inactivo", color: "bg-gray-100 text-gray-600" },
};

export function UsersTable({ users }: UsersTableProps) {
  const openUser = useAdminPanelStore((s) => s.openUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.documento?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || user.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  function getInitials(nombre: string, apellido: string) {
    return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Usuarios
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} registrado{filteredUsers.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o DNI..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-56 pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 border rounded-lg text-sm bg-background"
            >
              <option value="todos">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {searchTerm || statusFilter !== "todos" ? (
                <Search className="w-6 h-6 text-gray-400" />
              ) : (
                <Users className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {searchTerm || statusFilter !== "todos"
                ? "No se encontraron usuarios"
                : "Aún no hay usuarios"}
            </p>
            <p className="text-xs text-gray-500">
              {searchTerm || statusFilter !== "todos"
                ? "Intenta con otros filtros de búsqueda"
                : "Cuando registres usuarios, aparecerán aquí"}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Usuario</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Registrado
                  </TableHead>
                  <TableHead className="text-xs text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentUsers.map((user) => {
                  const status = statusConfig[user.estado] || statusConfig.ACTIVO;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-[10px] font-bold text-white">
                              {getInitials(user.nombre, user.apellido)}
                            </AvatarFallback>
                          </Avatar>

                          <button
                            type="button"
                            onClick={() => openUser(user.id)}
                            className="text-sm font-medium text-card-foreground hover:opacity-80 text-left"
                          >
                            {user.nombre} {user.apellido}
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUser(user.id)}
                          className="h-8 px-3"
                        >
                          Ver información
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, filteredUsers.length)} de{" "}
                  {filteredUsers.length} usuarios
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

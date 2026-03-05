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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { useState } from "react";

interface UserRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  createdAt: string;
}

interface UsersTableProps {
  users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  const openUser = useAdminPanelStore((s) => s.openUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Obtener iniciales del nombre
  function getInitials(nombre: string, apellido: string) {
    return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
  }

  // Formatear fecha
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Usuarios
            </CardTitle>
            <CardDescription>Gestiona tus usuarios</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-64 pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No se encontraron usuarios
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Usuario</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Registrado
                  </TableHead>
                  <TableHead className="text-xs text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentUsers.map((user) => (
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

                    <TableCell className="py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {user.estado}
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
                ))}
              </TableBody>
            </Table>

            {/* Paginación */}
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

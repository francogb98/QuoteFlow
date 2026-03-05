"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";

export interface UsuarioRow {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  estado: "ACTIVO" | "INACTIVO";
  fechaCreacion: string;
}

interface UsersTableProps {
  usuarios: UsuarioRow[];
}

const ITEMS_PER_PAGE = 10;

const estadoStyles: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVO: "bg-red-100 text-red-700 border-red-200",
};

const estadoLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
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

export function UsersTable({ usuarios }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const openUser = useAdminPanelStore((s) => s.openUser);

  const filtered = useMemo(() => {
    if (!search.trim()) return usuarios;
    const query = search.toLowerCase().trim();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(query) ||
        u.apellido.toLowerCase().includes(query) ||
        u.documento.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.telefono && u.telefono.includes(query)),
    );
  }, [usuarios, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const safePage = currentPage > totalPages ? 1 : currentPage;
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-card-foreground">
                Usuarios
              </CardTitle>
              <CardDescription>
                {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}{" "}
                {search ? "encontrados" : "registrados"}
              </CardDescription>
            </div>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, documento, email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No se encontraron usuarios
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Intenta con otro término de búsqueda"
                : "Aún no hay usuarios registrados"}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Usuario</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Documento
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Contacto
                  </TableHead>

                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Registro
                  </TableHead>
                  <TableHead className="text-xs text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-[10px] font-bold text-white">
                            {getInitials(usuario.nombre, usuario.apellido)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-card-foreground">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="truncate text-xs text-muted-foreground sm:hidden">
                            {usuario.documento}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">
                        {usuario.documento}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 hidden md:table-cell">
                      <div className="flex flex-col">
                        {usuario.email && (
                          <span className="truncate text-sm text-muted-foreground max-w-[180px]">
                            {usuario.email}
                          </span>
                        )}
                        {usuario.telefono && (
                          <span className="text-xs text-muted-foreground/70">
                            {usuario.telefono}
                          </span>
                        )}
                        {!usuario.email && !usuario.telefono && (
                          <span className="text-xs text-muted-foreground/50">
                            Sin contacto
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          estadoStyles[usuario.estado] ?? ""
                        }`}
                      >
                        {estadoLabels[usuario.estado] ?? usuario.estado}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(usuario.fechaCreacion)}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Button
                        variant="ghost"
                        //@ts-ignore
                        size="icon-sm"
                        onClick={() => openUser(usuario.id)}
                        title="Ver información del usuario"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver usuario</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  Mostrando {startIdx + 1}-
                  {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} de{" "}
                  {filtered.length}
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    //@ts-ignore
                    size="icon-sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Página anterior</span>
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - safePage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => {
                      const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-1 text-xs text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={safePage === page ? "default" : "outline"}
                            //@ts-ignore
                            size="icon-sm"
                            onClick={() => setCurrentPage(page)}
                            className="text-xs"
                          >
                            {page}
                          </Button>
                        </span>
                      );
                    })}

                  <Button
                    variant="outline"
                    //@ts-ignore
                    size="icon-sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Página siguiente</span>
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

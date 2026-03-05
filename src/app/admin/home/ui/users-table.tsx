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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
} from "lucide-react";

import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { UserPaymentsModal } from "./user-payment-modal";

export interface PagoEstado {
  mes: string;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO";
}

export interface UsuarioRow {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  estado: "ACTIVO" | "INACTIVO";
  fechaCreacion: string;
  pagos?: PagoEstado[];
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

const pagoStyles: Record<string, string> = {
  PAGADO: "bg-emerald-100 text-emerald-700",
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  VENCIDO: "bg-red-100 text-red-700",
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
  const [selectedUser, setSelectedUser] = useState<UsuarioRow | null>(null);
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
              <CardTitle className="text-base font-semibold">
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

              <TableHead className="text-xs">Pagos</TableHead>

              <TableHead className="text-xs">Estado</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((usuario) => (
              <TableRow key={usuario.id}>
                {/* Usuario */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="ghost"
                      onClick={() => openUser(usuario.id)}
                    >
                      <p className="truncate text-sm font-medium cursor-pointer capitalize">
                        {usuario.nombre} {usuario.apellido}
                      </p>
                    </Button>

                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground sm:hidden">
                        {usuario.documento}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Documento */}
                <TableCell className="py-3 hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground font-mono">
                    {usuario.documento}
                  </span>
                </TableCell>

                {/* Contacto */}
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

                {/* Pagos */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(usuario)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {usuario.pagos?.length}
                  </Button>
                </TableCell>

                {/* Estado */}
                <TableCell className="py-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      estadoStyles[usuario.estado]
                    }`}
                  >
                    {estadoLabels[usuario.estado]}
                  </Badge>
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
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <UserPaymentsModal
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
        usuarioNombre={
          selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : ""
        }
        pagos={selectedUser?.pagos ?? []}
      />
    </Card>
  );
}

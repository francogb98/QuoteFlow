"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, DollarSign, Eye, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRow } from "@/lib/data/dashboardQueries";
import { PaymentEstadoBadge } from "./payment-estado-badge";

const ITEMS_PER_PAGE = 12;

const ESTADO_PRIORITY: Record<string, number> = {
  VENCIDO: 0,
  PENDIENTE: 1,
  PAGADO: 2,
  SIN_PAGOS: 3,
};

type SortDirection = "asc" | "desc" | null;

interface UsersPaymentTableProps {
  users: UserRow[];
  onViewUser: (userId: string) => void;
  onCobrar: (user: UserRow) => void;
}

function UserAvatar({ nombre, apellido }: { nombre: string; apellido: string }) {
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials}
    </div>
  );
}

function getEstado(user: UserRow): string {
  return user.pagos?.[0]?.estado ?? "SIN_PAGOS";
}

export function UsersPaymentTable({
  users,
  onViewUser,
  onCobrar,
}: UsersPaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [users, searchQuery]);

  const filteredAndSorted = useMemo(() => {
    let result = users;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((user) => {
        const nombre = `${user.nombre} ${user.apellido}`.toLowerCase();
        const dni = (user.documento ?? "").toLowerCase();
        return nombre.includes(q) || dni.includes(q);
      });
    }

    if (sortDir) {
      result = [...result].sort((a, b) => {
        const pa = ESTADO_PRIORITY[getEstado(a)] ?? 99;
        const pb = ESTADO_PRIORITY[getEstado(b)] ?? 99;
        return sortDir === "asc" ? pa - pb : pb - pa;
      });
    }

    return result;
  }, [users, searchQuery, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  function toggleSort() {
    setSortDir((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }

  const sortIcon = sortDir === "asc" ? " ▲" : sortDir === "desc" ? " ▼" : "";

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuario por nombre o DNI..."
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Desktop table - hidden on mobile */}
        <div className="max-[480px]:hidden">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-7 px-2 text-[11px]">Usuario</TableHead>
                <TableHead className="h-7 px-2 text-[11px]">Plan / Tarifa</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="flex items-center gap-1 text-[11px] font-medium leading-none hover:text-foreground"
                  >
                    Estado de Pago
                    {sortIcon && (
                      <span className="text-[10px] text-primary">{sortIcon}</span>
                    )}
                  </button>
                </TableHead>
                <TableHead className="h-7 px-2 text-[11px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No hay usuarios para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const ultimoPago = user.pagos?.[0];
                  const estado = ultimoPago?.estado ?? "SIN_PAGOS";
                  const necesitaCobro = estado === "PENDIENTE" || estado === "VENCIDO";

                  return (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            nombre={user.nombre}
                            apellido={user.apellido}
                          />
                          <span className="text-xs font-medium capitalize text-foreground">
                            {user.nombre} {user.apellido}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-1.5">
                        {user.tarifaNombre || user.tarifaMonto ? (
                          <span className="text-[11px] font-medium text-gray-700">
                            {user.tarifaNombre && user.tarifaMonto
                              ? `${user.tarifaNombre} - $${user.tarifaMonto.toLocaleString("es-AR")}`
                              : user.tarifaNombre
                                ? user.tarifaNombre
                                : `$${user.tarifaMonto!.toLocaleString("es-AR")}`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Sin tarifa
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-1.5">
                        {ultimoPago ? (
                          <PaymentEstadoBadge
                            estado={ultimoPago.estado}
                            mes={ultimoPago.mes}
                            año={ultimoPago.año}
                          />
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Sin pagos
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => onViewUser(user.id)}
                              className="gap-2 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver perfil
                            </DropdownMenuItem>
                            {necesitaCobro && (
                              <DropdownMenuItem
                                onClick={() => onCobrar(user)}
                                className="gap-2 text-xs"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                $ Cobrar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile table - visible only on small screens */}
        <div className="hidden max-[480px]:block">
          <Table className="text-[11px]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-6 px-1.5 text-[10px]">Usuario</TableHead>
                <TableHead className="h-6 px-1.5 text-[10px]">Plan</TableHead>
                <TableHead className="h-6 px-1.5 text-[10px]">Estado</TableHead>
                <TableHead className="h-6 w-8 px-1.5 text-[10px]"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-4 text-center text-xs text-muted-foreground"
                  >
                    No hay usuarios para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const ultimoPago = user.pagos?.[0];
                  const estado = ultimoPago?.estado ?? "SIN_PAGOS";
                  const necesitaCobro = estado === "PENDIENTE" || estado === "VENCIDO";

                  return (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="px-1.5 py-1">
                        <span className="block max-w-[90px] truncate text-[11px] font-medium capitalize text-foreground">
                          {user.nombre} {user.apellido}
                        </span>
                      </TableCell>

                      <TableCell className="px-1.5 py-1">
                        {user.tarifaNombre || user.tarifaMonto ? (
                          <span className="block max-w-[70px] truncate text-[10px] font-medium text-gray-700">
                            {user.tarifaNombre
                              ? user.tarifaNombre
                              : `$${user.tarifaMonto!.toLocaleString("es-AR")}`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-1.5 py-1">
                        {ultimoPago ? (
                          <PaymentEstadoBadge
                            estado={ultimoPago.estado}
                            mes={ultimoPago.mes}
                            año={ultimoPago.año}
                            compact
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Sin pagos
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-1 py-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => onViewUser(user.id)}
                              className="gap-2 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver perfil
                            </DropdownMenuItem>
                            {necesitaCobro && (
                              <DropdownMenuItem
                                onClick={() => onCobrar(user)}
                                className="gap-2 text-xs"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                $ Cobrar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredAndSorted.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
          <p className="text-[11px] text-muted-foreground">
            Mostrando {startIdx + 1}-
            {Math.min(startIdx + ITEMS_PER_PAGE, filteredAndSorted.length)} de{" "}
            {filteredAndSorted.length}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <span className="px-1.5 text-[11px] text-muted-foreground">
              {safePage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
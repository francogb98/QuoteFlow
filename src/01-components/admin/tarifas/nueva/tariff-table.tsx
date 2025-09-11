"use client";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";

interface Tariff {
  id?: string;
  nombre: string;
  diaInicio?: number;
  diaFin?: number;
  monto?: number;
  montoBase?: number;
  diasGracia?: number;
  montoRecargo?: number;
}

interface TariffTableProps {
  tarifas: Tariff[];
  tipo: "FIJA_MENSUAL" | "DINAMICA_POR_FECHA_INGRESO";
  onEdit: (tarifa: Tariff) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function TariffTable({
  tarifas,
  tipo,
  onEdit,
  onDelete,
  onCreate,
}: TariffTableProps) {
  const isFijaMensual = tipo === "FIJA_MENSUAL";

  if (tarifas.length === 0) {
    return (
      <div className="text-center py-8 px-4 sm:py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
          No hay tarifas configuradas
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Crea tu primera tarifa para comenzar
        </p>
        <Button onClick={onCreate} size="sm" className="sm:text-base">
          <Plus className="w-4 h-4 mr-2" />
          Crear Primera Tarifa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">
            {isFijaMensual ? "Tarifas Fijas Mensuales" : "Tarifas Dinámicas"}
          </h3>
          <Badge variant="secondary" className="mt-1 text-xs">
            {tarifas.length} tarifa{tarifas.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button onClick={onCreate} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarifa
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-50 text-xs sm:text-sm">
              <TableHead className="font-semibold px-3 sm:px-6 py-2">
                Nombre
              </TableHead>
              {isFijaMensual ? (
                <>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Día Inicio
                  </TableHead>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Día Fin
                  </TableHead>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Monto
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Monto Base
                  </TableHead>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Días Gracia
                  </TableHead>
                  <TableHead className="font-semibold px-3 sm:px-6 py-2">
                    Monto Recargo
                  </TableHead>
                </>
              )}
              <TableHead className="w-12 px-3 sm:px-6 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarifas.map((tarifa) => (
              <TableRow key={tarifa.id} className="hover:bg-gray-50 text-sm">
                <TableCell className="font-medium px-3 sm:px-6 py-2">
                  {tarifa.nombre}
                </TableCell>
                {isFijaMensual ? (
                  <>
                    <TableCell className="px-3 sm:px-6 py-2">
                      {tarifa.diaInicio}
                    </TableCell>
                    <TableCell className="px-3 sm:px-6 py-2">
                      {tarifa.diaFin}
                    </TableCell>
                    <TableCell className="font-semibold px-3 sm:px-6 py-2">
                      ${tarifa.monto?.toFixed(2)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-semibold px-3 sm:px-6 py-2">
                      ${tarifa.montoBase?.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-3 sm:px-6 py-2">
                      {tarifa.diasGracia} días
                    </TableCell>
                    <TableCell className="font-semibold px-3 sm:px-6 py-2">
                      ${tarifa.montoRecargo?.toFixed(2)}
                    </TableCell>
                  </>
                )}
                <TableCell className="px-3 sm:px-6 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setTimeout(() => onEdit(tarifa), 0);
                        }}
                        className="text-sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          onDelete(tarifa.id!);
                        }}
                        className="text-red-600 focus:text-red-600 text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

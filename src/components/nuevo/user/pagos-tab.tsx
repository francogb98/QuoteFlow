// components/pagos-tab.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstadoPago, MetodoPago, Pago } from "@prisma/client";

interface PagosTabProps {
  pagos: Pago[];
  onAddPago: (pago: {
    monto: number;
    periodo: string;
    metodo: MetodoPago;
    estado: EstadoPago;
    mes: number;
    año: number;
  }) => void;
  onEditPago: (id: string, pago: Partial<Pago>) => void;
}

const estadoPagoStyles: Record<EstadoPago, string> = {
  [EstadoPago.PAGADO]:
    "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
  [EstadoPago.PENDIENTE]: "bg-amber-500/15 text-amber-700 border-amber-500/25",
  [EstadoPago.VENCIDO]: "bg-red-500/15 text-red-700 border-red-500/25",
  [EstadoPago.RECHAZADO]: "bg-red-500/15 text-red-600 border-red-500/25",
};

const metodoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: "Efectivo",
  [MetodoPago.MERCADOPAGO]: "MercadoPago",
  [MetodoPago.TRANSFERENCIA]: "Transferencia",
  [MetodoPago.TARJETA]: "Tarjeta",
};

const estadoLabels: Record<EstadoPago, string> = {
  [EstadoPago.PAGADO]: "Pagado",
  [EstadoPago.PENDIENTE]: "Pendiente",
  [EstadoPago.VENCIDO]: "Vencido",
  [EstadoPago.RECHAZADO]: "Rechazado",
};

interface PagoFormData {
  monto: string;
  periodo: string;
  metodo: MetodoPago | "";
  estado: EstadoPago | "";
}

const emptyForm: PagoFormData = {
  monto: "",
  periodo: "",
  metodo: "",
  estado: "",
};

// Helper simple para parsear "Enero 2024" o "01/2024"
const parsePeriodo = (periodoStr: string): { mes: number; año: number } => {
  const now = new Date();
  // Valor por defecto por si falla el parseo
  let mes = now.getMonth() + 1;
  let año = now.getFullYear();

  const meses: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  // Intento 1: "Mes Año" (ej: "Marzo 2026")
  const parts = periodoStr.split(" ");
  if (parts.length === 2) {
    const mesNombre = parts[0].toLowerCase();
    const añoNum = parseInt(parts[1]);
    if (meses[mesNombre] && !isNaN(añoNum)) {
      mes = meses[mesNombre];
      año = añoNum;
      return { mes, año };
    }
  }

  // Intento 2: "MM/AAAA" o "MM-AAAA"
  const separator = periodoStr.includes("/") ? "/" : "-";
  const dateParts = periodoStr.split(separator);
  if (dateParts.length === 2) {
    const mesNum = parseInt(dateParts[0]);
    const añoNum = parseInt(dateParts[1]);
    if (!isNaN(mesNum) && !isNaN(añoNum) && mesNum >= 1 && mesNum <= 12) {
      return { mes: mesNum, año: añoNum };
    }
  }

  return { mes, año };
};

export function PagosTab({ pagos, onAddPago, onEditPago }: PagosTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<PagoFormData>(emptyForm);
  const [editForm, setEditForm] = useState<PagoFormData>(emptyForm);

  const handleAdd = () => {
    if (
      !addForm.monto ||
      !addForm.periodo ||
      !addForm.metodo ||
      !addForm.estado
    )
      return;

    // Calculamos mes y año para cumplir con el schema de Prisma
    const { mes, año } = parsePeriodo(addForm.periodo);

    onAddPago({
      monto: parseFloat(addForm.monto),
      periodo: addForm.periodo,
      metodo: addForm.metodo as MetodoPago,
      estado: addForm.estado as EstadoPago,
      mes,
      año,
    });
    setAddForm(emptyForm);
    setShowAddForm(false);
  };

  const startEdit = (pago: Pago) => {
    setEditingId(pago.id);
    setEditForm({
      monto: pago.monto.toString(),
      periodo: pago.periodo,
      metodo: pago.metodo,
      estado: pago.estado,
    });
  };

  const handleEdit = () => {
    if (
      !editingId ||
      !editForm.monto ||
      !editForm.periodo ||
      !editForm.metodo ||
      !editForm.estado
    )
      return;

    const { mes, año } = parsePeriodo(editForm.periodo);

    onEditPago(editingId, {
      monto: parseFloat(editForm.monto),
      periodo: editForm.periodo,
      metodo: editForm.metodo as MetodoPago,
      estado: editForm.estado as EstadoPago,
      mes,
      año,
    });
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagos.length} pago{pagos.length !== 1 ? "s" : ""} registrado
          {pagos.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          variant={showAddForm ? "secondary" : "default"}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <X className="size-4" /> Cancelar
            </>
          ) : (
            <>
              <Plus className="size-4" /> Agregar Pago
            </>
          )}
        </Button>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-medium">Nuevo Pago</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-monto" className="text-xs">
                Monto
              </Label>
              <Input
                id="add-monto"
                type="number"
                placeholder="0.00"
                value={addForm.monto}
                onChange={(e) =>
                  setAddForm({ ...addForm, monto: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-periodo" className="text-xs">
                Periodo
              </Label>
              <Input
                id="add-periodo"
                placeholder="Ej: Marzo 2026"
                value={addForm.periodo}
                onChange={(e) =>
                  setAddForm({ ...addForm, periodo: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Metodo</Label>
              <Select
                value={addForm.metodo}
                onValueChange={(value) =>
                  setAddForm({ ...addForm, metodo: value as MetodoPago })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Metodo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MetodoPago).map((m) => (
                    <SelectItem key={m} value={m}>
                      {metodoLabels[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Estado</Label>
              <Select
                value={addForm.estado}
                onValueChange={(value) =>
                  setAddForm({ ...addForm, estado: value as EstadoPago })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EstadoPago).map((e) => (
                    <SelectItem key={e} value={e}>
                      {estadoLabels[e]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" className="mt-3" onClick={handleAdd}>
            <Check className="size-4" /> Confirmar Pago
          </Button>
        </div>
      )}

      {/* Payments table */}
      <ScrollArea className="h-[360px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Metodo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <p className="text-muted-foreground">
                    No hay pagos registrados
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              pagos.map((pago) =>
                editingId === pago.id ? (
                  <TableRow key={pago.id} className="bg-muted/30">
                    <TableCell>
                      <Input
                        value={editForm.periodo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, periodo: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.monto}
                        onChange={(e) =>
                          setEditForm({ ...editForm, monto: e.target.value })
                        }
                        className="h-8 w-24 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editForm.metodo}
                        onValueChange={(value) =>
                          setEditForm({
                            ...editForm,
                            metodo: value as MetodoPago,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MetodoPago).map((m) => (
                            <SelectItem key={m} value={m}>
                              {metodoLabels[m]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editForm.estado}
                        onValueChange={(value) =>
                          setEditForm({
                            ...editForm,
                            estado: value as EstadoPago,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(EstadoPago).map((e) => (
                            <SelectItem key={e} value={e}>
                              {estadoLabels[e]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={handleEdit}
                        >
                          <Check className="size-4 text-emerald-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={cancelEdit}
                        >
                          <X className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">
                      {pago.periodo}
                    </TableCell>
                    <TableCell>
                      {"$"}
                      {pago.monto.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{metodoLabels[pago.metodo]}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          estadoPagoStyles[pago.estado],
                        )}
                      >
                        {estadoLabels[pago.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => startEdit(pago)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

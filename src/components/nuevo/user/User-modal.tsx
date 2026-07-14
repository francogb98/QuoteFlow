// components/user-edit-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { TipoConfiguracionTarifa } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Loader2 } from "lucide-react";

import { editUser } from "@/actions/users";
import { getUser } from "@/actions/users/admin/getUser";
import { PagosTab } from "./pagos-tab";
import { PerfilTab } from "./perfil-tab";

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  adminConfigTarifa?: {
    tipoConfiguracion: TipoConfiguracionTarifa;
    rangos?: any[];
    dinamicas?: any[];
  } | null;
}

export function UserEditModal({
  open,
  onOpenChange,
  userId,
  adminConfigTarifa,
}: UserEditModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const {
    data: userData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId && open,
  });

  useEffect(() => {
    if (!userData) return;
    const clone = JSON.parse(JSON.stringify(userData));

    if (clone.fechaInicioMembresia) {
      try {
        clone.fechaInicioMembresia = new Date(clone.fechaInicioMembresia)
          .toISOString()
          .slice(0, 10);
      } catch (e) {
        console.error(e);
      }
    }

    // LÓGICA DE SINCRONIZACIÓN ACTUALIZADA
    // Si hay ID, lo usamos. Si no, asignamos "no-tarifa" para el Select
    clone.tarifa = clone.dinamicaTarifaId || clone.rangoTarifaId || "no-tarifa";

    setFormData(clone);
  }, [userData, userId]);

  const userMutation = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar usuario");
    },
  });

  const handleFormChange = (name: string, value: any) => {
    if (name === "tarifa") {
      // LÓGICA TRADUCIDA: Si el valor es "no-tarifa", guardamos null en los IDs
      const isClean = value === "no-tarifa";
      const selectedId = isClean ? null : value;

      const isDynamic =
        adminConfigTarifa?.tipoConfiguracion ===
        TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;
      const listaTarifas = isDynamic
        ? adminConfigTarifa?.dinamicas || []
        : adminConfigTarifa?.rangos || [];

      const nombreTarifa = isClean
        ? null
        : listaTarifas.find((t: any) => t.id === selectedId)?.nombre || null;

      setFormData((prev: any) => ({
        ...prev,
        // Mantenemos "no-tarifa" en el estado del form para que el Select no falle
        tarifa: value,
        dinamicaTarifaId: isDynamic ? selectedId : null,
        rangoTarifaId: !isDynamic ? selectedId : null,
        nombreTarifaAsignada: nombreTarifa,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const payload = { ...formData, id: userId };

    // LIMPIEZA PARA EL BACKEND: Convertir "no-tarifa" a null antes de enviar
    if (payload.tarifa === "no-tarifa") {
      payload.tarifa = null;
    }

    if (payload.fechaInicioMembresia) {
      const d = new Date(payload.fechaInicioMembresia);
      if (!isNaN(d.getTime())) payload.fechaInicioMembresia = d.toISOString();
    }

    userMutation.mutate(payload);
  };

  const tarifasDisponibles =
    adminConfigTarifa?.tipoConfiguracion === "FIJA_MENSUAL"
      ? adminConfigTarifa?.rangos || []
      : adminConfigTarifa?.dinamicas || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        {isLoading && !userData ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-purple-600 w-8 h-8" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl">
                  {formData?.nombre} {formData?.apellido}
                </DialogTitle>
                <Badge variant="outline">{formData?.estado}</Badge>
              </div>
              <DialogDescription>DOC: {formData?.documento}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="perfil" className="flex-1 mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="perfil" className="flex-1 gap-1.5">
                  <User className="size-4" /> Perfil
                </TabsTrigger>
                <TabsTrigger value="pagos" className="flex-1 gap-1.5">
                  <CreditCard className="size-4" /> Pagos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="perfil" className="mt-4">
                <PerfilTab
                  formData={formData}
                  originalData={userData}
                  tarifasDisponibles={tarifasDisponibles}
                  tipoConfiguracion={adminConfigTarifa?.tipoConfiguracion}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  isLoading={userMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="pagos" className="mt-4">
                <PagosTab
                  pagos={userData?.pagos || []}
                  onAddPago={(pago) => console.log("Add pago logic", pago)}
                  onEditPago={(id, pago) =>
                    console.log("Edit pago logic", id, pago)
                  }
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

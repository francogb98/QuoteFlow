"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { extendSubscriptionOneMonth } from "@/actions/admin/suscripcion-tecnica.action";
import { Empresa } from "@prisma/client";

interface SuscripcionTecnicaPanelProps {
  empresas: (Empresa & {
    suscripcion: any;
    administradores: Array<{ id: string; nombre: string; email: string }>;
  })[];
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVA: "default",
  TRIAL: "secondary",
  CANCELADA: "outline",
  VENCIDA: "destructive",
  PENDIENTE: "outline",
};

export default function SuscripcionTecnicaPanel({
  empresas,
}: SuscripcionTecnicaPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExtend = async (empresaId: string) => {
    setLoading(empresaId);
    setMessage(null);
    const result = await extendSubscriptionOneMonth(empresaId);
    setLoading(null);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
  };

  const getEstadoBadge = (estado: string) => {
    return (
      <Badge variant={estadoBadgeVariant[estado] || "outline"}>
        {estado}
      </Badge>
    );
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Panel Técnico de Suscripciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestión técnica de suscripciones de empresas
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-accent/10 text-accent border border-accent/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones</CardTitle>
          <CardDescription>
            Ver y gestionar el estado de suscripciones de todas las empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((empresa) => {
                const admin = empresa.administradores[0];
                const suscripcion = empresa.suscripcion;

                return (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">
                      {empresa.nombre}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{admin?.nombre || "-"}</div>
                        <div className="text-muted-foreground text-xs">
                          {admin?.email || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {suscripcion
                        ? getEstadoBadge(suscripcion.estadoSuscripcion)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {suscripcion ? (
                        <div className="text-sm">
                          <div>{suscripcion.planTipo}</div>
                          <div className="text-muted-foreground text-xs">
                            {suscripcion.frecuenciaPago}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {suscripcion
                        ? formatDate(suscripcion.fechaFinPeriodoActual)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExtend(empresa.id)}
                          disabled={loading === empresa.id}
                        >
                          {loading === empresa.id ? "..." : "Extender 1 mes"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

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
    const colors: Record<string, string> = {
      ACTIVA: "bg-green-100 text-green-800",
      TRIAL: "bg-blue-100 text-blue-800",
      CANCELADA: "bg-yellow-100 text-yellow-800",
      VENCIDA: "bg-red-100 text-red-800",
      PENDIENTE: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[estado] || "bg-gray-100 text-gray-800"}>
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
        <h1 className="text-3xl font-bold text-gray-900">
          Panel Técnico de Suscripciones
        </h1>
        <p className="text-gray-600 mt-2">
          Gestión técnica de suscripciones de empresas
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
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
                        <div className="text-gray-500 text-xs">
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
                          <div className="text-gray-500 text-xs">
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

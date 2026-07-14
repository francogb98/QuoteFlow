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
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = Array.from({ length: 10 }, (_, i) => i);

export function NotificationsTableSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-red-900">
              Pendientes de contactar
            </CardTitle>
            <CardDescription className="text-red-800/80">
              Todavía no se abrió el chat de WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-10" />
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">
              Chat abierto
            </CardTitle>
            <CardDescription className="text-amber-800/80">
              Se abrió WhatsApp pero falta confirmar envío.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-10" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Enviados</CardTitle>
            <CardDescription className="text-slate-700">
              Mensajes confirmados como enviados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-10" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Monto pendiente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Último envío</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((i) => (
                <TableRow key={i}>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-24 rounded-md" />
                      <Skeleton className="h-8 w-28 rounded-md" />
                      <Skeleton className="h-8 w-14 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-52" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

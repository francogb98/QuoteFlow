import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export function CompaniesTableSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Suscripción</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Usuarios activos</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((i) => (
              <TableRow key={i}>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="align-top">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="align-top">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-right align-top">
                  <Skeleton className="ml-auto h-8 w-24 rounded-md" />
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
  );
}

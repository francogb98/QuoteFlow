import { findUser } from "@/actions/users/public";
import { HandlePayment } from "../../ui/HandlePayment";
import { notFound } from "next/navigation";
import type { FindUserResult } from "@/types/find-user-result";
import type { Metadata } from "next"; // Importa Metadata

interface Props {
  params: Promise<{
    empresa: string;
    documento: string;
    pagoId: string;
  }>;
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Genera la metadata para la página de detalles del pago
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { empresa, documento, pagoId } = resolvedParams;

  const userResult: FindUserResult = await findUser(documento, empresa);

  const isUserOk = (
    result: FindUserResult
  ): result is {
    ok: true;
    usuario: any;
    id: string;
    administradorId: string;
    configuracionTarifa: any;
  } => {
    return result.ok === true && "usuario" in result;
  };

  if (!isUserOk(userResult)) {
    return {
      title: "Pago no encontrado",
      description: "No se pudo encontrar el pago solicitado.",
    };
  }

  const pagoActual = userResult.usuario.pagos.find(
    // @ts-ignore
    (pago) => pago.id === pagoId
  );

  if (!pagoActual) {
    return {
      title: "Pago no encontrado",
      description: "No se pudo encontrar el pago solicitado.",
    };
  }

  const mesNombre = meses[pagoActual.mes - 1];

  return {
    title: `Pago de ${mesNombre} ${pagoActual.año} | ${userResult.usuario.nombre} ${userResult.usuario.apellido}`,
    description: `Detalles del pago de ${mesNombre} de ${pagoActual.año} para ${userResult.usuario.nombre} ${userResult.usuario.apellido}. Estado: ${pagoActual.estado}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { empresa, documento, pagoId } = resolvedParams;

  if (!documento || !pagoId) {
    notFound();
  }

  const userResult: FindUserResult = await findUser(documento, empresa);

  const isUserOk = (
    result: FindUserResult
  ): result is {
    ok: true;
    usuario: any;
    id: string;
    administradorId: string;
    configuracionTarifa: any;
  } => {
    return result.ok === true && "usuario" in result;
  };

  if (!isUserOk(userResult)) {
    notFound();
  }

  const pagoActual = userResult.usuario.pagos.find(
    // @ts-ignore
    (pago) => pago.id === pagoId
  );

  if (!pagoActual) {
    notFound();
  }

  return (
    <HandlePayment
      nombreUsuarioCompleto={`${userResult.usuario.apellido} ${userResult.usuario.nombre}`}
      documento={userResult.usuario.documento}
      adminId={userResult.usuario.administradorId}
      pagoActual={pagoActual}
      meses={meses}
    />
  );
}

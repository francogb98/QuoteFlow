import { findUser } from "@/actions/users/public";
import { notFound } from "next/navigation";
import type { FindUserResult } from "@/types/find-user-result";
import type { Metadata } from "next";
import { UserDataUnified } from "../ui/UserDataUnified";
import { UserEmailForm } from "../ui/SaveEmailUser";
import { is } from "date-fns/locale";

interface Props {
  params: Promise<{
    empresa: string;
    documento: string;
  }>;
}

// Genera la metadata para la página del documento del usuario
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { empresa, documento } = resolvedParams;

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
      title: "Usuario no encontrado",
      description: `No se encontró información para el documento ${documento}.`,
    };
  }

  return {
    title: `Pagos de ${userResult.usuario.nombre} ${userResult.usuario.apellido} | DNI: ${userResult.usuario.documento}`,
    description: `Consulta el historial y estado de pagos de ${userResult.usuario.nombre} ${userResult.usuario.apellido}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function UserPaymentsPage({ params }: Props) {
  const resolvedParams = await params;
  const { empresa, documento } = resolvedParams;

  if (!documento) {
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
  //@ts-ignore
  const modeloCobro = userResult.modoDePago || "COMPROBANTE";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      <div className="container mx-auto sm:px-4 py-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
          <span className="mx-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent capitalize">
            {empresa}
          </span>
          <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"></div>
        </div>
        {!userResult.usuario.email ? (
          <UserEmailForm userId={userResult.id} />
        ) : (
          <UserDataUnified
            usuario={userResult.usuario}
            modeloCobro={modeloCobro}
            empresa={empresa}
            documento={documento}
          />
        )}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { successSuscriber } from "@/actions/auth/registration/02-successSuscriber";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      preapproval_created,
      empresaId,
      planType,
      frequency,
      preapproval_id,
    } = body;

    console.log(
      `[API PROCESS-SUBSCRIPTION] Recibiendo solicitud - preapproval_created: ${preapproval_created}, empresaId: ${empresaId}, planType: ${planType}, frequency: ${frequency}, preapproval_id: ${preapproval_id}`,
    );

    if (!preapproval_id) {
      return NextResponse.json(
        { success: false, error: "preapproval_id es requerido" },
        { status: 400 },
      );
    }

    const result = await successSuscriber({
      preapproval_created: preapproval_created || "",
      empresaId: empresaId || "",
      planType: planType || "",
      frequency: frequency || "",
      preapproval_id,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API PROCESS-SUBSCRIPTION] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la suscripción" },
      { status: 500 },
    );
  }
}

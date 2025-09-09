import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Obtén el cuerpo de la petición
  const body = await request.json();
  console.log("Notificación recibida:", body);

  // 2. Obtén el topic del evento
  const topic = body.type;

  // 3. Verifica que la solicitud sea de un webhook válido
  // Esta es la parte clave. Mercado Pago utiliza un token
  // que debes validar. Aquí es donde usarás el token
  // de autenticación que configuraste en tu panel de Mercado Pago.
  // IMPORTANTE: NO uses un valor hardcodeado como este. Debes
  // obtenerlo de variables de entorno (process.env)
  const webhookSecret = "TU_SECRETO_DE_WEBHOOK";
  const receivedSecret = request.headers.get("x-auth-token"); // O el nombre del header que uses

  if (receivedSecret !== webhookSecret) {
    // Si el token no coincide, respondemos con 401 Unauthorized
    // Esto es lo que está pasando en tu caso.
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 4. Procesa la notificación según el tipo de evento
  if (topic === "payment") {
    // Aquí es donde obtendrías los datos del pago y actualizarías tu base de datos
    const paymentId = body.data.id;
    console.log(`Pago actualizado. ID: ${paymentId}`);
    // Ejemplo: buscar el pago en tu base de datos y actualizar su estado.
  }

  // 5. Respondemos con un estado 200 OK para confirmar que recibimos la notificación.
  return NextResponse.json({ message: "Webhook recibido" }, { status: 200 });
}

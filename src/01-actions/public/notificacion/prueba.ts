"use server";
export async function pruebFuncion(data: any) {
  console.log(data);

  return new Response("Notificación de prueba desde el backend");
}

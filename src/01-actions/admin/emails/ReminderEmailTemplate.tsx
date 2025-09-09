import React from "react";
interface ReminderEmailProps {
  firstName: string;
  empresa: string;
  diasFaltantes: number; // 0 = hoy
  linkPago: string;
}

export function ReminderEmailTemplate({
  firstName,
  empresa,
  diasFaltantes,
  linkPago,
}: ReminderEmailProps) {
  const mensaje =
    diasFaltantes === 0
      ? "Tu pago vence hoy. Por favor, realiza el pago para evitar inconvenientes."
      : `Tu pago vence en ${diasFaltantes} días. Te recomendamos gestionarlo a tiempo.`;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h2>Hola {firstName},</h2>
      <p>
        Desde <b>{empresa}</b> te recordamos que {mensaje}
      </p>
      <p>
        Puedes ver los detalles y pagar aquí: <a href={linkPago}>Ir al pago</a>
      </p>
      <p>¡Gracias por confiar en nosotros!</p>
    </div>
  );
}

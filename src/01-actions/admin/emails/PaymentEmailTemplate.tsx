import React from "react";
const main = {
  backgroundColor: "#f0f2f5", // Un gris muy claro para un fondo suave
  fontFamily: "Helvetica, Arial, sans-serif",
  padding: "40px 0", // Añade padding para centrar el contenido
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e1e4e8", // Un borde más sutil
  borderRadius: "12px", // Bordes más redondeados para un look moderno
  margin: "0 auto",
  padding: "30px", // Más padding para que el contenido respire
  maxWidth: "600px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)", // Sombra más prominente y profesional
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "25px",
  borderBottom: "1px solid #e1e4e8",
};

const logo = {
  width: "180px", // Logo un poco más grande
};

const content = {
  padding: "25px 0",
  color: "#333333", // Un color de texto más oscuro para mejor legibilidad
  lineHeight: "1.8", // Mayor interlineado para facilitar la lectura
  fontSize: "17px", // Un tamaño de fuente ligeramente más grande
};

// Estilos condicionales para el mensaje de estado
const statusApproved = {
  backgroundColor: "#e8f5e9", // Verde claro para el éxito
  color: "#2e7d32", // Verde oscuro para el texto
  padding: "10px 15px",
  borderRadius: "8px",
  textAlign: "center" as const,
  fontWeight: "bold" as const,
  fontSize: "18px",
};

const statusRejected = {
  backgroundColor: "#ffebee", // Rojo claro para el rechazo
  color: "#c62828", // Rojo oscuro para el texto
  padding: "10px 15px",
  borderRadius: "8px",
  textAlign: "center" as const,
  fontWeight: "bold" as const,
  fontSize: "18px",
};

const button = {
  backgroundColor: "#2e7d32", // Usa un verde para "pagado" para transmitir éxito
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "15px 25px",
  display: "block",
  width: "250px", // Un poco más ancho
  margin: "30px auto 20px auto", // Espacio para que el botón respire
  transition: "background-color 0.3s ease", // Para un efecto de hover (aunque no se ve en todos los clientes)
};

const footer = {
  textAlign: "center" as const,
  paddingTop: "25px",
  marginTop: "25px",
  borderTop: "1px solid #e1e4e8",
  color: "#999999",
  fontSize: "13px", // Tamaño de fuente ligeramente más grande
};

interface EmailTemplateProps {
  firstName: string;
  paymentLink: string;
  newStatus: string;
  motivo: string | null;
}

export function PaymentEmailTemplate({
  firstName,
  paymentLink,
  newStatus,
  motivo,
}: EmailTemplateProps) {
  // Determina el estilo de la caja de estado
  const statusStyle =
    newStatus === "Aprobado" ? statusApproved : statusRejected;

  // Usa un mensaje más alegre para el pago aprobado
  const isApproved = newStatus === "Aprobado";
  const statusText = isApproved
    ? "¡Tu pago ha sido Aprobado!"
    : `Tu pago ha sido ${newStatus}.`;

  return (
    <div style={main}>
      <div style={container}>
        <div style={header}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cuotafacil.com.ar/Logo.png"
            alt="Cuota Fácil Logo"
            style={logo}
          />
        </div>
        <div style={content}>
          <p>Hola {firstName},</p>
          <p>
            Te escribimos desde <b>Cuota Fácil</b> para informarte el estado de
            tu transacción.
          </p>
          <div style={statusStyle}>{statusText}</div>
          {newStatus === "Rechazado" && motivo && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontWeight: "bold", color: "#c62828" }}>
                Motivo del rechazo:
              </p>
              <p>{motivo}</p>
            </div>
          )}
          <a href={paymentLink} style={button}>
            Ver detalles del pago
          </a>
        </div>
        <div style={footer}>
          <p>Si tienes alguna duda, no dudes en contactarnos.</p>
          <p>¡Gracias por confiar en Cuota Fácil!</p>
        </div>
      </div>
    </div>
  );
}

import React, { JSX } from "react";

interface PasswordResetEmailTemplateProps {
  nombre: string;
  resetLink: string;
}

export function PasswordResetEmailTemplate({
  nombre,
  resetLink,
}: PasswordResetEmailTemplateProps): JSX.Element {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f6f6f6",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "8px",
        }}
      >
        <h2>Recuperación de contraseña</h2>

        <p>Hola {nombre},</p>

        <p>
          Recibimos una solicitud para restablecer tu contraseña en
          <strong> CuotaFácil</strong>.
        </p>

        <p>Haz clic en el botón para crear una nueva contraseña.</p>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={resetLink}
            style={{
              backgroundColor: "#7c3aed",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Restablecer contraseña
          </a>
        </div>

        <p style={{ fontSize: "14px", color: "#555" }}>
          Este enlace expirará en 1 hora.
        </p>

        <p style={{ fontSize: "14px", color: "#555" }}>
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
      </div>
    </div>
  );
}

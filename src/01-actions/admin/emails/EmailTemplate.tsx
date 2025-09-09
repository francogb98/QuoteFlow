import Image from "next/image";
import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  dueDate: string;
  daysUntilDue: number;
  paymentLink: string;
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "20px",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "20px",
  borderBottom: "1px solid #eeeeee",
};

const logo = {
  width: "150px",
};

const content = {
  padding: "20px 0",
  color: "#525252",
  lineHeight: "1.6",
  fontSize: "16px",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 20px",
  display: "block",
  width: "200px",
  margin: "20px auto",
};

const footer = {
  textAlign: "center" as const,
  paddingTop: "20px",
  marginTop: "20px",
  borderTop: "1px solid #eeeeee",
  color: "#999999",
  fontSize: "12px",
};

export function EmailTemplate({
  firstName,
  dueDate,
  daysUntilDue,
  paymentLink,
}: EmailTemplateProps) {
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
          <p>
            ¡Hola, <b>{firstName}</b>!
          </p>
          <p>
            Te escribimos desde <b>Cuota Fácil</b> para recordarte que tu cuota
            mensual vence en <b>{daysUntilDue} días</b>, el <b>{dueDate}</b>.
          </p>
          <p>
            Para evitar recargos o interrupciones en tu servicio, te
            recomendamos realizar el pago antes de la fecha de vencimiento.
          </p>
          <a href={paymentLink} style={button}>
            Pagar ahora
          </a>
          <p>
            Si ya realizaste el pago, por favor ignora este correo. ¡Gracias!
          </p>
        </div>
        <div style={footer}>
          <p>
            Este es un correo automático, por favor no respondas a esta
            dirección.
          </p>
        </div>
      </div>
    </div>
  );
}

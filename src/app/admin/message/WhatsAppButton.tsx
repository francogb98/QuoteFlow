"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface WhatsAppButtonProps {
  to?: string;
  message?: string;
}

export const WhatsAppButton = ({
  to = "+5493855735888",
}: WhatsAppButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState("");

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setIsLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setResponseMessage(data.message || "Mensaje enviado exitosamente");
        console.log("Mensaje enviado:", data);
      } else {
        setStatus("error");
        setResponseMessage(data.error || "Error al enviar el mensaje");
        console.error("Error:", data);
      }
    } catch (error) {
      setStatus("error");
      setResponseMessage("Error de conexión");
      console.error("Error de conexión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          ¡Enviado!
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Reintentar
        </>
      );
    }

    return (
      <>
        <MessageSquare className="mr-2 h-4 w-4" />
        Enviar WhatsApp
      </>
    );
  };

  const getButtonVariant = () => {
    if (status === "success") return "default";
    if (status === "error") return "destructive";
    return "default";
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="message">Escribe tu mensaje</label>
        <input
          type="text"
          placeholder="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <Button
        onClick={sendMessage}
        disabled={isLoading}
        variant={getButtonVariant()}
        className="min-w-[150px]"
      >
        {getButtonContent()}
      </Button>

      {responseMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            status === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {responseMessage}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>Enviando a: {to}</p>
        <p>Mensaje: "{message}"</p>
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TestWhatsAppCard() {
  const [phone, setPhone] = useState("");
  const [template, setTemplate] = useState("vencido");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleTest() {
    if (!phone.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone.trim(), template }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          `Template "${data.template}" enviado (SID: ${data.sid})`
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Error desconocido");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión");
    }
  }

  return (
    <Card
      className={
        status === "success"
          ? "border-emerald-200 bg-emerald-50"
          : status === "error"
            ? "border-red-200 bg-red-50"
            : "border-slate-200 shadow-sm"
      }
    >
      <CardHeader>
        <CardTitle>Probar envío</CardTitle>
        <CardDescription>
          Enviá un mensaje de prueba con un template aprobado de WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="vencido">Template: Vencido</option>
            <option value="pendiente">Template: Pendiente</option>
          </select>
          <Input
            type="tel"
            placeholder="+54 9 11 1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTest()}
            className="max-w-xs"
          />
          <Button
            onClick={handleTest}
            disabled={!phone.trim() || status === "loading"}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {status === "loading" ? "Enviando..." : "Enviar prueba"}
          </Button>
        </div>
        {message && (
          <p
            className={`mt-3 text-sm ${status === "success" ? "text-emerald-700" : "text-red-700"}`}
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

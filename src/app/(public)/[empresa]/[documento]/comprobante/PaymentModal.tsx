"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Eye, Edit2, Check, X } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pago: any;
  usuarioId?: string;
  administradorId?: string;
  empresa: string;
  documento: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  pago,
  usuarioId,
  administradorId,
  empresa,
  documento,
}: PaymentModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const hasComprobante = pago.comprobante;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "cuotaFacil");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error("Error al subir imagen");
      }

      const response = await fetch("/api/payments/upload-comprobante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagoId: pago.id,
          comprobanteUrl: cloudinaryData.secure_url,
          previousComprobanteUrl: hasComprobante ? pago.comprobante : null,
          usuarioId,
          administradorId,
          empresa,
          documento,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar comprobante");
      }

      pago.comprobante = cloudinaryData.secure_url;
      onClose();
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleViewFull = () => {
    if (pago.comprobante) {
      setIsImageModalOpen(true);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
            resetModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {(pago.estado === "PENDIENTE" || pago.estado === "RECHAZADO") && (
              <DialogTitle className="flex items-center gap-2">
                {hasComprobante && !isEditing ? (
                  <>
                    <Eye className="h-5 w-5" />
                    Ver Comprobante
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    {hasComprobante
                      ? "Cambiar Comprobante"
                      : "Cargar Comprobante"}
                  </>
                )}
              </DialogTitle>
            )}
            <DialogDescription>
              {hasComprobante && !isEditing
                ? "Visualiza o edita tu comprobante de pago"
                : `Sube el comprobante de pago de $${pago.monto} para ${pago.descripcion}`}
            </DialogDescription>
            {pago.motivo && pago.estado === "RECHAZADO" && (
              <p className="text-sm text-muted-foreground">
                Motivo: <b>{pago.motivo}</b>
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {hasComprobante && !isEditing && (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/50 relative h-48">
                  <Image
                    src={
                      pago.comprobante ||
                      "/placeholder.svg?height=200&width=300&query=comprobante"
                    }
                    alt="Comprobante actual"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain" }}
                    className="rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewFull}
                    className="flex-1 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Completo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex-1 bg-transparent"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Cambiar
                  </Button>
                </div>
              </div>
            )}

            {(!hasComprobante || isEditing) && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="comprobante-upload"
                  />
                  <label
                    htmlFor="comprobante-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Haz clic para seleccionar una imagen
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG hasta 10MB
                    </span>
                  </label>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg p-4 bg-muted/50 relative h-48">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Vista previa"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "contain" }}
                      className="rounded"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancelar
              </Button>

              {selectedFile && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {hasComprobante ? "Actualizar" : "Subir"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative w-full max-w-2xl h-[80vh] max-h-full">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
              className="absolute top-4 right-4 z-[70] rounded-full bg-white/20 hover:bg-white/30 text-white"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
            <Image
              src={
                pago.comprobante ||
                "/placeholder.svg?height=600&width=800&query=comprobante ampliado"
              }
              alt="Comprobante de pago ampliado"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain" }}
              className="rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

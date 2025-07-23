"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { validatePromoCode } from "@/01-actions/auth/registration/04-validatePromoCode";

interface PromoCodeFieldProps {
  onValidCode: (codigo: string) => void;
  onInvalidCode: () => void;
  disabled?: boolean;
}

export const PromoCodeField = ({
  onValidCode,
  onInvalidCode,
  disabled = false,
}: PromoCodeFieldProps) => {
  const [codigo, setCodigo] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleValidate = async () => {
    if (!codigo.trim()) {
      setValidationResult({
        success: false,
        error: "Ingresa un código promocional",
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validatePromoCode(codigo);
      setValidationResult(result);

      if (result.success) {
        onValidCode(codigo);
      } else {
        onInvalidCode();
      }
    } catch (error) {
      setValidationResult({
        success: false,
        error: "Error al validar el código",
      });
      onInvalidCode();
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setCodigo(value);
    setValidationResult(null);
    onInvalidCode();
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="promo-code" className="text-sm font-medium text-gray-700">
        Código Promocional (Opcional)
      </Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          type="text"
          placeholder="Ej: PRUEBA2024"
          value={codigo}
          onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
          disabled={disabled || isValidating}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={disabled || isValidating || !codigo.trim()}
          className="px-4 bg-transparent"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Validar"
          )}
        </Button>
      </div>

      {validationResult && (
        <div
          className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
            validationResult.success
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {validationResult.success ? (
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span>
            {validationResult.success
              ? validationResult.message
              : validationResult.error}
          </span>
        </div>
      )}
    </div>
  );
};

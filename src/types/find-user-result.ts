export interface PaymentAnalysis {
  needsUpdate: boolean;
  message: string;
  oldMonto?: number;
  newMonto?: number;
  currentMonto?: number;
  paymentId?: string;
  isNewPayment?: boolean;
}

export interface FindUserResult {
  ok: boolean;
  message?: string;
  id?: string;
  administradorId?: string;
  usuario?: any;
  configuracionTarifa?: any;
  empresa?: {
    id: string;
    nombre: string;
    planTipo: string;
    estadoPago: string;
    frecuenciaPago: string;
    fechaUltimoPago: Date | null;
    fechaProximoVencimiento: Date | null;
    estaActiva: boolean;
  };
  paymentAnalysis?: PaymentAnalysis;
}

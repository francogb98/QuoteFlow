"use client";

import { useAppStore } from "@/lib/store/useAppStore";

/**
 * Hook para acceder a las tarifas del store global
 * Mucho más eficiente que hacer queries constantemente
 */
export function useTarifas() {
  const tarifa = useAppStore((state) => state.tarifa);

  return {
    tarifa,
    rangos: tarifa?.rangos || [],
    dinamicas: tarifa?.dinamicas || [],
    tipoConfiguracion: tarifa?.tipoConfiguracion || null,
  };
}

/**
 * Hook para acceder a los datos del admin desde el store
 */
export function useAdminData() {
  const admin = useAppStore((state) => state.admin);

  return admin;
}

/**
 * Hook para acceder a toda la información del store
 */
export function useAppData() {
  const admin = useAppStore((state) => state.admin);
  const tarifa = useAppStore((state) => state.tarifa);
  const isInitialized = useAppStore((state) => state.isInitialized);

  return {
    admin,
    tarifa,
    isInitialized,
  };
}

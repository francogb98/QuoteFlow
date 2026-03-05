"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { getAppData } from "@/01-actions/admin/home/getAppData";

/**
 * Componente para inicializar el store global con los datos del admin
 * Debe ser usado en el layout principal después de verificar que hay sesión
 */
export function AppStoreInitializer() {
  const { isInitialized, setAdmin, setTarifa, setIsInitialized } =
    useAppStore();

  const initializeStore = useCallback(async () => {
    try {
      const response = await getAppData();

      if (response.ok && response.data) {
        setAdmin(response.data.admin);
        if (response.data.tarifa) {
          //@ts-ignore
          setTarifa(response.data.tarifa);
        }
      }
    } catch (error) {
      console.error("Error en initializeStore:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [setAdmin, setTarifa, setIsInitialized]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    initializeStore();
  }, []);

  return null; // Este componente no renderiza nada
}

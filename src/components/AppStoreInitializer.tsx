"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { getAppData } from "@/actions/admin/home/getAppData";

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
          setTarifa({
            id: response.data.tarifa.id,
            tipoConfiguracion: response.data.tarifa.tipoConfiguracion,
            fechaCreacion: response.data.tarifa.fechaCreacion instanceof Date
              ? response.data.tarifa.fechaCreacion.toISOString()
              : String(response.data.tarifa.fechaCreacion),
            estaActiva: response.data.tarifa.estaActiva,
            rangos: response.data.tarifa.rangos ?? [],
            dinamicas: response.data.tarifa.dinamicas ?? [],
          });
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

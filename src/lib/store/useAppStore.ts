import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Rango {
  id: string;
  nombre: string;
  diaInicio: number;
  diaFin: number;
  monto: number;
  configuracionTarifaId: string;
}

interface Dinamica {
  id: string;
  nombre: string;
  montoBase: number;
  diasGracia: number;
  montoRecargo: number;
  configuracionTarifaId: string;
}

interface ConfiguracionTarifa {
  id: string;
  tipoConfiguracion: string;
  fechaCreacion: string;
  estaActiva: boolean;
  dinamicas: Dinamica[];
  rangos: Rango[];
  montoDefault?: number | null;
}

interface AdminData {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  empresa: {
    nombre: string;
  };
}

interface AppState {
  // Datos de Admin
  admin: AdminData | null;
  setAdmin: (admin: AdminData) => void;

  // Tarifas
  tarifa: ConfiguracionTarifa | null;
  setTarifa: (tarifa: ConfiguracionTarifa) => void;

  // Estado de carga
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;

  // Limpiar store (logout)
  clearStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      admin: null,
      setAdmin: (admin: AdminData) => set({ admin }),

      tarifa: null,
      setTarifa: (tarifa: ConfiguracionTarifa) => set({ tarifa }),

      isInitialized: false,
      setIsInitialized: (value: boolean) => set({ isInitialized: value }),

      clearStore: () =>
        set({
          admin: null,
          tarifa: null,
          isInitialized: false,
        }),
    }),
    {
      name: "app-store", // nombre de la key en localStorage
      partialize: (state) => ({
        // Solo persistimos lo que sea seguro
        admin: state.admin,
        tarifa: state.tarifa,
        isInitialized: state.isInitialized,
      }),
    },
  ),
);

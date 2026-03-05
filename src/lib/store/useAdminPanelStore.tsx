import { create } from "zustand";

type PanelType = "USER" | null;

interface AdminPanelState {
  panel: PanelType;
  entityId: string | null;

  openUser: (userId: string) => void;
  close: () => void;
}

export const useAdminPanelStore = create<AdminPanelState>((set) => ({
  panel: null,
  entityId: null,

  openUser: (userId) =>
    set({
      panel: "USER",
      entityId: userId,
    }),

  close: () =>
    set({
      panel: null,
      entityId: null,
    }),
}));

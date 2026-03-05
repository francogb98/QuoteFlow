"use client";

import { GlobalUserSidePanel } from "@/components/admin/GlobalUserSidePanel";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";

export function AdminPanelManager() {
  const { panel, entityId, close } = useAdminPanelStore();

  console.log({ panel, entityId, close });

  if (panel === "USER" && entityId) {
    return <GlobalUserSidePanel userId={entityId} onClose={close} />;
  }

  return null;
}

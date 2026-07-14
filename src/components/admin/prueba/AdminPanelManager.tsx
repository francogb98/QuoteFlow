"use client";

import { GlobalUserSidePanel } from "@/components/admin/GlobalUserSidePanel";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";

interface Props {
  user: any;
}

export function AdminPanelManager({ user }: Props) {
  const { panel, entityId, close } = useAdminPanelStore();

  if (!panel) return null;

  return (
    <>
      {panel === "USER" && entityId && (
        <GlobalUserSidePanel userId={entityId} onClose={close} />
      )}
    </>
  );
}

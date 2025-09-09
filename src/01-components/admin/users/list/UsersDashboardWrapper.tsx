// This is a new Client Component
"use client";

import { useEffect } from "react";
import { NuevaTablaDeUsuarios } from "./NuevaTablaDeUsuarios";

interface UserDashboardWrapperProps {
  profesorId?: string | null;
  session: any; // Use a proper type for session
}

export const UserDashboardWrapper = ({
  profesorId,
  session,
}: UserDashboardWrapperProps) => {
  useEffect(() => {}, [profesorId, session]);

  if (!session?.user?.id) {
    return null;
  }

  return <NuevaTablaDeUsuarios profesorId={profesorId} />;
};

// src/lib/utils/action-errors.ts

export interface ActionResponse<T = undefined> {
  success?: boolean;
  data?: T;
  error?: string;
  ok?: boolean;
  message?: string; // For success messages or general info
}

export function handleActionError(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred."
): ActionResponse<any> {
  console.error("Action Error:", error);

  if (error instanceof Error) {
    if (error.message.includes("Unique constraint failed")) {
      return {
        ok: false,
        error: "Ya existe un registro con este identificador único.",
      };
    }
    return { ok: false, error: error.message || defaultMessage };
  }

  return { ok: false, error: defaultMessage };
}

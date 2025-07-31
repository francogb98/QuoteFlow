// Cron para procesar pagos diarios
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (LOG_LEVEL === "debug" && !IS_PRODUCTION) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (["debug", "info"].includes(LOG_LEVEL)) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (["debug", "info", "warn"].includes(LOG_LEVEL)) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
};

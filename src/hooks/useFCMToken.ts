import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase-client";
import { toast } from "sonner";

interface UseFCMOptions {
  usuarioId: string;
}

interface UseFCMResult {
  permission: NotificationPermission | null;
  token: string | null;
  tokenSaved: boolean;
  loading: boolean;
  firebaseAvailable: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * Custom hook that obtains an FCM token, saves it to the server and
 * exposes permission/loading state.
 */
export function useFCMToken({ usuarioId }: UseFCMOptions): UseFCMResult {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseAvailable, setFirebaseAvailable] = useState(true);

  // send token to backend
  const saveTokenToDatabase = async (fcmToken: string) => {
    try {
      const res = await fetch("/api/fcm/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, token: fcmToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "unknown");
      }

      console.log("token saved on server");
    } catch (err) {
      console.error("Error saving token:", err);
      throw err;
    }
  };

  const obtainToken = async (): Promise<boolean> => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        setFirebaseAvailable(false);
        return false;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) {
        console.error("no token returned from firebase");
        return false;
      }

      setToken(fcmToken);
      await saveTokenToDatabase(fcmToken);
      setTokenSaved(true);
      return true;
    } catch (error) {
      console.error("obtainToken error", error);
      return false;
    }
  };

  // request permission from user
  const requestPermission = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        await obtainToken();
        toast.success("Notificaciones activadas");
      } else {
        toast.error("Permiso denegado");
      }
    } catch (err) {
      console.error("requestPermission error", err);
      toast.error("Error solicitando permiso");
    } finally {
      setLoading(false);
    }
  };

  // on mount check current state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    setPermission(Notification.permission);

    obtainToken();
  }, []);

  return {
    permission,
    token,
    tokenSaved,
    loading,
    firebaseAvailable,
    requestPermission,
  };
}

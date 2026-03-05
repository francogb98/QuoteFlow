"use client";

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAeDI84uxSjcEZaYHiSlUtbUieJfmOZzUU",
  authDomain: "cuota-facil-e5405.firebaseapp.com",
  projectId: "cuota-facil-e5405",
  messagingSenderId: "246742732487",
  appId: "1:246742732487:web:1d6e639f9f5f4677e478e2",
};

let app: any = null;
try {
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  }
} catch (err) {
  console.error("Error inicializando Firebase:", err);
}

export const getFirebaseMessaging = async () => {
  if (!app || !firebaseConfig.projectId) {
    console.warn("⚠️ Firebase no está configurado. Mensajería desactivada.");
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    console.warn("⚠️ Mensajería no soportada en este navegador.");
    return null;
  }

  try {
    return getMessaging(app);
  } catch (err) {
    console.error("Error obteniendo Messaging:", err);
    return null;
  }
};

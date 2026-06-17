"use client";

import { ArrowLeft } from "lucide-react";

export const ButtonBack = () => {
  //crear un boton para volver a la pagina anterior
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105"
    >
      <ArrowLeft className="mr-2 w-5 h-5" />
      Volver atrás
    </button>
  );
};

"use client";
import { IoAdd } from "react-icons/io5";

function NotAllowed() {
  return (
    <button
      onClick={() =>
        alert("Antes de crear un usuario, debés configurar tus tarifas.")
      }
      className="bg-gray-500 p-2 text-white w-[200px] rounded shadow-md flex items-center justify-center gap-2 mt-4 mx-auto cursor-pointer"
    >
      <IoAdd size={20} />
      <span>Agregar Usuario</span>
    </button>
  );
}

export default NotAllowed;

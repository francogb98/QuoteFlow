import { Store } from "lucide-react";
import { RegisterForm } from "./ui/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crea Tu Empresa",
  description: "Crea tu cuenta y elige el plan perfecto para tu negocio",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 md:p-8 border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Registrar Empresa
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta y elige el plan perfecto para tu negocio
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}

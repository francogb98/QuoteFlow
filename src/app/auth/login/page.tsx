import { LoginForm } from "./ui/LoginForm";
import { LogIn } from "lucide-react"; // Importa el ícono LogIn de lucide-react

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {/* Reemplazado el SVG inline con el componente LogIn de lucide-react */}
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600">Accede a tu cuenta para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

import { Navbar } from "@/components";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      <Navbar />
      {children}

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

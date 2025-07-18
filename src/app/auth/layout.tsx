import { Navbar } from "@/components";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] px-4 py-8">
        {children}
      </div>
    </div>
  );
}

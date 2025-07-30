import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Providers";

const logoIconSVG = `
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5CF6" />
        <stop offset="50%" stop-color="#A855F7" />
        <stop offset="100%" stop-color="#10B981" />
      </linearGradient>
    </defs>
    <circle cx="30" cy="30" r="28" fill="url(#primaryGradient)" />
    <path d="M15 20 Q30 15 45 20 Q30 25 15 20" stroke="white" stroke-width="2.5" fill="none" opacity="0.9" />
    <path d="M15 30 Q30 25 45 30 Q30 35 15 30" stroke="white" stroke-width="2.5" fill="none" opacity="0.7" />
    <path d="M15 40 Q30 35 45 40 Q30 45 15 40" stroke="white" stroke-width="2.5" fill="none" opacity="0.5" />
    <circle cx="30" cy="30" r="8" fill="white" />
    <text x="30" y="36" text-anchor="middle" fill="#8B5CF6" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">Q</text>
  </svg>
`;
const encodedSVG = encodeURIComponent(logoIconSVG.trim().replace(/\s+/g, " "));
const dataURL = `data:image/svg+xml,${encodedSVG}`;

export const metadata: Metadata = {
  title: "CuotaFácil - Gestión de Pagos y Cuotas Online",
  description:
    "Plataforma líder en Argentina para gestionar pagos y cuotas de forma fácil y segura. Accede a tu cuenta y administra tus finanzas.",
  keywords: "cuotas, pagos, finanzas, argentina, gestión financiera",
  authors: [{ name: "CuotaFácil" }],
  creator: "CuotaFácil",
  publisher: "CuotaFácil",

  // Configuración para motores de búsqueda
  robots: {
    index: true,
    follow: true,
  },

  // Open Graph para compartir en redes sociales
  openGraph: {
    title: "CuotaFácil - Gestión de Pagos y Cuotas",
    description: "Plataforma líder en Argentina para gestionar pagos y cuotas",
    url: "https://cuotafacil.com.ar",
    siteName: "CuotaFácil",
    locale: "es_AR",
    type: "website",
    // Puedes agregar una imagen cuando la tengas
    // images: [
    //   {
    //     url: "https://cuotafacil.com.ar/og-image.jpg",
    //     width: 1200,
    //     height: 630,
    //     alt: "CuotaFácil",
    //   },
    // ],
  },

  // Mantén tu configuración de iconos actual
  icons: {
    icon: dataURL,
  },

  // Configuración regional
  alternates: {
    canonical: "https://cuotafacil.com.ar",
    languages: {
      "es-AR": "https://cuotafacil.com.ar",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

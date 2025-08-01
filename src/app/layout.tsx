import { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Providers";
export const metadata: Metadata = {
  // Aquí se agrega la propiedad metadataBase para resolver las URLs relativas
  metadataBase: new URL("https://www.cuotafacil.com.ar"),
  title: "CuotaFacil | Simplifica el cobro de cuotas para tus alumnos",
  description:
    "La plataforma definitiva para gestionar cobros de cuotas. Automatiza pagos, aplica recargos y organiza la información de tus alumnos de forma sencilla. Ideal para escuelas, academias y negocios.",
  keywords: [
    "cuotas",
    "alumnos",
    "gestión de cobros",
    "facturación",
    "escuela",
    "academia",
    "pagos automáticos",
    "CuotaFacil",
  ],
  openGraph: {
    title: "CuotaFacil | Gestión de cuotas para alumnos",
    description:
      "Automatiza y simplifica el cobro de cuotas a tus alumnos. Con CuotaFacil, la administración de pagos nunca fue tan fácil y eficiente.",
    url: "https://www.cuotafacil.com.ar/Logo.png",
    siteName: "CuotaFacil",
    images: [
      {
        url: new URL("/Logo.png", "https://www.cuotafacil.com.ar").toString(), // URL absoluta
        width: 1200,
        height: 630,
        alt: "Logo de CuotaFacil",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  // La forma correcta de agregar el ícono es con la propiedad 'icons'
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/IconoOriginal.ico`, // La ruta es relativa a la carpeta `public`
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

import { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cuotafacil.com.ar"),
  title: "CuotaFacil",
  icons: {
    icon: "https://www.cuotafacil.com.ar/assets/IconoOriginal.ico",
  },
  openGraph: {
    title: "CuotaFacil | Gestión de cuotas para alumnos",
    description: "Automatiza y simplifica el cobro de cuotas...",
    url: "https://www.cuotafacil.com.ar",
    siteName: "CuotaFacil",
    images: [
      {
        url: "https://www.cuotafacil.com.ar/assets/Logo.png", // Cambia a URL absoluta
        width: 1200,
        height: 630,
        alt: "Logo de CuotaFacil",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://www.cuotafacil.com.ar/assets/Logo.png"],
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

import { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cuotafacil.com.ar"),
  title: "CuotaFacil",

  openGraph: {
    title: "CuotaFacil | Gestión de cuotas para alumnos",
    description: "Automatiza y simplifica el cobro de cuotas...",
    url: "https://www.cuotafacil.com.ar",
    siteName: "CuotaFacil",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

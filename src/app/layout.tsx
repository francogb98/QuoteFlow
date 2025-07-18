import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Providers";

export const metadata: Metadata = {
  title: "TrainPAY",
  description: "Aplicacion de pagos Online",
  icons: "/favicon.ico",
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

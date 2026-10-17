import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skilly LATAM - Plataforma de Servicios y Proyectos",
  description: "Conecta organizaciones con profesionales calificados.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

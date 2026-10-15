import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Victor Viera — Diseñador y desarrollador de productos digitales",
  description:
    "Portfolio de Victor Viera. Diseño y construyo productos digitales, sitios web y marcas para equipos y empresas que quieren resultados reales.",
  openGraph: {
    title: "Victor Viera — Diseñador y desarrollador de productos digitales",
    description:
      "Diseño y construyo productos digitales, sitios web y marcas para equipos y empresas que quieren resultados reales.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geist.variable} h-full bg-black antialiased`}
    >
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
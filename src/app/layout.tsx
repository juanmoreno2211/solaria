import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FloatingSun } from "@/components/FloatingSun";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "SolarIA — Descubre cuánto puedes ahorrar con energía solar";
const DESCRIPTION =
  "Sube tu recibo de luz y deja que nuestro agente con IA calcule cuánto puedes ahorrar en % y dinero con paneles solares, iluminación solar y refrigeración solar para tu casa, negocio o finca en Colombia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "SolarIA",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LoadingScreen />
        {children}
        <FloatingSun />
        <Analytics />
      </body>
    </html>
  );
}

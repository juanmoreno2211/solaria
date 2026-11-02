import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FloatingSun } from "@/components/FloatingSun";
import "./globals.css";

const display = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "SolarIA — ¿Le conviene la energía solar a tu negocio?";
const DESCRIPTION =
  "Calculadora para micronegocios en Colombia: con el recibo de luz de tu negocio, mira cuánto ahorrarías con paneles solares y en cuánto tiempo recuperas la inversión, y pide una cotización a un proveedor de tu región.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Piloto cerrado: muestra nombres de proveedores con datos sin confirmar.
  robots: { index: false },
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
    <html lang="es" className={`${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LoadingScreen />
        {children}
        <FloatingSun />
        <Analytics />
      </body>
    </html>
  );
}

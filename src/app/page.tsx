import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CalculatorSection } from "@/components/landing/calculator/CalculatorSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  // Sin llave de Gemini se oculta la opción de foto (se evalúa al compilar la página).
  const fotoDisponible = Boolean(process.env.GEMINI_API_KEY);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CalculatorSection fotoDisponible={fotoDisponible} />
        <HowItWorks fotoDisponible={fotoDisponible} />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

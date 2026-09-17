import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { Mission } from "@/components/landing/Mission";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Alternatives } from "@/components/landing/Alternatives";
import { SolarStats } from "@/components/landing/SolarStats";
import { BusinessBenefits } from "@/components/landing/BusinessBenefits";
import { TrustSection } from "@/components/landing/TrustSection";
import { CalculatorSection } from "@/components/landing/calculator/CalculatorSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Mission />
        <ProblemSolution />
        <HowItWorks />
        <Alternatives />
        <SolarStats />
        <BusinessBenefits />
        <TrustSection />
        <CalculatorSection />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

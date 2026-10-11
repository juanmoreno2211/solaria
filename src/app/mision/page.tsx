import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mission } from "@/components/landing/Mission";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { CTA } from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: "Nuestra misión — SolarIA",
};

export default function MisionPage() {
  return (
    <>
      <Navbar />
      <main>
        <Mission />
        <ProblemSolution />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

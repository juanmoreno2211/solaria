import Link from "next/link";
import { Home, Sun } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-ink-gradient py-28 sm:py-36">
        <Container className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sun-gradient text-ink-950 shadow-[0_12px_30px_-10px_rgba(245,158,11,0.6)]">
            <Sun className="h-8 w-8" strokeWidth={2.25} />
          </span>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-sun-300">
            Error 404
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl">
            Esta página se perdió como un rayo de sol en un día nublado
          </h1>
          <p className="mt-4 max-w-md text-balance text-white/60">
            La página que buscas no existe o se movió de lugar. Volvamos a un
            sitio con mejor cobertura solar.
          </p>
          <Link href="/" className="mt-8">
            <Button size="lg">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}

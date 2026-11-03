import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { FormularioIngreso } from "./FormularioIngreso";
import { normalizarCodigo } from "@/lib/invitaciones/codigo";

export const metadata: Metadata = {
  title: "Ingresar — SolarIA",
};

export default async function IngresarPage({ searchParams }: PageProps<"/ingresar">) {
  const { siguiente, error, invitacion, modo } = await searchParams;
  // El registro directo sigue sin código; con ?invitacion= la cuenta se atribuye al socio.
  const codigo = normalizarCodigo(invitacion);
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream-50 py-16">
        <Container className="flex flex-col items-center">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink-950">Tu cuenta en SolarIA</h1>
          <p className="mb-8 text-center text-sm text-ink-950/60">
            Guarda los datos de tu negocio para no volver a escribirlos.
          </p>
          <FormularioIngreso
            siguiente={typeof siguiente === "string" ? siguiente : undefined}
            error={typeof error === "string" ? error : undefined}
            invitacion={codigo ?? undefined}
            modoInicial={codigo || modo === "registro" ? "registrarse" : "ingresar"}
          />
        </Container>
      </main>
    </>
  );
}

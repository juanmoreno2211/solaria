import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, FlaskConical, ReceiptText, Target } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { normalizarCodigo } from "@/lib/invitaciones/codigo";
import { rutaRegistroConInvitacion } from "@/lib/invitaciones/enlace";
import { RegistrarApertura } from "./RegistrarApertura";

export const metadata: Metadata = {
  title: "Te invitaron a SolarIA Control",
  description: "Mira en qué gasta más energía tu negocio y dónde ahorrar.",
  robots: { index: false, follow: false },
};

const QUE_ES = [
  { Icono: ReceiptText, texto: "Guarda los recibos de luz de tu negocio y mira cómo cambia tu consumo mes a mes." },
  { Icono: ChartColumn, texto: "Descubre qué aparatos pesan más en tu recibo y cuánto te cuesta cada uno." },
  { Icono: Target, texto: "Recibe metas con el ahorro estimado en pesos, calculadas con tus datos." },
  { Icono: FlaskConical, texto: "Simula un aparato nuevo antes de comprarlo." },
];

/**
 * Página del invitado. No muestra nada de quien invita: ni nombre, ni negocio,
 * ni correo. Solo valida que el enlace exista.
 */
export default async function InvitacionPage({ params }: PageProps<"/i/[codigo]">) {
  const { codigo: crudo } = await params;
  const codigo = normalizarCodigo(crudo);

  const supabase = await createClient();
  const [{ data: valida }, { data: sesion }] = await Promise.all([
    codigo ? supabase.rpc("invitacion_valida", { p_codigo: codigo }) : Promise.resolve({ data: false }),
    supabase.auth.getClaims(),
  ]);
  const conSesion = Boolean(sesion?.claims);
  const enlaceValido = Boolean(codigo && valida === true);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream-50 py-12 sm:py-16">
        <Container className="max-w-2xl">
          {enlaceValido && <RegistrarApertura codigo={codigo!} />}
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-600">SolarIA Control</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-[-0.02em] text-ink-950 sm:text-4xl">
            {enlaceValido ? "Un socio te invita a ver en qué gasta más energía tu negocio" : "Mira en qué gasta más energía tu negocio"}
          </h1>
          {!enlaceValido && (
            <p className="mt-3 text-sm text-ink-950/75">Este enlace de invitación no es válido, pero igual puedes crear tu cuenta.</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-ink-950/80">
            SolarIA Control es gratis y sirve para cualquier micronegocio en Colombia, le convenga o no la energía solar.
          </p>

          <ul className="mt-8 space-y-4">
            {QUE_ES.map(({ Icono, texto }) => (
              <li key={texto} className="flex gap-3 text-sm leading-relaxed text-ink-950/85 sm:text-base">
                <Icono className="mt-0.5 h-5 w-5 shrink-0 text-sun-600" aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {conSesion ? (
              <Link href="/mi-negocio" className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-950 px-6 text-sm font-semibold text-white hover:bg-ink-800">
                Ir a mi negocio
              </Link>
            ) : (
              <Link
                href={enlaceValido ? rutaRegistroConInvitacion(codigo!) : "/ingresar?modo=registro&siguiente=%2Fmi-negocio"}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-950 px-6 text-sm font-semibold text-white hover:bg-ink-800"
              >
                Crear mi cuenta
              </Link>
            )}
            <Link href="/#calculadora" className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink-950/20 px-6 text-sm font-semibold text-ink-950 hover:border-ink-950/40">
              Primero calcular mi ahorro solar
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-950/65">Guardamos solo tu consumo y tu valor, no la foto de tu recibo. Quien te invitó no ve tus datos.</p>
        </Container>
      </main>
    </>
  );
}

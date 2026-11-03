"use client";

import { useEffect, useState } from "react";
import { Store, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";
import Link from "next/link";

const LINKS = [
  { href: "/#calculadora", label: "Calculadora" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#preguntas", label: "Preguntas frecuentes" },
  { href: "/mision", label: "Nuestra misión" },
];

/** Nombre que muestra el botón de la cuenta: el del negocio, o "Mi negocio" si aún no lo escribió. */
function useCuenta(cuenta?: { nombre: string | null }) {
  const [detectada, setDetectada] = useState<{ nombre: string | null } | null>(null);

  useEffect(() => {
    // La página ya sabe quién es (p. ej. Mi negocio): no hay nada que consultar.
    if (cuenta) return;
    // Sin cookie de sesión no se carga Supabase: la landing sigue liviana.
    if (!document.cookie.includes("-auth-token")) return;
    let vigente = true;
    import("@/lib/supabase/client")
      .then(async ({ createClient }) => {
        const supabase = createClient();
        // Solo decide el texto del botón; los datos los protege la RLS en el servidor.
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        const { data: negocio } = await supabase.from("negocios").select("nombre").maybeSingle();
        if (vigente) setDetectada({ nombre: negocio?.nombre ?? null });
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [cuenta]);

  return cuenta ?? detectada;
}

export function Navbar({ cuenta }: { cuenta?: { nombre: string | null } } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const sesion = useCuenta(cuenta);
  const etiquetaCuenta = sesion?.nombre?.trim() || "Mi negocio";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream-50/90 backdrop-blur-md border-b border-ink-950/8"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between sm:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2.5 text-ink-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sun-500 text-white">
            <Sun className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Solar<span className="text-sun-600">IA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[0.9rem] text-ink-950/70 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors hover:text-ink-950 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-sun-500 after:transition-all after:duration-200 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Siempre visible, también en el celular; sin sesión lleva a /ingresar. */}
        <Link
          href="/mi-negocio"
          aria-label={sesion ? `Tu cuenta: ${etiquetaCuenta}` : undefined}
          title={sesion ? etiquetaCuenta : undefined}
          className={clsx(
            "inline-flex min-h-11 max-w-[11rem] items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors sm:max-w-[16rem]",
            sesion
              ? "bg-ink-950 text-white hover:bg-ink-800"
              : "border border-ink-950/20 text-ink-950 hover:border-ink-950/40 hover:bg-ink-950/[0.03]"
          )}
        >
          {sesion && <Store className="h-4 w-4 shrink-0" aria-hidden="true" />}
          <span className="truncate">{etiquetaCuenta}</span>
        </Link>
      </Container>
    </header>
  );
}

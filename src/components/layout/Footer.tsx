import { Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 py-16 text-white/60">
      <Container>
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sun-500">
                <Sun className="h-4 w-4 text-white" strokeWidth={2.25} />
              </span>
              <span className="text-lg tracking-tight">
                Solar<span className="text-sun-400">IA</span>
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/55">
              Ayudamos a los micronegocios en Colombia a evaluar si la energía
              solar conviene para su operación. A partir de su recibo de luz,
              estimamos su potencial de ahorro y los conectamos con proveedores
              de su región.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                Producto
              </h4>

              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link
                    href="/#calculadora"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    Calculadora de ahorro
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#como-funciona"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    Cómo funciona
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                Empresa
              </h4>

              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link
                    href="/#preguntas"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    Preguntas frecuentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mision"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    Nuestra misión
                  </Link>
                </li>
                <li>
                  <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-2">

          <div className="mt-6 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SolarIA. Todos los derechos
              reservados.
            </p>

            <p className="text-white/40">
              Hecho en Colombia para los negocios que mueven el país.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
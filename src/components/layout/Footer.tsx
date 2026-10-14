import { Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 py-14 text-white/60">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sun-500">
                <Sun className="h-4 w-4 text-white" strokeWidth={2.25} />
              </span>
              <span className="text-lg tracking-tight">
                Solar<span className="text-sun-400">IA</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Una calculadora para micronegocios en Colombia: con tu recibo de
              luz te mostramos si te conviene instalar paneles solares y, si es
              así, te conectamos con un proveedor para que te cotice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Producto</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link href="/#calculadora" className="hover:text-white">Calculadora</Link></li>
                <li><Link href="/#como-funciona" className="hover:text-white">Cómo funciona</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Empresa</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link href="/#preguntas" className="hover:text-white">Preguntas frecuentes</Link></li>
                <li><Link href="/mision" className="hover:text-white">Nuestra misión</Link></li>
                <li>
                  <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Escríbenos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SolarIA. Todos los derechos reservados.</p>
          <p className="max-w-xl text-white/40">
            Las cifras de ahorro, inversión y retorno son estimaciones de
            referencia calculadas con datos del mercado colombiano y la
            información que proporcionas. Los valores reales pueden variar
            según cotización, ubicación y proveedor. No incluyen baterías.
          </p>
        </div>
      </Container>
    </footer>
  );
}

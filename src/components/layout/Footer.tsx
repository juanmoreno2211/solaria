import { Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";

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
              El asesor solar con inteligencia artificial que lee tu recibo de
              luz y te muestra, en minutos, cuánto puedes ahorrar con energía
              solar en Colombia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Producto</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#como-funciona" className="hover:text-white">Cómo funciona</a></li>
                <li><a href="#alternativas" className="hover:text-white">Alternativas solares</a></li>
                <li><a href="#calculadora" className="hover:text-white">Calculadora IA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Empresa</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#preguntas" className="hover:text-white">Preguntas frecuentes</a></li>
                <li>
                  <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Habla con un asesor
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
            según cotización, ubicación y proveedor.
          </p>
        </div>
      </Container>
    </footer>
  );
}

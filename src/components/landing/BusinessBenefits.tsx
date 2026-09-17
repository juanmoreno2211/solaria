import { Award, Receipt, ShieldCheck, TrendingDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const BENEFICIOS = [
  {
    icon: TrendingDown,
    title: "Reduce costos operativos",
    description:
      "Libera flujo de caja cada mes al depender menos de la tarifa eléctrica, algo clave en negocios con consumo intensivo o varios locales.",
  },
  {
    icon: ShieldCheck,
    title: "Continuidad del negocio",
    description:
      "Con respaldo solar, un corte de energía deja de significar pérdida de producción, inventario o ventas.",
  },
  {
    icon: Receipt,
    title: "Beneficios tributarios",
    description:
      "En Colombia, la Ley 1715 de 2014 contempla incentivos tributarios para la inversión en energías renovables como la solar. Consulta con tu contador los beneficios vigentes para tu caso.",
  },
  {
    icon: Award,
    title: "Marca y sostenibilidad",
    description:
      "Cada vez más clientes y aliados valoran negocios comprometidos con la sostenibilidad; la energía solar es una forma visible de demostrarlo.",
  },
];

export function BusinessBenefits() {
  return (
    <section className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Para empresas"
          title="La energía solar también es una decisión de negocio"
          description="Más allá del ahorro mensual, adoptar energía solar impacta la operación, las finanzas y la imagen de tu empresa."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-black/5 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-500/12 text-leaf-600">
                <b.icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-950">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/60">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

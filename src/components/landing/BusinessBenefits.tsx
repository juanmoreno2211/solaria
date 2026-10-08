import { Award, Receipt, ShieldCheck, TrendingDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

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
    <section className="border-t border-ink-950/8 py-24 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Para empresas"
              title="La energía solar también es una decisión de negocio"
              description="Más allá del ahorro mensual, adoptar energía solar impacta la operación, las finanzas y la imagen de tu empresa."
            />
          </Reveal>

          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {BENEFICIOS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <dt className="flex items-center gap-2.5 text-sm font-semibold text-ink-950">
                  <b.icon className="h-4 w-4 text-stone-500" strokeWidth={1.75} />
                  {b.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                  {b.description}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

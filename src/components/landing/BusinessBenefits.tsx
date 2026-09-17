import { Award, Receipt, ShieldCheck, TrendingDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/ui/FeatureCard";

const BENEFICIOS = [
  {
    icon: TrendingDown,
    title: "Reduce costos operativos",
    description:
      "Libera flujo de caja cada mes al depender menos de la tarifa eléctrica, algo clave en negocios con consumo intensivo o varios locales.",
    accent: "sun" as const,
  },
  {
    icon: ShieldCheck,
    title: "Continuidad del negocio",
    description:
      "Con respaldo solar, un corte de energía deja de significar pérdida de producción, inventario o ventas.",
    accent: "leaf" as const,
  },
  {
    icon: Receipt,
    title: "Beneficios tributarios",
    description:
      "En Colombia, la Ley 1715 de 2014 contempla incentivos tributarios para la inversión en energías renovables como la solar. Consulta con tu contador los beneficios vigentes para tu caso.",
    accent: "ember" as const,
  },
  {
    icon: Award,
    title: "Marca y sostenibilidad",
    description:
      "Cada vez más clientes y aliados valoran negocios comprometidos con la sostenibilidad; la energía solar es una forma visible de demostrarlo.",
    accent: "sun" as const,
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
          {BENEFICIOS.map((b, i) => (
            <FeatureCard
              key={b.title}
              index={i + 1}
              icon={b.icon}
              title={b.title}
              description={b.description}
              accent={b.accent}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

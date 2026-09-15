import { Container } from "@/components/ui/Container";

const STATS = [
  { value: "3", label: "Alternativas solares comparadas por el agente" },
  { value: "< 3 min", label: "Para obtener tu plan de ahorro personalizado" },
  { value: "COP", label: "Cálculos ajustados al mercado colombiano" },
  { value: "IA", label: "Interpreta tu recibo y tu tipo de predio" },
];

export function StatsBar() {
  return (
    <section className="border-y border-black/5 bg-cream-100/60 py-10">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-2xl font-bold text-ink-950 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-ink-800/60 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/ui/Container";

const STATS = [
  { value: "3", label: "Alternativas solares comparadas por el agente" },
  { value: "< 3 min", label: "Para obtener tu plan de ahorro personalizado" },
  { value: "COP", label: "Cálculos ajustados al mercado colombiano" },
  { value: "IA", label: "Interpreta tu recibo y tu tipo de predio" },
];

export function StatsBar() {
  return (
    <section className="border-y border-ink-950/8 bg-cream-100/50">
      <Container>
        <div className="grid grid-cols-1 divide-y divide-ink-950/8 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="py-7 first:pt-0 last:pb-0 sm:px-8 sm:py-10 sm:first:pl-0 sm:first:pt-10 sm:last:pr-0 sm:last:pb-10">
              <p className="tabular-nums text-3xl font-bold text-ink-950 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-snug tracking-wide text-stone-500 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

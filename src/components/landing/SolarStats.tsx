import { Leaf, Sun, TrendingUp, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HORAS_SOL_PICO, type Region } from "@/lib/config/pricing";

const DATOS = [
  {
    icon: Sun,
    valor: "Hasta 95%",
    label: "de tu consumo eléctrico se puede cubrir con un sistema solar bien dimensionado",
  },
  {
    icon: TrendingUp,
    valor: "4 – 7 años",
    label: "es el tiempo típico de retorno de una inversión en paneles solares en Colombia",
  },
  {
    icon: Wrench,
    valor: "25 – 30 años",
    label: "de vida útil tiene un panel solar bien mantenido, con mantenimiento mínimo",
  },
  {
    icon: Leaf,
    valor: "Energía limpia",
    label: "que reduce tu dependencia de fuentes no renovables y tu huella de carbono",
  },
];

const REGION_NOMBRE: Record<Region, string> = {
  caribe: "Caribe",
  insular: "Insular",
  orinoquia: "Orinoquía",
  amazonia: "Amazonía",
  andina: "Andina",
  pacifico: "Pacífico",
};

const HSP_MAXIMO = 6.5;
const regionesOrdenadas = (Object.keys(HORAS_SOL_PICO) as Region[]).sort(
  (a, b) => HORAS_SOL_PICO[b] - HORAS_SOL_PICO[a]
);

export function SolarStats() {
  return (
    <section className="bg-ink-gradient py-24 sm:py-28">
      <Container>
        <SectionHeading
          light
          eyebrow="La energía solar en números"
          title="Antes de decidir, el panorama general"
          description="Datos generales sobre energía solar y el potencial de cada región de Colombia — independientes de tu caso puntual, que ya calculamos en la calculadora."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {DATOS.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-gradient text-ink-950">
                  <d.icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <p className="mt-4 text-2xl font-bold text-white">{d.valor}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  {d.label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <p className="text-sm font-semibold text-white">
              Horas de sol pico promedio por región
            </p>
            <p className="mt-1 text-xs text-white/45">
              A más horas de sol pico, menos paneles necesitas para el mismo consumo.
            </p>

            <div className="mt-6 space-y-4">
              {regionesOrdenadas.map((region) => {
                const hsp = HORAS_SOL_PICO[region];
                const ancho = Math.round((hsp / HSP_MAXIMO) * 100);
                return (
                  <div key={region}>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{REGION_NOMBRE[region]}</span>
                      <span className="font-semibold text-sun-300">
                        {hsp.toFixed(1)} HSP
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-sun-gradient"
                        style={{ width: `${ancho}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

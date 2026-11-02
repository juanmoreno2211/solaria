import clsx from "clsx";

export type CampoRecibo = "consumo" | "valor" | null;

export function Marca({ n, activa }: { n: 1 | 2; activa?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors",
        activa ? "bg-sun-500 text-white" : "bg-sun-500/15 text-sun-600",
      )}
    >
      {n}
    </span>
  );
}

function Resalte({
  activo,
  children,
}: {
  activo: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "-mx-1 rounded px-1 transition-colors duration-200",
        activo
          ? "bg-sun-500/15 ring-2 ring-sun-500"
          : "ring-1 ring-transparent",
      )}
    >
      {children}
    </span>
  );
}

const CONSUMOS = [290, 340, 310, 385, 325, 365];
const PROMEDIO = Math.round(
  CONSUMOS.reduce((a, b) => a + b, 0) / CONSUMOS.length,
);

const alto = (kwh: number) => `${((kwh - 200) / 200) * 100}%`;

export function ReciboEjemplo({
  resaltado = null,
}: {
  resaltado?: CampoRecibo;
}) {
  const consumoActivo = resaltado === "consumo";

  return (
    <figure className="m-0">
      <div
        aria-hidden
        className="rotate-[-1deg] rounded-lg bg-white p-4 text-[11px] leading-tight text-ink-800/70 shadow-[0_14px_34px_-18px_rgba(17,22,31,0.45)] ring-1 ring-ink-950/10"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-950/10 pb-2.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink-950">
            <span className="h-3 w-3 rounded-sm bg-sun-500" />
            Empresa de energía
          </p>
          <p className="text-ink-800/50">Periodo: octubre</p>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-800/50">
              Consumo últimos 6 meses
            </p>

            <div className="relative mt-1.5 flex h-9 w-fit items-end gap-[5px]">
              {CONSUMOS.map((kwh, i) => (
                <span
                  key={i}
                  className={clsx(
                    "w-2.5 rounded-[2px] transition-colors duration-200",
                    i === CONSUMOS.length - 1
                      ? consumoActivo
                        ? "bg-sun-500"
                        : "bg-sun-500/60"
                      : "bg-ink-950/15",
                  )}
                  style={{ height: alto(kwh) }}
                />
              ))}

              <span
                className="absolute inset-x-0 border-t border-dashed border-ink-800/40"
                style={{ bottom: alto(PROMEDIO) }}
              />
            </div>
          </div>

          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-ink-800/50">
              <span className="w-3 border-t border-dashed border-ink-800/45" />
              Promedio
            </p>
            <p className="mt-0.5 text-ink-800/50">
              {PROMEDIO} kWh{" "}
              <span className="text-ink-800/40">(no lo uses)</span>
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-md bg-cream-100/80 p-2.5 ring-1 ring-ink-950/8">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-950">
              <Marca n={1} activa={consumoActivo} />
              Consumo del mes
            </span>

            <Resalte activo={consumoActivo}>
              <b className="tabular-nums text-ink-950">365 kWh</b>
            </Resalte>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-ink-950/10 pt-2">
            <span className="flex items-center gap-1.5 font-semibold text-ink-950">
              <Marca n={2} activa={resaltado === "valor"} />
              Valor de la energía
            </span>

            <Resalte activo={resaltado === "valor"}>
              <b className="tabular-nums text-ink-950">$ 285.000</b>
            </Resalte>
          </div>
        </div>

        <div className="mt-2.5 space-y-1 text-[10px]">
          <p className="flex items-center justify-between text-ink-800/60">
            <span>Aseo</span>
            <span className="tabular-nums">$ 21.500</span>
          </p>

          <p className="flex items-center justify-between text-ink-800/60">
            <span>Alumbrado público</span>
            <span className="tabular-nums">$ 12.000</span>
          </p>

          <p className="mt-1 flex items-center justify-between border-t border-ink-950/10 pt-1.5 font-semibold text-ink-950">
            <span>Total a pagar</span>
            <span className="tabular-nums">$ 318.500</span>
          </p>
        </div>

        <p className="mt-2 rounded-md bg-sun-500/10 px-2 py-1.5 text-[10px] font-medium text-ink-950">
          Usa el <b>valor de la energía</b>, no el total a pagar.
        </p>
      </div>

      <figcaption className="mt-3 text-center text-[11px] text-ink-800/45">
        Recibo de ejemplo. El diseño puede variar según la empresa.
      </figcaption>
    </figure>
  );
}
import { formatCOP, formatDecimal, formatNumber } from "@/lib/format";
import type { Estadisticas as Datos, Meta } from "@/lib/recibos/estadisticas";
import { actualizarRecibo, borrarRecibo } from "../actions";
import { ayuda, botonPrimario, botonSecundario, campo, etiqueta, tarjeta, tituloTarjeta } from "./estilos";

const pesos = (v: number) => formatCOP(Math.round(v / 100) * 100);

function mesCorto(mes: string): string {
  return new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(mes)).replace(".", "");
}

function mesLargo(mes: string): string {
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(mes));
}

function cambio(pct: number | null, sube: string, baja: string): string {
  if (pct == null) return "—";
  if (Math.abs(pct) < 0.5) return "igual";
  return `${pct > 0 ? sube : baja} ${formatDecimal(Math.abs(pct))} %`;
}

function Tile({ label, valor, nota }: { label: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-lg bg-cream-50 p-3">
      <dt className="text-xs font-medium text-ink-950/65">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tracking-tight text-ink-950 tabular-nums">{valor}</dd>
      {nota && <dd className="text-xs text-ink-950/65">{nota}</dd>}
    </div>
  );
}

/** Formulario para agregar un recibo de cualquier mes. Cada envío es una fila nueva. */
export function FormularioRecibo({ boton = "Guardar recibo" }: { boton?: string }) {
  return (
    <form action={actualizarRecibo} className="grid gap-3 sm:grid-cols-3">
      <label>
        <span className={etiqueta}>Consumo del mes (kWh)</span>
        <input name="consumo_kwh" inputMode="decimal" required className={campo} />
      </label>
      <label>
        <span className={etiqueta}>Valor pagado ($)</span>
        <input name="valor" inputMode="numeric" required className={campo} />
      </label>
      <label>
        <span className={etiqueta}>Mes del recibo</span>
        <input name="mes" type="month" required defaultValue={new Date().toISOString().slice(0, 7)} className={campo} />
      </label>
      <div className="sm:col-span-3">
        <button type="submit" className={botonPrimario}>{boton}</button>
        <p className={ayuda}>Si ya hay un recibo de ese mes, usamos el último que guardes.</p>
      </div>
    </form>
  );
}

export function Estadisticas({ est, metas }: { est: Datos; metas: Meta[] }) {
  const conKwh = est.meses.filter((m) => m.consumoKwh != null).slice(-12);
  const max = Math.max(1, ...conKwh.map((m) => m.consumoKwh!));
  const tendencia =
    est.tendenciaKwhMes == null || est.promedioKwh == null
      ? null
      : Math.abs(est.tendenciaKwhMes) < est.promedioKwh * 0.02
        ? "Estable"
        : `${est.tendenciaKwhMes > 0 ? "Sube" : "Baja"} ~${formatDecimal(Math.abs(est.tendenciaKwhMes))} kWh por mes`;

  return (
    <section aria-labelledby="t-estadisticas" className={tarjeta}>
      <h2 id="t-estadisticas" className={tituloTarjeta}>Estadísticas de consumo</h2>
      <p className="mt-1 text-sm text-ink-950/75">
        Agrega los recibos de varios meses para ver cómo cambia tu consumo y ponerte metas.
      </p>

      {conKwh.length > 0 && (
        <figure className="mt-5">
          <figcaption className="mb-2 text-xs font-medium text-ink-950/65">
            kWh por mes{est.promedioKwh != null && conKwh.length > 1 ? ` · la línea es tu promedio (${Math.round(est.promedioKwh)} kWh)` : ""}
          </figcaption>
          <div className="relative flex h-44 items-end gap-1.5 border-b border-ink-950/15 sm:gap-3" aria-hidden="true">
            {est.promedioKwh != null && conKwh.length > 1 && (
              <div
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-950/45"
                style={{ bottom: `${(est.promedioKwh / max) * 85}%` }}
              />
            )}
            {conKwh.map((m, i) => {
              const ultimo = i === conKwh.length - 1;
              return (
                <div key={m.mes} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] font-semibold tabular-nums text-ink-950/75 sm:text-xs">{formatNumber(Math.round(m.consumoKwh!))}</span>
                  <div
                    className={ultimo ? "w-full max-w-10 rounded-t bg-sun-600" : "w-full max-w-10 rounded-t bg-ink-950/30"}
                    style={{ height: `${Math.max(2, (m.consumoKwh! / max) * 85)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-1.5 sm:gap-3" aria-hidden="true">
            {conKwh.map((m) => (
              <span key={m.mes} className="min-w-0 flex-1 truncate text-center text-[10px] text-ink-950/65 sm:text-xs">{mesCorto(m.mes)}</span>
            ))}
          </div>
          {/* La gráfica es decorativa para lectores de pantalla; esta tabla lleva los datos. */}
          <table className="sr-only">
            <caption>Consumo por mes</caption>
            <thead><tr><th>Mes</th><th>kWh</th><th>Valor</th></tr></thead>
            <tbody>
              {est.meses.map((m) => (
                <tr key={m.mes}><td>{mesLargo(m.mes)}</td><td>{m.consumoKwh ?? "—"}</td><td>{m.valor != null ? formatCOP(m.valor) : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}

      {est.meses.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile
            label="Promedio al mes"
            valor={est.promedioKwh != null ? `${formatNumber(Math.round(est.promedioKwh))} kWh` : "—"}
            nota={est.promedioValor != null ? pesos(est.promedioValor) : undefined}
          />
          <Tile
            label="Contra el mes anterior"
            valor={cambio(est.cambioKwhPct, "Subió", "Bajó")}
            nota={est.cambioValorPct != null ? `En pesos: ${cambio(est.cambioValorPct, "subió", "bajó")}` : undefined}
          />
          <Tile label="Tendencia" valor={tendencia ?? "—"} nota={tendencia ? undefined : "Con 3 meses o más"} />
          <Tile
            label="Tu tarifa"
            valor={est.ultimo?.tarifa != null ? `${formatCOP(Math.round(est.ultimo.tarifa))}/kWh` : "—"}
            nota={est.cambioTarifaPct != null ? `Desde tu primer recibo: ${cambio(est.cambioTarifaPct, "subió", "bajó")}` : undefined}
          />
        </dl>
      )}

      {est.mejorMes && est.peorMes && (
        <p className="mt-3 text-sm text-ink-950/80">
          Tu mejor mes fue {mesLargo(est.mejorMes.mes)} ({formatNumber(Math.round(est.mejorMes.consumoKwh!))} kWh) y el más alto,{" "}
          {mesLargo(est.peorMes.mes)} ({formatNumber(Math.round(est.peorMes.consumoKwh!))} kWh).
        </p>
      )}

      {metas.length > 0 && (
        <div className="mt-6 border-t border-ink-950/10 pt-4">
          <h3 className="text-sm font-semibold text-ink-950">Tus metas</h3>
          <ul className="mt-3 space-y-3">
            {metas.map((m) => (
              <li key={m.id} className="rounded-lg border border-ink-950/10 p-3">
                <p className="font-semibold text-ink-950">{m.titulo}</p>
                <p className="mt-0.5 text-sm text-ink-950/80">{m.detalle}</p>
                {/* La meta del aparato ya dice su ahorro en el detalle. */}
                {m.ahorroMes != null && m.id !== "aparato" && (
                  <p className="mt-1 text-sm font-semibold text-leaf-700">Si la cumples: ~{pesos(m.ahorroMes)} al mes (estimado)</p>
                )}
              </li>
            ))}
          </ul>
          <p className={`${ayuda} mt-3`}>
            Metas calculadas con tus recibos y tus aparatos: diferencia de kWh × tu tarifa. Los recibos pueden cubrir periodos de distinto número de días.
          </p>
        </div>
      )}

      <details className="mt-6" open={est.meses.length === 0}>
        <summary className={`${botonSecundario} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
          Agregar recibo de otro mes
        </summary>
        <div className="mt-4">
          <FormularioRecibo boton="Agregar recibo" />
        </div>
      </details>

      {est.meses.length > 0 && (
        <details className="mt-3">
          <summary className={`${botonSecundario} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            Ver mis recibos ({est.meses.length})
          </summary>
          <ul className="mt-3 divide-y divide-ink-950/10">
            {[...est.meses].reverse().map((m) => (
              <li key={m.mes} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold capitalize text-ink-950">{mesLargo(m.mes)}</span>
                  <span className="block text-ink-950/70">
                    {m.consumoKwh != null ? `${formatNumber(m.consumoKwh)} kWh` : "— kWh"} · {m.valor != null ? formatCOP(m.valor) : "—"}
                    {m.tarifa != null && ` · ${formatCOP(Math.round(m.tarifa))}/kWh`}
                  </span>
                </span>
                <form action={borrarRecibo}>
                  <input type="hidden" name="mes" value={m.mes} />
                  <button type="submit" className={botonSecundario} aria-label={`Borrar el recibo de ${mesLargo(m.mes)}`}>Borrar</button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

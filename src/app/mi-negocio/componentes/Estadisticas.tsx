import { formatCOP, formatCOPConSigno, formatDecimal, formatNumber } from "@/lib/format";
import type { Estadisticas as Datos, Meta } from "@/lib/recibos/estadisticas";
import { actualizarRecibo, borrarRecibo } from "../actions";
import { ayuda, botonPrimario, botonSecundario, campo, etiqueta } from "./estilos";
import clsx from "clsx";
import { ChartColumn, Gauge, Minus, Target, TrendingDown, TrendingUp, Trophy, Zap, type LucideIcon } from "lucide-react";

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
  return `${pct > 0 ? sube : baja} ${formatDecimal(Math.abs(pct))} %`.trim();
}

/** En consumo y pesos, subir es malo (brasa) y bajar es bueno (hoja). */
function tono(pct: number | null): "sube" | "baja" | "igual" | null {
  if (pct == null) return null;
  return Math.abs(pct) < 0.5 ? "igual" : pct > 0 ? "sube" : "baja";
}

const FLECHA = { sube: TrendingUp, baja: TrendingDown, igual: Minus };
const COLOR = { sube: "text-ember-600", baja: "text-leaf-700", igual: "text-ink-950/70" };

function Tile({ Icono, label, valor, nota, cambio: estado }: { Icono: LucideIcon; label: string; valor: string; nota?: string; cambio?: ReturnType<typeof tono> }) {
  const Flecha = estado ? FLECHA[estado] : null;
  return (
    <div className="rounded-xl bg-cream-50 p-3.5 ring-1 ring-ink-950/5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-950/75">
        <Icono className="h-3.5 w-3.5 text-sun-600" aria-hidden="true" />
        {label}
      </dt>
      <dd className={clsx("mt-1 flex items-center gap-1 text-base font-bold leading-snug tracking-tight tabular-nums", estado ? COLOR[estado] : "text-ink-950")}>
        {Flecha && <Flecha className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {valor}
      </dd>
      {nota && <dd className="text-xs text-ink-950/75">{nota}</dd>}
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
        : `${est.tendenciaKwhMes > 0 ? "+" : "−"}${formatDecimal(Math.abs(est.tendenciaKwhMes))} kWh/mes`;

  return (
    <section aria-labelledby="t-estadisticas">
      <h3 id="t-estadisticas" className="flex items-center gap-2 text-base font-bold text-ink-950">
        <ChartColumn className="h-5 w-5 text-sun-600" aria-hidden="true" />
        Historial de tu consumo
      </h3>
      <p className="mt-0.5 text-sm text-ink-950/75">Agrega recibos de varios meses para ver cómo cambia.</p>

      {conKwh.length > 0 && (
        <figure className="mt-4 rounded-xl bg-cream-50 p-3 ring-1 ring-ink-950/5 sm:p-4">
          <figcaption className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-950/70">
            <span>kWh por mes</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-sun-500" />Último mes</span>
            {est.mejorMes && <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-leaf-500" />Mejor mes</span>}
            {est.promedioKwh != null && conKwh.length > 1 && (
              <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-4 border-t-2 border-dashed border-ink-950/45" />Promedio ({Math.round(est.promedioKwh)} kWh)</span>
            )}
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
                    className={ultimo ? "w-full max-w-10 rounded-t-md bg-sun-500" : est.mejorMes?.mes === m.mes ? "w-full max-w-10 rounded-t-md bg-leaf-500" : "w-full max-w-10 rounded-t-md bg-ink-700/35"}
                    style={{ height: `${Math.max(2, (m.consumoKwh! / max) * 85)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-1.5 sm:gap-3" aria-hidden="true">
            {conKwh.map((m) => (
              <span key={m.mes} className="min-w-0 flex-1 truncate text-center text-[10px] text-ink-950/75 sm:text-xs">{mesCorto(m.mes)}</span>
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
            Icono={Zap}
            label="Promedio al mes"
            valor={est.promedioKwh != null ? `${formatNumber(Math.round(est.promedioKwh))} kWh` : "—"}
            nota={est.promedioValor != null ? pesos(est.promedioValor) : undefined}
          />
          <Tile
            Icono={ChartColumn}
            label="Contra el mes anterior"
            valor={cambio(est.cambioKwhPct, "Subió", "Bajó")}
            cambio={tono(est.cambioKwhPct)}
            nota={est.cambioValor != null ? `En pesos: ${formatCOPConSigno(est.cambioValor)}` : undefined}
          />
          <Tile
            Icono={TrendingUp}
            label="Tendencia"
            valor={tendencia ?? "—"}
            cambio={tendencia == null ? null : tendencia === "Estable" ? "igual" : est.tendenciaKwhMes! > 0 ? "sube" : "baja"}
            nota={tendencia == null ? "Con 3 meses o más" : tendencia === "Estable" ? undefined : est.tendenciaKwhMes! > 0 ? "Tu consumo sube" : "Tu consumo baja"}
          />
          <Tile
            Icono={Gauge}
            label="Tu tarifa"
            valor={est.ultimo?.tarifa != null ? `${formatCOP(Math.round(est.ultimo.tarifa))}/kWh` : "—"}
            nota={est.cambioTarifaPct != null ? `Desde tu primer recibo: ${cambio(est.cambioTarifaPct, "subió", "bajó")}` : undefined}
          />
        </dl>
      )}

      {est.mejorMes && est.peorMes && (
        <p className="mt-4 flex gap-2 text-sm text-ink-950/80">
          <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700" aria-hidden="true" />
          <span>Tu mejor mes fue {mesLargo(est.mejorMes.mes)} ({formatNumber(Math.round(est.mejorMes.consumoKwh!))} kWh) y el más alto,{" "}
          {mesLargo(est.peorMes.mes)} ({formatNumber(Math.round(est.peorMes.consumoKwh!))} kWh).</span>
        </p>
      )}

      {metas.length > 0 && (
        <div className="mt-6 border-t border-ink-950/10 pt-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink-950">
            <Target className="h-5 w-5 text-sun-600" aria-hidden="true" />
            Tus metas
          </h3>
          <ul className="mt-3 grid gap-3">
            {metas.map((m) => {
              const ultimo = est.ultimo?.consumoKwh ?? null;
              // Barra: el objetivo como parte del consumo actual (cuánto hay que bajar se ve como el hueco).
              const progreso = m.objetivoKwh != null && ultimo ? Math.min(100, (m.objetivoKwh / ultimo) * 100) : null;
              return (
                <li key={m.id} className="rounded-xl border border-ink-950/10 bg-white p-4">
                  <p className="font-bold text-ink-950">{m.titulo}</p>
                  <p className="mt-1 text-sm text-ink-950/80">{m.detalle}</p>
                  {progreso != null && m.id !== "mantener" && (
                    <div className="mt-3" aria-hidden="true">
                      <div className="relative h-2.5 rounded-full bg-ember-500/20">
                        <div className="h-full rounded-full bg-leaf-500" style={{ width: `${progreso}%` }} />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-ink-950/75">
                        <span>Meta: {formatNumber(Math.round(m.objetivoKwh!))} kWh</span>
                        <span>Hoy: {formatNumber(Math.round(ultimo!))} kWh</span>
                      </div>
                    </div>
                  )}
                  {/* La meta del aparato ya dice su ahorro en el detalle. */}
                  {m.ahorroMes != null && m.id !== "aparato" && (
                    <p className="mt-2 inline-flex rounded-full bg-leaf-500/15 px-2.5 py-1 text-sm font-bold text-leaf-700">
                      Ahorras ~{pesos(m.ahorroMes)} al mes (estimado)
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={`${ayuda} mt-3`}>Ahorro de cada meta: kWh de diferencia × tu tarifa.</p>
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

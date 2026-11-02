"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { ChevronDown } from "lucide-react";
import { formatCOP, formatCOPMiles, formatDecimal } from "@/lib/format";
import { SUPUESTOS } from "@/lib/config/pricing";
import { cuotaCredito, proyeccionDeCifras, type Cifras } from "@/lib/savings/cifras";
import type { ProjectionRow } from "@/lib/savings/projection";
import styles from "./SavingsCharts.module.css";

const pct = (n: number) => `${formatDecimal(n * 100)} %`;
const compacto = (n: number) => new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function DetalleAnio({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const saldo = Number(payload[0].value);
  const row = payload[0].payload as ProjectionRow;
  return (
    <div className={styles.tooltip}>
      <p>{Number(label) === 0 ? "Hoy · inversión inicial" : `Año ${label}`}</p>
      <strong>{formatCOP(Math.abs(saldo))}</strong>
      <span>{saldo >= 0 ? "de ahorro neto acumulado" : "aún por recuperar"}</span>
      {row.reposiciones > 0 && <span>Reposición: {formatCOPMiles(row.reposiciones)}</span>}
      {row.ahorroTributario > 0 && <span>Beneficio de renta simulado: {formatCOPMiles(row.ahorroTributario)}</span>}
    </div>
  );
}

export function SavingsCharts({ cifras }: { cifras: Cifras }) {
  const id = useId().replace(/:/g, "");
  const [anio, setAnio] = useState(20);
  const { inversion, ahorroMensual, mantenimientoMensual } = cifras;
  const valido = [inversion, ahorroMensual, mantenimientoMensual].every(Number.isFinite) && inversion > 0 && ahorroMensual >= 0 && mantenimientoMensual >= 0;
  const projection = useMemo(() => valido ? proyeccionDeCifras(cifras) : null, [valido, cifras]);

  if (!projection) return <p className={styles.note}>{inversion === 0 ? "Esta opción no tiene una inversión inicial que recuperar." : "Faltan datos válidos para mostrar la proyección."}</p>;

  const saldo = projection.rows[anio].netoAcumulado;
  const positivo = saldo >= 0;
  const cuota = cuotaCredito(inversion);
  const flujoCredito = ahorroMensual - cuota - mantenimientoMensual;
  const minimo = Math.min(...projection.rows.map((row) => row.netoAcumulado));
  const maximo = Math.max(0, ...projection.rows.map((row) => row.netoAcumulado));
  const corte = maximo / (maximo - minimo) * 100;
  const color = positivo ? "#2f7d50" : "#b56a1d";

  return (
    <section className={styles.savings} aria-label="Tu ahorro en 20 años">
      <div className={styles.heading}>
        <p>Tu ahorro en el tiempo</p>
        <span className={styles.payback}>
          {projection.retornoAnios === null ? "Sin recuperación en 20 años" : `Recuperación estimada: ${formatDecimal(projection.retornoAnios)} años`}
        </span>
      </div>

      <div className={styles.balance} aria-live="polite" aria-atomic="true">
        <p>{anio === 0 ? "Inversión inicial" : positivo ? `Ahorro acumulado al año ${anio}` : `Por recuperar al año ${anio}`}</p>
        <strong style={{ color }}>{formatCOPMiles(Math.abs(saldo))}</strong>
        <span>{anio === 0 ? "El punto de partida, antes de generar ahorro." : positivo ? "Ya descuenta inversión, mantenimiento y reposiciones presupuestadas." : "Es lo que aún faltaría para recuperar la inversión inicial."}</span>
      </div>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={projection.rows} margin={{ top: 14, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
            <defs>
              <linearGradient id={`${id}-saldo`} x1="0" y1="0" x2="0" y2="1">
                <stop offset={`${corte}%`} stopColor="#2f7d50" />
                <stop offset={`${corte}%`} stopColor="#d9842b" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eeeae3" strokeDasharray="3 5" />
            <XAxis type="number" dataKey="anio" domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} tick={{ fontSize: 11, fill: "#8a8071" }} tickFormatter={(n) => Number(n) === 0 ? "Hoy" : String(n)} tickLine={false} axisLine={false} />
            <YAxis width={49} tickCount={4} tickFormatter={(n) => compacto(Number(n))} tick={{ fontSize: 10, fill: "#8a8071" }} tickLine={false} axisLine={false} />
            {(cifras.finanzas?.parametrosProyeccion?.reposiciones ?? []).map((r) => <ReferenceLine key={`${r.anio}-${r.concepto}`} x={r.anio} stroke="#d9842b" strokeDasharray="2 5" />)}
            <ReferenceLine y={0} stroke="#c9c1b4" />
            {projection.retornoAnios !== null && <ReferenceLine x={projection.retornoAnios} stroke="#d2d9d0" strokeDasharray="3 5" />}
            <Area type="linear" dataKey="netoAcumulado" stroke={`url(#${id}-saldo)`} fill={`url(#${id}-saldo)`} fillOpacity={0.09} strokeWidth={2.5} baseValue={0} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <ReferenceLine x={anio} stroke="#c9c1b4" strokeDasharray="3 5" />
            <ReferenceDot x={anio} y={saldo} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            <Tooltip content={DetalleAnio} cursor={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.axisNote}>Años desde la instalación · pesos de hoy · sin crédito</p>

      <div className={styles.explorer}>
        <div><label htmlFor={`${id}-anio`}>Desliza para explorar cada año</label><output htmlFor={`${id}-anio`}>{anio === 0 ? "Hoy" : `Año ${anio}`}</output></div>
        <input id={`${id}-anio`} type="range" min={0} max={20} step={1} value={anio} onChange={(e) => setAnio(Number(e.target.value))}
          aria-valuetext={`${anio === 0 ? "Hoy" : `Año ${anio}`}: ${formatCOP(Math.abs(saldo))} ${positivo ? "de ahorro neto" : "por recuperar"}`} />
        <div className={styles.rangeEnds}><span>Hoy</span><span>20 años</span></div>
      </div>

      <div className={styles.assumptions}>
        <p><strong>Incluimos una inflación aproximada de {pct(SUPUESTOS.inflacionAnual)} al año.</strong> Suponemos que la tarifa y los costos suben a ese ritmo, por eso se muestran pesos de hoy. Se descuenta degradación solar del 0,5 % anual y mantenimiento de {formatCOPMiles(mantenimientoMensual * 12)} al año.</p>
        {cifras.finanzas?.reposicionBateriaCOP ? <p>Reposición de baterías: {formatCOPMiles(cifras.finanzas.reposicionBateriaCOP)} cada {cifras.finanzas.aniosReposicionBateria} años, en pesos de hoy.</p> : null}
        {cifras.finanzas?.reposicionInversorCOP ? <p>Reposición del inversor: {formatCOPMiles(cifras.finanzas.reposicionInversorCOP)} en el año {cifras.finanzas.aniosReposicionInversor}.</p> : <p>La reposición del inversor no está incluida si no se ingresa su costo.</p>}
        <p>{cifras.finanzas?.simulacionTributaria ? "El saldo incluye una simulación de deducción de renta, pendiente de validación y certificación UPME." : "No se suman beneficios fiscales automáticamente."} La recuperación indica cuándo el saldo deja de ser negativo dentro del horizonte, considerando los costos futuros.</p>
      </div>

      <details className={styles.details}>
        <summary><span>Ver una opción con crédito<small>{SUPUESTOS.plazoCreditoAnios} años · {pct(SUPUESTOS.tasaCreditoEA)} efectivo anual</small></span><ChevronDown aria-hidden="true" /></summary>
        <div className={styles.credit}>
          <dl>
            <div><dt>Cuota mensual estimada</dt><dd>{formatCOPMiles(cuota)}</dd></div>
            <div><dt>{flujoCredito >= 0 ? "Te quedaría cada mes" : "Aportarías de tu bolsillo"}</dt><dd style={{ color: flujoCredito >= 0 ? "#2f7d50" : "#b56a1d" }}>{formatCOPMiles(Math.abs(flujoCredito))}</dd></div>
          </dl>
          <p>El saldo mensual del primer año ya descuenta la cuota y el mantenimiento. No es un saldo constante: también deben cubrirse la degradación y las reposiciones. Al terminar el crédito, continúa el mantenimiento.</p>
          <p>Es un ejemplo con la tasa del simulador. La oferta final depende del banco. La gráfica de arriba corresponde a una compra sin crédito.</p>
        </div>
      </details>

      <details className={styles.details}>
        <summary><span>Ver el detalle año por año</span><ChevronDown aria-hidden="true" /></summary>
        <div className={styles.tableScroll}>
          <table>
            <caption>Pesos de hoy. Un balance negativo indica inversión pendiente por recuperar.</caption>
            <thead><tr><th scope="col">Año</th><th scope="col">Flujo neto del año</th><th scope="col">Reposición</th><th scope="col">Beneficio de renta</th><th scope="col">Balance acumulado</th></tr></thead>
            <tbody>{projection.rows.map((row) => <tr key={row.anio}><th scope="row">{row.anio === 0 ? "Hoy" : row.anio}</th><td>{formatCOP(row.ahorroNetoAnual)}</td><td>{formatCOP(row.reposiciones)}</td><td>{formatCOP(row.ahorroTributario)}</td><td>{formatCOP(row.netoAcumulado)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

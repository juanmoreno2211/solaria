"use client";

import { useId, useState } from "react";
import { ArrowRight, Battery, Pencil, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDecimal, formatNumber } from "@/lib/format";
import { PERFORMANCE_RATIO } from "@/lib/config/pricing";
import { CONTACTO_SOLARIA_ID } from "@/lib/cotizacion-contacto";
import { cifrasPrincipales } from "@/lib/savings/cifras";
import { formatCOPMiles } from "@/lib/format";
import { SavingsCharts } from "./SavingsCharts";
import { FinancialSummary } from "./FinancialSummary";
import { SUPUESTOS_RESPALDO } from "@/lib/savings/energia";
import type { AnalisisResultado } from "@/lib/savings/types";
import { DirectorioProveedores } from "./DirectorioProveedores";
import { PestanasResultado, type PestanaResultado } from "./ResultTabs";

export function EnergyResultsView({ resultado, onCambiarDatos, onPedirCotizacion }: { resultado: AnalisisResultado; onCambiarDatos: () => void; onPedirCotizacion: (id: string) => void }) {
  const idBase = useId();
  const [pestana, setPestana] = useState<PestanaResultado>("proveedores");
  const e = resultado.energia;
  if (!e) return null;
  const paneles = resultado.alternativas[0];
  const finanzas = paneles?.finanzas;
  const cifras = paneles && finanzas?.proyeccion ? cifrasPrincipales(paneles) : undefined;
  const cantidad = resultado.proveedores?.length ?? 0;
  const pestanas: { id: PestanaResultado; label: string; corto: string }[] = [
    { id: "proveedores", label: cantidad ? `Proveedores (${cantidad})` : "Proveedores", corto: "Proveedores" },
    { id: "ahorro", label: "Ahorro a 20 años", corto: "20 años" },
    { id: "calculo", label: "Cómo calculamos", corto: "El cálculo" },
  ];
  const demandaBase = e.consumoDiarioKwh * (e.conexion === "sin_red" ? 1 : resultado.cobertura);
  const respaldo = e.supuestosBateria ?? SUPUESTOS_RESPALDO;
  return (
    <div>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">Tu solución energética</h3>
      <p className="mt-1 text-sm text-ink-800/60">{[resultado.ubicacion.municipio, resultado.ubicacion.departamento].filter(Boolean).join(", ")} · {formatDecimal(e.consumoDiarioKwh)} kWh de consumo diario{resultado.consumoEstimado ? " estimado a partir del valor pagado" : " informado"} · {formatDecimal(resultado.ubicacion.hsp)} horas de sol pico promedio.</p>
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 lg:sticky lg:top-24">
          <section className="min-w-0 rounded-2xl bg-ink-950 p-4 text-white sm:p-6">
            <p className="text-xs font-medium text-white/60">Orientación inicial</p>
            <h4 className="mt-2 text-2xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere]">{e.titulo}</h4>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{e.motivo}</p>
            <dl className="mt-5 grid gap-5 border-t border-white/15 pt-5">
              {e.conexion !== "no_se" && <div><dt className="flex items-center gap-2 text-xs text-white/60"><Sun className="h-4 w-4" aria-hidden="true" />{e.conexion === "sin_red" ? "Potencia solar base para el consumo indicado" : "Base solar para el consumo diurno"}</dt><dd className="mt-1 text-3xl font-semibold tabular-nums">≈ {formatDecimal(e.potenciaSolarBaseKwp)} kWp</dd><dd className="mt-1 text-xs leading-relaxed text-white/60">Balance con sol promedio; no es un diseño para garantizar autonomía.</dd></div>}
              {e.conexion !== "no_se" && <div><dt className="flex items-center gap-2 text-xs text-white/60"><Battery className="h-4 w-4" aria-hidden="true" />Batería nominal para las cargas indicadas</dt><dd className="mt-1 text-xl font-semibold">{e.bateriaNominalKwh ? `≈ ${formatDecimal(e.bateriaNominalKwh)} kWh` : "Pendiente de dimensionar"}</dd><dd className="mt-1 text-xs leading-relaxed text-white/60">{e.bateriaNominalKwh ? `${e.potenciaCriticaW} W medios durante ${e.autonomiaSolicitadaHoras} h. Supuestos: 80 % de descarga y 90 % de eficiencia.` : "En Cambiar mis datos puedes indicar la potencia media de las cargas y las horas de respaldo."}</dd></div>}
            </dl>
            <div className="mt-5 border-t border-white/15 pt-4 text-xs leading-relaxed text-white/65">
              {finanzas?.inversion !== null && finanzas?.inversion !== undefined ? <><p>Presupuesto {finanzas.origen === "cotizacion_usuario" ? "ingresado" : "de referencia"}</p><p className="mt-1 text-2xl font-medium text-white">{formatCOPMiles(finanzas.inversion)}</p><p className="mt-2">{finanzas.origen !== "cotizacion_usuario" ? `Rango: ${formatCOPMiles(finanzas.inversionMin!)} a ${formatCOPMiles(finanzas.inversionMax!)}. ` : ""}Es una estimación pendiente de validación técnica.</p></> : <p>El presupuesto se completa con las cargas y horas de respaldo o una cotización instalada.</p>}
              {cifras && <p className="mt-3">Ahorro energético inicial: {formatCOPMiles(cifras.ahorroMensual)} al mes, antes de mantenimiento y reposiciones.</p>}
            </div>
          </section>
        </div>
        <div className="min-w-0">
          <PestanasResultado pestanas={pestanas} activa={pestana} onCambiar={setPestana} idBase={idBase} />
          <div key={pestana} role="tabpanel" id={`${idBase}-panel-${pestana}`} aria-labelledby={`${idBase}-tab-${pestana}`} tabIndex={0} className="pt-5 outline-none">
            {pestana === "proveedores" && (
              <DirectorioProveedores onElegir={onPedirCotizacion} proveedores={resultado.proveedores ?? []} comunitarios={resultado.proveedoresComunitarios} />
            )}
            {pestana === "ahorro" && (cifras ? <SavingsCharts cifras={cifras} /> : (
              <div className="space-y-4 text-sm leading-relaxed text-ink-800/70">
                <h4 className="font-medium text-ink-950">Completa los datos para proyectar el ahorro</h4>
                {finanzas ? <FinancialSummary finanzas={finanzas} /> : <p>Primero hay que confirmar la conexión, el presupuesto completo y el costo de la energía que se sustituiría.</p>}
                <p>Puedes completar Presupuesto y costos en Cambiar mis datos o revisarlo con SolarIA.</p>
                <Button onClick={() => onPedirCotizacion(CONTACTO_SOLARIA_ID)}>
                  Continuar con SolarIA <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            {pestana === "calculo" && (
              <div className="space-y-5 text-xs leading-6 text-ink-800/70">
                <div><h4 className="text-sm font-medium text-ink-950">1. Consumo diario</h4><p>{formatNumber(resultado.consumoMensualKwh)} kWh al mes ÷ 30 días ≈ {formatDecimal(e.consumoDiarioKwh)} kWh al día.{resultado.consumoEstimado ? " El consumo se estimó a partir del valor pagado; conviene confirmar los kWh." : " Se usa el consumo que ingresaste."}</p></div>
                {e.conexion === "no_se" ? (
                  <p>Antes de dimensionar paneles y baterías, hay que confirmar si el negocio tiene red eléctrica y qué tan confiable es. Puedes actualizarlo en Cambiar mis datos.</p>
                ) : (
                  <>
                    <div><h4 className="text-sm font-medium text-ink-950">2. Potencia solar orientativa</h4><p>{e.conexion === "sin_red" ? "Se toma todo el consumo diario indicado." : `Según el horario, se toma el ${formatDecimal(resultado.cobertura * 100)} % del consumo como base diurna.`} La cuenta es: {formatDecimal(demandaBase)} kWh ÷ ({formatDecimal(resultado.ubicacion.hsp)} horas de sol pico × {formatDecimal(PERFORMANCE_RATIO)}) ≈ <strong className="font-medium text-ink-950">{formatDecimal(e.potenciaSolarBaseKwp)} kWp</strong>.</p></div>
                    <div><h4 className="text-sm font-medium text-ink-950">3. Batería para los equipos indicados</h4>{e.bateriaNominalKwh && e.energiaRespaldoKwh !== undefined ? <p>{formatNumber(e.potenciaCriticaW ?? 0)} W ÷ 1.000 × {formatDecimal(e.autonomiaSolicitadaHoras ?? 0)} horas ≈ {formatDecimal(e.energiaRespaldoKwh)} kWh útiles. Al considerar {formatDecimal(respaldo.profundidadDescarga * 100)} % de descarga y {formatDecimal(respaldo.eficiencia * 100)} % de eficiencia, se requieren unos <strong className="font-medium text-ink-950">{formatDecimal(e.bateriaNominalKwh)} kWh nominales</strong>. Corresponde solo a esas cargas y horas.</p> : <p>Falta indicar la potencia media de los equipos y las horas de respaldo. Puedes hacerlo en Cambiar mis datos o revisarlo con el instalador.</p>}</div>
                  </>
                )}
                {finanzas && <FinancialSummary finanzas={finanzas} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

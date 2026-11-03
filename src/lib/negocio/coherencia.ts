import { datosDepartamento } from "@/lib/geo/departamentos";
import { regionForDepartment } from "@/lib/geo/regions";
import { veredictoCalculadora, type FuncionVeredicto, type PerfilSimulacion } from "@/lib/aparatos/simulador";
import type { Veredicto } from "@/lib/savings/types";
import { CONEXIONES, HORARIOS, TIPOS_NEGOCIO, esOpcion } from "./opciones";

/**
 * Lo que comparten el simulador y la página de Mi negocio. Si los dos usan
 * estas funciones, el veredicto de la página y el "Hoy:" del simulador no se
 * pueden contradecir.
 */

/** Perfil validado con los códigos de la calculadora; lo que no sirve queda en null. */
export function perfilNegocio(datos: { tipo?: unknown; departamento?: unknown; municipio?: unknown; horario?: unknown; conexion?: unknown }) {
  const departamento = typeof datos.departamento === "string" && datosDepartamento(datos.departamento) ? datos.departamento : null;
  return {
    tipo_negocio: esOpcion(TIPOS_NEGOCIO, datos.tipo) ? datos.tipo : null,
    departamento,
    region: departamento ? regionForDepartment(departamento) ?? null : null,
    municipio: typeof datos.municipio === "string" ? datos.municipio.trim().slice(0, 80) || null : null,
    horario: esOpcion(HORARIOS, datos.horario) ? datos.horario : null,
    conexion: esOpcion(CONEXIONES, datos.conexion) ? datos.conexion : null,
  };
}

/** El perfil completo que necesita el veredicto, o null si falta algo. */
export function perfilParaSimular(datos: Parameters<typeof perfilNegocio>[0]): PerfilSimulacion | null {
  const p = perfilNegocio(datos);
  if (!p.tipo_negocio || !p.departamento || !p.region || !p.horario || !p.conexion) return null;
  return {
    tipoNegocio: p.tipo_negocio,
    departamento: p.departamento,
    region: p.region,
    horario: p.horario,
    conexion: p.conexion,
    municipio: p.municipio ?? undefined,
  };
}

/** Consumo y valor del recibo vigente; si falta uno, se completa con la tarifa. */
export function baseDelRecibo(
  recibo: { consumo_kwh: number | null; valor: number | null } | null,
  tarifa: number | null
): { consumoKwh: number; valor: number } | null {
  if (!tarifa) return null;
  const consumo = recibo?.consumo_kwh ?? (recibo?.valor ? recibo.valor / tarifa : null);
  const valor = recibo?.valor ?? (consumo ? consumo * tarifa : null);
  return consumo && valor ? { consumoKwh: consumo, valor } : null;
}

export interface ReciboGuardadoFila {
  consumo_kwh: number | null;
  valor: number | null;
  origen: string;
  creado_en: string;
}

/**
 * El recibo con el que se calculó el resultado guardado: el de origen
 * "calculadora" guardado justo con él (se escriben en la misma acción).
 */
export function reciboDelResultado<T extends ReciboGuardadoFila>(recibos: T[], guardadoEn: string | null): T | null {
  if (!guardadoEn) return null;
  const limite = new Date(guardadoEn).getTime() + 5 * 60 * 1000;
  return (
    recibos
      .filter((r) => r.origen === "calculadora" && new Date(r.creado_en).getTime() <= limite)
      .sort((a, b) => b.creado_en.localeCompare(a.creado_en))[0] ?? null
  );
}

export interface ResultadoMostrado {
  /** Veredicto con el recibo y el perfil de hoy: el mismo que usa el simulador. */
  actual: { veredicto: Veredicto; consumoKwh: number } | null;
  /** Lo que salió en la calculadora, con su fecha y su consumo. */
  guardado: { veredicto: Veredicto; fecha: string | null; consumoKwh: number | null; valor: number | null } | null;
  /** El veredicto de hoy es distinto del guardado. */
  cambio: boolean;
}

export function resultadoParaMostrar(
  entrada: {
    veredictoGuardado: Veredicto | null;
    guardadoEn: string | null;
    recibos: ReciboGuardadoFila[];
    perfil: Parameters<typeof perfilNegocio>[0];
    reciboActual: { consumo_kwh: number | null; valor: number | null } | null;
    tarifa: number | null;
  },
  veredicto: FuncionVeredicto = veredictoCalculadora
): ResultadoMostrado {
  const perfil = perfilParaSimular(entrada.perfil);
  const base = baseDelRecibo(entrada.reciboActual, entrada.tarifa);
  const actual = perfil && base ? { veredicto: veredicto(perfil, base.consumoKwh, base.valor), consumoKwh: base.consumoKwh } : null;

  const reciboOrigen = reciboDelResultado(entrada.recibos, entrada.guardadoEn);
  const guardado = entrada.veredictoGuardado
    ? { veredicto: entrada.veredictoGuardado, fecha: entrada.guardadoEn, consumoKwh: reciboOrigen?.consumo_kwh ?? null, valor: reciboOrigen?.valor ?? null }
    : null;

  return { actual, guardado, cambio: Boolean(actual && guardado && actual.veredicto !== guardado.veredicto) };
}

/** "2/11": día y mes, como se dice en Colombia. */
export function fechaCorta(fecha: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "numeric", timeZone: "America/Bogota" }).format(new Date(fecha));
}

import type { AnalisisFinanciero } from "@/lib/savings/financial-types";
import { formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import type { ProveedorCoincidente } from "@/lib/catalog/types";
import type { OfertaProveedor, OrientacionEnergetica } from "@/lib/savings/types";

export const CONTACTO_SOLARIA_ID = "solaria:orientacion";

/** Una consulta puede avanzar sin una oferta ni un precio comercial disponible. */
export type DestinoCotizacion =
  | { tipo: "oferta"; oferta: OfertaProveedor }
  | { tipo: "consulta"; proveedor?: ProveedorCoincidente };

export interface DatosCotizacion {
  departamento: string;
  municipio?: string;
  conexion?: string;
  zona?: string;
  tipoNegocio?: string;
  horario?: string;
  consumoKwh: number;
  valorFactura: number;
  valorFacturaEstimado?: boolean;
  kwp: number;
  energia?: OrientacionEnergetica;
  presupuestoFinanciero?: AnalisisFinanciero;
  referenciaEconomica?: { inversion: number; ahorroMensual: number; retornoMeses: number | null; finanzas?: AnalisisFinanciero };
}

export function proveedorDelDestino(destino: DestinoCotizacion): string | undefined {
  return destino.tipo === "oferta" ? destino.oferta.proveedor : destino.proveedor?.nombre;
}

export function permisoParaDestino(destino: DestinoCotizacion): string {
  if (destino.tipo === "oferta" && destino.oferta.estadoDatos === "simulado") return "un instalador";
  return proveedorDelDestino(destino) ?? "un proveedor que pueda atender mi negocio";
}

/** La referencia genérica de SolarIA no se presenta como precio de la empresa elegida. */
export function referenciaParaContacto(destino: DestinoCotizacion, datos: DatosCotizacion) {
  if (datos.energia?.requiereEstudio) return datos.referenciaEconomica?.finanzas?.proyeccion ? datos.referenciaEconomica : undefined;
  return destino.tipo === "oferta" ? destino.oferta : datos.referenciaEconomica;
}

export function armarMensajeContacto(destino: DestinoCotizacion, datos: DatosCotizacion, autorizado: boolean, ref: string): string {
  const proveedor = proveedorDelDestino(destino);
  const oferta = destino.tipo === "oferta" ? destino.oferta : undefined;
  const plan = oferta?.plan ? ` (${oferta.plan.nombre}, ${formatDecimal(oferta.plan.kwp)} kW)` : "";
  const lugar = [datos.municipio, datos.departamento].filter(Boolean).join(", ");
  const referencia = referenciaParaContacto(destino, datos);
  const energia = datos.energia;
  const lineas = [
    "Hola, quiero recibir orientación y solicitar una cotización con SolarIA.",
    proveedor ? `Me interesa evaluar la opción de ${proveedor}${plan}.` : "Necesito ayuda para elegir una solución y un proveedor.",
    `Mi negocio: ${datos.tipoNegocio?.toLowerCase() ?? "negocio"} en ${lugar}.${datos.horario ? ` Trabajo ${datos.horario.toLowerCase()}.` : ""}`,
    datos.conexion ? `Conexión: ${datos.conexion}.${datos.zona ? ` Zona: ${datos.zona}.` : ""}` : "",
    `Consumo informado o estimado: ${formatNumber(datos.consumoKwh)} kWh al mes.`,
    datos.valorFactura > 0 && energia?.conexion !== "sin_red" ? `Valor mensual ${datos.valorFacturaEstimado ? "estimado" : "informado"}: ${formatCOPMiles(datos.valorFactura)}.` : "",
    energia ? `Orientación inicial: ${energia.titulo}.` : "",
    datos.kwp > 0 && energia?.conexion !== "no_se" ? `Base solar orientativa de SolarIA: ${formatDecimal(datos.kwp)} kWp; pendiente de estudio técnico.` : "",
    energia?.bateriaNominalKwh ? `Batería orientativa: ${formatDecimal(energia.bateriaNominalKwh)} kWh nominales para ${energia.potenciaCriticaW} W medios durante ${energia.autonomiaSolicitadaHoras} h; pendiente de validación.` : "",
  ];
  if (oferta?.ppa && !energia?.requiereEstudio) {
    lineas.push(`Escenario PPA registrado en SolarIA: pago de ${formatCOPMiles(oferta.ppa.pagoMensual)} al mes y ahorro de ${formatCOPMiles(oferta.ahorroMensual)} al mes. Solicito confirmar tarifa y condiciones.`);
  } else if (referencia) {
    lineas.push(`Escenario de referencia de SolarIA: inversión de ${formatCOPMiles(referencia.inversion)} y ahorro estimado de ${formatCOPMiles(referencia.ahorroMensual)} al mes.${referencia.retornoMeses !== null ? ` Retorno de referencia: ${formatDecimal(referencia.retornoMeses / 12)} años.` : ""} No es una cotización del proveedor.`);
  } else {
    lineas.push("Solicito confirmar la solución, el presupuesto y la posibilidad de una visita técnica para mi negocio.");
  }
  const finanzas = (referencia && "finanzas" in referencia ? referencia.finanzas : undefined) ?? datos.presupuestoFinanciero;
  if (!referencia && finanzas?.inversion !== null && finanzas?.inversion !== undefined) lineas.push(`Presupuesto orientativo de SolarIA: ${formatCOPMiles(finanzas.inversion)}. Falta información para proyectar el ahorro; no es una cotización del proveedor.`);
  if (finanzas) {
    lineas.push(`Mantenimiento estimado: ${formatCOPMiles(finanzas.mantenimientoAnual ?? 0)} al año. El presupuesto y la autonomía requieren validación técnica.`);
    if (finanzas.reposicionBateriaCOP > 0) lineas.push(`Reposición presupuestada de baterías: ${formatCOPMiles(finanzas.reposicionBateriaCOP)} cada ${finanzas.aniosReposicionBateria} años, en pesos de hoy.`);
    if (finanzas.reposicionInversorCOP > 0) lineas.push(`Reposición presupuestada de inversor: ${formatCOPMiles(finanzas.reposicionInversorCOP)} en el año ${finanzas.aniosReposicionInversor}.`);
    if (finanzas.simulacionTributaria) lineas.push("El retorno incluye una simulación de deducción de renta pendiente de validación tributaria y certificación UPME.");
  }
  lineas.push(
    autorizado ? `Autorizo que SolarIA comparta estos datos y mi número con ${permisoParaDestino(destino)} para gestionar la cotización.` : "Por ahora, solicito atención de SolarIA sin compartir mis datos con proveedores.",
    `Ref. ${ref}`,
  );
  return lineas.filter(Boolean).join("\n");
}

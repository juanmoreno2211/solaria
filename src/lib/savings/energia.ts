import { COBERTURA_POR_HORARIO, PERFORMANCE_RATIO } from "@/lib/config/pricing";
import type { AnalisisInput, OrientacionEnergetica } from "./types";

/** Supuestos de predimensionamiento, no especificaciones de una batería o proveedor. */
export const SUPUESTOS_RESPALDO = { profundidadDescarga: 0.8, eficiencia: 0.9 } as const;

export function orientarEnergia(input: AnalisisInput, consumo: number, hsp: number): OrientacionEnergetica {
  const n = input.negocio;
  const conexion = n.conexion ?? (n.fallaLuz && n.fallaLuz !== "bajones" ? "intermitente" : "estable");
  const solucion = conexion === "sin_red" ? "aislado" : conexion === "intermitente" ? "hibrido" : "conectado";
  const requiereEstudio = conexion !== "estable";
  const consumoDiarioKwh = consumo / 30;
  const demandaBase = conexion === "sin_red" ? consumoDiarioKwh : consumoDiarioKwh * COBERTURA_POR_HORARIO[n.horario];
  const potenciaSolarBaseKwp = demandaBase / (hsp * PERFORMANCE_RATIO);
  const titulos = {
    estable: "Solar conectada a la red",
    intermitente: "Solar híbrida con respaldo",
    sin_red: "Solar aislada con almacenamiento",
    no_se: "Primero, confirma cómo llega la energía",
  };
  const motivos = {
    estable: "Con una red estable, la prioridad es aprovechar la generación diurna para reducir compras de energía.",
    intermitente: "Los cortes requieren evaluar baterías, un inversor con función de respaldo y las cargas que necesitan continuidad.",
    sin_red: "El objetivo es abastecer la demanda sin depender de una red: hay que dimensionar generación, almacenamiento y respaldo para los periodos de menor sol.",
    no_se: "La ubicación por sí sola no permite saber si existe red confiable ni si el negocio pertenece a una ZNI. Confirma la conexión antes de comparar ahorro y retorno.",
  };
  const advertencias = [
    "La potencia solar es un balance con sol promedio. El diseño final debe revisar el mes de menor radiación, las sombras, los picos de arranque y los días de baja generación.",
    "Un sistema conectado a la red sin respaldo no mantiene el suministro durante un apagón.",
  ];
  if (!input.recibo.consumoMensualKwh) advertencias.push("El consumo se infirió a partir del valor pagado y una tarifa comercial de referencia. Confirma los kWh antes de dimensionar equipos.");
  if (n.zona === "apartada" || n.zona === "rural") advertencias.push("La cotización debe incluir transporte hasta el predio, montaje, puesta en marcha y mantenimiento local. Estar en zona rural no significa automáticamente estar en una ZNI.");
  if (n.fallaLuz === "bajones" || n.fallaLuz === "ambos") advertencias.push("Los bajones de tensión también requieren revisar la instalación y sus protecciones. Las baterías por sí solas no corrigen una falla eléctrica.");
  const resultado: OrientacionEnergetica = {
    conexion, solucion, titulo: titulos[conexion], motivo: motivos[conexion], requiereEstudio,
    consumoDiarioKwh, potenciaSolarBaseKwp, advertencias,
  };
  if (requiereEstudio && n.potenciaCriticaW && n.horasAutonomia &&
      Number.isFinite(n.potenciaCriticaW) && Number.isFinite(n.horasAutonomia) &&
      n.potenciaCriticaW > 0 && n.horasAutonomia > 0) {
    const energiaRespaldoKwh = n.potenciaCriticaW / 1000 * n.horasAutonomia;
    resultado.energiaRespaldoKwh = energiaRespaldoKwh;
    resultado.bateriaNominalKwh = energiaRespaldoKwh / (SUPUESTOS_RESPALDO.profundidadDescarga * SUPUESTOS_RESPALDO.eficiencia);
    resultado.potenciaCriticaW = n.potenciaCriticaW;
    resultado.autonomiaSolicitadaHoras = n.horasAutonomia;
    resultado.supuestosBateria = SUPUESTOS_RESPALDO;
    resultado.advertencias.push("La batería calculada solo corresponde a las cargas y horas indicadas. No dimensiona el suministro completo de un negocio aislado ni asegura esa autonomía sin revisar el equipo y su estado de carga.");
  }
  return resultado;
}

import { CAMPOS_FINANCIEROS, errorFinanzas } from "./financial-validation";
import type { FinanzasInput } from "./financial-types";
import { regionForDepartment } from "@/lib/geo/regions";
import type { AnalisisInput, CargaCritica, FallaLuz, Horario, TipoNegocio } from "./types";
import type { ConexionElectrica, ZonaNegocio } from "@/lib/catalog/types";

type Validacion = { ok: true; input: AnalisisInput } | { ok: false; error: string };
const positivo = (s: string): number | null => {
  const n = Number(s);
  return s.trim() && Number.isFinite(n) && n > 0 ? n : null;
};

export function validarAnalisis(form: FormData): Validacion {
  const texto = (k: string) => typeof form.get(k) === "string" ? String(form.get(k)).trim() : "";
  const consumo = positivo(texto("consumoMensualKwh"));
  const valor = positivo(texto("valorPagadoMensual"));
  if ((texto("consumoMensualKwh") && !consumo) || (texto("valorPagadoMensual") && !valor)) return { ok: false, error: "El consumo y el valor deben ser números mayores que cero; puedes dejar el dato desconocido vacío." };
  if ((consumo && consumo > 10_000_000) || (valor && valor > 1_000_000_000_000)) return { ok: false, error: "Revisa las unidades del consumo y del valor mensual." };
  if (!consumo && !valor) return { ok: false, error: "Indica el consumo mensual en kWh o el valor de la energía." };
  const departamento = texto("departamento");
  const region = regionForDepartment(departamento);
  if (!region) return { ok: false, error: "Elige el departamento donde está tu negocio." };
  const conexion = texto("conexion");
  const zona = texto("zona");
  const horario = texto("horario") || "dia";
  const tipoNegocio = texto("tipoNegocio") || "otro";
  const fallaLuz = texto("fallaLuz");
  if (conexion && !["estable", "intermitente", "sin_red", "no_se"].includes(conexion)) return { ok: false, error: "Revisa cómo llega la energía a tu negocio." };
  if (zona && !["urbana", "rural", "apartada"].includes(zona)) return { ok: false, error: "Revisa el tipo de zona." };
  if (!["dia", "dia_noche", "24h"].includes(horario)) return { ok: false, error: "Revisa el horario del negocio." };
  if (!["tienda", "restaurante", "consultorio", "taller", "finca", "otro"].includes(tipoNegocio)) return { ok: false, error: "Revisa el tipo de negocio." };
  if (fallaLuz && !["cortes", "bajones", "ambos"].includes(fallaLuz)) return { ok: false, error: "Revisa las fallas de luz." };
  if (conexion === "sin_red" && !consumo) return { ok: false, error: "Sin red, necesitamos el consumo mensual estimado en kWh. Puedes volver al paso anterior y escribirlo sin una factura." };
  const potencia = positivo(texto("potenciaCriticaW"));
  const horas = positivo(texto("horasAutonomia"));
  if ((texto("potenciaCriticaW") && !potencia) || (texto("horasAutonomia") && !horas)) return { ok: false, error: "La potencia de respaldo y las horas deben ser números mayores que cero." };
  if (Boolean(potencia) !== Boolean(horas)) return { ok: false, error: "Para estimar la batería, completa la potencia de las cargas y las horas de respaldo; o deja ambos campos vacíos." };
  if ((potencia && potencia > 1_000_000) || (horas && horas > 168)) return { ok: false, error: "Para más de 1.000 kW o 168 horas de respaldo se necesita un estudio especializado." };
  const cargasPermitidas: CargaCritica[] = ["neveras", "aire", "medicos", "maquinaria", "computo", "luces"];
  const cargas = form.getAll("cargasCriticas");
  if (cargas.some((c) => typeof c !== "string" || !cargasPermitidas.includes(c as CargaCritica))) return { ok: false, error: "Revisa los equipos seleccionados." };
  const legal = texto("legalmenteConstituido");
  if (legal && !["si", "no", "nose"].includes(legal)) return { ok: false, error: "Revisa si el negocio está constituido." };
  const finanzas: FinanzasInput = {};
  for (const key of CAMPOS_FINANCIEROS) {
    const raw = texto(`finanzas.${key}`);
    if (raw) finanzas[key] = Number(raw);
  }
  const simular = texto("finanzas.simularDeduccion");
  if (simular && simular !== "1" && simular !== "0") return { ok: false, error: "Revisa la opción de simulación tributaria." };
  if (simular === "1") finanzas.simularDeduccion = true;
  const errorPresupuesto = errorFinanzas(finanzas);
  if (errorPresupuesto) return { ok: false, error: errorPresupuesto };
  return { ok: true, input: {
    recibo: { fuente: texto("fuente") === "foto" ? "foto" : "manual", consumoMensualKwh: consumo, valorPagadoMensual: valor },
    negocio: {
      departamento, region, tipoNegocio: tipoNegocio as TipoNegocio, horario: horario as Horario,
      cargasCriticas: [...new Set(cargas as CargaCritica[])],
      conexion: (conexion || undefined) as ConexionElectrica | undefined,
      zona: (zona || undefined) as ZonaNegocio | undefined,
      municipio: texto("municipio").slice(0, 100) || undefined,
      fallaLuz: (fallaLuz || undefined) as FallaLuz | undefined,
      legalmenteConstituido: (legal || undefined) as "si" | "no" | "nose" | undefined,
      potenciaCriticaW: potencia ?? undefined, horasAutonomia: horas ?? undefined,
      ...(Object.keys(finanzas).length ? { finanzas } : {}),
    },
  } };
}

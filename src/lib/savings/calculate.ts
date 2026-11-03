import { presupuestoSolar } from "@/lib/config/costs";
import { calcularFinanzas } from "./financial";
import { calcularRetornoMeses } from "./retorno";
import {
  COBERTURA_POR_HORARIO,
  HORAS_SOL_PICO,
  MANTENIMIENTO_ANUAL,
  PERFORMANCE_RATIO,
  TARIFA_COMERCIAL_COP_KWH,
  UMBRALES_RECOMENDACION,
} from "@/lib/config/pricing";
import { formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import { datosDepartamento, hspParaCalculo } from "@/lib/geo/departamentos";
import type { CatalogoPanelSistema } from "@/lib/catalog/types";
import { buscarProveedores } from "@/lib/catalog/proveedores";
import { calcularOfertas, elegirMejorOferta } from "./ofertas";
import { orientarEnergia } from "./energia";
import type {
  AlternativaResultado,
  AnalisisInput,
  AnalisisResultado,
  UbicacionCalculo,
  Veredicto,
} from "./types";

const DIAS_MES = 30;

/** HSP del departamento; el promedio regional solo queda como respaldo. */
export function resolverUbicacion(input: AnalisisInput): UbicacionCalculo {
  const { region, departamento, municipio } = input.negocio;
  const datos = datosDepartamento(departamento);
  const hsp = hspParaCalculo(departamento);
  if (datos && hsp !== undefined) {
    return { region, departamento, municipio, hsp, hspMin: datos.hspMin, hspMax: datos.hspMax, fuente: "departamento" };
  }
  const hspRegion = HORAS_SOL_PICO[region];
  return { region, departamento, municipio, hsp: hspRegion, hspMin: hspRegion, hspMax: hspRegion, fuente: "region" };
}

function resolverConsumoYValor(input: AnalisisInput, tarifaEstimada: number) {
  let consumo = input.recibo.consumoMensualKwh;
  let valor = input.recibo.valorPagadoMensual;

  if (!consumo && !valor) {
    // Sin ningún dato real, no se puede analizar (la API debe validar esto antes).
    consumo = 0;
    valor = 0;
  } else if (!consumo && valor) {
    consumo = valor / tarifaEstimada;
  } else if (consumo && !valor) {
    valor = consumo * tarifaEstimada;
  }

  return { consumo: consumo ?? 0, valor: valor ?? 0 };
}

function calcularPaneles(
  input: AnalisisInput,
  consumoMensualKwh: number,
  valorPagadoMensual: number,
  hsp: number,
  sistemas?: CatalogoPanelSistema[]
): AlternativaResultado {
  // Sin baterías, los paneles solo cubren lo que el negocio consume de día.
  const cobertura = COBERTURA_POR_HORARIO[input.negocio.horario];
  const produccionDiariaObjetivoKwh = (consumoMensualKwh * cobertura) / DIAS_MES;
  const kwpRequeridos = produccionDiariaObjetivoKwh / (hsp * PERFORMANCE_RATIO);

  const ahorroMensual = Math.round(valorPagadoMensual * cobertura);

  const ofertas = calcularOfertas(kwpRequeridos, ahorroMensual, {
    region: input.negocio.region,
    departamento: input.negocio.departamento,
  }, sistemas);
  const mejorOferta = elegirMejorOferta(ofertas);

  // Los números principales salen del mejor proveedor; el costo genérico por
  // kWp solo se usa como respaldo cuando ningún proveedor aplica. Un plan fijo
  // más chico que lo necesario ahorra menos.
  const presupuesto = presupuestoSolar(kwpRequeridos);
  const inversion = mejorOferta?.inversion ?? presupuesto.base;
  const ahorro = mejorOferta?.ahorroMensual ?? ahorroMensual;
  const ahorroAnualNeto = ahorro * 12 - inversion * MANTENIMIENTO_ANUAL;
  const retornoMeses = mejorOferta?.retornoMeses ?? calcularRetornoMeses(inversion, ahorro);

  return {
    id: "paneles",
    nombre: "Paneles solares",
    aplica: kwpRequeridos > 0,
    kwpRequeridos: Math.round(kwpRequeridos * 10) / 10,
    inversionBase: inversion,
    inversionEstimadaMin: Math.round(mejorOferta?.inversionMin ?? presupuesto.minimo),
    inversionEstimadaMax: Math.round(mejorOferta?.inversionMax ?? presupuesto.maximo),
    ahorroMensualEstimado: Math.round(ahorro),
    ahorroPorcentual: valorPagadoMensual > 0 ? Math.round((ahorro / valorPagadoMensual) * 100) : 0,
    retornoMeses: retornoMeses === null ? null : Math.round(retornoMeses),
    ahorro5Anios: Math.round(ahorroAnualNeto * 5 - inversion),
    ahorro10Anios: Math.round(ahorroAnualNeto * 10 - inversion),
    idealPara: [
      "Negocios que gastan buena parte de su luz de día",
      "Facturas medias o altas",
      "Quienes buscan bajar el costo fijo de energía a largo plazo",
    ],
    fuentePrecio: mejorOferta ? "catalogo" : "estimado",
    ofertas,
    mejorOferta,
  };
}

function decidirVeredictoBase(
  paneles: AlternativaResultado,
  consumoMensualKwh: number
): { veredicto: Veredicto; motivo: string } {
  const u = UMBRALES_RECOMENDACION;
  const kwp = formatDecimal(paneles.kwpRequeridos);
  const ahorro = formatCOPMiles(paneles.ahorroMensualEstimado);

  if (consumoMensualKwh < u.consumoMinimoKwh) {
    return {
      veredicto: "por_ahora_no",
      motivo: `Tu consumo (${formatNumber(Math.round(consumoMensualKwh))} kWh al mes) es bajo, y un sistema solar tardaría demasiado en pagarse. Si tu consumo sube o cambia tu negocio, vuelve a calcular.`,
    };
  }
  if (paneles.ahorroPorcentual < u.ahorroMinimoFraccion * 100) {
    return {
      veredicto: "por_ahora_no",
      motivo: `El ahorro estimado sería de solo ${paneles.ahorroPorcentual} % de tu factura.`,
    };
  }

  const mejor = paneles.mejorOferta;
  if (!mejor && paneles.ofertas.some((o) => o.aplica)) {
    return {
      veredicto: "por_ahora_no",
      motivo: "Con los precios actuales, el ahorro no alcanzaría a pagar la inversión.",
    };
  }
  if (!mejor) {
    const enZona = paneles.ofertas.find((o) => o.cubreZona);
    return {
      veredicto: "sin_proveedores",
      motivo: enZona
        ? `Con tus datos, un sistema de unos ${kwp} kWp ahorraría cerca de ${ahorro} al mes, pero los proveedores que atienden tu zona todavía no instalan un sistema de ese tamaño.`
        : `Con tus datos, un sistema de unos ${kwp} kWp ahorraría cerca de ${ahorro} al mes, pero todavía no hay un proveedor que atienda tu región.`,
    };
  }

  const retornoAnios = paneles.retornoMeses === null ? Infinity : paneles.retornoMeses / 12;
  const presupuestoIngresado = paneles.finanzas?.origen === "cotizacion_usuario";
  const sistema = mejor.plan && !presupuestoIngresado
    ? `el ${mejor.plan.nombre} (${formatDecimal(mejor.plan.kwp)} kW)`
    : `un sistema de unos ${kwp} kWp`;
  const anios = Number.isFinite(retornoAnios) ? `${formatDecimal(retornoAnios)} años` : "más de 20 años";

  if (retornoAnios <= u.retornoConvieneAnios) {
    return {
      veredicto: "conviene",
      motivo: `Con tu consumo, ${sistema} ahorraría cerca de ${ahorro} al mes y se pagaría en unos ${anios} ${presupuestoIngresado ? "con el presupuesto que ingresaste" : `con ${mejor.proveedor}`}.`,
    };
  }
  if (retornoAnios <= u.retornoCompararAnios) {
    return {
      veredicto: "comparar",
      motivo: `Se pagaría en unos ${anios}. Pide cotizaciones y compara antes de decidir.`,
    };
  }
  return {
    veredicto: "por_ahora_no",
    motivo: Number.isFinite(retornoAnios) ? `Con estos supuestos, la inversión tardaría unos ${anios} en recuperarse.` : "Con estos supuestos, el saldo no recupera la inversión de forma sostenida en 20 años.",
  };
}

/**
 * Si el sistema propio no se recomienda pero un PPA aplica y ahorra, se
 * menciona como alternativa sin inversión.
 */
function decidirVeredicto(
  paneles: AlternativaResultado,
  consumoMensualKwh: number
): { veredicto: Veredicto; motivo: string } {
  const r = decidirVeredictoBase(paneles, consumoMensualKwh);
  const ppa = paneles.ofertas.some((o) => o.ppa && o.aplica && o.ahorroMensual > 0);
  if (r.veredicto === "por_ahora_no" && ppa) {
    return {
      ...r,
      motivo: `${r.motivo} El sistema propio tarda en pagarse, pero podrías ahorrar sin inversión con un PPA (por confirmar).`,
    };
  }
  return r;
}

export function calcularAhorro(
  input: AnalisisInput,
  sistemas?: CatalogoPanelSistema[]
): AnalisisResultado {
  const tarifaEstimada = TARIFA_COMERCIAL_COP_KWH;
  const { consumo, valor } = resolverConsumoYValor(input, tarifaEstimada);

  const ubicacion = resolverUbicacion(input);
  // Un negocio sin red necesita consumo real/estimado en kWh. Un monto de diésel
  // o una tarifa subsidiada no se convierten a kWh con la tarifa comercial urbana.
  if (input.negocio.conexion === "sin_red" && !input.recibo.consumoMensualKwh) {
    throw new Error("Para un negocio sin red, indica el consumo mensual estimado en kWh.");
  }
  const energia = orientarEnergia(input, consumo, ubicacion.hsp);
  const perfil = { departamento: input.negocio.departamento, solucion: energia.solucion, consumoMensualKwh: consumo };
  const proveedores = energia.conexion === "no_se" ? [] : buscarProveedores(perfil);
  const proveedoresComunitarios = energia.conexion === "sin_red" || input.negocio.zona === "apartada"
    ? buscarProveedores(perfil, undefined, true) : [];

  // En respaldo o sin red no se reutiliza un presupuesto sin baterías ni se
  // presenta un retorno de inversión como si la operación fuera conectada.
  const paneles: AlternativaResultado = energia.requiereEstudio ? {
    id: "paneles", nombre: energia.titulo, aplica: energia.potenciaSolarBaseKwp > 0,
    kwpRequeridos: Math.round(energia.potenciaSolarBaseKwp * 10) / 10,
    inversionEstimadaMin: 0, inversionEstimadaMax: 0, inversionBase: 0, ahorroMensualEstimado: 0,
    ahorroPorcentual: 0, retornoMeses: null, ahorro5Anios: 0, ahorro10Anios: 0,
    idealPara: [], fuentePrecio: "estimado", ofertas: [],
  } : calcularPaneles(input, consumo, valor, ubicacion.hsp, sistemas);
  const finanzas = calcularFinanzas(input, energia, valor, paneles);
  paneles.finanzas = finanzas;
  if (finanzas.proyeccion && finanzas.inversion !== null && finanzas.ahorroMensualBase !== null) {
    paneles.inversionBase = finanzas.inversion;
    paneles.inversionEstimadaMin = finanzas.inversionMin!;
    paneles.inversionEstimadaMax = finanzas.inversionMax!;
    paneles.ahorroMensualEstimado = finanzas.ahorroMensualBase;
    const gastoComparado = energia.conexion === "sin_red" ? input.negocio.finanzas?.costoEnergiaActualCOP ?? 0 : valor;
    paneles.ahorroPorcentual = gastoComparado > 0 ? Math.round(finanzas.ahorroMensualBase / gastoComparado * 100) : 0;
    paneles.retornoMeses = finanzas.proyeccion.retornoAnios === null ? null : finanzas.proyeccion.retornoAnios * 12;
    paneles.ahorro5Anios = finanzas.proyeccion.rows[5].netoAcumulado;
    paneles.ahorro10Anios = finanzas.proyeccion.rows[10].netoAcumulado;
  }
  let { veredicto, motivo } = energia.requiereEstudio
    ? { veredicto: "comparar" as Veredicto, motivo: energia.motivo }
    : decidirVeredicto(paneles, consumo);
  if (veredicto === "sin_proveedores" && proveedores.length > 0) {
    veredicto = "comparar";
    motivo = `El sistema base sería de unos ${formatDecimal(paneles.kwpRequeridos)} kWp. Hay proveedores para consultar, pero todavía no hay una cotización validada para tu negocio. La inversión y el retorno mostrados usan ${finanzas.origen === "cotizacion_usuario" ? "el presupuesto total que ingresaste" : "un presupuesto de referencia por tamaño"}.`;
  }
  if (!energia.requiereEstudio && !paneles.mejorOferta && (input.negocio.zona === "apartada" || input.negocio.zona === "rural")) {
    motivo += " En tu zona, el transporte y el soporte pueden cambiar el costo: pide una cotización hasta el predio.";
  }

  return {
    energia,
    proveedores,
    proveedoresComunitarios,
    ubicacion,
    cobertura: COBERTURA_POR_HORARIO[input.negocio.horario],
    consumoMensualKwh: Math.round(consumo),
    consumoEstimado: !input.recibo.consumoMensualKwh,
    valorEstimado: energia.conexion !== "sin_red" && !input.recibo.valorPagadoMensual,
    valorPagadoMensual: energia.conexion === "sin_red" ? 0 : Math.round(valor),
    tarifaEstimadaKwh: energia.conexion === "sin_red" ? 0 : tarifaEstimada,
    alternativas: [paneles],
    mejorAlternativaId: paneles.aplica ? paneles.id : null,
    veredicto,
    motivoVeredicto: motivo,
  };
}

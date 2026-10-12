import {
  COBERTURA_POR_HORARIO,
  COSTO_PANELES_POR_KWP,
  HORAS_SOL_PICO,
  MANTENIMIENTO_ANUAL,
  PERFORMANCE_RATIO,
  TARIFA_COMERCIAL_COP_KWH,
  UMBRALES_RECOMENDACION,
} from "@/lib/config/pricing";
import { formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import { calcularOfertas, elegirMejorOferta } from "./ofertas";
import type {
  AlternativaResultado,
  AnalisisInput,
  AnalisisResultado,
  Veredicto,
} from "./types";

const DIAS_MES = 30;

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
  valorPagadoMensual: number
): AlternativaResultado {
  const hsp = HORAS_SOL_PICO[input.negocio.region];

  // Sin baterías, los paneles solo cubren lo que el negocio consume de día.
  const cobertura = COBERTURA_POR_HORARIO[input.negocio.horario];
  const produccionDiariaObjetivoKwh = (consumoMensualKwh * cobertura) / DIAS_MES;
  const kwpRequeridos = produccionDiariaObjetivoKwh / (hsp * PERFORMANCE_RATIO);

  const ahorroMensual = Math.round(valorPagadoMensual * cobertura);

  const ofertas = calcularOfertas(kwpRequeridos, ahorroMensual, {
    region: input.negocio.region,
    departamento: input.negocio.departamento,
  });
  const mejorOferta = elegirMejorOferta(ofertas);

  // Los números principales salen del mejor proveedor; el costo genérico por
  // kWp solo se usa como respaldo cuando ningún proveedor aplica. Un plan fijo
  // más chico que lo necesario ahorra menos.
  const inversion = mejorOferta?.inversion ?? kwpRequeridos * COSTO_PANELES_POR_KWP;
  const ahorro = mejorOferta?.ahorroMensual ?? ahorroMensual;
  const ahorroAnualNeto = ahorro * 12 - inversion * MANTENIMIENTO_ANUAL;
  const retornoMeses = mejorOferta
    ? mejorOferta.retornoMeses
    : ahorroAnualNeto > 0
      ? (inversion / ahorroAnualNeto) * 12
      : null;

  return {
    id: "paneles",
    nombre: "Paneles solares",
    aplica: kwpRequeridos > 0,
    kwpRequeridos: Math.round(kwpRequeridos * 10) / 10,
    inversionEstimadaMin: Math.round(inversion * 0.9),
    inversionEstimadaMax: Math.round(inversion * (mejorOferta ? 1.1 : 1.15)),
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

function decidirVeredicto(
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

  const retornoAnios = mejor.retornoMeses! / 12;
  const sistema = mejor.plan
    ? `el ${mejor.plan.nombre} (${formatDecimal(mejor.plan.kwp)} kW)`
    : `un sistema de unos ${kwp} kWp`;
  const anios = `${formatDecimal(retornoAnios)} años`;

  if (retornoAnios <= u.retornoConvieneAnios) {
    return {
      veredicto: "conviene",
      motivo: `Con tu consumo, ${sistema} ahorraría cerca de ${ahorro} al mes y se pagaría en unos ${anios} con ${mejor.proveedor}.`,
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
    motivo: `Con los precios actuales, la inversión tardaría unos ${anios} en pagarse.`,
  };
}

export function calcularAhorro(input: AnalisisInput): AnalisisResultado {
  const tarifaEstimada = TARIFA_COMERCIAL_COP_KWH;
  const { consumo, valor } = resolverConsumoYValor(input, tarifaEstimada);

  const paneles = calcularPaneles(input, consumo, valor);
  const { veredicto, motivo } = decidirVeredicto(paneles, consumo);

  return {
    consumoMensualKwh: Math.round(consumo),
    valorPagadoMensual: Math.round(valor),
    tarifaEstimadaKwh: tarifaEstimada,
    alternativas: [paneles],
    mejorAlternativaId: paneles.aplica ? paneles.id : null,
    veredicto,
    motivoVeredicto: motivo,
  };
}

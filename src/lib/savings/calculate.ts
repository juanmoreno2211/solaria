import {
  COBERTURA_POR_HORARIO,
  COSTO_PANELES_POR_KWP,
  HORAS_SOL_PICO,
  MANTENIMIENTO_ANUAL,
  PERFORMANCE_RATIO,
  TARIFA_COMERCIAL_COP_KWH,
  UMBRALES_RECOMENDACION,
} from "@/lib/config/pricing";
import { buscarMejorPanelSistema } from "@/lib/catalog/lookup";
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

  const matchCatalogo = buscarMejorPanelSistema(kwpRequeridos, input.negocio.region);
  const costoPorKwp = matchCatalogo?.precioPorKwpCOP ?? COSTO_PANELES_POR_KWP;

  const inversion = Math.round(kwpRequeridos * costoPorKwp);
  const ahorroMensual = Math.round(valorPagadoMensual * cobertura);

  // Retorno = inversión ÷ (ahorro anual − mantenimiento anual).
  const ahorroAnualNeto = ahorroMensual * 12 - inversion * MANTENIMIENTO_ANUAL;
  const retornoMeses =
    ahorroAnualNeto > 0 ? Math.round((inversion / ahorroAnualNeto) * 12) : null;

  return {
    id: "paneles",
    nombre: "Paneles solares",
    aplica: kwpRequeridos > 0,
    kwpRequeridos: Math.round(kwpRequeridos * 10) / 10,
    inversionEstimadaMin: Math.round(inversion * 0.9),
    inversionEstimadaMax: Math.round(inversion * 1.15),
    ahorroMensualEstimado: ahorroMensual,
    ahorroPorcentual: Math.round(cobertura * 100),
    retornoMeses,
    ahorro5Anios: Math.round(ahorroAnualNeto * 5 - inversion),
    ahorro10Anios: Math.round(ahorroAnualNeto * 10 - inversion),
    idealPara: [
      "Negocios que gastan buena parte de su luz de día",
      "Facturas medias o altas",
      "Quienes buscan bajar el costo fijo de energía a largo plazo",
    ],
    fuentePrecio: matchCatalogo ? "catalogo" : "estimado",
    proveedorRecomendado: matchCatalogo
      ? {
          proveedor: matchCatalogo.proveedor,
          producto: matchCatalogo.nombreSistema,
          marca: matchCatalogo.marca,
          url: matchCatalogo.url,
          telefono: matchCatalogo.telefono,
        }
      : undefined,
  };
}

function decidirVeredicto(
  paneles: AlternativaResultado,
  consumoMensualKwh: number
): { veredicto: Veredicto; motivo: string } {
  const u = UMBRALES_RECOMENDACION;

  if (consumoMensualKwh < u.consumoMinimoKwh) {
    return {
      veredicto: "por_ahora_no",
      motivo: `Tu consumo (${Math.round(consumoMensualKwh)} kWh al mes) es bajo; con menos de ${u.consumoMinimoKwh} kWh la inversión tarda mucho en pagarse.`,
    };
  }
  if (paneles.ahorroPorcentual < u.ahorroMinimoFraccion * 100) {
    return {
      veredicto: "por_ahora_no",
      motivo: "El ahorro sobre tu factura sería pequeño para lo que cuesta instalar.",
    };
  }

  const retornoAnios =
    paneles.retornoMeses !== null ? paneles.retornoMeses / 12 : Infinity;

  if (retornoAnios <= u.retornoConvieneAnios) {
    return {
      veredicto: "conviene",
      motivo: `Recuperarías la inversión en menos de ${u.retornoConvieneAnios} años.`,
    };
  }
  if (retornoAnios <= u.retornoCompararAnios) {
    return {
      veredicto: "comparar",
      motivo: `Recuperarías la inversión en ${u.retornoConvieneAnios} a ${u.retornoCompararAnios} años; vale la pena comparar cotizaciones.`,
    };
  }
  return {
    veredicto: "por_ahora_no",
    motivo: `Recuperar la inversión tomaría más de ${u.retornoCompararAnios} años.`,
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

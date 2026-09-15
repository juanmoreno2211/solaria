import {
  COBERTURA_MAXIMA,
  COSTO_PANELES_POR_KWP,
  HORAS_SOL_PICO,
  ILUMINACION_SOLAR,
  PERFORMANCE_RATIO,
  REFRIGERACION_SOLAR,
  TARIFA_ESTIMADA_COP_KWH,
} from "@/lib/config/pricing";
import {
  buscarMejorIluminacion,
  buscarMejorPanelSistema,
  buscarMejorRefrigeracion,
} from "@/lib/catalog/lookup";
import type {
  AlternativaResultado,
  AnalisisInput,
  AnalisisResultado,
} from "./types";

const DIAS_MES = 30;

function estimarTarifaKwh(predio: AnalisisInput["predio"]): number {
  if (predio.conexionRed === "zona_no_interconectada") {
    return TARIFA_ESTIMADA_COP_KWH.rural_zni;
  }
  if (predio.tipoPredio === "negocio") {
    return predio.esComercialOIndustrial === "industrial"
      ? TARIFA_ESTIMADA_COP_KWH.industrial
      : TARIFA_ESTIMADA_COP_KWH.comercial;
  }
  if (predio.tipoPredio === "finca") {
    return TARIFA_ESTIMADA_COP_KWH.estrato3;
  }
  const estrato = predio.estrato ?? 3;
  const key = `estrato${estrato}` as keyof typeof TARIFA_ESTIMADA_COP_KWH;
  return TARIFA_ESTIMADA_COP_KWH[key] ?? TARIFA_ESTIMADA_COP_KWH.estrato3;
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
  valorPagadoMensual: number
): AlternativaResultado {
  const hsp = HORAS_SOL_PICO[input.predio.region];

  // kWp necesarios para cubrir el consumo mensual, limitado a una cobertura máxima realista.
  const produccionDiariaObjetivoKwh =
    (consumoMensualKwh * COBERTURA_MAXIMA) / DIAS_MES;
  const kwpRequeridos = produccionDiariaObjetivoKwh / (hsp * PERFORMANCE_RATIO);

  const matchCatalogo = buscarMejorPanelSistema(kwpRequeridos, input.predio.region);
  const costoPorKwp =
    matchCatalogo?.precioPorKwpCOP ??
    (input.predio.conexionRed === "zona_no_interconectada"
      ? COSTO_PANELES_POR_KWP.zona_no_interconectada
      : COSTO_PANELES_POR_KWP.interconectado);

  const inversion = Math.round(kwpRequeridos * costoPorKwp);
  const produccionMensualKwh =
    kwpRequeridos * hsp * PERFORMANCE_RATIO * DIAS_MES;
  const cobertura = Math.min(
    COBERTURA_MAXIMA,
    consumoMensualKwh > 0 ? produccionMensualKwh / consumoMensualKwh : 0
  );

  const ahorroMensual = Math.round(valorPagadoMensual * cobertura);
  const retornoMeses =
    ahorroMensual > 0 ? Math.round(inversion / ahorroMensual) : null;

  return {
    id: "paneles",
    nombre: "Paneles solares",
    aplica: kwpRequeridos > 0,
    inversionEstimadaMin: Math.round(inversion * 0.9),
    inversionEstimadaMax: Math.round(inversion * 1.15),
    ahorroMensualEstimado: ahorroMensual,
    ahorroPorcentual: Math.round(cobertura * 100),
    retornoMeses,
    ahorro5Anios: ahorroMensual * 60 - inversion,
    ahorro10Anios: ahorroMensual * 120 - inversion,
    idealPara: [
      "Consumos medios o altos y factura elevada",
      "Quienes buscan el mayor ahorro a largo plazo",
      input.predio.conexionRed === "zona_no_interconectada"
        ? "Predios sin conexión a la red interconectada"
        : "Casas y negocios conectados a la red",
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

function calcularIluminacion(
  input: AnalisisInput,
  valorPagadoMensual: number
): AlternativaResultado {
  const { tipoPredio, interesIluminacionExterior, puntosIluminacionAprox } =
    input.predio;
  const puntos =
    puntosIluminacionAprox ??
    ILUMINACION_SOLAR.puntosSugeridos[tipoPredio];
  const matchCatalogo = buscarMejorIluminacion(input.predio.region);
  const costoPorPunto =
    matchCatalogo?.precioPorUnidadCOP ??
    ILUMINACION_SOLAR.costoPromedioPorPunto;
  const inversion = Math.round(puntos * costoPorPunto);
  const fraccion =
    ILUMINACION_SOLAR.fraccionConsumoIluminacionExterior[tipoPredio];
  const ahorroMensual = Math.round(valorPagadoMensual * fraccion);
  const retornoMeses =
    ahorroMensual > 0 ? Math.round(inversion / ahorroMensual) : null;

  return {
    id: "iluminacion",
    nombre: "Iluminación solar (linternas y decorativos)",
    aplica: interesIluminacionExterior,
    motivoNoAplica: interesIluminacionExterior
      ? undefined
      : "No marcaste interés en iluminación exterior o decorativa.",
    inversionEstimadaMin: Math.round(inversion * 0.85),
    inversionEstimadaMax: Math.round(inversion * 1.2),
    ahorroMensualEstimado: ahorroMensual,
    ahorroPorcentual: Math.round(fraccion * 100),
    retornoMeses,
    ahorro5Anios: ahorroMensual * 60 - inversion,
    ahorro10Anios: ahorroMensual * 120 - inversion,
    idealPara: [
      "Iluminación exterior, fachadas y zonas comunes",
      "Zonas rurales o con cortes frecuentes de energía",
      "Inversión inicial baja y resultados inmediatos",
    ],
    fuentePrecio: matchCatalogo ? "catalogo" : "estimado",
    proveedorRecomendado: matchCatalogo
      ? {
          proveedor: matchCatalogo.proveedor,
          producto: matchCatalogo.nombre,
          marca: matchCatalogo.marca,
          url: matchCatalogo.url,
          telefono: matchCatalogo.telefono,
        }
      : undefined,
  };
}

function calcularRefrigeracion(
  input: AnalisisInput,
  valorPagadoMensual: number
): AlternativaResultado {
  const { tieneRefrigeracionCritica, tamanoRefrigeracion } = input.predio;
  const tamano = tamanoRefrigeracion ?? "media";
  const fraccion = REFRIGERACION_SOLAR.fraccionConsumoPorTamano[tamano];
  const litrosEstimados =
    tamano === "pequena" ? 150 : tamano === "grande" ? 800 : 400;
  const matchCatalogo = buscarMejorRefrigeracion(
    litrosEstimados,
    input.predio.region
  );
  const inversion =
    matchCatalogo?.precioCOP ??
    Math.round(
      REFRIGERACION_SOLAR.costoBase +
        litrosEstimados * REFRIGERACION_SOLAR.costoPorLitroCapacidad
    );
  const ahorroMensual = Math.round(valorPagadoMensual * fraccion);
  const retornoMeses =
    ahorroMensual > 0 ? Math.round(inversion / ahorroMensual) : null;

  return {
    id: "refrigeracion",
    nombre: "Refrigeración solar (cadena de frío)",
    aplica: tieneRefrigeracionCritica,
    motivoNoAplica: tieneRefrigeracionCritica
      ? undefined
      : "No indicaste que tengas neveras o refrigeración crítica que proteger.",
    inversionEstimadaMin: Math.round(inversion * 0.9),
    inversionEstimadaMax: Math.round(inversion * 1.25),
    ahorroMensualEstimado: ahorroMensual,
    ahorroPorcentual: Math.round(fraccion * 100),
    retornoMeses,
    ahorro5Anios: ahorroMensual * 60 - inversion,
    ahorro10Anios: ahorroMensual * 120 - inversion,
    idealPara: [
      "Negocios y fincas con neveras, lácteos, vacunas o alimentos",
      "Zonas con cortes de luz frecuentes",
      "Evitar pérdidas de inventario por daño de la cadena de frío",
    ],
    fuentePrecio: matchCatalogo ? "catalogo" : "estimado",
    proveedorRecomendado: matchCatalogo
      ? {
          proveedor: matchCatalogo.proveedor,
          producto: matchCatalogo.nombre,
          marca: matchCatalogo.marca,
          url: matchCatalogo.url,
          telefono: matchCatalogo.telefono,
        }
      : undefined,
  };
}

export function calcularAhorro(input: AnalisisInput): AnalisisResultado {
  const tarifaEstimada = estimarTarifaKwh(input.predio);
  const { consumo, valor } = resolverConsumoYValor(input, tarifaEstimada);

  const paneles = calcularPaneles(input, consumo, valor);
  const iluminacion = calcularIluminacion(input, valor);
  const refrigeracion = calcularRefrigeracion(input, valor);

  const alternativas = [paneles, iluminacion, refrigeracion];
  const aplicables = alternativas.filter((a) => a.aplica);

  const mejorAlternativa = aplicables.reduce<AlternativaResultado | null>(
    (mejor, actual) =>
      !mejor || actual.ahorroMensualEstimado > mejor.ahorroMensualEstimado
        ? actual
        : mejor,
    null
  );

  // Las alternativas pueden compartir la misma carga (p. ej. los paneles ya
  // cubren la iluminación y la refrigeración), así que no se pueden sumar los
  // pesos ahorrados directamente: se combina por fracción de la factura y se
  // limita a la cobertura máxima realista para no "ahorrar" más de lo que se paga.
  const fraccionCombinada = Math.min(
    COBERTURA_MAXIMA,
    aplicables.reduce((sum, a) => sum + a.ahorroPorcentual / 100, 0)
  );
  const ahorroCombinadoPorcentual = Math.round(fraccionCombinada * 100);
  const ahorroCombinadoMensual = Math.round(valor * fraccionCombinada);

  return {
    consumoMensualKwh: Math.round(consumo),
    valorPagadoMensual: Math.round(valor),
    tarifaEstimadaKwh: tarifaEstimada,
    alternativas,
    mejorAlternativaId: mejorAlternativa?.id ?? null,
    ahorroCombinadoMensual,
    ahorroCombinadoPorcentual,
  };
}

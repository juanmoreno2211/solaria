import { AI_MODEL, getAnthropicClient, isAiConfigured } from "./client";
import type { AnalisisInput, AnalisisResultado } from "@/lib/savings/types";
import { formatCOP } from "@/lib/format";

const PROMPT_SISTEMA = `Eres un asesor experto en energía solar en Colombia, cercano y claro.
Recibes datos de consumo eléctrico de un cliente y los resultados de un cálculo de ahorro con distintas
alternativas de energía solar (paneles, iluminación solar, refrigeración solar). Escribe una recomendación
personalizada en español, en un tono cercano y profesional, de máximo 4 frases, en texto plano (sin markdown,
sin listas). Explica cuál alternativa conviene más según su caso y por qué, y menciona brevemente si combinar
alternativas tiene sentido, teniendo en cuenta que si la alternativa principal ya cubre casi toda la
factura, combinarla con otras no suma mucho ahorro adicional (aunque sí puede dar respaldo ante cortes de
energía). No inventes cifras que no te dieron.`;

function construirResumenParaIA(
  input: AnalisisInput,
  resultado: AnalisisResultado
): string {
  const aplicables = resultado.alternativas.filter((a) => a.aplica);
  const lineas = aplicables.map((a) => {
    const proveedor = a.proveedorRecomendado
      ? ` Proveedor real disponible: ${a.proveedorRecomendado.producto}${
          a.proveedorRecomendado.marca ? ` (${a.proveedorRecomendado.marca})` : ""
        } de ${a.proveedorRecomendado.proveedor}.`
      : "";
    return `- ${a.nombre}: inversión ${formatCOP(a.inversionEstimadaMin)}-${formatCOP(
      a.inversionEstimadaMax
    )}, ahorro mensual ${formatCOP(a.ahorroMensualEstimado)} (${a.ahorroPorcentual}%), retorno ${a.retornoMeses ?? "N/D"} meses.${proveedor}`;
  });

  return `Tipo de predio: ${input.predio.tipoPredio}. Región: ${input.predio.region}. Conexión: ${input.predio.conexionRed}.
Consumo mensual: ${resultado.consumoMensualKwh} kWh. Valor pagado: ${formatCOP(resultado.valorPagadoMensual)}.
Alternativas aplicables:
${lineas.join("\n")}`;
}

function generarInsightPlantilla(
  input: AnalisisInput,
  resultado: AnalisisResultado
): string {
  const mejor = resultado.alternativas.find(
    (a) => a.id === resultado.mejorAlternativaId
  );

  if (!mejor) {
    return "Cuéntanos un poco más sobre tu casa, negocio o finca (iluminación exterior o refrigeración) para poder recomendarte la mejor combinación de energía solar.";
  }

  const otras = resultado.alternativas.filter(
    (a) => a.aplica && a.id !== mejor.id
  );

  let texto = `Con un consumo de ${resultado.consumoMensualKwh} kWh al mes, la alternativa con mayor impacto para ti es ${mejor.nombre.toLowerCase()}, con un ahorro estimado de ${formatCOP(
    mejor.ahorroMensualEstimado
  )} al mes (${mejor.ahorroPorcentual}%) y un retorno de inversión cercano a ${mejor.retornoMeses ?? "varios"} meses.`;

  if (mejor.proveedorRecomendado) {
    texto += ` Para tu caso, ${mejor.proveedorRecomendado.proveedor} tiene disponible ${mejor.proveedorRecomendado.producto}${
      mejor.proveedorRecomendado.marca ? ` (${mejor.proveedorRecomendado.marca})` : ""
    } a ese precio.`;
  }

  const margenCombinado =
    resultado.ahorroCombinadoPorcentual - mejor.ahorroPorcentual;

  if (otras.length > 0 && margenCombinado >= 3) {
    texto += ` Además, podrías combinarla con ${otras
      .map((a) => a.nombre.toLowerCase())
      .join(" y ")} para llevar tu ahorro total a cerca del ${
      resultado.ahorroCombinadoPorcentual
    }% de tu factura.`;
  } else if (otras.length > 0) {
    texto += ` Como ${mejor.nombre.toLowerCase()} ya cubre la mayor parte de tu consumo, ${otras
      .map((a) => a.nombre.toLowerCase())
      .join(" y ")} suman poco ahorro adicional, pero te dan respaldo si hay cortes de energía.`;
  }

  if (input.predio.conexionRed === "zona_no_interconectada") {
    texto += " Como tu predio no está conectado a la red interconectada, el beneficio también incluye independencia energética y menos dependencia de plantas o combustible.";
  }

  return texto;
}

export async function generarRecomendacion(
  input: AnalisisInput,
  resultado: AnalisisResultado
): Promise<string> {
  if (!isAiConfigured()) {
    return generarInsightPlantilla(input, resultado);
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 300,
      system: PROMPT_SISTEMA,
      messages: [
        {
          role: "user",
          content: construirResumenParaIA(input, resultado),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (textBlock && textBlock.type === "text" && textBlock.text.trim()) {
      return textBlock.text.trim();
    }
    return generarInsightPlantilla(input, resultado);
  } catch {
    return generarInsightPlantilla(input, resultado);
  }
}

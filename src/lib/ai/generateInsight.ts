import { AI_MODEL, getAnthropicClient, isAiConfigured } from "./client";
import type { AnalisisInput, AnalisisResultado } from "@/lib/savings/types";
import { formatCOP, formatCOPMiles, formatDecimal } from "@/lib/format";

export interface Recomendacion {
  texto: string;
  fuente: "ia" | "plantilla";
}

const PROMPT_SISTEMA = `Eres parte de SolarIA, una calculadora de ahorro solar para micronegocios en Colombia.
Recibes los datos de un negocio y el resultado de un cálculo de ahorro con paneles solares, hecho con
código. Redacta en español, en tono cercano y claro, máximo 4 frases, en texto plano (sin markdown ni
listas), una explicación del resultado para el dueño del negocio. Respeta el veredicto que te dan; no lo
cambies. Los proveedores son de ejemplo: no los presentes como empresas reales. Usa solo las cifras que
te dan: no inventes, redondees de otra forma ni calcules cifras nuevas. No prometas que tendrá luz
durante los cortes: sin baterías, los paneles solo bajan la factura.`;

const HORARIO_TEXTO = {
  dia: "de día",
  dia_noche: "de día y de noche",
  "24h": "24 horas",
} as const;

function construirResumenParaIA(
  input: AnalisisInput,
  resultado: AnalisisResultado
): string {
  const p = resultado.alternativas[0];
  const ofertas = p.ofertas
    .map((o) =>
      o.aplica
        ? `- ${o.proveedor}: inversión ${formatCOPMiles(o.inversion)}, se paga en ${
            o.retornoMeses ? `${formatDecimal(o.retornoMeses / 12)} años` : "N/D"
          }${
            o.financiacion
              ? `, cuota de ${formatCOPMiles(o.financiacion.cuotaMensual)} durante ${o.financiacion.plazoMeses} meses`
              : ""
          }.`
        : `- ${o.proveedor}: no aplica (${o.motivoNoAplica})`
    )
    .join("\n");

  return `Tipo de negocio: ${input.negocio.tipoNegocio}. Región: ${input.negocio.region}. Trabaja ${
    HORARIO_TEXTO[input.negocio.horario]
  }. La luz falla por: ${input.negocio.fallaLuz}.
Consumo mensual: ${resultado.consumoMensualKwh} kWh. Valor pagado: ${formatCOP(resultado.valorPagadoMensual)}.
Sistema de paneles: ${formatDecimal(p.kwpRequeridos)} kWp, ahorro mensual ${formatCOPMiles(
    p.ahorroMensualEstimado
  )} (${p.ahorroPorcentual}% de la factura).
Proveedores (de ejemplo):
${ofertas || "- ninguno"}
Veredicto: ${resultado.veredicto}. Motivo: ${resultado.motivoVeredicto}`;
}

export async function generarRecomendacion(
  input: AnalisisInput,
  resultado: AnalisisResultado
): Promise<Recomendacion> {
  // La plantilla es el motivo del veredicto, que ya trae las cifras calculadas.
  const plantilla: Recomendacion = {
    texto: resultado.motivoVeredicto,
    fuente: "plantilla",
  };

  if (!isAiConfigured()) return plantilla;

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
      return { texto: textBlock.text.trim(), fuente: "ia" };
    }
    return plantilla;
  } catch {
    return plantilla;
  }
}

import { AI_MODEL, getAnthropicClient, isAiConfigured } from "./client";
import type { ReciboInput } from "@/lib/savings/types";

export interface ExtraccionRecibo {
  disponible: boolean;
  mensaje?: string;
  datos: Partial<ReciboInput>;
}

const PROMPT_SISTEMA = `Eres un asistente que extrae datos de recibos de energía eléctrica de Colombia a partir de una foto.
Responde ÚNICAMENTE con un objeto JSON (sin texto adicional, sin markdown) con esta forma exacta:
{
  "consumoMensualKwh": number | null,
  "valorPagadoMensual": number | null,
  "periodoFacturado": string | null,
  "ciudad": string | null,
  "confianzaExtraccion": "alta" | "media" | "baja"
}
Si no logras leer un campo con certeza, usa null en ese campo. No inventes valores.`;

type SupportedMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function mediaTypeFromFilename(filename: string): SupportedMediaType {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

export async function extraerDatosRecibo(
  imageBase64: string,
  filename: string
): Promise<ExtraccionRecibo> {
  if (!isAiConfigured()) {
    return {
      disponible: false,
      mensaje:
        "La lectura automática de recibos con IA está en modo demo (falta configurar ANTHROPIC_API_KEY). Completa los campos manualmente para continuar.",
      datos: {},
    };
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      system: PROMPT_SISTEMA,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaTypeFromFilename(filename),
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extrae los datos de este recibo de energía según el formato indicado.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("La IA no devolvió texto.");
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se encontró JSON en la respuesta.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      disponible: true,
      datos: {
        consumoMensualKwh: parsed.consumoMensualKwh ?? null,
        valorPagadoMensual: parsed.valorPagadoMensual ?? null,
        periodoFacturado: parsed.periodoFacturado ?? null,
        ciudad: parsed.ciudad ?? null,
        confianzaExtraccion: parsed.confianzaExtraccion ?? "baja",
      },
    };
  } catch {
    return {
      disponible: false,
      mensaje:
        "No pudimos leer automáticamente este recibo. Completa los campos manualmente.",
      datos: {},
    };
  }
}

import { ApiError, GoogleGenAI } from "@google/genai";
import {
  validarDatosRecibo,
  validarImagenRecibo,
  type LecturaRecibo,
} from "./receipt";

const MODELO_POR_DEFECTO = "gemini-3.5-flash-lite";

const INSTRUCCIONES = `Lees fotos de recibos de energía eléctrica de Colombia.
Devuelve:
- consumoMensualKwh: la energía consumida en el periodo facturado, en kWh (no el promedio histórico).
- valorPagadoMensual: el total a pagar del periodo, en pesos colombianos, como número sin puntos ni signos.
  En Colombia el punto separa miles: "$ 760.000" es 760000.
- periodoFacturado: el periodo tal como aparece en el recibo.
- ciudad: el municipio del servicio.
- confianza: "alta", "media" o "baja" según qué tan legible está el recibo.
Si no lees un dato con certeza, usa null. No inventes ni estimes valores.`;

const ESQUEMA = {
  type: "object",
  properties: {
    consumoMensualKwh: { type: ["number", "null"], description: "kWh del periodo facturado" },
    valorPagadoMensual: { type: ["number", "null"], description: "Total a pagar en COP" },
    periodoFacturado: { type: ["string", "null"] },
    ciudad: { type: ["string", "null"] },
    confianza: { type: "string", enum: ["alta", "media", "baja"] },
  },
  required: [
    "consumoMensualKwh",
    "valorPagadoMensual",
    "periodoFacturado",
    "ciudad",
    "confianza",
  ],
};

const FALLO = "No pudimos leer la foto. Escribe tu consumo y el valor de tu recibo.";

let cliente: GoogleGenAI | null = null;

export function lecturaReciboConfigurada(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Lee consumo, valor, periodo y ciudad de la foto de un recibo con Gemini.
 * Nunca lanza: ante cualquier fallo devuelve { disponible: false, mensaje }.
 * No registra ni guarda la imagen ni la llave.
 */
export async function extraerDatosRecibo(
  imagen: Buffer,
  tipo: string
): Promise<LecturaRecibo> {
  if (!lecturaReciboConfigurada()) {
    return { disponible: false, mensaje: "La lectura de fotos no está disponible. Escribe tu consumo y el valor de tu recibo." };
  }
  const errorImagen = validarImagenRecibo(tipo, imagen.byteLength);
  if (errorImagen) return { disponible: false, mensaje: errorImagen };

  try {
    cliente ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const respuesta = await cliente.models.generateContent({
      model: process.env.GEMINI_MODEL || MODELO_POR_DEFECTO,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: tipo, data: imagen.toString("base64") } },
            { text: "Extrae los datos de este recibo." },
          ],
        },
      ],
      config: {
        systemInstruction: INSTRUCCIONES,
        responseMimeType: "application/json",
        responseJsonSchema: ESQUEMA,
        temperature: 0,
      },
    });

    const datos = validarDatosRecibo(JSON.parse(respuesta.text ?? ""));
    if (!datos || (datos.consumoMensualKwh === null && datos.valorPagadoMensual === null)) {
      return { disponible: false, mensaje: FALLO };
    }
    return { disponible: true, datos };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      console.warn("[leer-recibo] límite de uso de Gemini (429)");
      return {
        disponible: false,
        mensaje: "La lectura de fotos llegó a su límite de uso por ahora. Escribe tu consumo y el valor de tu recibo.",
      };
    }
    // Solo el estado: el error podría incluir partes de la solicitud.
    console.warn(
      "[leer-recibo] falló la lectura",
      error instanceof ApiError ? error.status : (error as Error)?.name
    );
    return { disponible: false, mensaje: FALLO };
  }
}

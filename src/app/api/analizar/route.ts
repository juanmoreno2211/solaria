import { NextRequest, NextResponse } from "next/server";
import { extraerDatosRecibo } from "@/lib/ai/extractReceipt";
import { generarRecomendacion } from "@/lib/ai/generateInsight";
import { calcularAhorro } from "@/lib/savings/calculate";
import type { AnalisisInput, PredioInput, ReciboInput } from "@/lib/savings/types";

export const runtime = "nodejs";

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fuente = (formData.get("fuente") as string) === "foto" ? "foto" : "manual";
    const imageFile = formData.get("recibo") as File | null;

    let recibo: ReciboInput = {
      fuente,
      consumoMensualKwh: toNumberOrNull(formData.get("consumoMensualKwh")),
      valorPagadoMensual: toNumberOrNull(formData.get("valorPagadoMensual")),
    };

    let extraccionMensaje: string | undefined;

    if (fuente === "foto" && imageFile && imageFile.size > 0) {
      const bytes = Buffer.from(await imageFile.arrayBuffer());
      const base64 = bytes.toString("base64");
      const extraccion = await extraerDatosRecibo(base64, imageFile.name);
      extraccionMensaje = extraccion.mensaje;

      if (extraccion.disponible) {
        recibo = {
          ...recibo,
          consumoMensualKwh:
            extraccion.datos.consumoMensualKwh ?? recibo.consumoMensualKwh,
          valorPagadoMensual:
            extraccion.datos.valorPagadoMensual ?? recibo.valorPagadoMensual,
          periodoFacturado: extraccion.datos.periodoFacturado ?? null,
          ciudad: extraccion.datos.ciudad ?? null,
          confianzaExtraccion: extraccion.datos.confianzaExtraccion ?? null,
        };
      }
    }

    if (!recibo.consumoMensualKwh && !recibo.valorPagadoMensual) {
      return NextResponse.json(
        {
          error:
            "Necesitamos al menos el consumo en kWh o el valor pagado del recibo para poder calcular tu ahorro.",
        },
        { status: 400 }
      );
    }

    const predio: PredioInput = {
      tipoPredio: (formData.get("tipoPredio") as PredioInput["tipoPredio"]) || "casa",
      estrato: toNumberOrNull(formData.get("estrato")) as PredioInput["estrato"] | undefined,
      esComercialOIndustrial:
        (formData.get("esComercialOIndustrial") as PredioInput["esComercialOIndustrial"]) ||
        undefined,
      region: (formData.get("region") as PredioInput["region"]) || "andina",
      conexionRed:
        (formData.get("conexionRed") as PredioInput["conexionRed"]) ||
        "interconectado",
      tieneRefrigeracionCritica: formData.get("tieneRefrigeracionCritica") === "true",
      tamanoRefrigeracion:
        (formData.get("tamanoRefrigeracion") as PredioInput["tamanoRefrigeracion"]) ||
        undefined,
      interesIluminacionExterior:
        formData.get("interesIluminacionExterior") === "true",
      puntosIluminacionAprox:
        toNumberOrNull(formData.get("puntosIluminacionAprox")) ?? undefined,
    };

    const analisisInput: AnalisisInput = { recibo, predio };
    const resultado = calcularAhorro(analisisInput);
    const recomendacion = await generarRecomendacion(analisisInput, resultado);

    return NextResponse.json({
      resultado,
      recomendacion,
      recibo,
      avisoExtraccion: extraccionMensaje,
    });
  } catch (error) {
    console.error("Error en /api/analizar", error);
    return NextResponse.json(
      { error: "Ocurrió un error al analizar tu información. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

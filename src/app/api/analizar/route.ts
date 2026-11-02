import { NextRequest, NextResponse } from "next/server";
import { generarRecomendacion } from "@/lib/ai/generateInsight";
import catalogoJson from "@/lib/catalog/data/catalogo.json";
import type { CatalogoData } from "@/lib/catalog/types";
import { calcularAhorro } from "@/lib/savings/calculate";
import { validarAnalisis } from "@/lib/savings/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const validacion = validarAnalisis(formData);
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error }, { status: 400 });
    }
    const analisisInput = validacion.input;
    // Solo en desarrollo: ?simulados=1 en la página muestra únicamente los
    // proveedores de ejemplo (para probar la comparación y, en una región que
    // no cubren, el estado "sin proveedores").
    const soloSimulados =
      process.env.NODE_ENV !== "production" && formData.get("simulados") === "1";
    const resultado = calcularAhorro(
      analisisInput,
      soloSimulados
        ? (catalogoJson as CatalogoData).paneles.filter((p) => p.estadoDatos === "simulado")
        : undefined
    );

    return NextResponse.json({
      resultado,
      recomendacion: generarRecomendacion(resultado),
    });
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error en /api/analizar", error);
    return NextResponse.json(
      { error: "Ocurrió un error al analizar tu información. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
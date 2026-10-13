import { NextRequest, NextResponse } from "next/server";
import { generarRecomendacion } from "@/lib/ai/generateInsight";
import catalogoJson from "@/lib/catalog/data/catalogo.json";
import type { CatalogoData } from "@/lib/catalog/types";
import { DEPARTAMENTOS } from "@/lib/config/pricing";
import { calcularAhorro } from "@/lib/savings/calculate";
import type {
  AnalisisInput,
  CargaCritica,
  NegocioInput,
  ReciboInput,
} from "@/lib/savings/types";

export const runtime = "nodejs";

function toPositivo(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Solo números ya confirmados por el usuario: la foto se lee antes, en /api/leer-recibo.
    const recibo: ReciboInput = {
      fuente: formData.get("fuente") === "foto" ? "foto" : "manual",
      consumoMensualKwh: toPositivo(formData.get("consumoMensualKwh")),
      valorPagadoMensual: toPositivo(formData.get("valorPagadoMensual")),
    };

    if (!recibo.consumoMensualKwh && !recibo.valorPagadoMensual) {
      return NextResponse.json(
        {
          error:
            "Necesitamos al menos el consumo en kWh o el valor pagado del recibo para poder calcular tu ahorro.",
        },
        { status: 400 }
      );
    }

    const region = (formData.get("region") as NegocioInput["region"]) || "andina";
    const departamento = formData.get("departamento");

    const negocio: NegocioInput = {
      tipoNegocio:
        (formData.get("tipoNegocio") as NegocioInput["tipoNegocio"]) || "otro",
      region,
      // Solo departamentos conocidos de la región: deciden si se muestra la nota de cobertura.
      departamento:
        typeof departamento === "string" && DEPARTAMENTOS[region]?.includes(departamento)
          ? departamento
          : undefined,
      cargasCriticas: formData.getAll("cargasCriticas") as CargaCritica[],
      horario: (formData.get("horario") as NegocioInput["horario"]) || "dia",
      fallaLuz: (formData.get("fallaLuz") as NegocioInput["fallaLuz"]) || undefined,
      legalmenteConstituido:
        (formData.get("legalmenteConstituido") as NegocioInput["legalmenteConstituido"]) ||
        undefined,
    };

    const analisisInput: AnalisisInput = { recibo, negocio };
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
    console.error("Error en /api/analizar", error);
    return NextResponse.json(
      { error: "Ocurrió un error al analizar tu información. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

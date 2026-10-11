import { NextRequest, NextResponse } from "next/server";
import catalogoJson from "@/lib/catalog/data/catalogo.json";
import type { CatalogoData } from "@/lib/catalog/types";
import { validarSolicitante, type SolicitudCotizacionInput } from "@/lib/cotizacion";

export const runtime = "nodejs";

const catalogo = catalogoJson as CatalogoData;

function texto(valor: unknown, max = 120): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: SolicitudCotizacionInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const sistema = catalogo.paneles.find((p) => p.proveedor === body?.proveedor);
  if (!sistema) {
    return NextResponse.json({ error: "Ese proveedor no existe." }, { status: 400 });
  }

  const solicitante = {
    nombre: texto(body.solicitante?.nombre, 100),
    telefono: texto(body.solicitante?.telefono, 30),
    municipio: texto(body.solicitante?.municipio, 100),
  };
  const errores = validarSolicitante(
    { ...solicitante, consentimiento: body.consentimiento === true },
    sistema.proveedor
  );
  if (Object.keys(errores).length > 0) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario.", errores },
      { status: 400 }
    );
  }

  const registro = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    sessionId: texto(body.sessionId, 64),
    proveedor: sistema.proveedor,
    esSimulado: sistema.esSimulado ?? false,
    solicitante,
    consentimiento: true,
    negocio: body.negocio,
    estimado: body.estimado,
    estado: "nueva",
  };

  console.info("[cotizaciones] solicitud recibida", registro.id, registro.proveedor);

  return NextResponse.json({ id: registro.id }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { extraerDatosRecibo } from "@/lib/ai/extractReceipt";
import { validarImagenRecibo } from "@/lib/ai/receipt";

export const runtime = "nodejs";

/** Recibe solo la foto del recibo y devuelve los datos leídos. No la guarda. */
export async function POST(req: NextRequest) {
  let foto: FormDataEntryValue | null;
  try {
    foto = (await req.formData()).get("recibo");
  } catch {
    return NextResponse.json(
      { disponible: false, mensaje: "No recibimos la foto." },
      { status: 400 }
    );
  }

  if (!(foto instanceof File)) {
    return NextResponse.json(
      { disponible: false, mensaje: "No recibimos la foto." },
      { status: 400 }
    );
  }

  const error = validarImagenRecibo(foto.type, foto.size);
  if (error) {
    return NextResponse.json({ disponible: false, mensaje: error }, { status: 400 });
  }

  const lectura = await extraerDatosRecibo(Buffer.from(await foto.arrayBuffer()), foto.type);
  return NextResponse.json(lectura);
}

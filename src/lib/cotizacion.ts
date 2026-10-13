import type { TipoOferta } from "@/lib/catalog/types";
import type { NegocioInput } from "@/lib/savings/types";

/** Lo que el navegador envía a POST /api/cotizaciones. */
export interface SolicitudCotizacionInput {
  sessionId?: string;
  proveedor: string;
  /** Plan pedido, si el proveedor vende por planes. */
  plan?: string;
  /** Oferta pedida, si el proveedor tiene varias (EPC o PPA). */
  oferta?: TipoOferta;
  solicitante: { nombre: string; telefono: string; municipio: string };
  consentimiento: boolean;
  negocio: {
    tipo: NegocioInput["tipoNegocio"];
    region: NegocioInput["region"];
    departamento: string;
    horario: NegocioInput["horario"];
    noPuedeFallar: NegocioInput["cargasCriticas"];
    comoFalla: string;
    constituido: string;
  };
  estimado: {
    consumoKwh: number;
    valorFactura: number;
    kwp: number;
    ahorroMensual: number;
    inversion: number;
    retornoMeses: number | null;
  };
}

export type ErroresSolicitante = Partial<
  Record<"nombre" | "telefono" | "municipio" | "consentimiento", string>
>;

/** Validación compartida por el formulario y el servidor. */
export function validarSolicitante(
  datos: { nombre: string; telefono: string; municipio: string; consentimiento: boolean },
  proveedor: string
): ErroresSolicitante {
  const errores: ErroresSolicitante = {};
  if (!datos.nombre.trim()) errores.nombre = "Escribe tu nombre.";
  if (datos.telefono.replace(/\D/g, "").length < 7)
    errores.telefono = "Escribe un celular o WhatsApp de al menos 7 dígitos.";
  if (!datos.municipio.trim())
    errores.municipio = "Escribe el municipio donde está tu negocio.";
  if (!datos.consentimiento)
    errores.consentimiento = `Marca la autorización para que podamos compartir tus datos con ${proveedor}.`;
  return errores;
}

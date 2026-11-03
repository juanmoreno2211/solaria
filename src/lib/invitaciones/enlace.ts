/** Enlace, mensaje de WhatsApp y ruta de registro de una invitación. */

export function enlaceInvitacion(origen: string, codigo: string): string {
  return `${origen.replace(/\/+$/, "")}/i/${codigo}`;
}

export function mensajeInvitacion(enlace: string): string {
  return `Hola, estoy usando SolarIA Control para ver en qué gasta más energía mi negocio y dónde ahorrar. Es gratis. Mira el tuyo aquí: ${enlace}`;
}

/** wa.me sin número: WhatsApp deja elegir a quién mandarlo. */
export function enlaceWhatsApp(enlace: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensajeInvitacion(enlace))}`;
}

/** /ingresar en modo registro, conservando el código para atribuir la cuenta. */
export function rutaRegistroConInvitacion(codigo: string): string {
  return `/ingresar?invitacion=${encodeURIComponent(codigo)}&siguiente=${encodeURIComponent("/mi-negocio")}`;
}

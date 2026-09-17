export const WHATSAPP_NUMBER = "573107739585";
export const WHATSAPP_NUMBER_DISPLAY = "+57 310 773 9585";

const MENSAJE_PREDETERMINADO =
  "¡Hola! 👋 Vi la página de SolarIA y me interesa saber cuánto puedo ahorrar con energía solar. ¿Me ayudas?";

export function buildWhatsAppLink(mensaje: string = MENSAJE_PREDETERMINADO): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

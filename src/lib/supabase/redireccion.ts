/** Solo rutas internas ("/algo"); evita que ?siguiente= mande a otro sitio. */
export function rutaSegura(ruta: string | null | undefined, porDefecto = "/mi-negocio"): string {
  if (!ruta || !ruta.startsWith("/") || ruta.startsWith("//") || ruta.startsWith("/\\")) return porDefecto;
  return ruta;
}

import fs from "node:fs";
import path from "node:path";

/**
 * Busca una imagen subida a /public con cualquiera de estas extensiones.
 * Así basta con soltar "recibo.png" o "recibo.webp" en la carpeta, sin tocar
 * el código. Solo funciona en componentes de servidor (lee el disco al
 * compilar la página).
 */
const EXTENSIONES = ["webp", "png", "jpg", "jpeg", "avif", "svg"] as const;

export interface ImagenEncontrada {
  src: string;
  esSvg: boolean;
}

export function buscarImagen(base: string): ImagenEncontrada | null {
  const limpio = base.replace(/^\/+/, "");
  for (const ext of EXTENSIONES) {
    const relativo = `${limpio}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", relativo))) {
      return { src: `/${relativo}`, esSvg: ext === "svg" };
    }
  }
  return null;
}

export const EN_DESARROLLO = process.env.NODE_ENV !== "production";

import catalogoJson from "./data/catalogo.json";
import type { Region } from "@/lib/config/pricing";
import { formatDecimal } from "@/lib/format";
import type {
  CatalogoData,
  CatalogoPanelSistema,
  RegionesCobertura,
} from "./types";

const catalogo = catalogoJson as CatalogoData;

export interface SistemaEvaluado {
  sistema: CatalogoPanelSistema;
  aplica: boolean;
  motivoNoAplica?: string;
}

function cubreRegion(regiones: RegionesCobertura, region: Region): boolean {
  if (regiones === "nacional") return true;
  return regiones.includes(region);
}

export function buscarMejorPanelSistema(
  kwpRequeridos: number,
  region: Region
): CatalogoPanelSistema | null {
  const candidatos = buscarPanelesSistemas(kwpRequeridos, region)
    .filter((e) => e.aplica)
    .map((e) => e.sistema);
  if (candidatos.length === 0) return null;
  return candidatos.reduce((mejor, actual) =>
    actual.precioPorKwpCOP < mejor.precioPorKwpCOP ? actual : mejor
  );
}

/**
 * Devuelve todos los proveedores de paneles del catálogo, cada uno con si
 * aplica para este negocio y, si no, el motivo para mostrárselo al usuario.
 */
export function buscarPanelesSistemas(
  kwpRequeridos: number,
  region: Region,
  sistemas: CatalogoPanelSistema[] = catalogo.paneles
): SistemaEvaluado[] {
  return sistemas.map((sistema) => {
    if (!cubreRegion(sistema.regiones, region)) {
      return { sistema, aplica: false, motivoNoAplica: "Todavía no llega a tu región." };
    }
    if (kwpRequeridos < sistema.kwpMin) {
      return {
        sistema,
        aplica: false,
        motivoNoAplica: `Instala desde ${formatDecimal(sistema.kwpMin)} kWp y tu sistema sería de ${formatDecimal(kwpRequeridos)} kWp.`,
      };
    }
    if (kwpRequeridos > sistema.kwpMax) {
      return {
        sistema,
        aplica: false,
        motivoNoAplica: `Instala hasta ${formatDecimal(sistema.kwpMax)} kWp y tu sistema sería de ${formatDecimal(kwpRequeridos)} kWp.`,
      };
    }
    return { sistema, aplica: true };
  });
}

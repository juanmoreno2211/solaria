import catalogoJson from "./data/catalogo.json";
import type { Region } from "@/lib/config/pricing";
import type {
  CatalogoData,
  CatalogoIluminacionProducto,
  CatalogoPanelSistema,
  CatalogoRefrigeracionSistema,
  RegionesCobertura,
} from "./types";

const catalogo = catalogoJson as CatalogoData;

function cubreRegion(regiones: RegionesCobertura, region: Region): boolean {
  if (regiones === "nacional") return true;
  return regiones.includes(region);
}

export function buscarMejorPanelSistema(
  kwpRequeridos: number,
  region: Region
): CatalogoPanelSistema | null {
  const candidatos = catalogo.paneles.filter(
    (p) =>
      cubreRegion(p.regiones, region) &&
      kwpRequeridos >= p.kwpMin &&
      kwpRequeridos <= p.kwpMax
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((mejor, actual) =>
    actual.precioPorKwpCOP < mejor.precioPorKwpCOP ? actual : mejor
  );
}

export function buscarMejorIluminacion(
  region: Region
): CatalogoIluminacionProducto | null {
  const candidatos = catalogo.iluminacion.filter((p) =>
    cubreRegion(p.regiones, region)
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((mejor, actual) =>
    actual.precioPorUnidadCOP < mejor.precioPorUnidadCOP ? actual : mejor
  );
}

export function buscarMejorRefrigeracion(
  litrosEstimados: number,
  region: Region
): CatalogoRefrigeracionSistema | null {
  const candidatos = catalogo.refrigeracion.filter(
    (p) =>
      cubreRegion(p.regiones, region) &&
      litrosEstimados >= p.capacidadLitrosMin &&
      litrosEstimados <= p.capacidadLitrosMax
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((mejor, actual) =>
    actual.precioCOP < mejor.precioCOP ? actual : mejor
  );
}

export function catalogoTieneDatos(): boolean {
  return (
    catalogo.paneles.length > 0 ||
    catalogo.iluminacion.length > 0 ||
    catalogo.refrigeracion.length > 0
  );
}

import data from "./data/proveedores.json";
import type { ProveedorCoincidente, ProveedorDirectorio, SolucionSolar } from "./types";

export const DIRECTORIO: ProveedorDirectorio[] = data.proveedores as ProveedorDirectorio[];
export const RECURSOS_RURALES = data.recursos;
export const FECHA_DIRECTORIO = data.actualizadoEl;

interface Perfil {
  departamento?: string;
  solucion: SolucionSolar;
  consumoMensualKwh: number;
}

/**
 * Prioriza evidencia territorial y compatibilidad técnica. No produce un precio,
 * una certificación del proveedor ni una confirmación de atención municipal.
 * Una oficina o un proyecto documentado solo prueba presencia/experiencia.
 */
export function buscarProveedores(
  perfil: Perfil,
  directorio: ProveedorDirectorio[] = DIRECTORIO,
  colectivos = false
): ProveedorCoincidente[] {
  return directorio
    .filter((p) => {
      if ((p.contratacion === "proyecto_colectivo") !== colectivos) return false;
      if (!p.soluciones.includes(colectivos ? "comunitario" : perfil.solucion)) return false;
      if (p.consumoMinimoExclusivoKwh !== undefined && perfil.consumoMensualKwh <= p.consumoMinimoExclusivoKwh) return false;
      // Un servicio por proyectos localizados no se extiende al departamento vecino.
      if (p.contratacion === "servicio_zonal" &&
          (!perfil.departamento || !p.departamentosReferencia.includes(perfil.departamento))) return false;
      return true;
    })
    .map((p): ProveedorCoincidente => {
      const experienciaEnDepartamento = Boolean(perfil.departamento && p.departamentosReferencia.includes(perfil.departamento));
      return {
        ...p,
        experienciaEnDepartamento,
        motivo: experienciaEnDepartamento
          ? `Presencia o proyectos documentados en ${perfil.departamento}; atención de tu negocio por confirmar.`
          : p.alcance === "nacional_declarado"
            ? "Declara alcance nacional; confirma disponibilidad, transporte y soporte en tu municipio."
            : "Publica esta solución; consulta si atiende tu municipio y el tamaño de tu negocio.",
      };
    })
    .sort((a, b) => Number(b.experienciaEnDepartamento) - Number(a.experienciaEnDepartamento)
      || Number(a.contratacion === "equipos") - Number(b.contratacion === "equipos")
      || a.nombre.localeCompare(b.nombre, "es"));
}

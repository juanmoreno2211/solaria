import { proyectar20Anios } from "./projection";

/** Retorno estimado con degradación y mantenimiento, dentro del horizonte de 20 años. */
export function calcularRetornoMeses(inversion: number, ahorroMensual: number): number | null {
  if (!Number.isFinite(inversion) || !Number.isFinite(ahorroMensual) || inversion <= 0 || ahorroMensual < 0) return null;
  const retorno = proyectar20Anios({ inversion, ahorroMensual }).retornoAnios;
  return retorno === null ? null : retorno * 12;
}

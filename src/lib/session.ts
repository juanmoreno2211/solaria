const CLAVE = "solaria_session_id";
let enMemoria: string | null = null;

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // crypto.randomUUID solo existe en contextos seguros (https o localhost).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Identificador anónimo de la visita. Une "vio el resultado" con "pidió
 * cotización" sin guardar datos personales. Sobrevive a "Empezar de nuevo".
 */
export function getSessionId(): string {
  try {
    const guardado = sessionStorage.getItem(CLAVE);
    if (guardado) return guardado;
    const id = nuevoId();
    sessionStorage.setItem(CLAVE, id);
    return id;
  } catch {
    enMemoria ??= nuevoId();
    return enMemoria;
  }
}

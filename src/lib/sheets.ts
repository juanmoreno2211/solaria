type Celda = string | number | boolean | null;

/** Nombres (nunca valores) de las variables de la hoja que no están definidas. */
export function variablesHojaFaltantes(): string[] {
  return ["SHEETS_WEBHOOK_URL", "SHEETS_WEBHOOK_TOKEN"].filter((n) => !process.env[n]);
}

/**
 * Agrega una fila a una hoja de Google mediante un Apps Script publicado como
 * aplicación web (ver docs/hoja-google.md). Sin SHEETS_WEBHOOK_URL solo
 * registra en consola, para poder probar en local.
 */
export async function enviarAHoja(
  hoja: "solicitudes" | "eventos",
  fila: Celda[]
): Promise<boolean> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[sheets] SHEETS_WEBHOOK_URL no está definida; no se guardó una fila en "${hoja}".`);
    } else {
      console.info(`[sheets] (sin webhook) ${hoja}:`, fila);
    }
    return true;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: process.env.SHEETS_WEBHOOK_TOKEN, hoja, fila }),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    return json?.ok === true;
  } catch {
    return false;
  }
}

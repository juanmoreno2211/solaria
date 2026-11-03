/**
 * Guarda lo mismo en varios destinos (Supabase y la hoja de Google) a la vez.
 * Basta con que uno funcione para no perder la solicitud; los que fallan se
 * informan para revisarlos.
 */
export async function guardarEnDestinos<K extends string>(
  destinos: Record<K, () => Promise<boolean>>
): Promise<{ ok: boolean; fallaron: K[] }> {
  const nombres = Object.keys(destinos) as K[];
  const resultados = await Promise.all(
    nombres.map((n) =>
      destinos[n]().then(
        (ok) => ok,
        () => false
      )
    )
  );
  const fallaron = nombres.filter((_, i) => !resultados[i]);
  return { ok: fallaron.length < nombres.length, fallaron };
}

/**
 * Solo las variables públicas de Supabase (URL y clave publicable/anon).
 * La clave secreta nunca pasa por aquí: salta la seguridad por fila y no
 * debe llegar al navegador.
 */
export function supabaseEnv(): { url: string; key: string } {
  // Next solo incrusta NEXT_PUBLIC_* en el cliente si se leen de forma literal.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY) en .env.local"
    );
  }
  return { url, key };
}

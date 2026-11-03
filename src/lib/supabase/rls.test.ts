import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Prueba de integración contra el proyecto real de Supabase: crea dos cuentas
 * y confirma que la RLS no deja que una vea ni toque los datos de la otra.
 *
 * Necesita NEXT_PUBLIC_SUPABASE_URL y la clave publicable en .env.local.
 * Si además está SUPABASE_SECRET_KEY (solo en el entorno de la prueba, nunca
 * en el cliente), crea las cuentas ya confirmadas y las borra al terminar.
 * Sin ella usa el registro normal, que requiere la confirmación de correo apagada.
 */
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_PUBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CLAVE_SECRETA = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const sinSesion = { auth: { persistSession: false, autoRefreshToken: false } };

type Cuenta = { id: string; db: SupabaseClient };

async function crearCuenta(admin: SupabaseClient | null, etiqueta: string): Promise<Cuenta> {
  const correo = `rls-${etiqueta}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const contrasena = `Prueba-${crypto.randomUUID()}`;
  const db = createClient(URL_SUPABASE!, CLAVE_PUBLICA!, sinSesion);

  if (admin) {
    const { error } = await admin.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    const { data, error: errIngreso } = await db.auth.signInWithPassword({ email: correo, password: contrasena });
    if (errIngreso) throw errIngreso;
    return { id: data.user.id, db };
  }

  const { data, error } = await db.auth.signUp({ email: correo, password: contrasena });
  if (error) throw error;
  if (!data.session || !data.user) {
    throw new Error("El registro no dio sesión: apaga la confirmación de correo o define SUPABASE_SECRET_KEY para la prueba.");
  }
  return { id: data.user.id, db };
}

describe.skipIf(!URL_SUPABASE || !CLAVE_PUBLICA)("RLS: cada cuenta solo ve sus filas", () => {
  const admin = CLAVE_SECRETA ? createClient(URL_SUPABASE!, CLAVE_SECRETA, sinSesion) : null;
  let a: Cuenta;
  let b: Cuenta;
  const deA: Record<"negocio" | "aparato" | "invitacion", string> & { evento: number } = {
    negocio: "",
    aparato: "",
    invitacion: "",
    evento: 0,
  };

  beforeAll(async () => {
    a = await crearCuenta(admin, "a");
    b = await crearCuenta(admin, "b");

    const negocio = await a.db.from("negocios").insert({ nombre: "Tienda de A" }).select("id").single();
    if (negocio.error) throw negocio.error;
    deA.negocio = negocio.data.id;

    const aparato = await a.db
      .from("aparatos")
      .insert({ negocio_id: deA.negocio, nombre: "Nevera de A", potencia_w: 300 })
      .select("id")
      .single();
    if (aparato.error) throw aparato.error;
    deA.aparato = aparato.data.id;

    const evento = await a.db.from("eventos").insert({ evento: "resultado_visto" }).select("id").single();
    if (evento.error) throw evento.error;
    deA.evento = evento.data.id;

    const invitacion = await a.db.from("invitaciones").insert({ correo: "socio@example.com" }).select("id").single();
    if (invitacion.error) throw invitacion.error;
    deA.invitacion = invitacion.data.id;
  }, 30_000);

  afterAll(async () => {
    if (!admin) return;
    // Borrar la cuenta borra sus filas en cascada.
    for (const cuenta of [a, b]) if (cuenta) await admin.auth.admin.deleteUser(cuenta.id);
  });

  it("A ve sus propias filas", async () => {
    for (const tabla of ["negocios", "aparatos", "eventos", "invitaciones"]) {
      const { data, error } = await a.db.from(tabla).select("id, user_id");
      expect(error, tabla).toBeNull();
      expect(data, tabla).toHaveLength(1);
      expect(data![0].user_id, tabla).toBe(a.id);
    }
  });

  it("B no ve ninguna fila de A", async () => {
    for (const tabla of ["negocios", "aparatos", "eventos", "invitaciones"]) {
      const todas = await b.db.from(tabla).select("id");
      expect(todas.error, tabla).toBeNull();
      expect(todas.data, tabla).toEqual([]);

      const porUsuario = await b.db.from(tabla).select("id").eq("user_id", a.id);
      expect(porUsuario.data, tabla).toEqual([]);
    }
    const porId = await b.db.from("negocios").select("id").eq("id", deA.negocio);
    expect(porId.data).toEqual([]);
  });

  it("B no puede editar ni borrar filas de A", async () => {
    const editado = await b.db.from("negocios").update({ nombre: "Robado" }).eq("id", deA.negocio).select();
    expect(editado.data).toEqual([]);

    const borrados = [
      await b.db.from("negocios").delete().eq("id", deA.negocio).select(),
      await b.db.from("aparatos").delete().eq("id", deA.aparato).select(),
      await b.db.from("eventos").delete().eq("id", deA.evento).select(),
      await b.db.from("invitaciones").delete().eq("id", deA.invitacion).select(),
    ];
    for (const r of borrados) expect(r.data).toEqual([]);

    const { data } = await a.db.from("negocios").select("nombre").eq("id", deA.negocio).single();
    expect(data?.nombre).toBe("Tienda de A");
    const { data: aparatos } = await a.db.from("aparatos").select("id");
    expect(aparatos).toHaveLength(1);
  });

  it("B no puede crear filas a nombre de A", async () => {
    const intentos = [
      await b.db.from("negocios").insert({ user_id: a.id, nombre: "Falso" }),
      await b.db.from("eventos").insert({ user_id: a.id, evento: "falso" }),
      await b.db.from("invitaciones").insert({ user_id: a.id, correo: "x@example.com" }),
      // Tampoco colgar un aparato del negocio de A, ni con su user_id ni con el propio.
      await b.db.from("aparatos").insert({ user_id: a.id, negocio_id: deA.negocio, nombre: "Falso" }),
      await b.db.from("aparatos").insert({ negocio_id: deA.negocio, nombre: "Falso" }),
    ];
    for (const r of intentos) expect(r.error).not.toBeNull();

    const { data } = await a.db.from("aparatos").select("id");
    expect(data).toHaveLength(1);
  });

  it("sin sesión no se ve nada", async () => {
    const anonimo = createClient(URL_SUPABASE!, CLAVE_PUBLICA!, sinSesion);
    for (const tabla of ["negocios", "aparatos", "eventos", "invitaciones"]) {
      const { data } = await anonimo.from(tabla).select("id");
      expect(data ?? [], tabla).toEqual([]);
    }
  });
});

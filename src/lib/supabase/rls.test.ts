import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generarCodigo } from "@/lib/invitaciones/codigo";

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
  /** Cuenta creada después de la invitación de A: la única que puede atribuirse. */
  let c: Cuenta | undefined;
  const TABLAS = ["negocios", "aparatos", "eventos", "invitaciones", "recibos"];
  const deA: Record<"negocio" | "aparato" | "invitacion" | "recibo" | "codigo", string> & { evento: number } = {
    codigo: "",
    negocio: "",
    aparato: "",
    invitacion: "",
    recibo: "",
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

    deA.codigo = generarCodigo();
    const invitacion = await a.db.from("invitaciones").insert({ correo: "socio@example.com", codigo: deA.codigo }).select("id").single();
    if (invitacion.error) throw invitacion.error;
    deA.invitacion = invitacion.data.id;

    const recibo = await a.db.from("recibos").insert({ consumo_kwh: 300, valor: 270_000 }).select("id, tarifa_kwh").single();
    if (recibo.error) throw recibo.error;
    deA.recibo = recibo.data.id;
  }, 30_000);

  afterAll(async () => {
    if (!admin) return;
    // Borrar la cuenta borra sus filas en cascada.
    for (const cuenta of [a, b, c]) if (cuenta) await admin.auth.admin.deleteUser(cuenta.id);
  });

  it("A ve sus propias filas", async () => {
    for (const tabla of TABLAS) {
      const { data, error } = await a.db.from(tabla).select("id, user_id");
      expect(error, tabla).toBeNull();
      expect(data, tabla).toHaveLength(1);
      expect(data![0].user_id, tabla).toBe(a.id);
    }
  });

  it("B no ve ninguna fila de A", async () => {
    for (const tabla of TABLAS) {
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
    const reciboEditado = await b.db.from("recibos").update({ valor: 1 }).eq("id", deA.recibo).select();
    expect(reciboEditado.data).toEqual([]);

    const borrados = [
      await b.db.from("negocios").delete().eq("id", deA.negocio).select(),
      await b.db.from("aparatos").delete().eq("id", deA.aparato).select(),
      await b.db.from("eventos").delete().eq("id", deA.evento).select(),
      await b.db.from("invitaciones").delete().eq("id", deA.invitacion).select(),
      await b.db.from("recibos").delete().eq("id", deA.recibo).select(),
    ];
    for (const r of borrados) expect(r.data).toEqual([]);

    const { data } = await a.db.from("negocios").select("nombre").eq("id", deA.negocio).single();
    expect(data?.nombre).toBe("Tienda de A");
    const { data: aparatos } = await a.db.from("aparatos").select("id");
    expect(aparatos).toHaveLength(1);
    const { data: recibo } = await a.db.from("recibos").select("valor, tarifa_kwh").eq("id", deA.recibo).single();
    expect(Number(recibo?.valor)).toBe(270_000);
    expect(Number(recibo?.tarifa_kwh)).toBe(900);
  });

  it("B no puede crear filas a nombre de A", async () => {
    const intentos = [
      await b.db.from("negocios").insert({ user_id: a.id, nombre: "Falso" }),
      await b.db.from("eventos").insert({ user_id: a.id, evento: "falso" }),
      await b.db.from("invitaciones").insert({ user_id: a.id, correo: "x@example.com" }),
      await b.db.from("recibos").insert({ user_id: a.id, consumo_kwh: 1, valor: 1 }),
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
    for (const tabla of TABLAS) {
      const { data } = await anonimo.from(tabla).select("id");
      expect(data ?? [], tabla).toEqual([]);
    }
  });
  it("B no ve ni toca la invitación de A, ni puede cambiar su código", async () => {
    const editada = await b.db.from("invitaciones").update({ estado: "cancelada" }).eq("id", deA.invitacion).select();
    expect(editada.data).toEqual([]);
    // Ni el dueño puede cambiar el código una vez creado.
    const cambio = await a.db.from("invitaciones").update({ codigo: generarCodigo() }).eq("id", deA.invitacion);
    expect(cambio.error).not.toBeNull();
  });

  it("aperturas: se cuentan sin sesión una vez por navegador y no se pueden leer", async () => {
    const anonimo = createClient(URL_SUPABASE!, CLAVE_PUBLICA!, sinSesion);
    const visitante = crypto.randomUUID();

    expect((await anonimo.rpc("registrar_apertura", { p_codigo: deA.codigo, p_visitante: visitante })).data).toBe("contada");
    expect((await anonimo.rpc("registrar_apertura", { p_codigo: deA.codigo, p_visitante: visitante })).data).toBe("repetida");
    // El dueño con su sesión no cuenta.
    expect((await a.db.rpc("registrar_apertura", { p_codigo: deA.codigo, p_visitante: crypto.randomUUID() })).data).toBe("propia");
    expect((await anonimo.rpc("registrar_apertura", { p_codigo: generarCodigo(), p_visitante: visitante })).data).toBe("no_existe");

    // Nadie lee ni escribe aperturas directamente.
    for (const cliente of [anonimo, b.db, a.db]) {
      const lectura = await cliente.from("aperturas").select("*");
      expect(lectura.data ?? []).toEqual([]);
      const escritura = await cliente.from("aperturas").insert({ invitacion_id: deA.invitacion, visitante: crypto.randomUUID() });
      expect(escritura.error).not.toBeNull();
    }

    // El dueño ve solo el total; B ve ceros.
    const resumenA = await a.db.rpc("resumen_mis_invitaciones");
    expect(Number(resumenA.data?.[0]?.aperturas)).toBe(1);
    const resumenB = await b.db.rpc("resumen_mis_invitaciones");
    expect(Number(resumenB.data?.[0]?.aperturas)).toBe(0);
    // El evento de apertura no tiene dueño: nadie lo ve desde un cliente.
    const eventosA = await a.db.from("eventos").select("evento").eq("evento", "invitacion_abierta");
    expect(eventosA.data).toEqual([]);
  });

  it("atribución: solo la cuenta nueva de la sesión, una vez y para siempre", async () => {
    // B tiene su propio enlace para intentar cambiarse de invitación.
    const codigoB = generarCodigo();
    const invB = await b.db.from("invitaciones").insert({ codigo: codigoB });
    expect(invB.error).toBeNull();

    c = await crearCuenta(admin, "c");
    expect((await c.db.rpc("atribuir_invitacion", { p_codigo: deA.codigo })).data).toBe(true);
    // No puede cambiarse a la invitación de B ni repetir.
    expect((await c.db.rpc("atribuir_invitacion", { p_codigo: codigoB })).data).toBe(false);
    expect((await c.db.rpc("atribuir_invitacion", { p_codigo: deA.codigo })).data).toBe(false);
    const propia = await c.db.from("atribuciones").select("invitacion_id, invitado_id");
    expect(propia.data).toEqual([{ invitacion_id: deA.invitacion, invitado_id: c.id }]);

    // B se creó antes de la invitación de A: no puede colgarse de ella.
    expect((await b.db.rpc("atribuir_invitacion", { p_codigo: deA.codigo })).data).toBe(false);
    // El dueño no puede atribuirse su propio enlace.
    expect((await a.db.rpc("atribuir_invitacion", { p_codigo: deA.codigo })).data).toBe(false);

    // Nadie escribe atribuciones directamente, ni a su nombre ni al de otro.
    const directa = await b.db.from("atribuciones").insert({ invitacion_id: deA.invitacion, invitado_id: b.id });
    expect(directa.error).not.toBeNull();
    const ajena = await b.db.from("atribuciones").insert({ invitacion_id: deA.invitacion, invitado_id: c.id });
    expect(ajena.error).not.toBeNull();
    const cambio = await c.db.from("atribuciones").update({ invitacion_id: deA.invitacion }).eq("invitado_id", c.id).select();
    expect(cambio.error ?? cambio.data?.length === 0).toBeTruthy();
    const borrado = await c.db.from("atribuciones").delete().eq("invitado_id", c.id).select();
    expect(borrado.error ?? borrado.data?.length === 0).toBeTruthy();

    // B no ve la atribución de C; A solo ve el total.
    expect((await b.db.from("atribuciones").select("*")).data).toEqual([]);
    expect(Number((await a.db.rpc("resumen_mis_invitaciones")).data?.[0]?.cuentas)).toBe(1);

    // Sin sesión no se puede atribuir.
    const anonimo = createClient(URL_SUPABASE!, CLAVE_PUBLICA!, sinSesion);
    const sinCuenta = await anonimo.rpc("atribuir_invitacion", { p_codigo: deA.codigo });
    expect(sinCuenta.data === true).toBe(false);
  }, 30_000);
});

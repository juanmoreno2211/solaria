import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { salir } from "@/app/ingresar/actions";
import { agregarAparato, borrarAparato, guardarNegocio } from "./actions";

export const metadata: Metadata = {
  title: "Mi negocio — SolarIA",
};

const campo =
  "w-full rounded-lg border border-ink-950/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-950/30 focus:border-sun-500 focus:ring-2 focus:ring-sun-500/15";
const etiqueta = "mb-2 block text-sm font-semibold text-ink-950";

export default async function MiNegocioPage() {
  const supabase = await createClient();
  // proxy.ts ya redirige, pero la página no depende de eso para proteger los datos.
  const { data: sesion } = await supabase.auth.getClaims();
  if (!sesion?.claims) redirect("/ingresar?siguiente=/mi-negocio");
  const correo = typeof sesion.claims.email === "string" ? sesion.claims.email : "";

  const { data: negocio } = await supabase.from("negocios").select("*").maybeSingle();
  const { data: aparatos } = negocio
    ? await supabase.from("aparatos").select("*").eq("negocio_id", negocio.id).order("creado_en")
    : { data: [] };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream-50 py-12">
        <Container className="max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Mi negocio</h1>
              <p className="text-sm text-ink-950/60">{correo}</p>
            </div>
            <form action={salir}>
              <Button type="submit" variant="secondary">Salir</Button>
            </form>
          </div>

          <section className="rounded-xl border border-ink-950/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-ink-950">Datos del negocio</h2>
            <form action={guardarNegocio} className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={etiqueta}>Nombre</span>
                <input name="nombre" required maxLength={120} defaultValue={negocio?.nombre ?? ""} className={campo} />
              </label>
              <label>
                <span className={etiqueta}>Tipo de negocio</span>
                <input name="tipo_negocio" maxLength={80} defaultValue={negocio?.tipo_negocio ?? ""} className={campo} />
              </label>
              <label>
                <span className={etiqueta}>Departamento</span>
                <input name="departamento" maxLength={80} defaultValue={negocio?.departamento ?? ""} className={campo} />
              </label>
              <label>
                <span className={etiqueta}>Municipio</span>
                <input name="municipio" maxLength={80} defaultValue={negocio?.municipio ?? ""} className={campo} />
              </label>
              <label>
                <span className={etiqueta}>Consumo al mes (kWh)</span>
                <input name="consumo_kwh_mes" inputMode="decimal" defaultValue={negocio?.consumo_kwh_mes ?? ""} className={campo} />
              </label>
              <label>
                <span className={etiqueta}>Valor del recibo (COP)</span>
                <input name="valor_recibo" inputMode="numeric" defaultValue={negocio?.valor_recibo ?? ""} className={campo} />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </section>

          {negocio && (
            <section className="mt-6 rounded-xl border border-ink-950/10 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-ink-950">Aparatos</h2>
              {aparatos && aparatos.length > 0 ? (
                <ul className="mb-6 divide-y divide-ink-950/8 text-sm">
                  {aparatos.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-ink-950">
                        {a.cantidad} × {a.nombre}
                        <span className="text-ink-950/55">
                          {a.potencia_w != null && ` · ${a.potencia_w} W`}
                          {a.horas_dia != null && ` · ${a.horas_dia} h/día`}
                        </span>
                      </span>
                      <form action={borrarAparato}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button type="submit" variant="ghost">Quitar</Button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-sm text-ink-950/55">Todavía no has agregado aparatos.</p>
              )}

              <form action={agregarAparato} className="grid gap-4 sm:grid-cols-4">
                <input type="hidden" name="negocio_id" value={negocio.id} />
                <label className="sm:col-span-4">
                  <span className={etiqueta}>Aparato</span>
                  <input name="nombre" required maxLength={120} placeholder="Nevera exhibidora" className={campo} />
                </label>
                <label>
                  <span className={etiqueta}>Cantidad</span>
                  <input name="cantidad" inputMode="numeric" defaultValue="1" className={campo} />
                </label>
                <label>
                  <span className={etiqueta}>Potencia (W)</span>
                  <input name="potencia_w" inputMode="decimal" className={campo} />
                </label>
                <label>
                  <span className={etiqueta}>Horas al día</span>
                  <input name="horas_dia" inputMode="decimal" className={campo} />
                </label>
                <div className="flex items-end">
                  <Button type="submit" variant="secondary" className="w-full">Agregar</Button>
                </div>
              </form>
            </section>
          )}
        </Container>
      </main>
    </>
  );
}

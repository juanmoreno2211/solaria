import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { salir } from "@/app/ingresar/actions";
import { DATOS_DEPARTAMENTO } from "@/lib/geo/departamentos";
import { REGION_LABELS } from "@/lib/geo/regions";
import { aparatoDelCatalogo } from "@/lib/aparatos/catalogo";
import { rankingAparatos, type UsoAparato } from "@/lib/aparatos/calculo";
import { consejosPara } from "@/lib/aparatos/consejos";
import { formatCOP, formatDecimal, formatNumber } from "@/lib/format";
import { CONEXIONES, HORARIOS, TEXTO_VEREDICTO, TIPOS_NEGOCIO, etiqueta as etiquetaDe } from "@/lib/negocio/opciones";
import type { Region } from "@/lib/config/pricing";
import type { Veredicto } from "@/lib/savings/types";
import { actualizarRecibo, guardarPerfil, guardarTarifa } from "./actions";
import { cargarMiNegocio, tarifaVigente, type AparatoFila } from "./datos";
import { ImportarResultado } from "./componentes/ImportarResultado";
import { FormularioAparato } from "./componentes/FormularioAparato";
import { FilaAparato } from "./componentes/FilaAparato";
import { Simulador } from "./componentes/Simulador";
import { RankingVisto } from "./componentes/RankingVisto";
import { ayuda, botonPrimario, botonSecundario, campo, etiqueta, tarjeta, tituloTarjeta } from "./componentes/estilos";

export const metadata: Metadata = {
  title: "Mi negocio — SolarIA",
};

const DEPARTAMENTOS = Object.keys(DATOS_DEPARTAMENTO).sort((a, b) => a.localeCompare(b, "es"));

/** Estimados en pesos redondeados a centenas. */
const pesos = (v: number) => formatCOP(Math.round(v / 100) * 100);

function mesTexto(fecha: string): string {
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(fecha));
}

function retornoTexto(meses: number | null): string {
  if (meses == null) return "no se recupera en 20 años";
  return meses < 24 ? `${Math.round(meses)} meses` : `${formatDecimal(meses / 12)} años`;
}

function usoDeFila(a: AparatoFila): UsoAparato & { id: string; fila: AparatoFila } {
  return {
    id: a.id,
    fila: a,
    nombre: a.nombre,
    tipo: a.tipo_catalogo,
    cantidad: a.cantidad,
    potenciaW: a.potencia_w ?? 0,
    factorCiclo: a.factor_ciclo,
    horasDia: a.horas_dia ?? 0,
    diasMes: a.dias_mes,
    kwhAnioEtiqueta: a.kwh_anio_etiqueta,
  };
}

function deReferencia(a: AparatoFila): boolean {
  const c = aparatoDelCatalogo(a.tipo_catalogo);
  return Boolean(c && !c.generaEnergia && !a.kwh_anio_etiqueta && a.potencia_w === c.potenciaW && a.horas_dia === c.horasDia && Math.round(a.factor_ciclo * 100) === Math.round(c.factorCiclo * 100));
}

function Dato({ label, children, nota }: { label: string; children: React.ReactNode; nota?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-950/65">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tracking-tight text-ink-950 tabular-nums">{children}</dd>
      {nota && <dd className="text-xs text-ink-950/60">{nota}</dd>}
    </div>
  );
}

export default async function MiNegocioPage() {
  const supabase = await createClient();
  // proxy.ts ya redirige, pero la página no depende de eso para proteger los datos.
  const { data: sesion } = await supabase.auth.getClaims();
  if (!sesion?.claims) redirect("/ingresar?siguiente=/mi-negocio");
  const correo = typeof sesion.claims.email === "string" ? sesion.claims.email : "";

  const { negocio, recibo, aparatos } = await cargarMiNegocio(supabase);
  const tarifa = tarifaVigente(negocio, recibo);
  const tarifaManual = !recibo?.tarifa_kwh && negocio?.tarifa_manual_kwh ? negocio.tarifa_manual_kwh : null;
  const usos = aparatos.map(usoDeFila);
  const ranking = rankingAparatos(usos, tarifa, recibo?.consumo_kwh ?? null);
  const filasConConsumo = ranking.filas.filter((f) => f.kwhMes > 0);
  const principal = filasConConsumo[0];
  const consejos = principal ? consejosPara(principal.aparato, tarifa) : [];
  const maxBarra = recibo?.consumo_kwh ? Math.max(recibo.consumo_kwh, ranking.kwhAparatos) : principal?.kwhMes ?? 1;
  const veredicto = negocio?.resultado_veredicto as Veredicto | null;
  const perfilCompleto = Boolean(negocio?.tipo_negocio && negocio.departamento && negocio.horario && negocio.conexion);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream-50 py-10 sm:py-12">
        <Container className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{negocio?.nombre || "Mi negocio"}</h1>
              <p className="truncate text-sm text-ink-950/65">{correo}</p>
            </div>
            <form action={salir}>
              <button type="submit" className={botonSecundario}>Salir</button>
            </form>
          </div>

          <ImportarResultado />

          <div className="space-y-6">
            {veredicto && (
              <section aria-labelledby="t-resultado" className="rounded-xl bg-ink-950 p-5 text-white sm:p-6">
                <h2 id="t-resultado" className="text-xs font-semibold text-white/70">
                  Tu resultado de la calculadora
                  {negocio?.resultado_guardado_en && ` · ${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(negocio.resultado_guardado_en))}`}
                </h2>
                <p className="mt-2 text-xl font-semibold tracking-tight text-sun-300">{TEXTO_VEREDICTO[veredicto]}</p>
                <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {negocio?.resultado_kwp != null && (
                    <div>
                      <dt className="text-xs text-white/70">Sistema base</dt>
                      <dd className="text-lg font-semibold tabular-nums">{formatDecimal(negocio.resultado_kwp)} kWp</dd>
                    </div>
                  )}
                  {negocio?.resultado_ahorro_mensual != null && (
                    <div>
                      <dt className="text-xs text-white/70">Ahorro al mes</dt>
                      <dd className="text-lg font-semibold tabular-nums">{pesos(negocio.resultado_ahorro_mensual)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-white/70">Retorno</dt>
                    <dd className="text-lg font-semibold tabular-nums">{retornoTexto(negocio?.resultado_retorno_meses ?? null)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-white/70">Estimado de la calculadora con los supuestos de ese día. La cifra final la da el instalador.</p>
                {(veredicto === "conviene" || veredicto === "comparar") && (
                  <Link href="/#calculadora" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-ink-950 hover:bg-cream-100">
                    Pedir cotización
                  </Link>
                )}
              </section>
            )}

            <section aria-labelledby="t-recibo" className={tarjeta}>
              <h2 id="t-recibo" className={tituloTarjeta}>Mi recibo</h2>
              {recibo ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Dato label="Consumo">{recibo.consumo_kwh != null ? `${formatNumber(recibo.consumo_kwh)} kWh` : "—"}</Dato>
                    <Dato label="Valor">{recibo.valor != null ? formatCOP(recibo.valor) : "—"}</Dato>
                    <Dato label="Tarifa" nota="valor ÷ kWh">{recibo.tarifa_kwh != null ? `${formatCOP(Math.round(recibo.tarifa_kwh))}/kWh` : "—"}</Dato>
                    <Dato label="Mes">{mesTexto(recibo.mes)}</Dato>
                  </dl>
                  {recibo.origen === "calculadora" && <p className={ayuda}>Datos que escribiste en la calculadora.</p>}
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-950/75">Escribe los datos de tu último recibo de luz para calcular cuánto te cuesta cada aparato.</p>
              )}

              <details className="group mt-4" open={!recibo}>
                <summary className={`${botonSecundario} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                  {recibo ? "Actualizar recibo" : "Escribir mi recibo"}
                </summary>
                <form action={actualizarRecibo} className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label>
                    <span className={etiqueta}>Consumo del mes (kWh)</span>
                    <input name="consumo_kwh" inputMode="decimal" required className={campo} />
                  </label>
                  <label>
                    <span className={etiqueta}>Valor pagado ($)</span>
                    <input name="valor" inputMode="numeric" required className={campo} />
                  </label>
                  <label>
                    <span className={etiqueta}>Mes del recibo</span>
                    <input name="mes" type="month" defaultValue={new Date().toISOString().slice(0, 7)} className={campo} />
                  </label>
                  <div className="sm:col-span-3">
                    <button type="submit" className={botonPrimario}>Guardar recibo</button>
                    <p className={ayuda}>Cada actualización queda guardada como un recibo nuevo.</p>
                  </div>
                </form>
              </details>

              {!recibo?.tarifa_kwh && (
                <form action={guardarTarifa} className="mt-5 border-t border-ink-950/10 pt-4">
                  <label className="block max-w-xs">
                    <span className={etiqueta}>O escribe tu tarifa ($ por kWh)</span>
                    <input name="tarifa_kwh" inputMode="decimal" defaultValue={tarifaManual ?? ""} className={campo} />
                  </label>
                  <button type="submit" className={`${botonSecundario} mt-3`}>Guardar tarifa</button>
                  {tarifaManual && <p className={ayuda}>Usamos la tarifa que escribiste: {formatCOP(Math.round(tarifaManual))}/kWh.</p>}
                </form>
              )}
            </section>

            <section aria-labelledby="t-perfil" className={tarjeta}>
              <h2 id="t-perfil" className={tituloTarjeta}>Tu negocio</h2>
              {negocio?.region && <p className="mt-1 text-sm text-ink-950/65">Región {REGION_LABELS[negocio.region as Region] ?? negocio.region}</p>}
              <details className="mt-4" open={!perfilCompleto}>
                <summary className={`${botonSecundario} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                  {perfilCompleto ? "Editar datos del negocio" : "Completar datos del negocio"}
                </summary>
                <form action={guardarPerfil} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className={etiqueta}>Nombre del negocio (opcional)</span>
                    <input name="nombre" maxLength={120} defaultValue={negocio?.nombre ?? ""} className={campo} />
                  </label>
                  <label>
                    <span className={etiqueta}>Tipo de negocio</span>
                    <select name="tipo_negocio" defaultValue={negocio?.tipo_negocio ?? ""} className={campo}>
                      <option value="">Elige uno</option>
                      {TIPOS_NEGOCIO.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className={etiqueta}>Horario</span>
                    <select name="horario" defaultValue={negocio?.horario ?? ""} className={campo}>
                      <option value="">Elige uno</option>
                      {HORARIOS.map((h) => <option key={h.v} value={h.v}>{h.label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className={etiqueta}>Departamento</span>
                    <select name="departamento" defaultValue={negocio?.departamento ?? ""} className={campo}>
                      <option value="">Elige uno</option>
                      {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className={etiqueta}>Municipio</span>
                    <input name="municipio" maxLength={80} defaultValue={negocio?.municipio ?? ""} className={campo} />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={etiqueta}>¿Cómo te llega la luz?</span>
                    <select name="conexion" defaultValue={negocio?.conexion ?? ""} className={campo}>
                      <option value="">Elige una</option>
                      {CONEXIONES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" className={botonPrimario}>Guardar</button>
                  </div>
                </form>
              </details>
              {perfilCompleto && (
                <p className="mt-3 text-sm text-ink-950/75">
                  {etiquetaDe(TIPOS_NEGOCIO, negocio?.tipo_negocio)} · {negocio?.municipio ? `${negocio.municipio}, ` : ""}{negocio?.departamento} · {etiquetaDe(HORARIOS, negocio?.horario)} · {etiquetaDe(CONEXIONES, negocio?.conexion)}
                </p>
              )}
            </section>

            <section aria-labelledby="t-aparatos" className={tarjeta}>
              <h2 id="t-aparatos" className={tituloTarjeta}>Tus aparatos</h2>
              {aparatos.length > 0 ? (
                <ul className="mt-2 divide-y divide-ink-950/10">
                  {ranking.filas.map((f) => (
                    <FilaAparato key={f.aparato.id} aparato={f.aparato.fila} kwhMes={f.kwhMes} deReferencia={deReferencia(f.aparato.fila)} />
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-950/75">Agrega los aparatos que usas en tu negocio. Empieza por los que pasan más tiempo prendidos.</p>
              )}
              <details className="mt-4" open={aparatos.length === 0}>
                <summary className={`${botonPrimario} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>Agregar aparato</summary>
                <div className="mt-4">
                  <FormularioAparato />
                </div>
              </details>
            </section>

            {filasConConsumo.length > 0 && (
              <section aria-labelledby="t-ranking" className={tarjeta}>
                <RankingVisto aparatos={aparatos.length} />
                <h2 id="t-ranking" className={tituloTarjeta}>En qué gastas más</h2>
                {ranking.porcentajeExplicado != null ? (
                  <p className="mt-1 text-sm text-ink-950/80">
                    Tus aparatos explican <span className="font-semibold text-ink-950">{formatDecimal(ranking.porcentajeExplicado)} %</span> de tu consumo
                    ({formatDecimal(ranking.kwhAparatos)} de {formatNumber(recibo!.consumo_kwh!)} kWh).
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink-950/80">Guarda el consumo de tu recibo para ver qué parte explica cada aparato.</p>
                )}
                {ranking.porcentajeExplicado != null && ranking.porcentajeExplicado > 100 && (
                  <p className="mt-1 text-sm text-ink-950/80">Tus aparatos suman más de lo que marca el recibo: revisa las horas o la potencia de alguno.</p>
                )}

                <ol className="mt-5 space-y-4">
                  {filasConConsumo.map((f) => (
                    <li key={f.aparato.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 font-semibold text-ink-950">{f.aparato.cantidad} × {f.aparato.nombre}</span>
                        <span className="shrink-0 tabular-nums text-ink-950">
                          {f.costoMes != null ? `~${pesos(f.costoMes)}` : `${formatDecimal(f.kwhMes)} kWh`}
                          {f.porcentajeRecibo != null && <span className="text-ink-950/65"> · {formatDecimal(f.porcentajeRecibo)} %</span>}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2.5 rounded-full bg-ink-950/8" aria-hidden="true">
                        <div className="h-full rounded-full bg-sun-500" style={{ width: `${Math.max(1, Math.min(100, (f.kwhMes / maxBarra) * 100))}%` }} />
                      </div>
                    </li>
                  ))}
                  {ranking.kwhOtros != null && ranking.kwhOtros > 0 && (
                    <li>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-semibold text-ink-950/75">Otros</span>
                        <span className="tabular-nums text-ink-950/75">
                          {ranking.costoOtros != null ? `~${pesos(ranking.costoOtros)}` : `${formatDecimal(ranking.kwhOtros)} kWh`}
                          {" · "}{formatDecimal(100 - ranking.porcentajeExplicado!)} %
                        </span>
                      </div>
                      <div className="mt-1.5 h-2.5 rounded-full bg-ink-950/8" aria-hidden="true">
                        <div className="h-full rounded-full bg-stone-400" style={{ width: `${Math.max(1, (ranking.kwhOtros / maxBarra) * 100)}%` }} />
                      </div>
                    </li>
                  )}
                </ol>
                <p className={`${ayuda} mt-4`}>
                  Costos al mes estimados: potencia × horas × días × parte del tiempo a plena potencia × cantidad × tu tarifa
                  {tarifa ? ` (${formatCOP(Math.round(tarifa))}/kWh)` : ""}. Los aparatos marcados “valor de referencia” usan cifras del catálogo, no las de tu equipo.
                </p>

                {consejos.length > 0 && (
                  <div className="mt-5 border-t border-ink-950/10 pt-4">
                    <h3 className="text-sm font-semibold text-ink-950">Dónde ahorrar: {principal!.aparato.nombre.toLowerCase()}</h3>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-950/85">
                      {consejos.map((c) => <li key={c.id}>{c.texto}</li>)}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section aria-labelledby="t-simulador" className={tarjeta}>
              <h2 id="t-simulador" className={tituloTarjeta}>¿Y si agrego…?</h2>
              <p className="mt-1 mb-4 text-sm text-ink-950/75">Mira cuánto subiría tu recibo con un aparato nuevo. No se guarda.</p>
              <Simulador />
            </section>

            <section aria-labelledby="t-datos" className="rounded-xl border border-ink-950/10 bg-cream-100/60 p-5 text-sm text-ink-950/80">
              <h2 id="t-datos" className="font-semibold text-ink-950">Tus datos</h2>
              <p className="mt-1">Guardamos solo tu consumo y tu valor, no la foto de tu recibo.</p>
              <p className="mt-1">Otras cuentas no pueden ver tus datos. Los usamos para calcular en qué gastas y dónde ahorrar.</p>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import clsx from "clsx";
import { Check, ChevronDown, FlaskConical, Lightbulb, MapPin, Receipt, ShieldCheck, Store } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { salir } from "@/app/ingresar/actions";
import { DATOS_DEPARTAMENTO } from "@/lib/geo/departamentos";
import { REGION_LABELS } from "@/lib/geo/regions";
import { CATALOGO_APARATOS, aparatoDelCatalogo } from "@/lib/aparatos/catalogo";
import { rankingAparatos, type UsoAparato } from "@/lib/aparatos/calculo";
import { consejosPara, type Consejo } from "@/lib/aparatos/consejos";
import { calcularEstadisticas, calcularMetas } from "@/lib/recibos/estadisticas";
import { enlaceInvitacion } from "@/lib/invitaciones/enlace";
import { formatCOP, formatDecimal, formatNumber } from "@/lib/format";
import { CONEXIONES, HORARIOS, TEXTO_VEREDICTO, TIPOS_NEGOCIO, esOpcion, etiqueta as etiquetaDe } from "@/lib/negocio/opciones";
import type { Region } from "@/lib/config/pricing";
import type { Veredicto } from "@/lib/savings/types";
import { actualizarRecibo, guardarPerfil, guardarTarifa } from "./actions";
import { fechaCorta, resultadoParaMostrar, type ResultadoMostrado } from "@/lib/negocio/coherencia";
import { cargarMiInvitacion, cargarMiNegocio, tarifaVigente, type AparatoFila } from "./datos";
import { ImportarResultado } from "./componentes/ImportarResultado";
import { AgregarAparato } from "./componentes/AgregarAparato";
import { TarjetaAparato } from "./componentes/TarjetaAparato";
import { RankingVisto } from "./componentes/RankingVisto";
import { Simulador } from "./componentes/Simulador";
import { TarjetaInvitar } from "./componentes/TarjetaInvitar";
import { AbrirSeccion } from "./componentes/AbrirSeccion";
import { Estadisticas, FormularioRecibo } from "./componentes/Estadisticas";
import { botonPrimario, botonSecundario, campo, etiqueta, tarjeta, tarjetaAcordeon } from "./componentes/estilos";

export const metadata: Metadata = {
  title: "Mi negocio — SolarIA",
};

const DEPARTAMENTOS = Object.keys(DATOS_DEPARTAMENTO).sort((a, b) => a.localeCompare(b, "es"));

/** Estimados en pesos redondeados a centenas. */
const pesos = (v: number) => formatCOP(Math.round(v / 100) * 100);

/** Acordeón cerrado: el resumen es un botón grande con su flecha. */
const resumen =
  "flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-base font-bold text-ink-950 [&::-webkit-details-marker]:hidden";

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

/** "Calculado el 2/11 con 400 kWh: Todavía no lo necesitas…" */
function textoGuardado(g: NonNullable<ResultadoMostrado["guardado"]>, hayActual: boolean): string {
  const cuando = g.fecha ? `Calculado el ${fechaCorta(g.fecha)}` : "Calculado en la calculadora";
  const con = g.consumoKwh != null ? ` con ${formatNumber(Math.round(g.consumoKwh))} kWh` : g.valor != null ? ` con un recibo de ${formatCOP(g.valor)}` : "";
  return `${cuando}${con}${hayActual ? `: ${TEXTO_VEREDICTO[g.veredicto].toLowerCase()}.` : "."}`;
}

function Dato({ label, children, nota }: { label: string; children: React.ReactNode; nota?: string }) {
  return (
    <div className="rounded-xl bg-cream-50 p-3 ring-1 ring-ink-950/5">
      <dt className="text-xs font-medium text-ink-950/75">{label}</dt>
      <dd className="mt-0.5 text-base font-bold tracking-tight text-ink-950 tabular-nums">{children}</dd>
      {nota && <dd className="text-xs text-ink-950/75">{nota}</dd>}
    </div>
  );
}

/** ① Agrega 2 aparatos → ② Mira en qué gastas → ③ Mira dónde ahorrar. */
function FranjaProgreso({ aparatos, etapa, sinRecibo }: { aparatos: number; etapa: 1 | 2; sinRecibo: boolean }) {
  const pasos = [
    { n: 1, texto: "Agrega 2 aparatos", nota: `${Math.min(aparatos, 2)} de 2` },
    { n: 2, texto: "Mira en qué gastas", nota: sinRecibo ? "Escribe tu recibo" : undefined },
    { n: 3, texto: "Mira dónde ahorrar", nota: undefined },
  ];
  return (
    <nav aria-label="Tu avance" className="rounded-2xl border border-ink-950/10 bg-white p-3 sm:p-4">
      <ol className="grid grid-cols-3 gap-2">
        {pasos.map((p) => {
          const hecho = p.n < etapa;
          const actual = p.n === etapa;
          return (
            <li key={p.n} aria-current={actual ? "step" : undefined} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  hecho && "bg-leaf-700 text-white",
                  actual && "bg-sun-400 text-ink-950 ring-4 ring-sun-400/30",
                  !hecho && !actual && "bg-cream-100 text-ink-950/75"
                )}
              >
                {hecho ? <Check className="h-4 w-4" aria-hidden="true" /> : p.n}
              </span>
              <span className={clsx("text-xs leading-tight sm:text-sm", actual ? "font-bold text-ink-950" : "text-ink-950/75")}>
                {p.texto}
                {hecho && <span className="sr-only"> (hecho)</span>}
              </span>
              {p.nota && actual && <span className="text-xs font-semibold text-ember-600">{p.nota}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Formulario corto para quien aún no tiene recibo (mes actual por defecto). */
function ReciboRapido() {
  return (
    <form action={actualizarRecibo} className="mt-3 grid grid-cols-2 gap-2">
      <input type="hidden" name="mes" value={new Date().toISOString().slice(0, 7)} />
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-950">Consumo (kWh)</span>
        <input name="consumo_kwh" inputMode="decimal" required className={campo} />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold text-ink-950">Valor ($)</span>
        <input name="valor" inputMode="numeric" required className={campo} />
      </label>
      <button type="submit" className={`${botonPrimario} col-span-2`}>Guardar recibo</button>
    </form>
  );
}

export default async function MiNegocioPage() {
  const supabase = await createClient();
  // proxy.ts ya redirige, pero la página no depende de eso para proteger los datos.
  const { data: sesion } = await supabase.auth.getClaims();
  if (!sesion?.claims) redirect("/ingresar?siguiente=/mi-negocio");

  const [{ negocio, recibo, recibos, aparatos }, invitacion, cabeceras, { count: vecesRanking }] = await Promise.all([
    cargarMiNegocio(supabase),
    cargarMiInvitacion(supabase),
    headers(),
    // Solo para la franja de progreso: ¿ya vio sus aparatos con porcentajes?
    supabase.from("eventos").select("id", { count: "exact", head: true }).eq("evento", "ranking_visto"),
  ]);
  // El enlace usa el dominio por el que entró el usuario (local o producción).
  const host = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host");
  const origen = host ? `${cabeceras.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const tarifa = tarifaVigente(negocio, recibo);
  const tarifaManual = !recibo?.tarifa_kwh && negocio?.tarifa_manual_kwh ? negocio.tarifa_manual_kwh : null;
  const consumoRecibo = recibo?.consumo_kwh ?? null;
  const ranking = rankingAparatos(aparatos.map(usoDeFila), tarifa, consumoRecibo);
  const filasConConsumo = ranking.filas.filter((f) => f.kwhMes > 0);
  const principal = filasConConsumo[0];
  const conPorcentajes = consumoRecibo != null && consumoRecibo > 0;
  // Barras: parte del recibo si lo hay; si no, relativas al aparato que más gasta.
  const baseBarra = conPorcentajes ? Math.max(consumoRecibo, ranking.kwhAparatos) : principal?.kwhMes ?? 1;

  // Dónde ahorrar: el consejo con ahorro en pesos del aparato que más pesa entre
  // los que se pueden ajustar (a una nevera no se le pide usarla menos horas).
  // Si ninguno tiene ahorro cuantificable, el primer consejo del que más pesa.
  const todosConsejos = filasConConsumo.flatMap((f) => consejosPara(f.aparato, tarifa).map((c) => ({ aparato: f.aparato.nombre, consejo: c })));
  const consejoPrincipal = todosConsejos.find((x) => x.consejo.ahorroMes != null && x.consejo.ahorroMes > 0) ?? todosConsejos[0];
  const masConsejos: { aparato: string; consejo: Consejo }[] = todosConsejos.filter((x) => x !== consejoPrincipal).slice(0, 5);

  const estadisticas = calcularEstadisticas(
    recibos.map((r) => ({ id: r.id, mes: r.mes, consumoKwh: r.consumo_kwh, valor: r.valor, creadoEn: r.creado_en }))
  );
  // Meta del aparato: el que más pesa entre los que tienen un ahorro cuantificable
  // (a una nevera no se le sugiere usarla menos horas).
  const ajustable = filasConConsumo
    .map((f) => ({ nombre: f.aparato.nombre, consejo: consejosPara(f.aparato, tarifa).find((c) => c.ahorroMes != null && c.ahorroMes > 0) }))
    .find((x) => x.consejo);
  const metas = calcularMetas(
    estadisticas,
    tarifa,
    ajustable?.consejo ? { nombre: ajustable.nombre, texto: ajustable.consejo.texto, ahorroMes: ajustable.consejo.ahorroMes! } : null
  );

  // Mismo perfil, recibo y función que el simulador: los dos dicen lo mismo.
  const resultado = resultadoParaMostrar({
    veredictoGuardado: (negocio?.resultado_veredicto as Veredicto | null) ?? null,
    guardadoEn: negocio?.resultado_guardado_en ?? null,
    recibos,
    perfil: { tipo: negocio?.tipo_negocio, departamento: negocio?.departamento, municipio: negocio?.municipio, horario: negocio?.horario, conexion: negocio?.conexion },
    reciboActual: recibo,
    tarifa,
  });
  const tipoNegocio = esOpcion(TIPOS_NEGOCIO, negocio?.tipo_negocio) ? negocio.tipo_negocio : null;
  const mostrarProgreso = !(aparatos.length >= 2 && (vecesRanking ?? 0) > 0);

  return (
    <>
      <Navbar cuenta={{ nombre: negocio?.nombre ?? null }} />
      <main className="flex-1 bg-cream-50 pb-16 pt-8 sm:pt-12">
        <Container className="max-w-2xl">
          {/* Encabezado compacto. */}
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ember-600">SolarIA Control</p>
              <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink-950 sm:text-3xl">{negocio?.nombre || "Mi negocio"}</h1>
              {(negocio?.municipio || negocio?.departamento || tipoNegocio) && (
                <ul className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold text-ink-950">
                  {(negocio?.municipio || negocio?.departamento) && (
                    <li className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-ink-950/10">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {negocio?.municipio || negocio?.departamento}
                    </li>
                  )}
                  {tipoNegocio && <li className="rounded-full bg-white px-2.5 py-1 ring-1 ring-ink-950/10">{etiquetaDe(TIPOS_NEGOCIO, tipoNegocio)}</li>}
                </ul>
              )}
              <p className="mt-1 text-sm text-ink-950/80">
                {recibo ? (
                  <>
                    Último recibo:{" "}
                    <span className="font-semibold text-ink-950 tabular-nums">
                      {[recibo.consumo_kwh != null && `${formatNumber(recibo.consumo_kwh)} kWh`, recibo.valor != null && formatCOP(recibo.valor)].filter(Boolean).join(" · ")}
                    </span>
                    {" · "}
                  </>
                ) : (
                  "Sin recibo todavía · "
                )}
                <AbrirSeccion destino="mi-recibo" className="inline-flex min-h-11 items-center font-semibold text-ink-950 underline underline-offset-4">
                  {recibo ? "Editar" : "Escribirlo"}
                </AbrirSeccion>
              </p>
            </div>
            <form action={salir}>
              <button type="submit" className="min-h-11 rounded-md px-3 text-sm font-semibold text-ink-950/80 hover:bg-ink-950/5">Salir</button>
            </form>
          </header>

          <div className="mt-4">
            <ImportarResultado />
          </div>

          <div className="space-y-5">
            {mostrarProgreso && <FranjaProgreso aparatos={aparatos.length} etapa={aparatos.length < 2 ? 1 : 2} sinRecibo={!conPorcentajes} />}

            {/* Tus aparatos: el bloque principal. */}
            <section aria-labelledby="t-aparatos" className={tarjeta}>
              <h2 id="t-aparatos" className="text-xl font-bold tracking-[-0.01em] text-ink-950">Tus aparatos</h2>
              <p className="mt-0.5 text-sm text-ink-950/75">
                {aparatos.length > 0 ? "Del que más cuesta al que menos." : "Mira cuánto gasta cada uno."}
              </p>

              <div className="mt-4">
                <AgregarAparato hayAparatos={aparatos.length > 0} />
              </div>

              {aparatos.length > 0 && (
                <>
                  {!conPorcentajes && (
                    <div className="mt-5 rounded-xl bg-sun-400/15 p-4">
                      <p className="text-sm font-semibold text-ink-950">Escribe tu último recibo para ver el costo en pesos.</p>
                      <ReciboRapido />
                    </div>
                  )}

                  <div className="mt-5">
                    {/* ranking_visto: cuando la lista con porcentajes entra en pantalla. */}
                    {conPorcentajes && <RankingVisto aparatos={aparatos.length} />}
                    <ol className="space-y-3">
                      {ranking.filas.map((f, i) => (
                        <TarjetaAparato
                          key={f.aparato.id}
                          aparato={f.aparato.fila}
                          kwhMes={f.kwhMes}
                          costoMes={f.costoMes}
                          porcentaje={f.porcentajeRecibo}
                          anchoBarra={(f.kwhMes / baseBarra) * 100}
                          primero={i === 0 && f.kwhMes > 0}
                          deReferencia={deReferencia(f.aparato.fila)}
                          generaEnergia={Boolean(aparatoDelCatalogo(f.aparato.tipo)?.generaEnergia)}
                        />
                      ))}
                    </ol>
                  </div>

                  {ranking.porcentajeExplicado != null && (
                    <p className="mt-4 text-sm text-ink-950/80">
                      Tus aparatos explican <span className="font-bold text-ink-950">{formatDecimal(ranking.porcentajeExplicado)} %</span> de tu consumo.
                      {ranking.porcentajeExplicado > 100 && " Suman más que tu recibo: revisa las horas o la potencia."}
                    </p>
                  )}
                </>
              )}

              <details className="mt-4 rounded-xl border border-ink-950/10">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
                  ¿Cómo se calcula?
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </summary>
                <div className="space-y-2 px-4 pb-4 text-sm text-ink-950/80">
                  <p>kWh al mes = potencia en kW × horas al día × días al mes × parte del tiempo a plena potencia × cantidad.</p>
                  <p>
                    Costo al mes = kWh × tu tarifa{tarifa ? ` (${formatCOP(Math.round(tarifa))}/kWh)` : ""}, que sale de tu recibo (valor ÷ kWh) o de la que escribas.
                    Todo es estimado.
                  </p>
                  <p>“Parte del tiempo a plena potencia”: una nevera o un aire prenden y apagan el compresor; un bombillo o un computador trabajan el 100 %.</p>
                  <p>“Valor de referencia” quiere decir que usamos los valores del catálogo y no los de tu equipo. Corrígelos con la placa o la etiqueta energética.</p>
                  <p className="font-semibold text-ink-950">Fuentes del catálogo</p>
                  <ul className="space-y-1">
                    {CATALOGO_APARATOS.map((a) => (
                      <li key={a.tipo}><span className="font-semibold text-ink-950">{a.nombre}:</span> {a.fuente}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </section>

            {consejoPrincipal && (
              <section aria-labelledby="t-ahorro" className="rounded-2xl bg-leaf-500/10 p-5 ring-1 ring-leaf-600/20 sm:p-6">
                <h2 id="t-ahorro" className="flex items-center gap-2 text-lg font-bold text-ink-950">
                  <Lightbulb className="h-5 w-5 text-leaf-700" aria-hidden="true" />
                  Dónde ahorrar
                </h2>
                <p className="mt-2 text-base text-ink-950">{consejoPrincipal.consejo.texto}</p>
                {masConsejos.length > 0 && (
                  <details className="mt-2">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-ink-950 underline underline-offset-4 [&::-webkit-details-marker]:hidden">
                      Ver más consejos
                    </summary>
                    <ul className="mt-1 space-y-2 text-sm text-ink-950/85">
                      {masConsejos.map((m) => (
                        <li key={`${m.aparato}-${m.consejo.id}`} className="flex gap-2">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-700" />
                          {m.consejo.texto}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            )}

            <details className={tarjetaAcordeon}>
              <summary className={resumen}>
                <span className="flex items-center gap-2.5">
                  <FlaskConical className="h-5 w-5 text-ink-800" aria-hidden="true" />
                  ¿Y si agrego un aparato?
                </span>
                <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-5">
                <p className="mb-4 text-sm text-ink-950/75">Mira cuánto subiría tu recibo. No se guarda.</p>
                <Simulador />
              </div>
            </details>

            <TarjetaInvitar
              enlace={invitacion.codigo ? enlaceInvitacion(origen, invitacion.codigo) : null}
              aperturas={invitacion.aperturas}
              cuentas={invitacion.cuentas}
            />

            {/* Todo lo del recibo, cerrado por defecto. */}
            <details id="mi-recibo" className={clsx(tarjetaAcordeon, "scroll-mt-24")}>
              <summary className={resumen}>
                <span className="flex items-center gap-2.5">
                  <Receipt className="h-5 w-5 text-ink-800" aria-hidden="true" />
                  Mi recibo, historial y metas
                </span>
                <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
              </summary>
              <div className="space-y-6 px-5 pb-6">
                <div>
                  <h3 className="text-base font-bold text-ink-950">Tu recibo actual</h3>
                  {recibo ? (
                    <dl className="mt-3 grid grid-cols-2 gap-2">
                      <Dato label="Consumo">{recibo.consumo_kwh != null ? `${formatNumber(recibo.consumo_kwh)} kWh` : "—"}</Dato>
                      <Dato label="Valor">{recibo.valor != null ? formatCOP(recibo.valor) : "—"}</Dato>
                      <Dato label="Tarifa" nota="valor ÷ kWh">{recibo.tarifa_kwh != null ? `${formatCOP(Math.round(recibo.tarifa_kwh))}/kWh` : "—"}</Dato>
                      <Dato label="Mes"><span className="first-letter:uppercase">{mesTexto(recibo.mes)}</span></Dato>
                    </dl>
                  ) : (
                    <p className="mt-1 text-sm text-ink-950/75">Todavía no has guardado un recibo.</p>
                  )}
                  <div className="mt-4">
                    <FormularioRecibo boton={recibo ? "Actualizar recibo" : "Guardar recibo"} />
                  </div>
                  {!recibo?.tarifa_kwh && (
                    <form action={guardarTarifa} className="mt-4 border-t border-ink-950/10 pt-4">
                      <label className="block max-w-xs">
                        <span className={etiqueta}>O escribe tu tarifa ($ por kWh)</span>
                        <input name="tarifa_kwh" inputMode="decimal" defaultValue={tarifaManual ?? ""} className={campo} />
                      </label>
                      <button type="submit" className={`${botonSecundario} mt-3`}>Guardar tarifa</button>
                    </form>
                  )}
                </div>

                <div className="border-t border-ink-950/10 pt-5">
                  <Estadisticas est={estadisticas} metas={metas} />
                </div>

                {(resultado.actual || resultado.guardado) && (
                  <div className="border-t border-ink-950/10 pt-5">
                    <h3 className="text-base font-bold text-ink-950">¿Te convienen los paneles?</h3>
                    {resultado.actual ? (
                      <>
                        <p className="mt-1 text-sm font-semibold text-ink-950">{TEXTO_VEREDICTO[resultado.actual.veredicto]}</p>
                        <p className="mt-0.5 text-sm text-ink-950/75">
                          Con tu recibo actual ({formatNumber(Math.round(resultado.actual.consumoKwh))} kWh). Es el mismo cálculo del simulador.
                        </p>
                      </>
                    ) : (
                      resultado.guardado && <p className="mt-1 text-sm font-semibold text-ink-950">{TEXTO_VEREDICTO[resultado.guardado.veredicto]}</p>
                    )}
                    {resultado.guardado && (
                      <p className={clsx("text-sm text-ink-950/75", resultado.actual ? "mt-3 border-l-2 border-ink-950/15 pl-3" : "mt-0.5")}>
                        {textoGuardado(resultado.guardado, Boolean(resultado.actual))}
                        {" "}
                        {[
                          negocio?.resultado_kwp != null && `Sistema de ${formatDecimal(negocio.resultado_kwp)} kWp`,
                          negocio?.resultado_ahorro_mensual != null && `ahorro de ~${pesos(negocio.resultado_ahorro_mensual)} al mes`,
                          `retorno: ${retornoTexto(negocio?.resultado_retorno_meses ?? null)}`,
                        ].filter(Boolean).join(" · ")}
                        {" (estimado de ese día)."}
                        {resultado.cambio && " Cambió porque tu recibo o tus datos son otros."}
                      </p>
                    )}
                    {(resultado.actual?.veredicto ?? resultado.guardado?.veredicto) === "conviene" && (
                      <Link href="/#calculadora" className={`${botonPrimario} mt-3`}>Pedir cotización</Link>
                    )}
                  </div>
                )}
              </div>
            </details>

            <details id="datos-negocio" className={clsx(tarjetaAcordeon, "scroll-mt-24")}>
              <summary className={resumen}>
                <span className="flex items-center gap-2.5">
                  <Store className="h-5 w-5 text-ink-800" aria-hidden="true" />
                  Datos de tu negocio
                </span>
                <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-6">
                <p className="text-sm text-ink-950/75">
                  {negocio?.region ? `Región ${REGION_LABELS[negocio.region as Region] ?? negocio.region}. ` : ""}Con estos datos simulamos si te convienen los paneles.
                </p>
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
              </div>
            </details>

            <p className="flex items-start gap-2 px-1 text-sm text-ink-950/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700" aria-hidden="true" />
              Guardamos solo tu consumo y tu valor, no la foto de tu recibo. Otras cuentas no ven tus datos.
            </p>
          </div>
        </Container>
      </main>
    </>
  );
}

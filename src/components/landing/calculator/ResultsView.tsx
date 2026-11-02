"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { SUPUESTOS } from "@/lib/config/pricing";
import { formatCOP, formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import { cifrasPrincipales, numeroPaneles, type Cifras } from "@/lib/savings/cifras";
import type { AnalisisResultado, OfertaProveedor, Veredicto } from "@/lib/savings/types";
import { anios, ProveedorCard } from "./ProveedorCard";
import { SavingsCharts } from "./SavingsCharts";
import { ComoCalculamos } from "./ComoCalculamos";
import { Desplegable } from "./Desplegable";
import { DirectorioProveedores } from "./DirectorioProveedores";
import { EnergyResultsView } from "./EnergyResultsView";
import { PestanasResultado as Pestanas, type PestanaResultado as Pestana } from "./ResultTabs";

const VEREDICTO: Record<Veredicto, { titulo: string; color: string }> = {
  conviene: { titulo: "Te conviene pedir cotización", color: "text-leaf-400" },
  comparar: { titulo: "Puede convenirte: compara con calma", color: "text-sun-300" },
  por_ahora_no: { titulo: "Por ahora no te lo recomendamos", color: "text-ember-400" },
  sin_proveedores: { titulo: "Aún no hay un proveedor para tu caso", color: "text-sun-300" },
};

// Estable entre renders: si cambia, CountUp vuelve a contar desde cero.
const formatoPesos = (v: number) => formatCOP(Math.round(v));

function Proveedores({
  ofertas,
  recomendadaId,
  onElegir,
}: {
  ofertas: OfertaProveedor[];
  recomendadaId?: string;
  onElegir: (ofertaId: string, plan?: string) => void;
}) {
  // Un PPA no tiene inversión: no compite por "La menor inversión".
  const conInversion = ofertas.filter((o) => o.aplica && !o.ppa);
  const menorInversion =
    conInversion.length > 1 ? Math.min(...conInversion.map((o) => o.inversion)) : null;

  // La recomendada primero; las que no aplican, plegadas al final.
  const aplican = ofertas
    .filter((o) => o.aplica)
    .sort((a, b) => Number(b.id === recomendadaId) - Number(a.id === recomendadaId));
  const noAplican = ofertas.filter((o) => !o.aplica);

  return (
    <>
      {aplican.length > 0 ? (
        <div className="grid gap-3">
          {aplican.map((o) => (
            <ProveedorCard
              key={o.id}
              oferta={o}
              recomendada={o.id === recomendadaId}
              menorInversion={!o.ppa && o.inversion === menorInversion}
              onElegir={(plan) => onElegir(o.id, plan)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-800/65">Ningún proveedor aplica a tu caso por ahora.</p>
      )}
      {noAplican.length > 0 && (
        <Desplegable
          titulo={`${noAplican.length} ${noAplican.length === 1 ? "proveedor no aplica" : "proveedores no aplican"} a tu caso`}
          variante="plano"
          className="mt-3"
        >
          <div className="grid gap-3">
            {noAplican.map((o) => (
              <ProveedorCard key={o.id} oferta={o} recomendada={false} menorInversion={false} onElegir={() => {}} />
            ))}
          </div>
        </Desplegable>
      )}
    </>
  );
}


function CifraVeredicto({
  label,
  children,
  nota,
  grande,
}: {
  label: string;
  children: React.ReactNode;
  nota?: string;
  /** La cifra principal (el ahorro) va más grande y ocupa toda la fila. */
  grande?: boolean;
}) {
  return (
    <div className={grande ? "min-w-0 sm:col-span-2" : "min-w-0"}>
      <dt className="text-xs text-white/50">{label}</dt>
      <dd
        className={clsx(
          "mt-1 font-semibold tracking-[-0.02em] tabular-nums",
          grande ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
        )}
      >
        {children}
      </dd>
      {nota && <dd className="mt-0.5 text-xs text-white/45">{nota}</dd>}
    </div>
  );
}

export function ResultsView({
  resultado,
  recomendacion,
  horario,
  onCambiarDatos,
  onPedirCotizacion,
  onInteresSinProveedor,
}: {
  resultado: AnalisisResultado;
  recomendacion: string;
  /** Etiqueta del horario ("De día"…) para explicar el cálculo. */
  horario?: string;
  onCambiarDatos: () => void;
  onPedirCotizacion: (ofertaId: string, plan?: string) => void;
  onInteresSinProveedor: () => void;
}) {
  const idBase = useId();
  const [interesRegistrado, setInteresRegistrado] = useState(false);
  const paneles = resultado.alternativas[0];
  const veredicto = VEREDICTO[resultado.veredicto];
  const { ubicacion } = resultado;

  const inicial: Pestana =
    resultado.veredicto === "por_ahora_no" ? "calculo" : "proveedores";
  const [pestana, setPestana] = useState<Pestana>(inicial);

  if (resultado.energia?.requiereEstudio) return <EnergyResultsView resultado={resultado} onCambiarDatos={onCambiarDatos} onPedirCotizacion={onPedirCotizacion} />;
  if (!paneles) return null;
  const cifras: Cifras = cifrasPrincipales(paneles);
  const ofertas = paneles.ofertas;
  const enZona = ofertas.filter((o) => o.cubreZona);
  const ofertasVisibles = resultado.veredicto === "sin_proveedores" ? enZona : ofertas;
  const cuantasAplican = (resultado.proveedores?.length ?? 0) + ofertasVisibles.filter((o) => o.aplica).length;

  const pestanas: { id: Pestana; label: string; corto: string }[] = [
    {
      id: "proveedores",
      label: cuantasAplican > 0 ? `Proveedores (${cuantasAplican})` : "Proveedores",
      corto: cuantasAplican > 0 ? `Proveedores (${cuantasAplican})` : "Proveedores",
    },
    { id: "ahorro", label: "Ahorro a 20 años", corto: "20 años" },
    { id: "calculo", label: "Cómo calculamos", corto: "El cálculo" },
  ];

  const necesitas = `El sistema base sería de unos ${formatDecimal(paneles.kwpRequeridos)} kWp, cerca de ${numeroPaneles(paneles.kwpRequeridos)} paneles de ${SUPUESTOS.wattsPanel} W.`;
  const conQuien = cifras.finanzas?.origen === "cotizacion_usuario"
    ? " Se usa la inversión total instalada que ingresaste."
    : !cifras.oferta
    ? " Calculamos con un precio de referencia."
    : cifras.oferta.plan
      ? ` Las cifras son del ${cifras.oferta.plan.nombre} de ${cifras.oferta.proveedor}, de ${formatDecimal(cifras.oferta.plan.kwp)} kW.`
      : ` Las cifras son de ${cifras.oferta.proveedor}.`;

  return (
    <div>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">
        Tu resultado
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        Con {formatNumber(resultado.consumoMensualKwh)} kWh al mes{resultado.consumoEstimado ? " estimados" : ""}, una factura {resultado.valorEstimado ? "estimada " : ""}de{" "}
        {formatCOP(resultado.valorPagadoMensual)} y {formatDecimal(ubicacion.hsp)} horas de sol pico al día
        {ubicacion.departamento ? ` en ${ubicacion.departamento}` : ""}.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
      {/* Izquierda: la recomendación queda fija mientras se recorre la derecha. */}
      <div className="lg:sticky lg:top-24">
      <section className="min-w-0 rounded-2xl bg-ink-950 p-4 text-white sm:p-6">
        <p className="text-xs font-semibold text-white/50">Nuestra recomendación</p>
        <p className={clsx("mt-2 text-2xl font-bold tracking-[-0.02em]", veredicto.color)}>{veredicto.titulo}</p>
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-white/80 sm:text-base">{recomendacion}</p>

        <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
          <CifraVeredicto
            label="Ahorro energético inicial al mes"
            nota={`${paneles.ahorroPorcentual} % de tu factura, antes de mantenimiento y reposiciones`}
            grande
          >
            <CountUp value={Math.round(cifras.ahorroMensual / 1000) * 1000} format={formatoPesos} />
          </CifraVeredicto>
          <CifraVeredicto label={cifras.oferta ? "Inversión" : "Inversión de referencia"} nota={cifras.finanzas && cifras.finanzas.inversionMin !== cifras.finanzas.inversionMax ? `${formatCOPMiles(cifras.finanzas.inversionMin!)} a ${formatCOPMiles(cifras.finanzas.inversionMax!)}` : undefined}>{formatCOPMiles(cifras.inversion)}</CifraVeredicto>
          <CifraVeredicto label={cifras.oferta ? "Se paga en" : "Retorno de referencia"}>
            <span className={clsx(resultado.veredicto === "por_ahora_no" && "text-ember-400")}>
              {anios(cifras.retornoMeses)}
            </span>
          </CifraVeredicto>
        </dl>
        {cifras.finanzas?.simulacionTributaria && <p className="mt-4 text-xs leading-relaxed text-white/65">El retorno incluye una simulación de deducción de renta que debe validar el contador.</p>}
        <p className="mt-5 text-xs leading-relaxed text-white/45">
          {necesitas}
          {conQuien} La cifra final la da el instalador.
        </p>
      </section>

        <div className="mt-4">
          <Button variant="ghost" size="md" onClick={onCambiarDatos}>
            <Pencil className="h-4 w-4" />
            Cambiar mis datos
          </Button>
        </div>
      </div>

      {/* Derecha: proveedores, ahorro en el tiempo y la cuenta. */}
      <div className="min-w-0">
        <Pestanas pestanas={pestanas} activa={pestana} onCambiar={setPestana} idBase={idBase} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pestana}
            role="tabpanel"
            id={`${idBase}-panel-${pestana}`}
            aria-labelledby={`${idBase}-tab-${pestana}`}
            tabIndex={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pt-5 outline-none"
          >
            {pestana === "proveedores" && (
              <>
                {resultado.veredicto === "por_ahora_no" && cuantasAplican > 0 && (
                  <p className="mb-4 text-sm text-ink-800/65">
                    Con los precios de hoy no te lo recomendamos, pero si quieres puedes cotizar igual.
                  </p>
                )}
                <DirectorioProveedores
                  onElegir={onPedirCotizacion}
                  proveedores={resultado.proveedores ?? []}
                  comunitarios={resultado.proveedoresComunitarios}
                />
                {ofertasVisibles.length > 0 && (
                  <div className="mt-6 border-t border-ink-950/10 pt-5">
                    <h4 className="mb-3 text-sm font-semibold text-ink-950">Escenarios con precio registrado</h4>
                    <Proveedores ofertas={ofertasVisibles} recomendadaId={cifras.oferta?.id} onElegir={onPedirCotizacion} />
                  </div>
                )}
              </>
            )}
            {pestana === "ahorro" && <SavingsCharts cifras={cifras} />}
            {pestana === "calculo" && (
              <ComoCalculamos resultado={resultado} paneles={paneles} cifras={cifras} horario={horario} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

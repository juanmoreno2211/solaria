"use client";

import { useState } from "react";
import { BatteryWarning, Pencil } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { formatCOP, formatNumber } from "@/lib/format";
import type { AnalisisResultado, OfertaProveedor, Veredicto } from "@/lib/savings/types";
import { ResultCard } from "./ResultCard";
import { SavingsCharts } from "./SavingsCharts";
import { FinancingSimulator } from "./FinancingSimulator";
import { ProveedorCard } from "./ProveedorCard";

const VEREDICTO: Record<Veredicto, { titulo: string; color: string }> = {
  conviene: { titulo: "Te conviene pedir cotización", color: "text-leaf-400" },
  comparar: { titulo: "Puede convenirte: compara con calma", color: "text-sun-300" },
  por_ahora_no: { titulo: "Por ahora no te lo recomendamos", color: "text-ember-400" },
  sin_proveedores: { titulo: "Aún no hay un proveedor para tu caso", color: "text-sun-300" },
};

function ProveedoresGrid({
  ofertas,
  onPedir,
}: {
  ofertas: OfertaProveedor[];
  onPedir: (proveedor: string, plan?: string) => void;
}) {
  const aplican = ofertas.filter((o) => o.aplica);
  const menorInversion =
    aplican.length > 1 ? Math.min(...aplican.map((o) => o.inversion)) : null;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {ofertas.map((o) => (
        <ProveedorCard
          key={o.proveedor}
          oferta={o}
          menorInversion={o.aplica && o.inversion === menorInversion}
          onPedir={(plan) => onPedir(o.proveedor, plan)}
        />
      ))}
    </div>
  );
}

export function ResultsView({
  resultado,
  recomendacion,
  onCambiarDatos,
  onPedirCotizacion,
  onInteresSinProveedor,
}: {
  resultado: AnalisisResultado;
  recomendacion: string;
  onCambiarDatos: () => void;
  onPedirCotizacion: (proveedor: string, plan?: string) => void;
  onInteresSinProveedor: () => void;
}) {
  const [verProveedores, setVerProveedores] = useState(false);
  const [interesRegistrado, setInteresRegistrado] = useState(false);

  const paneles = resultado.alternativas.find(
    (a) => a.id === resultado.mejorAlternativaId
  );
  const veredicto = VEREDICTO[resultado.veredicto];
  const ofertas = paneles?.ofertas ?? [];
  const enZona = ofertas.filter((o) => o.cubreZona);

  return (
    <Reveal y={16}>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">
        Tu resultado
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        Basado en {formatNumber(resultado.consumoMensualKwh)} kWh/mes y{" "}
        {formatCOP(resultado.valorPagadoMensual)} de factura mensual.
      </p>

      <div className="mt-5 rounded-2xl bg-ink-950 p-6 text-white sm:p-7">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
          Nuestra recomendación
        </span>
        <p className={clsx("mt-2 text-2xl font-bold", veredicto.color)}>
          {veredicto.titulo}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          {recomendacion}
        </p>

        {paneles && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-xs text-white/45">Ahorro mensual estimado</p>
              <p className="text-2xl font-bold">
                <CountUp
                  value={paneles.ahorroMensualEstimado}
                  format={(v) => formatCOP(Math.round(v))}
                />
              </p>
            </div>
            <div>
              <p className="text-xs text-white/45">Ahorro sobre tu factura</p>
              <p className="text-2xl font-bold text-sun-300">
                <CountUp
                  value={paneles.ahorroPorcentual}
                  format={(v) => `${Math.round(v)}%`}
                />
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-ink-800/75">
        <BatteryWarning className="mt-0.5 h-4 w-4 shrink-0 text-ember-600" />
        Este cálculo estima tu ahorro en la factura. Para tener luz durante un
        corte se necesitan baterías, que suben la inversión.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink-800/45">
        La cifra final depende de la cotización de un instalador.
      </p>

      {paneles && (resultado.veredicto === "conviene" || resultado.veredicto === "comparar") && (
        <section className="mt-8">
          <h4 className="text-base font-bold text-ink-950">Con quién cotizar</h4>
          <p className="mt-1 text-xs text-ink-800/50">
            Los precios son estimados de referencia de cada proveedor.
          </p>
          <ProveedoresGrid ofertas={paneles.ofertas} onPedir={onPedirCotizacion} />
        </section>
      )}

      {paneles && resultado.veredicto === "por_ahora_no" && paneles.ofertas.some((o) => o.aplica) && (
        <section className="mt-6">
          {verProveedores ? (
            <ProveedoresGrid ofertas={paneles.ofertas} onPedir={onPedirCotizacion} />
          ) : (
            <button
              type="button"
              onClick={() => setVerProveedores(true)}
              className="text-sm font-semibold text-sun-600 underline-offset-4 hover:underline"
            >
              Ver cotizaciones de todas formas
            </button>
          )}
        </section>
      )}

      {resultado.veredicto === "sin_proveedores" && enZona.length > 0 && (
        <section className="mt-8">
          <h4 className="text-base font-bold text-ink-950">Proveedores en tu zona</h4>
          <ProveedoresGrid ofertas={enZona} onPedir={onPedirCotizacion} />
        </section>
      )}

      {resultado.veredicto === "sin_proveedores" && (
        <section className="mt-8 rounded-2xl border border-black/8 bg-cream-100/70 p-6">
          <h4 className="text-base font-bold text-ink-950">
            Cuéntanos que te interesa
          </h4>
          <p className="mt-1 text-sm text-ink-800/65">
            Así sabemos en qué regiones buscar proveedores primero.
          </p>
          {interesRegistrado ? (
            <p role="status" className="mt-4 text-sm font-medium text-leaf-700">
              Gracias, registramos tu interés.
            </p>
          ) : (
            <Button
              size="md"
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                setInteresRegistrado(true);
                onInteresSinProveedor();
              }}
            >
              Avísame cuando haya proveedores
            </Button>
          )}
        </section>
      )}

      {paneles && (
        <>
          <div
            className={clsx(
              "mt-8 grid gap-5",
              !paneles.mejorOferta && "lg:grid-cols-[0.85fr_1.15fr]"
            )}
          >
            {!paneles.mejorOferta && <ResultCard alternativa={paneles} />}
            <SavingsCharts mejor={paneles} />
          </div>
          {paneles.mejorOferta && <FinancingSimulator mejor={paneles} />}
        </>
      )}

      <div className="mt-8">
        <Button variant="ghost" size="md" onClick={onCambiarDatos}>
          <Pencil className="h-4 w-4" />
          Cambiar mis datos
        </Button>
      </div>
    </Reveal>
  );
}

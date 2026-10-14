import { Button } from "@/components/ui/Button";
import { formatCOPMiles, formatDecimal } from "@/lib/format";
import type { OfertaProveedor } from "@/lib/savings/types";

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs text-ink-800/55">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink-950">{children}</dd>
    </div>
  );
}

function Nota({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-normal text-ink-800/50">{children}</span>;
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-ink-950/6 px-2 py-0.5 text-[11px] font-semibold text-ink-900/70">
      {children}
    </span>
  );
}

export function ProveedorCard({
  oferta,
  menorInversion,
  onPedir,
}: {
  oferta: OfertaProveedor;
  menorInversion: boolean;
  onPedir: () => void;
}) {
  const { financiacion: fin } = oferta;

  if (!oferta.aplica) {
    return (
      <article className="rounded-xl border border-dashed border-ink-950/12 bg-white/60 p-5 text-ink-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="text-base font-bold text-ink-950/50">{oferta.proveedor}</h5>
          {oferta.esSimulado && <Etiqueta>Proveedor de ejemplo</Etiqueta>}
        </div>
        <p className="mt-2 text-sm">{oferta.motivoNoAplica}</p>
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-xl border border-ink-950/10 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h5 className="text-base font-bold text-ink-950">{oferta.proveedor}</h5>
        {oferta.esSimulado && <Etiqueta>Proveedor de ejemplo</Etiqueta>}
        {menorInversion && <Etiqueta>Menor inversión</Etiqueta>}
        {fin && <Etiqueta>Con financiación</Etiqueta>}
      </div>

      <dl className="mt-3 divide-y divide-ink-950/6">
        <Fila label="Inversión estimada">
          ≈ {formatCOPMiles(oferta.inversion)}
          <Nota>
            entre {formatCOPMiles(oferta.inversionMin)} y {formatCOPMiles(oferta.inversionMax)}
          </Nota>
        </Fila>
        {fin ? (
          <>
            <Fila label="Cuota inicial">{formatCOPMiles(fin.cuotaInicial)}</Fila>
            <Fila label="Cuota mensual">
              {formatCOPMiles(fin.cuotaMensual)}
              <Nota>durante {fin.plazoMeses} meses</Nota>
            </Fila>
            <Fila label="Ahorro menos cuota">
              <span className={fin.flujoMensual >= 0 ? "text-leaf-700" : "text-red-700"}>
                {fin.flujoMensual >= 0 ? "+" : "−"}
                {formatCOPMiles(Math.abs(fin.flujoMensual))}
              </span>
              <Nota>al mes mientras pagas</Nota>
            </Fila>
          </>
        ) : (
          <>
            <Fila label="Forma de pago">
              <span className="font-medium">{oferta.pagoDescripcion}</span>
            </Fila>
            {oferta.primerPago !== undefined && (
              <Fila label="Primer pago">{formatCOPMiles(oferta.primerPago)}</Fila>
            )}
          </>
        )}
        <Fila label="Se paga en">
          {oferta.retornoMeses !== null
            ? `${formatDecimal(oferta.retornoMeses / 12)} años`
            : "No se paga"}
        </Fila>
        {oferta.instalacion && <Fila label="Instalación">{oferta.instalacion}</Fila>}
      </dl>

      <Button size="md" className="mt-4 w-full" onClick={onPedir}>
        Pedir cotización con {oferta.proveedor}
      </Button>
    </article>
  );
}

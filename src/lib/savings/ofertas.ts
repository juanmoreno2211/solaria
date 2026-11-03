import { MANTENIMIENTO_ANUAL, type Region } from "@/lib/config/pricing";
import {
  buscarPanelesSistemas,
  type PlanEvaluado,
  type SistemaEvaluado,
  type Ubicacion,
} from "@/lib/catalog/lookup";
import type { CatalogoPanelSistema, SistemaVendible } from "@/lib/catalog/types";
import { calcularRetornoMeses } from "./retorno";
import type { OfertaProveedor, PagoSimulado } from "./types";

/** Cuota fija de un crédito: monto × i ÷ (1 − (1 + i)^−n). */
export function cuotaMensual(monto: number, tasaMensual: number, plazoMeses: number): number {
  if (tasaMensual === 0) return monto / plazoMeses;
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
}

/** Cuota mensual y flujo (ahorro − cuota − mantenimiento) con una cuota inicial dada. */
export function simularPago(
  inversion: number,
  ahorroMensual: number,
  cuotaInicialPct: number,
  tasaMensual: number,
  plazoMeses: number
): PagoSimulado {
  const cuotaInicial = inversion * cuotaInicialPct;
  const monto = inversion - cuotaInicial;
  const cuota = cuotaMensual(monto, tasaMensual, plazoMeses);
  return {
    cuotaInicialPct,
    cuotaInicial,
    monto,
    cuotaMensual: cuota,
    plazoMeses,
    flujoMensual: ahorroMensual - cuota - (inversion * MANTENIMIENTO_ANUAL) / 12,
  };
}

/** "En el resto …" de cada región. */
const RESTO_REGION: Record<Region, string> = {
  caribe: "del Caribe",
  andina: "de la región Andina",
  pacifico: "del Pacífico",
  orinoquia: "de la Orinoquía",
  amazonia: "de la Amazonía",
  insular: "de San Andrés y Providencia",
};

const listaEs = new Intl.ListFormat("es", { type: "conjunction" });

/** Nota para quien está fuera de los departamentos confirmados del proveedor. */
function notaCobertura(
  sistema: SistemaVendible,
  { region, departamento }: Ubicacion
): string | undefined {
  if (sistema.notaCobertura) return sistema.notaCobertura;
  const confirmados = sistema.departamentosConfirmados;
  if (!confirmados || (departamento && confirmados.includes(departamento))) return undefined;
  return `Atiende ${listaEs.format(confirmados)}. En el resto ${RESTO_REGION[region]}, por confirmar con el proveedor.`;
}

function titulo(sistema: SistemaVendible): string {
  if (!sistema.tipoOferta || !sistema.nombreOferta) return sistema.proveedor;
  const nombre = sistema.nombreOferta.charAt(0).toLowerCase() + sistema.nombreOferta.slice(1);
  return `${sistema.proveedor}, ${nombre} (${sistema.tipoOferta})`;
}

/** Datos de la tarjeta que no dependen del precio. */
function datosTarjeta(
  { sistema, cubreZona, aplica, motivoNoAplica }: SistemaEvaluado,
  nota: string | undefined
) {
  return {
    id: sistema.id,
    proveedor: sistema.proveedor,
    titulo: titulo(sistema),
    tipoOferta: sistema.tipoOferta,
    estadoDatos: sistema.estadoDatos,
    origenDatos: sistema.origenDatos,
    etiqueta: sistema.etiqueta,
    requiereVisitaTecnica: sistema.requiereVisitaTecnica,
    cubreZona,
    aplica,
    motivoNoAplica,
    notaCobertura: nota,
  };
}

/**
 * PPA: no hay inversión ni retorno. El cliente paga la energía que genera el
 * sistema con un descuento sobre la tarifa de la red y se ahorra ese descuento.
 * El mantenimiento lo hace el proveedor. ahorroMensual es el costo de red
 * evitado (energía generada, con tope en la energía a cubrir, por la tarifa).
 */
function armarOfertaPPA(
  evaluado: SistemaEvaluado,
  ppa: { descuentoSobreRed: number; contrato?: string | null },
  ahorroMensual: number,
  nota: string | undefined
): OfertaProveedor {
  return {
    ...datosTarjeta(evaluado, nota),
    inversion: 0,
    inversionMin: 0,
    inversionMax: 0,
    ahorroMensual: ahorroMensual * ppa.descuentoSobreRed,
    mantenimientoMensual: 0,
    retornoMeses: null,
    ppa: {
      pagoMensual: ahorroMensual * (1 - ppa.descuentoSobreRed),
      descuentoSobreRed: ppa.descuentoSobreRed,
      contrato: ppa.contrato ?? undefined,
    },
  };
}

/** Inversión, retorno y forma de pago de un proveedor (o de uno de sus planes). */
function armarOferta(
  evaluado: SistemaEvaluado,
  inversion: number,
  ahorroMensual: number,
  plan: PlanEvaluado | undefined,
  nota: string | undefined
): OfertaProveedor {
  const { sistema, aplica } = evaluado;
  const margen = sistema.margenPrecio ?? 0.1;
  const oferta: OfertaProveedor = {
    ...datosTarjeta(evaluado, nota),
    inversion,
    inversionMin: plan?.plan.precioMin ?? inversion * (1 - margen),
    inversionMax: plan?.plan.precioMax ?? inversion * (1 + margen),
    ahorroMensual,
    mantenimientoMensual: (inversion * MANTENIMIENTO_ANUAL) / 12,
    retornoMeses: calcularRetornoMeses(inversion, ahorroMensual),
    plan: plan && { nombre: plan.plan.nombre, kwp: plan.plan.kwp },
    instalacion: sistema.instalacion ?? undefined,
    pagoDescripcion: sistema.pagoDescripcion,
  };

  const f = sistema.financiacion;
  if (f) {
    oferta.financiacion = simularPago(
      inversion,
      ahorroMensual,
      f.cuotaInicialPct,
      f.tasaMensual,
      f.plazoMeses
    );
  } else if (sistema.estadoDatos === "simulado") {
    oferta.primerPago = inversion * 0.5;
  }

  const sim = sistema.simulacionPago;
  if (sim && aplica) {
    oferta.simulacionPago = {
      tasaMensual: sim.tasaMensual,
      plazoMeses: sim.plazoMeses,
      opciones: sim.opcionesCuotaInicialPct.map((pct) =>
        simularPago(inversion, ahorroMensual, pct, sim.tasaMensual, sim.plazoMeses)
      ),
    };
  }

  return oferta;
}

/**
 * Calcula, para cada proveedor que se muestra, la inversión, el retorno y la
 * forma de pago con el tamaño de sistema y el ahorro ya estimados. Con planes
 * fijos se paga el precio del plan y el ahorro baja si el plan cubre menos de
 * lo necesario. Función pura: no redondea; el redondeo es solo para mostrar.
 */
export function calcularOfertas(
  kwp: number,
  ahorroMensual: number,
  ubicacion: Ubicacion,
  sistemas?: CatalogoPanelSistema[]
): OfertaProveedor[] {
  return buscarPanelesSistemas(kwp, ahorroMensual, ubicacion, sistemas).map((evaluado) => {
    const { sistema, plan, planCubreMas, cubreZona } = evaluado;
    const nota = cubreZona ? notaCobertura(sistema, ubicacion) : undefined;

    if (sistema.planes) {
      const oferta = armarOferta(
        evaluado,
        plan?.plan.precio ?? 0,
        plan?.ahorroMensual ?? ahorroMensual,
        plan,
        nota
      );
      if (planCubreMas) {
        oferta.cubreMas = armarOferta(
          evaluado,
          planCubreMas.plan.precio,
          planCubreMas.ahorroMensual,
          planCubreMas,
          undefined
        );
      }
      return oferta;
    }
    if (sistema.ppa) return armarOfertaPPA(evaluado, sistema.ppa, ahorroMensual, nota);
    return armarOferta(evaluado, kwp * sistema.precioPorKwpCOP, ahorroMensual, undefined, nota);
  });
}

/** La oferta que aplica con el menor tiempo de retorno (un PPA no tiene retorno). */
export function elegirMejorOferta(
  ofertas: OfertaProveedor[]
): OfertaProveedor | undefined {
  return ofertas
    .filter((o) => o.aplica && o.retornoMeses !== null)
    .reduce<OfertaProveedor | undefined>(
      (mejor, o) => (!mejor || o.retornoMeses! < mejor.retornoMeses! ? o : mejor),
      undefined
    );
}

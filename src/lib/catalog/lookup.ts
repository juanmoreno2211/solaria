import catalogoJson from "./data/catalogo.json";
import { PLAN_COBERTURA_MINIMA, PLAN_USO_MINIMO, type Region } from "@/lib/config/pricing";
import { formatDecimal } from "@/lib/format";
import { calcularRetornoMeses } from "@/lib/savings/retorno";
import type {
  CatalogoData,
  CatalogoPanelSistema,
  PlanProveedor,
  RegionesCobertura,
  SistemaVendible,
} from "./types";

const catalogo = catalogoJson as CatalogoData;

export interface Ubicacion {
  region: Region;
  departamento?: string;
}

/** Un plan con la parte del sistema necesario que cubre y el ahorro que da. */
export interface PlanEvaluado {
  plan: PlanProveedor;
  /** Qué parte del sistema necesario cubre el plan (0 a 1). */
  cobertura: number;
  ahorroMensual: number;
  retornoMeses: number | null;
}

export interface SistemaEvaluado {
  sistema: SistemaVendible;
  /** Atiende la región del negocio. */
  cubreZona: boolean;
  aplica: boolean;
  motivoNoAplica?: string;
  /** Plan recomendado, para proveedores que venden por planes. */
  plan?: PlanEvaluado;
  /** Otro plan que cubre todo el sistema necesario ("Cubre más de tu consumo"). */
  planCubreMas?: PlanEvaluado;
}

function cubreRegion(regiones: RegionesCobertura, region: Region): boolean {
  if (regiones === "nacional") return true;
  return regiones.includes(region);
}

const listaEs = new Intl.ListFormat("es", { type: "conjunction" });

// Margen para que 4 kW ÷ 5 kWp cuente como el 80 % pese al redondeo binario.
const EPSILON = 1e-9;

/**
 * Evalúa cada plan por cercanía al sistema necesario: aplica si cubre al menos
 * PLAN_COBERTURA_MINIMA de lo necesario y se aprovecha al menos PLAN_USO_MINIMO
 * del plan. Recomienda el de menor retorno (si empatan, el más barato). El
 * ahorro de un plan más chico que lo necesario baja en proporción a lo que cubre.
 */
export function elegirPlan(
  kwp: number,
  ahorroMensual: number,
  planes: PlanProveedor[],
  motivoFueraDeRango?: string
): { plan?: PlanEvaluado; planCubreMas?: PlanEvaluado; motivoNoAplica?: string } {
  const ordenados = [...planes].sort((a, b) => a.kwp - b.kwp);
  const evaluados = ordenados.map((plan) => {
    const cobertura = Math.min(1, plan.kwp / kwp);
    const uso = Math.min(1, kwp / plan.kwp);
    const ahorro = ahorroMensual * cobertura;
    return {
      plan,
      cobertura,
      uso,
      ahorroMensual: ahorro,
      retornoMeses: calcularRetornoMeses(plan.precio, ahorro),
    };
  });
  const aplican = evaluados.filter(
    (e) => e.cobertura >= PLAN_COBERTURA_MINIMA - EPSILON && e.uso >= PLAN_USO_MINIMO - EPSILON
  );

  if (aplican.length === 0) {
    if (motivoFueraDeRango) return { motivoNoAplica: motivoFueraDeRango };
    const menor = evaluados[0];
    const mayor = evaluados[evaluados.length - 1];
    if (menor.uso < PLAN_USO_MINIMO) {
      return {
        motivoNoAplica: `Su plan más pequeño es de ${formatDecimal(menor.plan.kwp)} kW y tu sistema necesario sería de ${formatDecimal(kwp)} kWp.`,
      };
    }
    if (mayor.cobertura < PLAN_COBERTURA_MINIMA) {
      return { motivoNoAplica: "Tu consumo requiere un sistema a medida: cotiza directamente." };
    }
    return {
      motivoNoAplica: `Sus planes son de ${listaEs.format(ordenados.map((p) => formatDecimal(p.kwp)))} kW y ninguno se ajusta a tu sistema de ${formatDecimal(kwp)} kWp.`,
    };
  }

  const recomendado = aplican.reduce((mejor, e) => {
    const rm = mejor.retornoMeses ?? Infinity;
    const re = e.retornoMeses ?? Infinity;
    return re < rm || (re === rm && e.plan.precio < mejor.plan.precio) ? e : mejor;
  });
  // Solo si el recomendado no cubre todo lo necesario: el más chico que sí lo cubre.
  const cubreMas =
    recomendado.cobertura < 1 ? aplican.find((e) => e.cobertura >= 1) : undefined;

  const sinUso = ({ plan, cobertura, ahorroMensual, retornoMeses }: (typeof evaluados)[number]) => ({
    plan,
    cobertura,
    ahorroMensual,
    retornoMeses,
  });
  return { plan: sinUso(recomendado), planCubreMas: cubreMas && sinUso(cubreMas) };
}

function evaluar(
  sistema: SistemaVendible,
  kwp: number,
  ahorroMensual: number,
  { region }: Ubicacion
): SistemaEvaluado {
  if (!cubreRegion(sistema.regiones, region)) {
    return {
      sistema,
      cubreZona: false,
      aplica: false,
      motivoNoAplica: "Todavía no llega a tu región.",
    };
  }
  if (sistema.planes) {
    const { plan, planCubreMas, motivoNoAplica } = elegirPlan(
      kwp,
      ahorroMensual,
      sistema.planes,
      sistema.motivoFueraDeRango
    );
    return { sistema, cubreZona: true, aplica: Boolean(plan), motivoNoAplica, plan, planCubreMas };
  }
  if (kwp < sistema.kwpMin) {
    return {
      sistema,
      cubreZona: true,
      aplica: false,
      motivoNoAplica: `Instala desde ${formatDecimal(sistema.kwpMin)} kWp y tu sistema sería de ${formatDecimal(kwp)} kWp.`,
    };
  }
  if (kwp > sistema.kwpMax) {
    return {
      sistema,
      cubreZona: true,
      aplica: false,
      motivoNoAplica: `Instala hasta ${formatDecimal(sistema.kwpMax)} kWp y tu sistema sería de ${formatDecimal(kwp)} kWp.`,
    };
  }
  return { sistema, cubreZona: true, aplica: true };
}

/**
 * Un proveedor con varias ofertas (EPC y PPA) se vuelve una entrada por oferta,
 * cada una con su tarjeta. Los demás quedan igual, con el proveedor como id.
 */
export function separarOfertas(sistema: CatalogoPanelSistema): SistemaVendible[] {
  if (!sistema.ofertas) return [{ ...sistema, id: sistema.proveedor }];
  const { ofertas, ...base } = sistema;
  return ofertas.map((o): SistemaVendible => {
    const comun = {
      ...base,
      id: `${sistema.proveedor}:${o.tipo}`,
      tipoOferta: o.tipo,
      nombreOferta: o.nombre,
      kwpMin: o.kwpMin,
      kwpMax: o.kwpMax,
    };
    if (o.tipo === "PPA") {
      return {
        ...comun,
        ppa: { descuentoSobreRed: o.descuentoSobreRed, contrato: o.contrato },
      };
    }
    return {
      ...comun,
      precioPorKwpCOP: o.precioPorKwpCOP,
      margenPrecio: o.margenPrecio,
      instalacion: o.instalacion,
      financiacion: o.financiacion,
      pagoDescripcion: o.pagoDescripcion,
    };
  });
}

/**
 * Devuelve los proveedores de paneles que se le muestran al usuario, cada uno
 * con si aplica para este negocio y, si no, el motivo.
 *
 * Nunca se mezclan proveedores reales y de ejemplo: si un proveedor real
 * atiende la región (aunque no aplique por tamaño), los de ejemplo se ocultan.
 * Los reales solo aparecen en las regiones que atienden.
 */
export function buscarPanelesSistemas(
  kwpRequeridos: number,
  ahorroMensual: number,
  ubicacion: Ubicacion,
  sistemas: CatalogoPanelSistema[] = catalogo.paneles.filter((s) => !s.soloReferenciaInterna)
): SistemaEvaluado[] {
  const hayReal = sistemas.some(
    (s) => s.estadoDatos !== "simulado" && cubreRegion(s.regiones, ubicacion.region)
  );
  return sistemas
    .filter((s) =>
      s.estadoDatos === "simulado" ? !hayReal : cubreRegion(s.regiones, ubicacion.region)
    )
    .flatMap(separarOfertas)
    .map((s) => evaluar(s, kwpRequeridos, ahorroMensual, ubicacion));
}

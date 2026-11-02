/** Referencias de presupuesto, no tarifas ni cotizaciones de los proveedores. */
export const REFERENCIAS_COSTOS = {
  fecha: "2026-11-02",
  bateria: {
    modelo: "Felicity FLA48100-EU, 51,2 V",
    capacidadNominalKwh: 5.12,
    precioEquipoCOP: 4_868_231,
    fuente: "https://autosolar.co/baterias-de-litio",
    alcance: "Precio publicado de equipo; instalación y envío se presupuestan aparte. La compatibilidad debe validarse.",
  },
  mantenimiento: { minimo: 0.01, base: 0.015, maximo: 0.02, fuente: "https://blog.erco.energy/mantenimiento-operacion-sistemas-solares-empresas/" },
  normativa: "https://normograma.dian.gov.co/dian/compilacion/docs/ley_1715_2014.htm",
} as const;

/** Calibración a partir de los rangos aportados por el usuario. No son ofertas verificadas. */
const ANCLAS = [
  { kwp: 3, min: 4_000_000, max: 6_000_000 },
  { kwp: 10, min: 3_500_000, max: 5_000_000 },
  { kwp: 20, min: 3_200_000, max: 4_500_000 },
  { kwp: 60, min: 2_800_000, max: 4_000_000 },
];
export function presupuestoSolar(kwp: number) {
  if (!Number.isFinite(kwp) || kwp <= 0) throw new RangeError("La potencia solar debe ser positiva.");
  const superior = ANCLAS.findIndex((a) => kwp <= a.kwp);
  const a = superior <= 0 ? ANCLAS[superior < 0 ? ANCLAS.length - 1 : 0] : ANCLAS[superior - 1];
  const b = superior <= 0 ? a : ANCLAS[superior];
  const factor = a === b ? 0 : (kwp - a.kwp) / (b.kwp - a.kwp);
  const minimo = kwp * (a.min + (b.min - a.min) * factor);
  const maximo = kwp * (a.max + (b.max - a.max) * factor);
  return { minimo, base: (minimo + maximo) / 2, maximo };
}

export const SUPUESTOS_FINANCIEROS = {
  degradacionAnualPct: 0.5,
  reposicionBateriaAnios: 10,
  /** Margen de presupuesto adicional al sistema sin baterías, no precio de un inversor completo. */
  adecuacionRespaldoPct: 0.2,
  instalacionReposicionPct: 0.1,
  deduccionMaxima: 0.5,
  limiteRentaLiquida: 0.5,
  plazoDeduccionAnios: 15,
  depreciacionMaximaAnualPct: 33.33,
} as const;

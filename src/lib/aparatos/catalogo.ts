/**
 * Aparatos comunes en un micronegocio con valores de referencia. El usuario
 * puede corregir potencia, factor de ciclo y horas; si conoce el consumo de la
 * etiqueta energética (kWh al año), esa cifra manda.
 *
 * factorCiclo: fracción del tiempo encendido en que el aparato trabaja a su
 * potencia nominal. Neveras, congeladores y aires prenden y apagan el compresor;
 * luces y computadores valen 1.
 */
export type TipoAparato =
  | "aire"
  | "nevera"
  | "congelador"
  | "computador"
  | "camaras"
  | "luces"
  | "ventilador"
  | "datafono"
  | "planta";

export interface AparatoCatalogo {
  tipo: TipoAparato;
  nombre: string;
  potenciaW: number;
  factorCiclo: number;
  horasDia: number;
  /** De dónde sale cada valor. Lo que no tiene fuente dice "estimación del equipo, por verificar". */
  fuente: string;
  /** Genera energía en vez de consumirla de la red: no suma al recibo. */
  generaEnergia?: boolean;
}

const VT = "Virginia Cooperative Extension, “Estimating Appliance and Home Electronic Energy Use”, BSE-301NP (2020)";
const POR_VERIFICAR = "estimación del equipo, por verificar";

export const CATALOGO_APARATOS: AparatoCatalogo[] = [
  {
    tipo: "nevera",
    nombre: "Nevera",
    potenciaW: 725,
    factorCiclo: 1 / 3,
    horasDia: 24,
    fuente: `Potencia y factor de ciclo: ${VT} (nevera de 16 pies³; el compresor trabaja cerca de un tercio del tiempo). Horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "congelador",
    nombre: "Congelador",
    potenciaW: 300,
    factorCiclo: 0.4,
    horasDia: 24,
    fuente: `Potencia, factor y horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "aire",
    nombre: "Aire acondicionado",
    potenciaW: 1100,
    factorCiclo: 0.5,
    horasDia: 8,
    fuente: `Potencia (equipo de 12.000 BTU), factor y horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "computador",
    nombre: "Computador o caja registradora",
    potenciaW: 120,
    factorCiclo: 1,
    horasDia: 10,
    fuente: `Potencia: ${VT} (torre de escritorio encendida, sin monitor). Horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "camaras",
    nombre: "Cámara de seguridad",
    potenciaW: 5,
    factorCiclo: 1,
    horasDia: 24,
    fuente: `Potencia por cámara y horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "luces",
    nombre: "Bombillo LED",
    potenciaW: 10,
    factorCiclo: 1,
    horasDia: 10,
    fuente: `Potencia por bombillo y horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "ventilador",
    nombre: "Ventilador",
    potenciaW: 55,
    factorCiclo: 1,
    horasDia: 8,
    fuente: `Potencia: ${VT} (ventilador de ventana, 55 a 250 W; se usa el valor más bajo). Horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "datafono",
    nombre: "Datáfono",
    potenciaW: 5,
    factorCiclo: 1,
    horasDia: 10,
    fuente: `Potencia y horas: ${POR_VERIFICAR}.`,
  },
  {
    tipo: "planta",
    nombre: "Planta eléctrica",
    potenciaW: 0,
    factorCiclo: 1,
    horasDia: 0,
    generaEnergia: true,
    fuente: "Una planta eléctrica genera energía con combustible: no suma kWh a tu recibo de luz.",
  },
];

export function aparatoDelCatalogo(tipo: string | null | undefined): AparatoCatalogo | undefined {
  return CATALOGO_APARATOS.find((a) => a.tipo === tipo);
}

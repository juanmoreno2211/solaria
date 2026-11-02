import type { TipoNegocio } from "@/lib/savings/types";

/**
 * Testimonios reales, con permiso de la persona para publicar su nombre,
 * su frase y su foto. Agrega aquí los que recojas en las entrevistas.
 * Si la lista está vacía, la sección no aparece en producción.
 */
export interface Testimonio {
  cita: string;
  nombre: string;
  negocio: string;
  lugar?: string;
  rol: "negocio" | "instalador";
  tipo?: TipoNegocio;
  foto?: string;
  fotoPequena?: string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre: "Jorge Pedraza",
    negocio: "Presidente de la Cámara Colombiana de la Energía",
    cita:
      "Conocemos a todos los actores de la cadena energética, desde grandes empresas hasta pequeños negocios. Queremos que esos pequeños también encuentren oportunidades, pero la financiación inicial sigue siendo una barrera importante",
    rol: "negocio",
    foto: "imagenes/testimonios/jorge-pedraza-2",
    fotoPequena: "imagenes/testimonios/jorge-pedraza",
  },
  {
    nombre: "John Jairo Rangel",
    negocio: "Negocio de refrigerios y postres",
    lugar: "Barichara",
    cita:
      "La experiencia con SolarIA fue muy agradable y me dejó pensando en el tema. A veces el recibo llega con sorpresas porque uno no mide cuánta energía está usando durante el mes. Me gustaría poder hacer seguimiento a esta propuesta.",
    rol: "negocio",
    tipo: "restaurante",
    foto: "imagenes/testimonios/john-jairo"
  },
  {
    nombre: "Alejandro Rojas",
    negocio: "Asesor de empresas de energía solar",
    lugar: "Colombia",
    cita:
      "Normalmente trabajamos con proyectos de gran escala; llegar al micronegocio tiene retos, especialmente conseguir clientes. Tener usuarios bien asesorados e interesados sería un gran avance.",
    rol: "instalador",
    foto: "imagenes/testimonios/alejandro-rojas"
  },
];
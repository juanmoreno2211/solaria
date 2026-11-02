/**
 * Punto donde va el pin de cada departamento en el mapa (coordenadas del
 * viewBox de colombia-departments.json). Es el punto interior más alejado del
 * borde, no el centro del recuadro: así Cundinamarca no cae sobre Bogotá.
 * Calculado una vez en el navegador a partir de los trazados.
 */
export const CENTROS_DEPARTAMENTOS: Record<string, [number, number]> = {
  "Amazonas": [430, 569.3],
  "Antioquia": [261.1, 248.3],
  "Arauca": [452.8, 246.9],
  "Atlántico": [277.8, 80.7],
  "Bogotá D.C.": [314.8, 331.5],
  "Bolívar": [310.9, 177.4],
  "Boyacá": [370, 284.6],
  "Caldas": [261.9, 298.3],
  "Caquetá": [316.5, 493.4],
  "Casanare": [418.5, 294.9],
  "Cauca": [195.9, 417.6],
  "Cesar": [341, 108.1],
  "Chocó": [202.3, 314.3],
  "Cundinamarca": [304.3, 310.1],
  "Córdoba": [247.3, 182],
  "Guainía": [530.1, 409.1],
  "Guaviare": [392.9, 442.5],
  "Huila": [256.1, 405.3],
  "La Guajira": [360.9, 64.3],
  "Magdalena": [301.6, 116.3],
  "Meta": [343.5, 382.5],
  "Nariño": [155.5, 454.1],
  "Norte de Santander": [364.8, 184.1],
  "Putumayo": [251, 502.7],
  "Quindío": [248, 336],
  "Risaralda": [233, 305.7],
  "San Andrés y Providencia": [0.9, 2.2],
  "Santander": [344.1, 244.9],
  "Sucre": [280.5, 158.9],
  "Tolima": [267.6, 359.3],
  "Valle del Cauca": [206, 373],
  "Vaupés": [453.3, 479.3],
  "Vichada": [524.3, 316.9],
};

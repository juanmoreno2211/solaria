// Importa catálogos de proveedores (paneles, iluminación, refrigeración) desde
// archivos .csv o .xlsx en data/catalog/import/ y los fusiona en
// src/lib/catalog/data/catalogo.json.
//
// Uso:
//   npm run catalog:import
//
// Nombra los archivos empezando por la categoría, p. ej.:
//   data/catalog/import/paneles_acme.xlsx
//   data/catalog/import/iluminacion_solventas.csv
//   data/catalog/import/refrigeracion_frioverde.xlsx
// Puedes tener varios archivos por categoría (uno por proveedor).

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMPORT_DIR = path.join(ROOT, "data", "catalog", "import");
const CATALOG_PATH = path.join(
  ROOT,
  "src",
  "lib",
  "catalog",
  "data",
  "catalogo.json"
);

const REGIONES_VALIDAS = [
  "caribe",
  "andina",
  "pacifico",
  "orinoquia",
  "amazonia",
  "insular",
];

function parseRegiones(valor) {
  if (!valor) return "nacional";
  const texto = String(valor).trim().toLowerCase();
  if (texto === "" || texto === "nacional") return "nacional";
  const regiones = texto
    .split(";")
    .map((r) => r.trim())
    .filter(Boolean);
  const invalidas = regiones.filter((r) => !REGIONES_VALIDAS.includes(r));
  if (invalidas.length > 0) {
    console.warn(
      `  ! Regiones no reconocidas (${invalidas.join(", ")}), usa: ${REGIONES_VALIDAS.join(", ")} o "nacional"`
    );
  }
  return regiones.filter((r) => REGIONES_VALIDAS.includes(r));
}

function num(valor, campo, fila) {
  const n = Number(valor);
  if (valor === undefined || valor === "" || Number.isNaN(n)) {
    console.warn(`  ! Fila omitida: falta o es inválido el campo "${campo}"`, fila);
    return null;
  }
  return n;
}

function leerFilas(filePath) {
  const buffer = readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer" });
  const hoja = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(hoja, { defval: "" });
}

function esPlantilla(fila) {
  return String(fila.proveedor || "").toUpperCase().startsWith("PLANTILLA");
}

function archivosPara(prefijo) {
  if (!existeDir(IMPORT_DIR)) return [];
  return readdirSync(IMPORT_DIR)
    .filter((f) => f.toLowerCase().startsWith(prefijo))
    .filter((f) => f.endsWith(".csv") || f.endsWith(".xlsx") || f.endsWith(".xls"))
    .map((f) => path.join(IMPORT_DIR, f));
}

function existeDir(dir) {
  try {
    readdirSync(dir);
    return true;
  } catch {
    return false;
  }
}

function parsePaneles() {
  const items = [];
  for (const file of archivosPara("paneles")) {
    console.log(`Leyendo ${path.basename(file)} (paneles)...`);
    for (const fila of leerFilas(file)) {
      if (esPlantilla(fila)) continue;
      const kwpMin = num(fila.kwpMin, "kwpMin", fila);
      const kwpMax = num(fila.kwpMax, "kwpMax", fila);
      const precioPorKwpCOP = num(fila.precioPorKwpCOP, "precioPorKwpCOP", fila);
      if (kwpMin === null || kwpMax === null || precioPorKwpCOP === null) continue;
      items.push({
        proveedor: String(fila.proveedor || "").trim(),
        marca: fila.marca ? String(fila.marca).trim() : undefined,
        nombreSistema: String(fila.nombreSistema || "").trim(),
        kwpMin,
        kwpMax,
        precioPorKwpCOP,
        regiones: parseRegiones(fila.regiones),
        estadoDatos: ["simulado", "referencial", "confirmado"].includes(fila.estadoDatos)
          ? fila.estadoDatos
          : "referencial",
        url: fila.url ? String(fila.url).trim() : undefined,
        telefono: fila.telefono ? String(fila.telefono).trim() : undefined,
        notas: fila.notas ? String(fila.notas).trim() : undefined,
      });
    }
  }
  return items;
}

function parseIluminacion() {
  const items = [];
  for (const file of archivosPara("iluminacion")) {
    console.log(`Leyendo ${path.basename(file)} (iluminación)...`);
    for (const fila of leerFilas(file)) {
      if (esPlantilla(fila)) continue;
      const precioPorUnidadCOP = num(fila.precioPorUnidadCOP, "precioPorUnidadCOP", fila);
      if (precioPorUnidadCOP === null) continue;
      items.push({
        proveedor: String(fila.proveedor || "").trim(),
        marca: fila.marca ? String(fila.marca).trim() : undefined,
        nombre: String(fila.nombre || "").trim(),
        precioPorUnidadCOP,
        lumenes: fila.lumenes ? Number(fila.lumenes) : undefined,
        regiones: parseRegiones(fila.regiones),
        url: fila.url ? String(fila.url).trim() : undefined,
        telefono: fila.telefono ? String(fila.telefono).trim() : undefined,
        notas: fila.notas ? String(fila.notas).trim() : undefined,
      });
    }
  }
  return items;
}

function parseRefrigeracion() {
  const items = [];
  for (const file of archivosPara("refrigeracion")) {
    console.log(`Leyendo ${path.basename(file)} (refrigeración)...`);
    for (const fila of leerFilas(file)) {
      if (esPlantilla(fila)) continue;
      const capacidadLitrosMin = num(fila.capacidadLitrosMin, "capacidadLitrosMin", fila);
      const capacidadLitrosMax = num(fila.capacidadLitrosMax, "capacidadLitrosMax", fila);
      const precioCOP = num(fila.precioCOP, "precioCOP", fila);
      if (capacidadLitrosMin === null || capacidadLitrosMax === null || precioCOP === null)
        continue;
      items.push({
        proveedor: String(fila.proveedor || "").trim(),
        marca: fila.marca ? String(fila.marca).trim() : undefined,
        nombre: String(fila.nombre || "").trim(),
        capacidadLitrosMin,
        capacidadLitrosMax,
        precioCOP,
        autonomiaHoras: fila.autonomiaHoras ? Number(fila.autonomiaHoras) : undefined,
        regiones: parseRegiones(fila.regiones),
        url: fila.url ? String(fila.url).trim() : undefined,
        telefono: fila.telefono ? String(fila.telefono).trim() : undefined,
        notas: fila.notas ? String(fila.notas).trim() : undefined,
      });
    }
  }
  return items;
}

function fusionar(existentes, nuevos, claveFn) {
  const mapa = new Map(existentes.map((e) => [claveFn(e), e]));
  for (const n of nuevos) {
    mapa.set(claveFn(n), n);
  }
  return Array.from(mapa.values());
}

function main() {
  const actual = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));

  const nuevosPaneles = parsePaneles();
  const nuevaIluminacion = parseIluminacion();
  const nuevaRefrigeracion = parseRefrigeracion();

  const catalogo = {
    paneles: fusionar(
      actual.paneles,
      nuevosPaneles,
      (p) => `${p.proveedor}::${p.nombreSistema}`
    ),
    iluminacion: fusionar(
      actual.iluminacion,
      nuevaIluminacion,
      (p) => `${p.proveedor}::${p.nombre}`
    ),
    refrigeracion: fusionar(
      actual.refrigeracion,
      nuevaRefrigeracion,
      (p) => `${p.proveedor}::${p.nombre}`
    ),
  };

  writeFileSync(CATALOG_PATH, JSON.stringify(catalogo, null, 2) + "\n");

  console.log("\nCatálogo actualizado:");
  console.log(`  Paneles: ${catalogo.paneles.length}`);
  console.log(`  Iluminación: ${catalogo.iluminacion.length}`);
  console.log(`  Refrigeración: ${catalogo.refrigeracion.length}`);
  console.log(`\nGuardado en ${path.relative(ROOT, CATALOG_PATH)}`);
  console.log("Reinicia `npm run dev` (o vuelve a compilar) para ver los cambios.");
}

main();

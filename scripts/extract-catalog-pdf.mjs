// Extrae una tabla de precios de un PDF de proveedor usando Claude (visión de
// documentos) y la deja en un CSV de staging para que la revises antes de
// fusionarla con `npm run catalog:import`.
//
// Uso:
//   npm run catalog:extract-pdf -- paneles ruta/al/catalogo-proveedor.pdf
//   npm run catalog:extract-pdf -- iluminacion ruta/al/lista-precios.pdf
//   npm run catalog:extract-pdf -- refrigeracion ruta/al/fichas.pdf
//
// Requiere ANTHROPIC_API_KEY en tu entorno o en .env.local.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function cargarEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const linea of readFileSync(envPath, "utf-8").split("\n")) {
    const match = linea.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, clave, valor = ""] = match;
    if (!process.env[clave]) {
      process.env[clave] = valor.replace(/^["']|["']$/g, "");
    }
  }
}

cargarEnvLocal();

const ENCABEZADOS = {
  paneles:
    "proveedor,marca,nombreSistema,kwpMin,kwpMax,precioPorKwpCOP,regiones,url,telefono,notas",
  iluminacion:
    "proveedor,marca,nombre,precioPorUnidadCOP,lumenes,regiones,url,telefono,notas",
  refrigeracion:
    "proveedor,marca,nombre,capacidadLitrosMin,capacidadLitrosMax,precioCOP,autonomiaHoras,regiones,url,telefono,notas",
};

const [, , categoria, pdfPath] = process.argv;

if (!categoria || !pdfPath || !ENCABEZADOS[categoria]) {
  console.error(
    "Uso: npm run catalog:extract-pdf -- <paneles|iluminacion|refrigeracion> <ruta-al-pdf>"
  );
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Falta ANTHROPIC_API_KEY. Agrégala a tu entorno o a .env.local antes de continuar."
  );
  process.exit(1);
}

if (!existsSync(pdfPath)) {
  console.error(`No se encontró el archivo: ${pdfPath}`);
  process.exit(1);
}

const encabezado = ENCABEZADOS[categoria];
const pdfBase64 = readFileSync(pdfPath).toString("base64");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const systemPrompt = `Extraes tablas de precios de proveedores de energía solar en Colombia desde un PDF.
Responde ÚNICAMENTE con CSV (sin texto adicional, sin bloques de código markdown), empezando por esta
cabecera EXACTA:
${encabezado}
Una fila por producto/sistema. Si no encuentras un dato numérico obligatorio para una fila, omite esa fila
en vez de inventar cifras. El campo "regiones" debe ser "nacional" o una lista separada por ";" usando
solo estos valores: caribe, andina, pacifico, orinoquia, amazonia, insular. No inventes proveedores ni
precios que no estén en el documento.`;

const response = await client.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 4000,
  system: systemPrompt,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: pdfBase64,
          },
        },
        {
          type: "text",
          text: `Extrae la tabla de productos de categoría "${categoria}" de este documento, siguiendo exactamente el formato CSV indicado.`,
        },
      ],
    },
  ],
});

const textBlock = response.content.find((b) => b.type === "text");
if (!textBlock || !textBlock.text.trim()) {
  console.error("La IA no devolvió contenido. Intenta con un PDF más claro o revisa manualmente.");
  process.exit(1);
}

const csv = textBlock.text.trim().replace(/^```csv?|```$/g, "").trim();
const nombreBase = path.basename(pdfPath, path.extname(pdfPath));
const salida = path.join(
  ROOT,
  "data",
  "catalog",
  "import",
  `${categoria}_${nombreBase}_extraido.csv`
);
writeFileSync(salida, csv + "\n");

console.log(`Listo. Revisa y corrige antes de importar: ${path.relative(ROOT, salida)}`);
console.log("Cuando esté correcto, corre: npm run catalog:import");

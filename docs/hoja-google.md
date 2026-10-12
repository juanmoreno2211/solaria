# Guardar solicitudes y eventos en una hoja de Google

`POST /api/cotizaciones` y `POST /api/eventos` envían cada registro a una hoja de Google
mediante un Apps Script publicado como aplicación web. Si no está configurado, el servidor
solo lo registra en la consola (útil en local); **en producción las filas se pierden**, así que
hay que configurarlo en Vercel antes de probar con usuarios.

## Variables de entorno

| Variable | Qué es |
|---|---|
| `SHEETS_WEBHOOK_URL` | URL de la aplicación web del Apps Script |
| `SHEETS_WEBHOOK_TOKEN` | Clave compartida; el script la verifica porque la URL es pública |

## Pasos

1. Crea una hoja de cálculo con dos pestañas: `solicitudes` y `eventos`.
2. En **Extensiones → Apps Script**, pega este código y cambia el token:

   ```js
   const TOKEN = 'cambia-esto';
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     if (d.token !== TOKEN) return ContentService.createTextOutput('no').setMimeType(ContentService.MimeType.TEXT);
     const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(d.hoja);
     hoja.appendRow(d.fila);
     return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Implementar → Nueva implementación → Aplicación web**, ejecutar como tú y con acceso
   "Cualquier usuario". Copia la URL en `SHEETS_WEBHOOK_URL` y el token en `SHEETS_WEBHOOK_TOKEN`.
4. Limita quién puede ver la hoja: tiene nombres y celulares (Ley 1581 de 2012).

## Columnas

**solicitudes:** id, fecha, sessionId, proveedor, estadoDatos, nombre, telefono, municipio,
consentimiento, tipo, region, horario, noPuedeFallar, comoFalla, constituido, consumoKwh,
valorFactura, kwp, ahorroMensual, inversion, retornoMeses, estado, departamento, plan.

`plan` es el plan pedido (por ejemplo, "Plan Básico") en proveedores que venden por planes; vacío
en los demás. `ahorroMensual`, `inversion` y `retornoMeses` son los del plan pedido.

`estadoDatos` es `simulado` (proveedor de ejemplo), `referencial` (empresa real con precios sin
confirmar; la solicitud la recibe el equipo) o `confirmado`. Antes esta columna se llamaba
`esSimulado` y guardaba verdadero o falso.

**eventos:** fecha, sessionId, evento, detalle (JSON, sin datos personales).

Los eventos son `recibo_ingresado`, `resultado_visto`, `clic_pedir_cotizacion`,
`cotizacion_pedida` e `interes_sin_proveedor`. Para la métrica, une por `sessionId` las filas de
`resultado_visto` con las de `cotizacion_pedida` de los 7 días siguientes.

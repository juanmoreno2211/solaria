# SolarIA

## Qué es

SolarIA es una calculadora de ahorro con energía solar para micronegocios en Colombia, pensada para los que tienen una red eléctrica inestable o no tienen red. Con el recibo de luz del negocio estima cuánto se ahorraría con paneles solares y en cuánto tiempo se recupera la inversión, y permite pedir una cotización a un proveedor de la región. SolarIA Control es la parte con cuenta (“Mi negocio”): el negocio registra sus aparatos y su recibo, ve cuál aparato gasta más y recibe consejos para bajar la factura.

## Enlace al producto

https://solaria-ten.vercel.app

## Stack

Versiones tomadas de `package.json`:

| Tecnología | Versión |
| --- | --- |
| Next.js | 16.3.5 |
| React / React DOM | 19.2.8 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Supabase (`@supabase/supabase-js`) | ^2.118.0 |
| Supabase SSR (`@supabase/ssr`) | ^0.12.7 |
| Vitest | ^3.2.7 |
| Google Gen AI (`@google/genai`) | ^2.28.0 |

Además:

- **Vercel**: hosting del sitio.
- **Google Sheets con Apps Script**: un Apps Script publicado como aplicación web recibe filas de solicitudes y eventos (`src/lib/sheets.ts`).
- **Gemini**: lee la foto del recibo para sacar el consumo y el valor (`src/lib/ai/extractReceipt.ts`). Las cifras del resultado se calculan en el código, no las redacta el modelo.

## Cómo correrlo en local

Requiere Node.js y npm.

```bash
npm install
cp .env.example .env.local   # y llena los valores (ver la tabla de abajo)
npm run dev                  # http://localhost:3000
```

Otros scripts de `package.json`:

```bash
npm test        # vitest run
npm run build   # next build
npm run start   # sirve el build
npm run lint    # eslint
```

`.env.local` no se sube al repositorio (está en `.gitignore`). Sin `SHEETS_WEBHOOK_URL` las filas para la hoja solo se muestran en la consola, y sin `GEMINI_API_KEY` la lectura de la foto del recibo se desactiva y hay que escribir el consumo y el valor a mano.

## Variables de entorno

| Nombre | Para qué sirve |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase (la que puede ir al navegador; la seguridad la ponen las reglas por fila). |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, para los metadatos y las imágenes al compartir. Si falta, usa `http://localhost:3000`. |
| `SHEETS_WEBHOOK_URL` | URL de la aplicación web de Apps Script que agrega filas a la hoja de Google. |
| `SHEETS_WEBHOOK_TOKEN` | Token que se envía al Apps Script para que acepte la fila. |
| `GEMINI_API_KEY` | Clave de la API de Gemini para leer la foto del recibo. |
| `GEMINI_MODEL` | Modelo de Gemini a usar. Si falta, usa el modelo por defecto definido en `src/lib/ai/extractReceipt.ts`. |

## Base de datos

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En **Project Settings → API** copia la URL del proyecto y la clave publicable a `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`.
3. En el **SQL Editor** corre las migraciones de `supabase/migrations`, una por una y en este orden:
   1. `20261102000000_tablas_por_usuario.sql`
   2. `20261103000000_mi_negocio_recibos.sql`
   3. `20261104000000_growth_loop_invitaciones.sql`
   4. `20261105000000_solicitudes_contacto.sql`
   5. `20261106000000_nevera_valor_referencia.sql`
4. En **Authentication**:
   - Apaga **Confirm email**.
   - En **URL Configuration** pon la URL del sitio en **Site URL** y agrega las URL del sitio (la de producción y `http://localhost:3000` para local) en **Redirect URLs**.

## Pruebas

`npm test` corre todas las pruebas con Vitest. Cubren, entre otras cosas:

- El cálculo de ahorro, la proyección a veinte años, la recuperación de la inversión y las cifras del resultado.
- Las ofertas y planes de los proveedores, y el directorio por región.
- La validación de entradas (datos del recibo, imagen del recibo, datos financieros, celular y pedido de contacto).
- Los aparatos de “Mi negocio”: consumo, costo, ranking, consejos, simulador y riesgo si se va y vuelve la luz.
- Las estadísticas de recibos por mes y las metas.
- Los códigos y enlaces de invitación y su atribución.
- La ruta `POST /api/analizar`.
- Seguridad (`src/lib/supabase/rls.test.ts`): crea cuentas y confirma que una cuenta no puede ver ni tocar las filas de otra.

> **Advertencia:** las pruebas de seguridad crean cuentas `@example.com` en el Supabase al que apunta `.env.local`. No las corras contra los datos de producción: usa un proyecto de Supabase aparte. Si `.env.local` no tiene la URL y la clave de Supabase, esa prueba se salta. Las cuentas solo se borran al terminar si está definida `SUPABASE_SECRET_KEY` en el entorno de la prueba (nunca en el cliente); sin ella quedan creadas.

## Cuenta de prueba

- Correo: `monitor.solaria@example.com`
- Contraseña: `SolarIA-Prueba-2026`

Ya tiene datos de uso cargados. Es solo para la revisión del curso. El monitor también puede crear una cuenta nueva desde cero en `/ingresar`.

## Cómo verificar que funciona

Abre `/api/health` (por ejemplo, https://solaria-ten.vercel.app/api/health). Debe responder:

```json
{"ok":true,"supabase":"ok"}
```

La respuesta también trae `ms`, el tiempo que tardó la consulta. Si Supabase no responde, devuelve `ok: false` con estado 503.

## Decisiones del piloto

- **Confirmación de correo apagada**: la cuenta se puede usar apenas se crea, sin esperar un correo.
- **Qué se guarda**: del recibo solo se guardan el consumo (kWh) y el valor; la foto no se guarda. Cada cuenta ve solo sus filas, por las reglas de seguridad por fila (RLS) de Supabase.

## Qué es manual

- Escribirles por WhatsApp a quienes piden que los contacten.
- Sacar las métricas corriendo a mano, en el SQL Editor de Supabase, las consultas de `supabase/queries`:
  - `activacion.sql`: activación de “Mi negocio”.
  - `loop.sql`: invitaciones (growth loop).
  - `solicitudes.sql`: solicitudes de contacto, las más nuevas primero.

## Equipo

Grupo 5:

- Valentina Rojas
- Juan Andrés Moreno
- Juan Felipe Hortúa
- Isabela Archbold
- Sergio Soler
- José Rodríguez

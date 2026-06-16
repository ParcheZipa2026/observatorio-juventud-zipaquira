/* ============================================================================
 *  graph-connector.js — Conexión con el Excel institucional vía Microsoft Graph
 *  FASE 2 (opcional). Requiere registro de aplicación en Azure AD por TI.
 *
 *  El dashboard (index.html) funciona HOY sin este archivo, leyendo data/data.json.
 *  Este conector reemplaza esa lectura por una sincronización en vivo con el
 *  archivo Excel alojado en OneDrive/SharePoint Microsoft 365 institucional.
 *
 *  Flujo recomendado:
 *  1. TI registra una App en Azure AD (Entra ID) con permiso Files.Read /
 *     Sites.Read.All y consentimiento del administrador.
 *  2. Se obtiene el driveId y el itemId del archivo Excel.
 *  3. Un job programado (GitHub Actions / Azure Function) ejecuta este conector,
 *     descarga el rango usado de la hoja "BASE DE DATOS" y regenera data/data.json.
 *
 *  ⚠ Nunca incrustar el CLIENT_SECRET en el navegador. La sincronización corre
 *     del lado del servidor; el navegador solo consume el data.json resultante.
 * ========================================================================== */

const GRAPH = 'https://graph.microsoft.com/v1.0';

// Columnas del Excel en orden, mapeadas a las claves del modelo de datos.
const COLUMNS = [
  'periodo', 'secretaria', 'indicador', 'unidad', 'fuente', 'frecuencia',
  'responsable', 'hombre', 'mujer', 'noBinario', 'e14_17', 'e18_20',
  'e21_24', 'e25_28', 'rural', 'urbana', 'discapacidad', 'victimas',
  'extranjera', 'habitanteCalle', 'analisis'
];
const NUM_KEYS = COLUMNS.slice(7, 20);

async function getToken({ tenantId, clientId, clientSecret }) {
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new Error(`Token error ${res.status}`);
  return (await res.json()).access_token;
}

async function readWorksheet(token, { driveId, itemId, worksheet }) {
  const url = `${GRAPH}/drives/${driveId}/items/${itemId}`
    + `/workbook/worksheets/${encodeURIComponent(worksheet)}/usedRange(valuesOnly=true)`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Graph error ${res.status}`);
  return (await res.json()).values; // matriz [filas][columnas]
}

function rowsToRecords(values) {
  const body = values.slice(1); // descarta encabezado
  let id = 0;
  return body
    .filter(r => r.some(c => c !== '' && c != null))
    .map(r => {
      const rec = { id: ++id, anio: 2026 };
      COLUMNS.forEach((key, i) => {
        let v = r[i];
        if (NUM_KEYS.includes(key)) v = (v === '' || v == null) ? null : Number(v);
        else v = (v === '' || v == null) ? null : String(v).trim();
        rec[key] = v;
      });
      return rec;
    });
}

/** Sincroniza el Excel institucional y devuelve el objeto data.json listo. */
export async function syncFromGraph(cfg) {
  const token = await getToken(cfg);
  const values = await readWorksheet(token, cfg);
  const registros = rowsToRecords(values);
  const periodos = [...new Set(registros.map(r => r.periodo))];
  const secretarias = [...new Set(registros.map(r => r.secretaria))].sort();
  return {
    meta: {
      fuente: 'Microsoft Graph · Excel institucional',
      vigencia: 2026,
      actualizado: new Date().toISOString(),
      totalRegistros: registros.length,
      totalIndicadores: new Set(registros.map(r => r.indicador)).size,
      periodos, secretarias, datosCargados: true,
    },
    registros,
  };
}

// Uso en Node (job de sincronización):
//   import { writeFileSync } from 'fs';
//   const data = await syncFromGraph({
//     tenantId: process.env.GRAPH_TENANT_ID, clientId: process.env.GRAPH_CLIENT_ID,
//     clientSecret: process.env.GRAPH_CLIENT_SECRET, driveId: process.env.GRAPH_DRIVE_ID,
//     itemId: process.env.GRAPH_ITEM_ID, worksheet: process.env.GRAPH_WORKSHEET });
//   writeFileSync('data/data.json', JSON.stringify(data, null, 1));

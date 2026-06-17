/* ============================================================================
 *  sync.mjs — Sincroniza el Excel institucional y regenera data/data.json
 *
 *  Se ejecuta en GitHub Actions (servidor, sin restricciones del navegador).
 *  Detecta automáticamente qué método usar según las variables disponibles:
 *
 *   MÉTODO A · Microsoft Graph (recomendado, seguro)
 *     Requiere los secretos: GRAPH_TENANT_ID, GRAPH_CLIENT_ID,
 *     GRAPH_CLIENT_SECRET, GRAPH_DRIVE_ID, GRAPH_ITEM_ID.
 *     El Excel sigue siendo privado; lo lee una app registrada por TI.
 *
 *   MÉTODO B · Enlace de SharePoint "Cualquiera con el vínculo" (más simple)
 *     Requiere solo el secreto SHARE_URL con el link que compartiste.
 *     No necesita Azure, pero el archivo queda legible por quien tenga el link.
 *
 *  Node 18+ (fetch nativo). Dependencia: xlsx (SheetJS).
 * ========================================================================== */

import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync } from 'node:fs';

const COLMAP = {
  'Período': 'periodo', 'Secretaría / Entidad': 'secretaria', 'Indicador': 'indicador',
  'Unidad de Medida': 'unidad', 'Fuente de Información': 'fuente',
  'Frecuencia de Actualización': 'frecuencia', 'Responsable': 'responsable',
  'Hombre': 'hombre', 'Mujer': 'mujer', 'No Binario': 'noBinario',
  '14 a 17 años': 'e14_17', '18 a 20 años': 'e18_20', '21 a 24 años': 'e21_24',
  '25 a 28 años': 'e25_28', 'Rural': 'rural', 'Urbana': 'urbana',
  'Discapacidad y NEE': 'discapacidad', 'Víctimas de Conflicto': 'victimas',
  'Población Extranjera': 'extranjera', 'Habitante de Calle': 'habitanteCalle',
  'Análisis': 'analisis',
};
const NUM = ['hombre','mujer','noBinario','e14_17','e18_20','e21_24','e25_28',
  'rural','urbana','discapacidad','victimas','extranjera','habitanteCalle'];

async function downloadBuffer() {
  if (process.env.GRAPH_CLIENT_SECRET) return await viaGraph();
  if (process.env.SHARE_URL) return await viaShareLink(process.env.SHARE_URL);
  throw new Error('Faltan credenciales: define los secretos GRAPH_* o SHARE_URL.');
}

async function viaGraph() {
  const { GRAPH_TENANT_ID: t, GRAPH_CLIENT_ID: c, GRAPH_CLIENT_SECRET: s,
          GRAPH_DRIVE_ID: drive, GRAPH_ITEM_ID: item } = process.env;
  const tok = await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: c, client_secret: s,
      scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
  }).then(r => r.json());
  if (!tok.access_token) throw new Error('No se pudo autenticar con Microsoft Graph.');
  const res = await fetch(`https://graph.microsoft.com/v1.0/drives/${drive}/items/${item}/content`,
    { headers: { Authorization: `Bearer ${tok.access_token}` } });
  if (!res.ok) throw new Error(`Graph respondió ${res.status}`);
  console.log('Origen: Microsoft Graph (privado)');
  return Buffer.from(await res.arrayBuffer());
}

async function viaShareLink(url) {
  const dl = url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
  const res = await fetch(dl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`El enlace respondió ${res.status}. ¿Está como "Cualquiera con el vínculo"?`);
  console.log('Origen: enlace de SharePoint');
  return Buffer.from(await res.arrayBuffer());
}

function parse(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const ws = wb.Sheets['BASE DE DATOS'] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  let id = 0;
  const registros = rows
    .filter(r => Object.values(r).some(v => v !== null && v !== ''))
    .map(r => {
      const rec = { id: ++id, anio: 2026 };
      for (const [xl, key] of Object.entries(COLMAP)) {
        let v = r[xl];
        if (NUM.includes(key)) v = (v === '' || v == null) ? null : Number(v);
        else v = (v === '' || v == null) ? null : String(v).trim();
        rec[key] = v;
      }
      return rec;
    });
  const periodos = [...new Set(registros.map(r => r.periodo).filter(Boolean))];
  const secretarias = [...new Set(registros.map(r => r.secretaria).filter(Boolean))].sort();
  const conCifras = registros.some(r => NUM.some(k => r[k] != null));
  return {
    meta: {
      fuente: process.env.GRAPH_CLIENT_SECRET ? 'Microsoft Graph · Excel institucional'
                                              : 'Excel institucional (SharePoint)',
      vigencia: 2026,
      actualizado: new Date().toISOString(),
      totalRegistros: registros.length,
      totalIndicadores: new Set(registros.map(r => r.indicador)).size,
      periodos, secretarias, datosCargados: conCifras,
    },
    registros,
  };
}

const data = parse(await downloadBuffer());
mkdirSync('data', { recursive: true });
writeFileSync('data/data.json', JSON.stringify(data, null, 1));
console.log(`OK · ${data.registros.length} registros · ${data.meta.totalIndicadores} indicadores · datos cargados: ${data.meta.datosCargados}`);

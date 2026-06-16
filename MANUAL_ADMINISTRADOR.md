# Manual de administrador · Observatorio de Juventudes de Zipaquirá

Para quien **mantiene** el tablero y carga los datos.

## A. Publicar / actualizar el sitio en GitHub Pages

1. Sube los archivos al repositorio (rama `main`).
2. *Settings → Pages → Source:* **GitHub Actions**.
3. Cada vez que hagas `push` a `main`, el flujo `.github/workflows/deploy.yml` republica el sitio automáticamente (1–2 minutos).

## B. Cargar datos reales (modo manual)

Los datos viven en `data/data.json`. El dashboard también trae una copia embebida en `index.html` para que funcione offline; **para la versión publicada, la fuente de verdad es lo que regeneres con los pasos de abajo.**

### Opción rápida desde el Excel
Mantén tu Excel `OBSERVATORIO_DE_JUVENTUD_EXCEL_2026.xlsx` con las cifras diligenciadas y regenera el JSON con este script de Python:

```python
import pandas as pd, json
df = pd.read_excel('OBSERVATORIO_DE_JUVENTUD_EXCEL_2026.xlsx', sheet_name='BASE DE DATOS')
df = df.where(pd.notna(df), None)
cols = {
 'Período':'periodo','Secretaría / Entidad':'secretaria','Indicador':'indicador',
 'Unidad de Medida':'unidad','Fuente de Información':'fuente',
 'Frecuencia de Actualización':'frecuencia','Responsable':'responsable',
 'Hombre':'hombre','Mujer':'mujer','No Binario':'noBinario',
 '14 a 17 años':'e14_17','18 a 20 años':'e18_20','21 a 24 años':'e21_24','25 a 28 años':'e25_28',
 'Rural':'rural','Urbana':'urbana','Discapacidad y NEE':'discapacidad',
 'Víctimas de Conflicto':'victimas','Población Extranjera':'extranjera',
 'Habitante de Calle':'habitanteCalle','Análisis':'analisis'}
df = df.rename(columns=cols)
regs = []
for i, r in df.iterrows():
    rec = {'id': i+1, 'anio': 2026}
    rec.update({v: (r[v] if v in df.columns else None) for v in cols.values()})
    regs.append(rec)
meta = {'fuente':'Excel institucional','vigencia':2026,'totalRegistros':len(regs),
        'totalIndicadores':int(df['indicador'].nunique()),
        'periodos':list(df['periodo'].dropna().unique()),
        'secretarias':sorted(df['secretaria'].dropna().unique().tolist()),
        'datosCargados':True}
json.dump({'meta':meta,'registros':regs}, open('data/data.json','w',encoding='utf-8'),
          ensure_ascii=False, indent=1)
```

Luego, para que `index.html` use ese JSON en lugar de la copia embebida, en `index.html` reemplaza la línea `const RAW=...` por una carga del archivo:

```html
<script>
fetch('data/data.json').then(r=>r.json()).then(d=>{ window.RAW = d; /* inicializa app */ });
</script>
```

> Si prefieres no tocar `index.html`, simplemente vuelve a generar el archivo con tu Excel actualizado y reemplázalo completo: la copia embebida se regenera en el mismo paso.

## C. Cargar la vigencia anterior (comparativo 2025)

Crea `data/data_2025.json` con el mismo esquema. Con ambas vigencias presentes, el módulo de Comparación habilita el comparativo interanual y marca los indicadores **no comparables** por los cambios metodológicos de 2026.

## D. Conexión automática Microsoft Graph (Fase 2)

Ver `docs/HOJA_DE_RUTA.md` y `src/graph-connector.js`. Resumen:
1. TI registra una App en Azure AD con permiso `Files.Read.All` y consentimiento de administrador.
2. Se cargan las variables de `.env.example` como **Secrets** del repositorio (nunca en el código).
3. Un job programado regenera `data/data.json` desde el Excel en OneDrive y hace push.

## E. Cambiar colores o logos

- Colores: variables CSS al inicio de `index.html` (`:root { --azul: ... }`).
- Logos: reemplaza los archivos en `assets/` y vuelve a generar el `index.html` (los logos están embebidos en base64).

## F. Buenas prácticas

- No subas nunca el archivo `.env` ni secretos al repositorio.
- Versiona los `data.json` por trimestre (`data/2026-T1.json`) para conservar histórico.
- Define un responsable de reporte por secretaría y una fecha de corte trimestral.

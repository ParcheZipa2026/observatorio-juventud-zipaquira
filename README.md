<div align="center">

# 🔭 Observatorio de Juventudes de Zipaquirá

**Sistema oficial de monitoreo, seguimiento y visualización de la población joven del municipio de Zipaquirá**

Secretaría de Familia y Desarrollo Social · Programa de Juventudes · Vigencia 2026

![Vanilla JS](https://img.shields.io/badge/Stack-HTML%20%2B%20JS%20vanilla-4280EA)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-55E84D)
![Datos](https://img.shields.io/badge/Indicadores-68-F4F21F)
![Entidades](https://img.shields.io/badge/Entidades-9-FF6B35)

</div>

---

## ¿Qué es esto?

Un tablero web (dashboard) que consolida los **68 indicadores de juventud** reportados por 9 entidades del municipio a lo largo de los 4 trimestres de 2026. Permite consultar KPIs, comparar trimestres y entidades, analizar la composición demográfica, generar alertas automáticas y producir un análisis narrativo ejecutivo.

El tablero es **un único archivo `index.html` sin paso de compilación**: se publica en GitHub Pages tal cual, sin Node, sin Vercel y sin servidor.

## Cómo verlo en línea (GitHub Pages) — 5 minutos

1. Crea un repositorio nuevo en tu cuenta de GitHub (por ejemplo `observatorio-juventud-zipaquira`).
2. Sube **todo el contenido de esta carpeta** (puedes arrastrarlo en *Add file → Upload files*).
3. Entra a **Settings → Pages**.
4. En *Source* elige **GitHub Actions** (ya viene incluido el flujo en `.github/workflows/deploy.yml`).
5. Espera ~1 minuto. Tu observatorio quedará publicado en
   `https://<tu-usuario>.github.io/observatorio-juventud-zipaquira/`

> Alternativa sin Actions: en *Settings → Pages → Source* elige `Deploy from a branch`, rama `main`, carpeta `/ (root)`.

## Cómo verlo sin internet

Abre `index.html` haciendo doble clic. Funciona directamente en el navegador (los datos y los logos están embebidos en el archivo).

## Estructura del proyecto

```
observatorio/
├── index.html                  ← El dashboard completo (autocontenido)
├── data/
│   └── data.json               ← Catálogo de indicadores (fuente de datos)
├── assets/
│   ├── logo-observatorio.png
│   └── logo-parche.png
├── src/
│   └── graph-connector.js      ← Conexión Microsoft Graph (fase 2, opcional)
├── docs/
│   ├── MODELO_DE_DATOS.md
│   ├── MANUAL_USUARIO.md
│   ├── MANUAL_ADMINISTRADOR.md
│   └── HOJA_DE_RUTA.md
├── .github/workflows/deploy.yml
├── .env.example
└── README.md
```

## Datos

Hoy el tablero trae el **catálogo estructural** (qué se mide, quién lo reporta, con qué fuente y frecuencia). Las cifras todavía no están diligenciadas, así que el dashboard incluye un interruptor **“Datos demo”** que llena valores de ejemplo para previsualizar todas las visualizaciones.

Para cargar datos reales tienes dos caminos:

- **Manual:** edita `data/data.json` llenando los campos numéricos por registro y vuelve a publicar.
- **Automático (Microsoft Graph):** ver `docs/HOJA_DE_RUTA.md` y `src/graph-connector.js`. Requiere registro de aplicación en Azure por parte del área de TI institucional.

## Identidad visual

| Color | HEX | Uso |
|---|---|---|
| Azul institucional | `#4280EA` | Menús, KPIs, gráficos principales |
| Amarillo institucional | `#F4F21F` | Resaltados, métricas clave |
| Verde Parche Zipa | `#55E84D` | Indicadores positivos, cumplimiento |
| Naranja de alerta | `#FF6B35` | Riesgos y advertencias |

Tipografía: **Montserrat** (títulos) + **Inter** (texto).

## Licencia y créditos

Desarrollado para la **Alcaldía de Zipaquirá** — Programa de Juventudes, Secretaría de Familia y Desarrollo Social. Uso institucional.

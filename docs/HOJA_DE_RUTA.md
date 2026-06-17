# Hoja de ruta · Observatorio de Juventudes de Zipaquirá

El "prompt maestro" original describe una plataforma muy ambiciosa. Para que llegue a producción de forma realista y sin depender de un solo gran paso, conviene avanzar por fases. Lo que ya está entregado es la **Fase 1 completa y funcional**.

## ✅ Fase 1 — Tablero publicable (ENTREGADO)

- Dashboard de una sola página, sin compilación, listo para GitHub Pages.
- Catálogo real: 68 indicadores, 9 entidades, 4 trimestres.
- Módulos: Inicio (KPIs + análisis automático + semáforo), Demográfico, Secretarías, Indicadores (tabla con buscar/ordenar/exportar), Comparación, Alertas, Sala de Análisis, Datos Abiertos.
- Filtros globales, motor de alertas, narrativa automática.
- Identidad visual oficial (colores, logos, tipografía).
- Modo "Datos demo" para previsualizar mientras se diligencian las cifras.
- Manuales y documentación.

## 🔜 Fase 2 — Datos en vivo (Microsoft Graph)

**Objetivo:** que el Excel institucional alimente el tablero sin carga manual.

Pasos y responsables:
1. **TI institucional:** registrar App en Azure AD (Entra ID), permiso `Files.Read.All` o `Sites.Read.All`, consentimiento de administrador. *Esto no se puede hacer desde el código; requiere al administrador del tenant de Microsoft 365.*
2. Obtener `driveId` e `itemId` del Excel en OneDrive/SharePoint.
3. Cargar credenciales como Secrets del repositorio.
4. Programar la sincronización (GitHub Actions con `cron`, o Azure Function) usando `src/graph-connector.js` para regenerar `data/data.json`.

> Nota de seguridad: el `client_secret` nunca debe ir en el navegador. La sincronización corre del lado del servidor; el navegador solo lee el JSON resultante.

## 🔮 Fase 3 — Comparativo interanual y analítica avanzada

- Cargar la línea base 2025 (`data/data_2025.json`).
- Detección automática de indicadores nuevos / eliminados / modificados con código estable.
- Coberturas (%) usando SISBÉN como denominador poblacional.
- Exportación de PDF ejecutivo (hoy se exporta CSV/JSON; el PDF puede añadirse con una librería de impresión del navegador).

## 🔮 Fase 4 — Migración a Next.js (opcional)

Si en el futuro se requieren autenticación de usuarios, roles, edición en línea o un backend, conviene migrar a Next.js + TypeScript desplegado en Vercel. El modelo de datos (`docs/MODELO_DE_DATOS.md`) y el conector Graph ya están pensados para reutilizarse.

## Qué NO puede hacerse automáticamente

Para fijar expectativas con claridad: la creación del repositorio en GitHub, el registro de la App en Azure y la carga de Secrets son acciones que debe realizar una persona con las credenciales institucionales. Este paquete deja todo listo para que esos pasos tomen minutos.

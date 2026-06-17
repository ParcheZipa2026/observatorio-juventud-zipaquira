# Modelo de datos · Observatorio de Juventudes de Zipaquirá

## 1. Fuente actual

El archivo `OBSERVATORIO_DE_JUVENTUD_EXCEL_2026.xlsx` contiene dos hojas:

- **BASE DE DATOS** — una fila por (indicador × trimestre). 267 filas, 21 columnas.
- **LEYENDA** — convenciones de color por período y por entidad.

Cada registro reúne la *definición* del indicador (qué se mide, quién lo reporta, con qué fuente y frecuencia) y sus *desagregaciones* (género, edad, zona, poblaciones diferenciales).

## 2. Esquema normalizado (`data/data.json`)

```jsonc
{
  "meta": {
    "fuente": "string",
    "vigencia": 2026,
    "totalRegistros": 267,
    "totalIndicadores": 68,
    "periodos": ["ENE - MAR 2026", "ABR - JUN 2026", "JUL - SEP 2026", "OCT - DIC 2026"],
    "secretarias": ["Secretaría de Educación", "..."],
    "datosCargados": false
  },
  "registros": [
    {
      "id": 1,
      "periodo": "ENE - MAR 2026",
      "anio": 2026,
      "secretaria": "Secretaría de Educación",
      "indicador": "Jóvenes matriculados (SIMAT)",
      "unidad": "# de jovenes",
      "fuente": "Bases de datos institucionales",
      "frecuencia": "Trimestral",
      "responsable": "Secretaría de Educación",
      "hombre": null, "mujer": null, "noBinario": null,
      "e14_17": null, "e18_20": null, "e21_24": null, "e25_28": null,
      "rural": null, "urbana": null,
      "discapacidad": null, "victimas": null, "extranjera": null, "habitanteCalle": null,
      "analisis": null
    }
  ]
}
```

Los campos numéricos en `null` significan **no diligenciado**. Un `0` significa **ausencia real del fenómeno**. El dashboard distingue ambos casos (estado *Pendiente* vs *En cero*).

## 3. Dimensiones (catálogo)

| Dimensión | Valores |
|---|---|
| Período | 4 trimestres de 2026 |
| Entidad | 9 (Educación, Desarrollo Económico, Salud, Gobierno, Seguridad, Familia, Rural, IMCRDZ, SISBÉN) |
| Género | Hombre · Mujer · No binario |
| Edad | 14–17 · 18–20 · 21–24 · 25–28 |
| Zona | Rural · Urbana |
| Diferencial | Discapacidad y NEE · Víctimas del conflicto · Población extranjera · Habitante de calle |

## 4. Mejoras propuestas al modelo (nivel gubernamental)

1. **Separar catálogo de hechos.** Tabla `indicadores` (id, nombre, entidad, unidad, fuente, frecuencia, definición, fórmula) y tabla `mediciones` (indicador_id, período, desagregaciones). Evita repetir la metadata en cada trimestre.
2. **Identificador estable por indicador (`codigo`).** Permite detectar indicadores nuevos / eliminados / modificados entre vigencias sin depender del texto exacto del nombre.
3. **Versionado metodológico.** Campo `version_metodologica` y `comparable_con_anterior` (bool) para marcar las series que cambiaron en las mesas técnicas de 2026.
4. **Denominador poblacional.** Integrar el total de jóvenes SISBÉN como denominador para reportar *coberturas* (%) y no solo conteos absolutos.
5. **Trazabilidad.** Campos `fecha_reporte`, `reportado_por` y `enlace_evidencia` por medición.
6. **Validación de cuadres.** Regla: la suma por género ≈ suma por edad ≈ suma por zona ≈ total del indicador. El motor de alertas puede señalar inconsistencias.
7. **Línea base 2025.** Cargar `data/data_2025.json` con el mismo esquema para habilitar el comparativo interanual.

## 5. Indicadores sensibles (monitoreo prioritario)

Salud mental (ideación, intento y muerte por suicidio), violencias, sistema de responsabilidad penal y habitabilidad en calle. Se recomienda umbral de alerta y revisión cualitativa, no solo cuantitativa.

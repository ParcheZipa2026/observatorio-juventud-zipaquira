# Conexión en vivo · que el dashboard se actualice solo

**Objetivo:** las secretarías llenan el Excel en SharePoint y el dashboard se actualiza solo, sin que nadie vuelva a subir archivos.

## Por qué no es "directo desde el navegador"

El Excel está en SharePoint **privado e institucional**. Una página web (GitHub Pages) **no puede leerlo directamente** porque (1) SharePoint exige iniciar sesión de Microsoft 365 y (2) bloquea por seguridad (CORS) que un sitio externo lea sus datos. Esto aplica a cualquier herramienta, no solo a esta.

La solución es un **proceso programado en GitHub** que cada hora baja el Excel, lo convierte en `data/data.json` y republica el sitio. El navegador solo lee ese JSON, que se refresca solo. Resultado para quien consulta: el tablero se actualiza solo.

> El sitio ya está preparado: `index.html` carga `data/data.json` automáticamente al abrir. Mientras no exista ese archivo con datos, usa la copia embebida (catálogo) y el modo "Datos demo".

---

## Elige UN método

### Método A — Microsoft Graph (recomendado · seguro · el Excel sigue privado)

El Excel no se hace público. Una "aplicación" registrada por TI lo lee con permisos controlados.

**Lo hace el área de TI (una sola vez):**
1. En **Azure / Entra ID → Registros de aplicaciones → Nuevo registro**. Nombre: `Observatorio Juventud Sync`.
2. **Permisos de API → Microsoft Graph → Permisos de aplicación →** `Files.Read.All` (o `Sites.Read.All`). Luego **"Conceder consentimiento del administrador"**.
3. **Certificados y secretos → Nuevo secreto de cliente.** Copia el valor (solo se ve una vez).
4. Anota: `Tenant ID`, `Client ID`, el `Client secret`.
5. Obtén el `Drive ID` y el `Item ID` del Excel (se consiguen con una llamada a Graph Explorer, o los ubica TI).

**Lo haces tú en GitHub (Settings → Secrets and variables → Actions → New repository secret):**

| Secreto | Valor |
|---|---|
| `GRAPH_TENANT_ID` | Tenant ID |
| `GRAPH_CLIENT_ID` | Client ID |
| `GRAPH_CLIENT_SECRET` | el secreto de cliente |
| `GRAPH_DRIVE_ID` | Drive ID del Excel |
| `GRAPH_ITEM_ID` | Item ID del Excel |

Listo. El flujo `.github/workflows/sync-datos.yml` corre cada hora.

### Método B — Enlace público de SharePoint (sin Azure · más simple)

Más fácil, pero **el archivo queda legible por cualquiera que tenga el enlace.** Úsalo solo si los datos no son sensibles o si TI no puede registrar la app.

1. En el Excel: **Compartir → Cualquiera con el vínculo puede ver** y copia el enlace.
2. En GitHub: crea **un solo secreto** `SHARE_URL` con ese enlace.

Eso es todo. El script detecta que existe `SHARE_URL` y baja el archivo por ahí.

> Nota: algunas configuraciones de Microsoft 365 desactivan los enlaces "Cualquiera con el vínculo". Si tu institución los bloquea, tendrás que usar el Método A.

---

## Probar y ajustar

- **Forzar una sincronización ya:** pestaña **Actions → "Sincronizar datos del Excel" → Run workflow**.
- **Cambiar la frecuencia:** edita la línea `cron` en `sync-datos.yml`. `0 * * * *` = cada hora; `*/30 * * * *` = cada 30 minutos; `0 6,12,18 * * *` = a las 6am, 12m y 6pm UTC. (Zipaquirá = UTC−5.)
- **Ver si quedó actualizado:** en el tablero, arriba a la derecha aparece "Actualizado dd mmm hh:mm".

## Seguridad

- El `client_secret` y el enlace viven como **Secrets de GitHub**, nunca en el código ni en el navegador.
- El navegador jamás se conecta a SharePoint: solo lee el `data.json` ya generado.
- Nunca subas un archivo `.env` real al repositorio (ya está en `.gitignore`).

## Qué necesito de ti / de TI

Para el Método A, los 5 valores (Tenant, Client ID, secret, Drive ID, Item ID) los entrega TI tras registrar la app — ese registro requiere permisos de administrador del tenant de Microsoft 365 y **no puede hacerse desde el código**. Para el Método B, basta con que el enlace quede como "Cualquiera con el vínculo".

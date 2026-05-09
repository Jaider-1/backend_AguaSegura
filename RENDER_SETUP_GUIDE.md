# Guía completa: Configurar Base de Datos y Backend en Render

## Resumen rápido
Tu proyecto usa `render.yml` para declarar infraestructura como código. Render **puede crear automáticamente** la BD y el web service si todo está bien configurado. Sigue estos pasos.

---

## Paso 1: Preparar el repositorio

1. Asegúrate de estar en la rama correcta (`jtegue` o `main`):
   ```bash
   git status
   ```

2. Verifica que `render.yml` esté en la raíz del proyecto:
   ```bash
   ls render.yml
   ```

3. Haz commit de los cambios recientes (si los hay):
   ```bash
   git add .
   git commit -m "Fix render.yml database configuration"
   git push origin jtegue
   ```

---

## Paso 2: Configurar Render manualmente (primera vez)

### Opción A: Usar render.yml (recomendado)

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Haz login y ve a tu proyecto
3. Clickea en **"New +"** → **"Blueprint"** (no "Web Service")
4. Selecciona tu repositorio y rama
5. En "Blueprint file path", déjalo como `render.yml` (por defecto)
6. Clickea **"Create from Blueprint"**
7. Render leerá `render.yml` y provisionará:
   - Web service `aguasegura-backend`
   - Base de datos PostgreSQL `aguasegura-db`
   - Vinculación automática (el web service recibe `DATABASE_URL`)

### Opción B: Crear manual (si Blueprint no funciona)

**Crear la BD:**
1. En Render dashboard → **"Databases"** → **"New PostgreSQL"**
2. Configura:
   - **Database**: `aguasegura_bd`
   - **User**: `saido` (o el que prefieras)
   - **Plan**: Free
3. Clickea **"Create Database"**
4. Copia la **connection string** (la verás en la página de la BD bajo "Connections")

**Crear el Web Service:**
1. En Render dashboard → **"New +"** → **"Web Service"**
2. Conecta tu repositorio y selecciona rama (`jtegue`)
3. Configura:
   - **Name**: `aguasegura-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/database/scripts/run-migrations.js && npm run start:prod`
   - **Plan**: Free (o la que prefieras)
4. Clickea **"Create Web Service"**

**Vincular BD al Web Service:**
1. En el web service (`aguasegura-backend`) → **"Environment"**
2. Añade variables manuales:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (genera una cadena fuerte de ≥32 caracteres)
   - `DATABASE_URL` = (pega la connection string de la BD)
3. **Importante:** Elimina cualquier otra variable de BD (`DB_HOST`, `DB_PORT`, etc.)
4. Clickea **"Save"**

5. El web service se redesplegará automáticamente

---

## Paso 3: Verificar la conexión

1. Abre los **logs** del web service en Render
2. Busca este mensaje (o similar):
   ```
   [Nest] 80 - 05/08/2026 PM LOG [NestFactory] Application successfully started
   Listening on port 3000
   ```
   ✅ Si ves esto, la conexión está funcionando.

3. Si ves errores de conexión a BD:
   - Verifica que `DATABASE_URL` sea correcto en Environment
   - Comprueba que la BD está en estado "Available" (verde) en Databases
   - Redeploy: clickea el botón **"Deploy latest"** en el web service

---

## Paso 4: Probar los endpoints

1. Una vez que esté corriendo, visita:
   ```
   https://tu-servicio-render.onrender.com/api
   ```
   (Reemplaza `tu-servicio-render` con el nombre real de tu web service)

2. Deberías ver la documentación **Swagger** (Open API docs)

3. Prueba un endpoint, ej. `/api/health` o el que tengas:
   ```bash
   curl https://tu-servicio-render.onrender.com/api/health
   ```

---

## Paso 5: Configurar el Frontend (si tienes)

Si tu frontend está en otro servicio de Render:
1. Actualiza `.env.production` en Render:
   ```
   CORS_ORIGIN=https://tu-frontend-render.onrender.com
   ```
2. Esto permite que el frontend acceda al backend desde otra URL

---

## Solución de problemas

### ❌ Error: "Unable to connect to database"

**Causas comunes:**
- `DATABASE_URL` está vacía o apunta a host incorrecto
- La BD no está creada en Render
- El servicio web y la BD no están vinculados

**Solución:**
1. En el web service, abre **Environment**
2. Verifica que `DATABASE_URL` tenga un valor (no vacío)
3. Si está vacía, cópiala desde la página de la BD en Render
4. Redeploy

### ❌ Error: "getaddrinfo ENOTFOUND HOST"

- **Causa:** Variables `DB_HOST=HOST` aún están en Environment
- **Solución:** Elimina todas las variables `DB_*` excepto `DATABASE_URL`

### ❌ El web service no arranca (sale del rojo)

1. Abre los **logs** para ver el error exacto
2. Busca líneas con **ERROR**
3. Comparte el error en terminal/chat para diagnóstico

### ❌ Las migraciones no corren

- Verifica que `node dist/database/scripts/run-migrations.js` existe tras el build
- Comprueba que `dist/` se crea en el build (revisa log de build)
- Si falla, ejecuta manualmente desde la consola de Render:
  ```bash
  npm run migration:run
  ```

---

## Estructura de render.yml explicada

```yaml
services:
  - type: web                                 # Web service
    name: aguasegura-backend                 # Nombre del servicio
    startCommand: npm run start:prod          # Comando para arrancar
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: aguasegura-db               # DEBE ser igual al name de la BD
          property: connectionString        # Propiedad de la conexión

databases:
  - name: aguasegura-db                      # Identificador de la BD
    databaseName: aguasegura_bd              # Nombre real de la BD en PostgreSQL
    user: saido                              # Usuario
    plan: free
```

**Nota:** El `name` de la BD en `fromDatabase` debe ser igual al `name` en la sección `databases`.

---

## Comandos útiles (en tu máquina local)

Build y test antes de desplegar:
```bash
npm ci
npm run build
npm test
npm run lint
```

Ejecutar migraciones localmente:
```bash
npm run migration:run
```

---

## Contacto / Siguientes pasos

- Si algo no funciona, comparte los logs de Render (cópia-pega el error)
- Si necesitas cambios en la configuración, actualiza `render.yml` y haz push
- Render redesplegará automáticamente si `autoDeploy: true` está activado

¡Éxito! 🚀

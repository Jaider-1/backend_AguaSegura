# Aguasegura Backend

## Configuración de entornos

El proyecto carga la configuración desde archivos separados según el entorno:

- `.env.development` para desarrollo local.
- `.env.production` para despliegue en producción.
- `.env` sigue siendo compatible como override local si existe.

Variables esperadas:

- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DB_SYNCHRONIZE`

## Validación

Usa estos comandos para verificar cambios locales:

- `npm run typecheck`
- `npm test -- --runInBand`

## Despliegue en Render

Este backend está preparado para desplegarse como servicio Node en Render sin Docker.

- `render.yml` usa `env: node`
- el build ejecuta `npm ci && npm run build`
- el start ejecuta `npm run start:prod`
- Render debe inyectar `DATABASE_URL` desde su base de datos administrada
# backend_AguaSegura
💧 AguaSegura Backend - API NestJS para monitoreo calidad agua. Procesa datos IoT, analiza parámetros y genera recomendaciones. Soporta JWT, WebSockets, PostgreSQL. Ideal gestión recursos hídricos.

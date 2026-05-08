# Despliegue en Render — Aguasegura Backend

Instrucciones rápidas para desplegar este proyecto en Render.

Requisitos previos
- Node 20.x (o compatible con las engines en `package.json`).
- Base de datos PostgreSQL (Render puede crearla automáticamente desde `render.yml`).

Variables de entorno mínimas (configurar en Render > Environment)
- `DATABASE_URL`: postgresql://USER:PASSWORD@HOST:5432/DB_NAME (Render la genera si usas su DB)
- `JWT_SECRET`: cadena fuerte (mínimo 32 caracteres)
- `NODE_ENV`: production
- `PORT`: 3000 (opcional)
- `CORS_ORIGIN`: orígenes permitidos separados por comas (ej. https://tu-frontend.onrender.com)
- `DB_SYNCHRONIZE`: false (en producción)

Comandos (usados por `render.yml`)
- `buildCommand`: `npm ci && npm run build`
- `startCommand`: `node dist/database/scripts/run-migrations.js && npm run start:prod`

Notas sobre migraciones
- El `startCommand` ejecuta `dist/database/scripts/run-migrations.js` antes de iniciar.
  Esto usa el JS compilado (evita depender de `ts-node` en producción).
- Asegúrate de que la compilación incluya `database/**/*` (ya está en `tsconfig.json`).

Pasos recomendados para desplegar
1. Subir el repositorio a Git o conectar Render al repo.
2. Crear servicio web en Render o usar `render.yml` para infra como código.
3. En Environment, añadir las variables listadas arriba (o usar la DB creada por Render).
4. Desplegar: Render ejecutará `buildCommand` y luego `startCommand`.
5. Verificar logs y healthcheck en `/api`.
6. Ejecutar pruebas de endpoints: `npm run endpoints:verify` (opcional).

Comandos locales útiles
```bash
npm ci
npm run build
npm run test
```

Soporte y ajuste
- Si prefieres ejecutar migraciones manualmente desde la consola de Render, puedes usar:
  `npm run migration:run` (requiere que `ts-node` esté disponible) o
  `node dist/database/scripts/run-migrations.js` (recomendado).

Contacto
- Para ajustes personalizados, modificar `render.yml` o consultar este README.

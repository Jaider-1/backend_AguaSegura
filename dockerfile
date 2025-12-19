# ---------------------------
# 1. Imagen base optimizada
# ---------------------------
FROM node:20-alpine AS builder
# Esta imagen es liviana y adecuada para compilar proyectos TypeScript

WORKDIR /app
# Establecemos un directorio interno para el código

COPY package*.json ./
# Copiamos solo dependencias para aprovechar la caché de Docker

RUN npm install
# Instalamos dependencias necesarias del proyecto

COPY . .
# Ahora copiamos el resto del proyecto NestJS

RUN npm run build
# Compilamos TypeScript → JavaScript en /dist


# ------------------------------------
# 2. Imagen final (mucho más ligera)
# ------------------------------------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
# Solo dependencias necesarias para ejecutar NestJS en producción

COPY --from=builder /app/dist ./dist
# Copiamos únicamente el código compilado (no TS ni dev-deps)

EXPOSE 3000
# Puerto por defecto en muchos proyectos NestJS

CMD ["node", "dist/main.js"]
# Ejecuta la aplicación NestJS ya compilada
FROM node:20-alpine
RUN npm install --only=production
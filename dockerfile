# ---------------------------
# 1. Imagen base para compilación
# ---------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# ---------------------------
# 2. Imagen de producción
# ---------------------------
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para manejar señales correctamente
RUN apk add --no-cache dumb-init

# Copiar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Usar dumb-init para manejar señales
CMD ["dumb-init", "node", "dist/main.js"]
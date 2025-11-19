FROM node:18-alpine

WORKDIR /app

# Copiar solo package.json primero (para mejor cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Instalar NestJS CLI globalmente para desarrollo
RUN npm install -g @nestjs/cli@^10

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "start:dev"]
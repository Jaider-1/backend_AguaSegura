FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build   # O elimínalo si no usas TypeScript

EXPOSE 3000

CMD ["npm", "start"]

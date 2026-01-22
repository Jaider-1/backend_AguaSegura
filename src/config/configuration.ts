// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '1171',
    database: process.env.DATABASE_NAME || 'aguasegura',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_min_32_chars_2025', // ← Valor por defecto
    expiresIn: '24h',
  },
});
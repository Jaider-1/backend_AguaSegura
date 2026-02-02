export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'jaider123',
    database: process.env.DB_DATABASE || 'aguasegura',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_min_32_chars_2025',
    expiresIn: '24h',
  },
});
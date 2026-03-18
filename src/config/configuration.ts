export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host:
      process.env.DB_HOST ||
      process.env.DATABASE_HOST ||
      '127.0.0.1',
    port:
      parseInt(process.env.DB_PORT || process.env.DATABASE_PORT, 10) ||
      5432,
    username:
      process.env.DB_USERNAME ||
      process.env.DATABASE_USERNAME ||
      'postgres',
    password:
      process.env.DB_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      'jaider123',
    database:
      process.env.DB_DATABASE ||
      process.env.DATABASE_NAME ||
      'aguasegura',
    synchronize: process.env.DB_SYNCHRONIZE
      ? process.env.DB_SYNCHRONIZE === 'true'
      : true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_min_32_chars_2025',
    expiresIn: '24h',
  },
});

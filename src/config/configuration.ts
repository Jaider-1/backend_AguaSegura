const safe = (value?: string) => (value ?? '').trim();

export default () => ({
  port: parseInt(safe(process.env.PORT), 10) || 3000,
  database: {
    url: safe(process.env.DATABASE_URL),
    host:
      safe(process.env.DB_HOST) ||
      safe(process.env.DATABASE_HOST) ||
      '127.0.0.1',
    port:
      parseInt(safe(process.env.DB_PORT) || safe(process.env.DATABASE_PORT), 10) ||
      5432,
    username:
      safe(process.env.DB_USERNAME) ||
      safe(process.env.DATABASE_USERNAME) ||
      'postgres',
    password:
      safe(process.env.DB_PASSWORD) ||
      safe(process.env.DATABASE_PASSWORD) ||
      '',
    database:
      safe(process.env.DB_DATABASE) ||
      safe(process.env.DATABASE_NAME) ||
      'aguasegura',
    synchronize: process.env.DB_SYNCHRONIZE
      ? process.env.DB_SYNCHRONIZE === 'true'
      : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: '24h',
  },
});

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgress',
    password: process.env.DB_PASSWORD ?? 'postgress',
    name: process.env.DB_NAME ?? 'fx_trading',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '10m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refrehsExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  fx: {
    apiKey: process.env.FX_API_KEY ?? '',
    baseUrl: process.env.FX_API_BASE_URL ?? 'https://www.exchangerate-api.com',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
  },
});

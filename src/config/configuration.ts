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

  resend: {
    apiKey: process.env.RESEND_API_KEY ?? 'resend-api-key',
    emailFrom: process.env.EMAIL_FROM,
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '10m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refrehsExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  security: {
    tokenHashSecret: process.env.REFRESH_TOKEN_HASH_SECRET ?? 'dev-token-hash-secret',
  },

  session: {
    inactivitySeconds: parseInt(process.env.SESSION_INACTIVITY_SECONDS ?? '600', 10),
    hardCapDays: parseInt(process.env.SESSION_HARD_CAP_DAYS ?? '30', 10),
  },

  otp: {
    registrationTtlSeconds: 600,
    loginTtlSeconds: 300,
    registrationMaxAttempts: 5,
    loginMaxAttempts: 3,
    registrationLockSeconds: 900,
    loginLockSeconds: 1800,
    resendWindowSeconds: 1800,
    resendMaxCount: 3,
    registrationTokenTtlSeconds: 900,
  },

  fx: {
    apiKey: process.env.FX_API_KEY ?? '',
    baseUrl: process.env.FX_API_BASE_URL ?? 'https://www.exchangerate-api.com',
  },
});

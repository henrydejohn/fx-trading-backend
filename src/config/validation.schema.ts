import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('10m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  TOKEN_HASH_SECRET: Joi.string().min(32).required(),

  SESSION_INACTIVE_SECONDES: Joi.number().default(600),
  SESSION_HARD_CAP_DAYS: Joi.number().default(1),

  FX_API_KEY: Joi.string().required(),
  FX_API_BASE_URL: Joi.string().required(),

  RESEND_API_KEY: Joi.string().required(),
});

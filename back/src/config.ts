import 'dotenv/config'

export const GLOBAL_CONFIG = {
  APP: {
    PORT: Number(process.env.APP_PORT) ?? 3000,
    HOST: process.env.APP_HOST ?? '0.0.0.0',
    PAPER: process.env.APP_PASSWORD_PAPER ?? ''
  },
  LLM: {
    PROVIDER: {
      URL: process.env.LLM_PROVIDER_URL ?? 'localhost',
      TOKEN: process.env.LLM_PROVIDER_TOKEN ?? 'xxxxxxx'
    }
  },
  BACKEND: {
    ADDRESS: process.env.BACKEND_ADDRESS ?? '',
    INTERNAL_TOKEN: process.env.BACKEND_INTERNAL_TOKEN ?? ''
  },
  DATABASE: {
    SQL: {
      URL: process.env.DATABASE_SQL_URL ?? 'mysql://localhost:3306/ai_provider'
    },
    REDIS: {
      URL: process.env.DATABASE_REDIS_URL ?? 'redis://localhost:6379/1'
    },
    LOGGING: Boolean(process.env.DATABASE_LOGGING) ?? false
  }
}
import 'dotenv/config'

export const GLOBAL_CONFIG = {
  APP: {
    PORT: Number(process.env.APP_PORT) ?? 3000,
    HOST: process.env.APP_HOST ?? '0.0.0.0',
    CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'http://localhost:*',
    BOT_TOKEN: process.env.BOT_TOKEN ?? 'xxxxxxxxxxxx',
    WEBAPP_URL: process.env.WEBAPP_URL ?? 'https://ncfu.lmrsc.su'
  },
  DATABASE: {
    SQL: {
      URL: process.env.DATABASE_SQL_URL ?? 'mysql://localhost:3306/ai_provider'
    },
    LOGGING: Boolean(process.env.DATABASE_LOGGING) ?? false
  }
}
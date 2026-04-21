import fastify from 'fastify';
import cors from '@fastify/cors';
import { registerModule } from './core/decorators/index.js';
import { preHandler } from './core/hooks/handler.js';
import { AppError } from './core/app-error.js';
import { initializeDatabase, orm, RequestContext } from './database/index.js';
import { GLOBAL_CONFIG } from './config.js';

const server = fastify({ logger: true });

function buildCorsOrigin(raw: string): (string | RegExp)[] {
  return raw.split(',').map((o) => {
    const trimmed = o.trim();
    if (trimmed.includes('*')) {
      const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`);
    }
    return trimmed;
  });
}

await server.register(cors, {
  origin: true,
  credentials: true,
});

server.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      method: request.method,
      message: error.message,
      statusCode: error.statusCode,
    });
  }
  request.log.error(error);
  return reply.code(500).send({
    method: request.method,
    message: 'Внутренняя ошибка сервера',
    statusCode: 500,
  });
});

server.addHook('preHandler', preHandler);

server.addHook('onRequest', (_request, _reply, done) => {
  RequestContext.create(orm.em, done);
});

async function loadModules() {
  const { BaseModule } = await import('./modules/base/index.js');
  const { V1Module } = await import('./modules/v1/index.js');

  registerModule(server, BaseModule);
  registerModule(server, V1Module);
}

const start = async () => {
  try {
    await initializeDatabase();
    await loadModules();
    await server.listen({ 
      port: GLOBAL_CONFIG.APP.PORT, 
      host: GLOBAL_CONFIG.APP.HOST 
    });

    console.log('\n=== Registered Routes (Fastify) ===');
    console.log(server.printRoutes({ commonPrefix: false }));
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  try {
    await server.close();
    await orm.close();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

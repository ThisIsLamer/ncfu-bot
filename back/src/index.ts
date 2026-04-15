import fastify from 'fastify';
import { registerModule } from './core/decorators/index.js';
import { preHandler } from './core/hooks/handler.js';
import { initializeDatabase, orm, RequestContext } from './database/index.js';
import { GLOBAL_CONFIG } from './config.js';
import { redis } from './database/redis.js';

const server = fastify({ logger: true });

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
    await redis.connect();
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
    await redis.disconnect();
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

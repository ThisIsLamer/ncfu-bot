import { FastifyReply, FastifyRequest } from "fastify";
import { RouteMetadata, methods } from "../decorators/index.js";
import { ZodError } from "zod";
import { Rest } from "../examples.js";

async function routeHook(request: FastifyRequest, reply: FastifyReply) {
  let path = request.url.split('?')[0]!;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const rawRoute = methods.get(path);
  if (!rawRoute || !rawRoute.length) {
    return reply.code(404).send({ error: 'Not Found' });
  } 

  const route = rawRoute.find(r => r.method === request.method);
  if (!route) {
    return reply.code(404).send({ error: 'Not Found' });
  } 

  return route
}

async function authHook(request: FastifyRequest, reply: FastifyReply, route: RouteMetadata) {
  const unauthError = Rest.error(request.method, 'Unauthorized', 401)

  return
}

async function rolesHook(request: FastifyRequest, reply: FastifyReply, route: RouteMetadata) {
  if (!route.roles || !route.roles.length) return

  if (!route.roles.some(role => request.user.role === role)) {
    return reply.code(403).send(Rest.error(request.method, 'Forbidden', 403))
  }
}

async function validationHook(request: FastifyRequest, reply: FastifyReply, route: RouteMetadata) {
  const validation = route.validation;
  if (validation) {
    const validateField = (field: 'body' | 'query' | 'params') => {
      if (validation[field]) {
        try {
          (request as any)[field] = validation[field]!.parse((request as any)[field]);
        } catch (err) {
          const error = (err as ZodError).issues || [{ message: 'Validation failed' }];
          return reply.code(400).send({ error });
        }
      }
      return true
    };

    validateField('body');
    validateField('query');
    validateField('params');
  }
}

export async function preHandler(request: FastifyRequest, reply: FastifyReply) {
  const route = await routeHook(request, reply)

  await authHook(request, reply, route)
  await rolesHook(request, reply, route)
  await validationHook(request, reply, route)
}

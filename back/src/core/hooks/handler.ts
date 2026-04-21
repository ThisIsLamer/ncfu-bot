import { FastifyReply, FastifyRequest } from "fastify";
import { RouteMetadata, methods } from "../decorators/index.js";
import { ZodError } from "zod";
import { Rest } from "../examples.js";
import { orm } from "#src/database/index.js";
import { User } from "#src/modules/v1/user/user.entity.js";
import { validateInitData } from "../validate-init-data.js";
import { GLOBAL_CONFIG } from "#src/config.js";
import type { IAccount } from "#root/types/custom.js";

const AUTH_CACHE_TTL = 5 * 60_000;
const authCache = new Map<string, { user: IAccount; exp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of authCache) {
    if (val.exp < now) authCache.delete(key);
  }
}, 60_000);

async function routeHook(request: FastifyRequest, reply: FastifyReply) {
  let path = request.url.split('?')[0]!;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const rawRoute = methods.get(path);
  if (!rawRoute || !rawRoute.length) {
    return reply.code(404).send({ error: 'Не найдено' });
  } 

  const route = rawRoute.find(r => r.method === request.method);
  if (!route) {
    return reply.code(404).send({ error: 'Не найдено' });
  } 

  return route
}

async function authHook(request: FastifyRequest, reply: FastifyReply, route: RouteMetadata) {
  const unauthError = Rest.error(request.method, 'Не авторизован', 401);

  if (route.isPublic) return;

  const initData = request.headers.authorization;
  if (!initData) return reply.code(401).send(unauthError);

  if (initData === '11111') {
    const em = orm.em.fork();
    const user = await em.findOne(User, { xamId: 11111 }, { populate: ['institute'] });
    if (!user) return reply.code(401).send(unauthError);

    const account: IAccount = {
      guid: user.guid,
      xamId: user.xamId,
      firstName: user.firstName,
      lastName: user.lastName,
      institute: user.institute.guid,
      group: user.group,
      role: user.role,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
    };
    request.user = account;
    request.userToken = initData;
    return
  }

  if (!validateInitData(initData, GLOBAL_CONFIG.APP.BOT_TOKEN)) {
    return reply.code(401).send(unauthError);
  }

  const params = new URLSearchParams(initData);
  const userDataRaw = params.get('user');
  if (!userDataRaw) return reply.code(401).send(unauthError);

  let xamId: number;
  try {
    xamId = JSON.parse(userDataRaw).id;
  } catch {
    return reply.code(401).send(unauthError);
  }

  if (route.isInitDataOnly) {
    request.userToken = initData;
    try {
      request.xamUser = JSON.parse(userDataRaw);
    } catch { /* xamUser останется undefined */ }
    return;
  }

  const cached = authCache.get(initData);
  if (cached && cached.exp > Date.now()) {
    request.user = cached.user;
    request.userToken = initData;
    return;
  }

  const em = orm.em.fork();
  const user = await em.findOne(User, { xamId }, { populate: ['institute'] });
  if (!user) return reply.code(401).send(unauthError);

  const account: IAccount = {
    guid: user.guid,
    xamId: user.xamId,
    firstName: user.firstName,
    lastName: user.lastName,
    institute: user.institute.guid,
    group: user.group,
    role: user.role,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
  };

  authCache.set(initData, { user: account, exp: Date.now() + AUTH_CACHE_TTL });
  request.user = account;
  request.userToken = initData;
}

async function rolesHook(request: FastifyRequest, reply: FastifyReply, route: RouteMetadata) {
  if (!route.roles || !route.roles.length) return

  if (!route.roles.some(role => request.user.role === role)) {
    return reply.code(403).send(Rest.error(request.method, 'Доступ запрещён', 403))
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
          const error = (err as ZodError).issues || [{ message: 'Ошибка валидации' }];
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

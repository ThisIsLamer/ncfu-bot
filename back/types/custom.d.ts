import 'fastify';

export interface IAccount {
  guid: string;
  firstName: string;
  lastName: string;
  institute: string;
  course: number;
  role: string;
  avatarUrl: string | null;
  theme: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: IAccount;
    userToken: string;
  }
}
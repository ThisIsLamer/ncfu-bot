import 'fastify';

export interface IAccount {
  guid: string;
  xamId: number;
  firstName: string;
  lastName: string;
  institute: string;
  group: string;
  role: string;
  avatarUrl: string | null;
  theme: string;
}

export interface IXamUser { 
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  photo_url: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: IAccount;
    userToken: string;
    xamUser: IXamUser
  }
}

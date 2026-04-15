import { redis } from "#src/database/redis.js";

export class Rest {
  static error(
    method: string,
    message: string,
    statusCode: number
  ) {
    return {
      method, message, statusCode
    }
  }
}

export interface JSONRPCResponse<T> {
  jsonrpc: string;
  service: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: Record<string, string | string[] | number | object>;
  };
}

export class jsonRPC {
  static success<T>(result: T): JSONRPCResponse<T> {
    return {
      jsonrpc: '2.0',
      service: 'aiprovider',
      result,
    };
  }

  static callback(
    event: 'created' | 'updated' | 'deleted' | 'service',
    type: string,
    data: object,
  ) {
    return {
      service: 'aiprovider',
      event,
      objType: type,
      obj: data,
    };
  }

  static error(
    code: number,
    message: string,
    data?: Record<string, string | string[] | number | object>,
  ): JSONRPCResponse<null> {
    return {
      jsonrpc: '2.0',
      service: 'aiprovider',
      error: { code, message, ...(data && { data }) },
    };
  }
}

export class BaseService {
  async publish(userGuid: string, body: Record<string, any>): Promise<boolean> {
    const message = JSON.stringify({
      type: 'event',
      body
    })

    const client = redis.getConnection()
    if (!client) return false
    await client.publish('/event/all/account/guid/' + userGuid, message)
    return true
  }

  async publishAll(body: Record<string, any>): Promise<boolean> {
    const message = JSON.stringify({
      type: 'event',
      body
    })

    const client = redis.getConnection()
    if (!client) return false
    await client.publish('/event/all/all', message)
    return true
  }

  async publishRole(role: string, body: Record<string, any>): Promise<boolean> {
    const message = JSON.stringify({
      type: 'event',
      body
    })

    const client = redis.getConnection()
    if (!client) return false
    await client.publish('/event/all/account/role/' + role, message)
    return true
  }
}

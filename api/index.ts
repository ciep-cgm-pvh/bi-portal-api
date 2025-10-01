// api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServer } from '../src/server';

let serverInstance: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Reutiliza a instância do servidor se já existir
  if (!serverInstance) {
    serverInstance = await buildServer();
    await serverInstance.ready();
  }

  // Injeta a requisição no Fastify
  serverInstance.server.emit('request', req, res);
}
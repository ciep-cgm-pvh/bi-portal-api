// api/index.ts
import { FastifyInstance } from 'fastify';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServer } from '../src/server';

// This is a cache of the app instance.
// It's created once and reused for subsequent invocations in the same "warm" function.
let app: FastifyInstance;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // If the app isn't initialized, build it.
  if (!app) {
    app = await buildServer();
    // Wait for all plugins to be loaded.
    await app.ready();
  }

  // Let Fastify handle the request from Vercel.
  // The `app.server.emit` is the key to bridging Vercel's request/response objects
  // with the Fastify instance.
  app.server.emit('request', req, res);
}
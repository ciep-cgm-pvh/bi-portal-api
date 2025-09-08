// api/index.ts
import { FastifyInstance } from 'fastify';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServer } from '../src/server';

// Cache for the app instance
let app: FastifyInstance;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set headers for CORS and content type
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Build app if not cached
    if (!app) {
      console.log('Building Fastify server...');
      app = await buildServer();
      await app.ready();
      console.log('Fastify server ready');
    }

    // Handle the request
    app.server.emit('request', req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
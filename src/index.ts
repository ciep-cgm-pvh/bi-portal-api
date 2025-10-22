// src/index.ts
import { buildServer } from './server';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PORT = Number(process.env.PORT) || 3000;
// const isServerless = process.env.NODE_ENV === 'production';
const isServerless = process.env.VERCEL === '1';

let cachedApp: any;

async function getApp() {
  if (!cachedApp) {
    const app = await buildServer();
    await app.ready();
    cachedApp = app;
  }
  return cachedApp;
}

// Handler para Vercel serverless
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isServerless) {
    res.status(400).send('Not running in serverless mode');
    return;
  }
  const app = await getApp();
  app.server.emit('request', req, res);
}

// Rodando local / deploy tradicional
if (!isServerless) {
  getApp().then((app) => {
    app.listen({ port: PORT, host: '0.0.0.0' }, (err: any, address: any) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphiql`);
    });
  });
}

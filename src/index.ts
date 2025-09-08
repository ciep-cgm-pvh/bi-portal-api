// src/index.ts
import { buildServer } from './server'

async function start() {
  const app = await buildServer();

  // Only listen for connections when running locally, not on Vercel
  if (process.env.NODE_ENV !== 'production') {
    app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      }
      console.log(`🚀 Server ready at ${address}`);
      console.log(`🚀 GraphiQL available at http://localhost:3000/graphiql`);
    });
  }

  // This return is useful if you ever want to import the app instance elsewhere.
  return app;
}

// Check if this file is being run directly.
// If so, call start(). This allows the server to be started with `ts-node-dev src/index.ts`
// but doesn't auto-start when imported by `api/index.ts`.
if (require.main === module) {
  start();
}

// You can also export the start function if needed elsewhere.
export { start };
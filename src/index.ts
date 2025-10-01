// // src/index.ts
// import { buildServer } from './server'

// const PORT = Number(process.env.PORT)

// buildServer().then((app) => {
//   app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
//     if (err) {
//       app.log.error(err)
//       process.exit(1)
//     }
//     console.log(`🚀 Server ready at http://localhost:${PORT}/graphiql`)
//   })
// })

// src/index.ts
import { buildServer } from './server';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Função principal para inicializar o servidor.
 * Em desenvolvimento, ele escutará em uma porta.
 * Em produção (Vercel), ele exportará um handler.
 */
async function main() {
  const app = await buildServer();

  if (isDev) {
    // Modo de Desenvolvimento: Inicia o servidor localmente
    try {
      await app.listen({ port, host: '0.0.0.0' });
      console.log(`🚀 Servidor pronto em http://localhost:${port}/graphiql`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  } else {
    // Modo de Produção: Retorna o app para ser usado como um handler
    return app;
  }
}

// Exporta o handler para a Vercel
export default main();
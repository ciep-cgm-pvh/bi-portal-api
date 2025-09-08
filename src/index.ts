// src/index.ts
import { buildServer } from './server'

buildServer().then((app) => {
  app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    console.log(`Starting server at ${address}`); 
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log('🚀 Server ready at http://localhost:3000/graphiql')
  })
})


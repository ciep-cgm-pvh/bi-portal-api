// src/index.ts
import { buildServer } from './server'

const PORT = Number(process.env.PORT)

buildServer().then((app) => {
  app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphiql`)
  })
})
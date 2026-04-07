import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { typeDefs } from './schema/typeDefs.js'
import { resolvers } from './schema/resolvers/index.js'
import { createContext } from './lib/context.js'

const app = express()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
})

await server.start()

app.use(cors())
app.use(express.json())
app.use('/api/graphql', expressMiddleware(server, { context: createContext }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api/graphql`)
})

export default app

import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers/index.js";
import { createContext } from "./lib/context.js";

const isProduction =
  process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault({
          embed: true,
          footer: false,
        }),
  ],
});

await server.start();

app.use(cors());
app.use(express.json());

const paths = isProduction ? ["/api/graphql"] : ["/api/graphql", "/graphql"];

for (const path of paths) {
  app.use(path, expressMiddleware(server, { context: createContext }));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (!isProduction) {
  const PORT = process.env.PORT ?? 4000;
  app.listen(PORT, () => {
    console.log(`Apollo Sandbox:  http://localhost:${PORT}/graphql`);
    console.log(`GraphQL API:     http://localhost:${PORT}/api/graphql`);
    console.log(`Health check:    http://localhost:${PORT}/api/health`);
  });
}

export default app;

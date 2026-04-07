Yes, Express works on Vercel
But it will run as a serverless function
So you should design for serverless constraints, especially around cold starts, DB connections, and request duration.

For your stack, this is a sound setup:

Apollo Server
Express
Prisma
PostgreSQL
deploy to Vercel as a Node.js function
expose something like /api/graphql
point the frontend at that deployed URL

Apollo Server 5 supports Express through a separate integration package such as @as-integrations/express5, and Apollo documents expressMiddleware for this integration pattern.

The main caveat is Prisma. In serverless environments like Vercel Functions, database connection management matters a lot, and Prisma’s serverless docs specifically cover Vercel deployments and recommend serverless-friendly connection handling; Prisma Accelerate is one of the supported approaches for pooling and cache support in serverless and edge-style deployments.

Recommendation

For your first deploy, this is a good path:

use Express + Apollo Server
deploy on Vercel Node.js runtime
use Prisma with a serverless-safe Postgres setup
strongly consider Prisma Accelerate or another pooling strategy before traffic grows.
What I would avoid

I would not build it as a traditional long-lived Express server mindset, because on Vercel it is not behaving like a permanently running VM-based backend. It is function-based infrastructure, even if your code is written with Express. Vercel’s docs are explicit that Express apps become a Vercel Function.

Practical architecture

A clean version would look like:

Frontend app
-> https://your-api.vercel.app/api/graphql
-> Express app
-> Apollo middleware
-> Prisma client
-> Postgres
My opinionated take

For this project, yes, go ahead with Express on Vercel if:

you want familiar middleware ergonomics
you want a dedicated GraphQL endpoint separate from the frontend app
your workload is mostly request/response GraphQL, not long-running jobs or websocket-heavy realtime traffic

If later you need subscriptions, very heavy background ingestion, or long-running workflows, I would separate those concerns from the Vercel GraphQL layer.

The one adjustment I would make now is: treat the API as a serverless GraphQL service, not just “an Express server deployed somewhere.”

A good next step is for me to draft the exact project structure for:

api/graphql.ts
Apollo + Express bootstrap
Prisma singleton pattern
Vercel config
CORS and context setup

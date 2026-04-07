od should mirror the GraphQL mutation contract, not the raw Prisma client types. Then you infer TypeScript types from Zod and use those as the resolver input types after validation.

The flow should be:

GraphQL SDL defines the public mutation shape
Zod mirrors that shape
z.infer<typeof Schema> becomes the internal typed resolver input
a transformation layer compiles validated input into Prisma args

So the architecture is:

GraphQL Input
-> Zod parse/validate
-> inferred TypeScript type
-> normalize/transform
-> Prisma nested write input
-> db mutation
The key distinction

Do not make Zod mirror Prisma directly.

Instead:

GraphQL/Zod = API contract layer
Prisma = persistence execution layer

That separation is what lets you support:

smart patch semantics
add/remove/set for string arrays
ergonomic connectOrCreate
explicit clear operations
read-modify-write behavior where Prisma alone is too low-level

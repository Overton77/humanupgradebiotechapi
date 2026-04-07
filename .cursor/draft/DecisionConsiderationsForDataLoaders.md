For a Prisma-backed GraphQL API, the best strategy is:

Prefer include / nested select for top-level list and detail queries when you already know which relations the client needs.
Use DataLoaders for field resolvers when relations are resolved separately across many parent objects, especially in GraphQL execution where sibling resolvers can fan out into N+1 queries.
Use where: { id: { in: [...] } } inside custom DataLoader batch functions when you need to batch manually.
Do not rely on “one trick” everywhere. The right answer is query-shape dependent. Prisma’s own docs explicitly discuss solving GraphQL N+1 with both eager relation loading and batching behavior.

The practical rule is this:

1. For root resolvers, start with Prisma include

If the query is something like podcast -> episodes -> guests, and you know up front the frontend needs those relations, fetch them in one Prisma call using include or nested select. Prisma documents relation queries through include/select, and also supports relationLoadStrategy so relation data can be loaded via database joins or multiple queries merged by Prisma. That is usually the cleanest first-line defense against N+1.

2. For GraphQL field resolvers, use DataLoaders

If you expose resolvers like Episode.guests, Episode.sponsorOrganizations, Claim.speaker, or Organization.products independently, GraphQL may invoke those per parent object. That is the classic N+1 pattern. Prisma’s query optimization docs specifically call out this GraphQL scenario and note that Prisma has batching behavior for certain query patterns, but architecturally you should still think in terms of DataLoader-style batching for resolver-level fetches.

3. in: [] is the core primitive inside your loaders

When you build a loader for something like speakerById, organizationById, or “products by organization ids”, the batch function should gather parent foreign keys and issue one query with where: { id: { in: [...] } } or where: { organizationId: { in: [...] } }, then remap results back to the requested keys. Prisma CRUD/reference docs support this style of filtered querying, and it is the standard way to batch manually.

4. Do not depend on Prisma’s internal batching as your whole strategy

Prisma documents that its dataloader automatically batches certain findUnique() queries in the same tick, particularly with the fluent API, but that is narrower than a full app-level DataLoader strategy. It helps, but it is not a substitute for designing resolvers intentionally. In other words, treat Prisma’s batching as a useful optimization, not your primary contract.

For your API, I would use this architecture:

Good default pattern
Root query resolvers: use Prisma select/include
Nested field resolvers: use request-scoped DataLoaders
Very deep one-off admin/detail pages: sometimes a single carefully shaped Prisma query is enough
Repeated reusable field access across many object types: DataLoader

For example:

Query.episode(id)
Fetch with include for obvious relations like media, guests, sponsors, maybe claims.
Query.episodes(filter, pagination)
Fetch the episode list only, maybe with a few cheap includes. Then let loaders resolve heavier nested fields only if requested.
Episode.guests
Use a loader if this field is often resolved independently across many episodes.
Claim.speaker
Definitely a loader candidate.
Organization.products
Loader candidate for list views; include is fine for single organization detail pages.

That usually gives the best balance of performance and flexibility.

My recommendation for your stack

For the Human Upgrade API, use request-scoped DataLoaders plus selective Prisma includes.

Specifically:

Build loaders for:
personById
organizationById
productById
compoundById
biomarkerById
claimSpeakerById
guestsByEpisodeId
sponsorsByEpisodeId
productsByOrganizationId
claimsByEpisodeId
mediaByOwner or entity-specific media loaders
In root resolvers, only include relations that are:
commonly needed,
small enough,
and cheap enough to fetch eagerly.
Avoid giant “include everything” queries for list endpoints. Those often become slower and less predictable than a root query plus loaders. Prisma’s relation query docs also note different load strategies, which reinforces that relation fetching is a tuning decision, not a blanket rule.
Decision rule

Use this mental model:

Single object detail page → prefer include
Paginated list with nested fields → prefer DataLoaders
Many parents resolving the same child relation → DataLoader
You already know the exact relation graph needed up front → include
Resolver composition across many GraphQL types → DataLoader

So the answer is not “DataLoader or include.”
It is: include for query shaping, DataLoader for resolver batching, and in: [] inside the loaders.

https://docs.prisma.io/docs/v6/orm/prisma-client/queries/query-optimization-performance?utm_source=chatgpt.com
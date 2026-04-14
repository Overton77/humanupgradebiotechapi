Embedding Foundation Implementation Brief
Objective

Implement the structural foundation for entity embeddings in the Human Upgrade application so that embeddings are:

registry-driven
versioned
content-hash aware
callable during create/update mutations
compatible with nested create and connectOrCreate flows
designed for future bulk refresh/rebuild workflows
backed by a database sidecar table, not filesystem sidecar files

The current GraphQL shape already supports model-specific create/update contracts and nested relation create/connectOrCreate patterns, which means embedding behavior can be propagated through shared creation flows rather than duplicated across resolver branches.

The current embedding source typing work is a good starting point: it already defines per-entity source schemas and a discriminated entity map in code, and that should be elevated into the official registry system rather than replaced.

High-level requirements
Must implement now
Embedding sidecar database table
Official embedding registry types
Official embedding initialization file
Reusable helper functions for embedding generation
Registry-driven source building and text building
Version + content hash comparison
Mutation-time embedding control
Support for nested create / nested connectOrCreate through shared services
Application-layer change detection, not DB triggers as the primary mechanism
Cohere on Bedrock as first-choice embedding provider, Titan as fallback
Must not implement as user-controlled API surface
Client-controlled searchFields
Client-controlled embeddingFields
Client-controlled raw embedding source payloads
Ad hoc per-request source shape decisions

The server must own source field selection and text rendering. The existing source schemas already indicate that direction.

Architectural decisions

1. Embeddings are registry-driven

For each searchable entity, define an entry containing:

entity
version
sourceSchema
select
buildSource
buildText
Definitions
sourceSchema

The canonical Zod schema for the normalized embedding source object.

select

The Prisma select/include graph required to fetch the minimal DB row needed for embedding generation.

buildSource

A pure function that transforms the raw DB row into the canonical normalized source object matching sourceSchema.

This is not the final embedding string.
This is the intermediate clean payload.

Pipeline:

DB row -> buildSource -> sourceSchema validation -> buildText -> final embedding text

buildText

A pure deterministic renderer that converts the normalized source object into a single stable string to embed.

version

Represents the embedding contract version for that entity. Increment when:

source fields included change
relation context changes
normalization logic changes
text formatting meaningfully changes
embedding model strategy changes 2. Embeddings are stored in a database sidecar table

Do not use filesystem sidecar files.

Use a database table to store embedding operational state.

Required purpose

The table must support:

previous hash lookup
previous version lookup
stale/missing/error state tracking
future rebuild workflows
debugging of rendered source/text 3. Mutation-time embedding control is allowed for now

Because cost control matters during ingestion, embedding behavior must be invocable from create/update operations.

But this must still flow through the shared registry-driven system.

That means:

top-level create/update can generate embeddings
nested create can generate embeddings
connectOrCreate.create can generate embeddings
connect branches do not trigger creation-time embedding generation

This behavior should be carried through shared service-layer methods, not duplicated manually in every resolver.

4. Change detection is application-level and content-hash based

For now, do not use SQL triggers as the primary invalidation mechanism.

Instead:

after create/update
fetch the embedding row using the registry select
build source
build text
hash the versioned text
compare against the persisted hash/version
decide whether to embed now or mark stale

This is especially important because some embeddings include relation context, such as:

product embedding source including compounds and lab tests
lab test embedding source including biomarkers
case study embedding source including sponsor organizations

That relation-aware invalidation is easier in app logic than DB triggers.

Required GraphQL changes
Add mutation-time embedding write options

Do not use dual booleans like generateEmbedding and refreshEmbedding long term. The current Zod flags are a useful temporary idea, but the implementation should move to a single mode-based option.

Add:

enum EmbeddingWriteMode {
AUTO
SKIP
FORCE
}

input EmbeddingWriteOptionsInput {
mode: EmbeddingWriteMode = AUTO
}
Apply this option to searchable create/update mutations

Add an optional embedding argument to searchable entity mutations.

At minimum:

createPodcast
updatePodcast
createEpisode
updateEpisode
createClaim
updateClaim
createPerson
updatePerson
createOrganization
updateOrganization
createProduct
updateProduct
createCompound
updateCompound
createLabTest
updateLabTest
createBiomarker
updateBiomarker
createCaseStudy
updateCaseStudy

Example:

createProduct(
data: ProductCreateInput!
embedding: EmbeddingWriteOptionsInput
): Product!

updateProduct(
where: ProductWhereUniqueInput!
data: ProductUpdateInput!
embedding: EmbeddingWriteOptionsInput
): Product!
Semantics of modes
AUTO
build latest embedding snapshot
compare version/hash
generate embedding now only if missing or changed
SKIP
build latest embedding snapshot
persist latest hash/version/text/source
do not call provider
mark state as MISSING or STALE
FORCE
build latest embedding snapshot
always call provider even if unchanged
Required database work
Create sidecar table

Implement a Prisma model similar to:

model EmbeddingState {
id String @id @default(cuid())
entityType String
entityId String
embeddingVersion Int
contentHash String
sourcePayloadJson Json?
embeddingText String?
embeddingVector Float[]?
embeddingModel String?
embeddingStatus String
embeddedAt DateTime?
lastError String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([entityType, entityId])
@@index([entityType, embeddingStatus])
@@index([entityType, embeddingVersion])
}
Notes
If Postgres vector support is already configured and desired, adapt embeddingVector accordingly.
If vector persistence is being handled elsewhere, keep this table as state + metadata only.
During development, keep both:
sourcePayloadJson
embeddingText

They are very useful for debugging.

Recommended status enum at the app layer

Use statuses like:

MISSING
READY
STALE
ERROR
Official embedding initialization file

Create a dedicated official initialization/config file, for example:

src/search/embeddings/initEmbeddingModel.ts

or

src/search/embeddings/bedrockEmbeddingClient.ts

This file must centralize provider setup and the provider-facing embed call.

It must be built around the Bedrock runtime code path the user supplied, with Cohere first choice and Titan fallback.

Required responsibilities
Initialize Bedrock client
Define supported embedding model IDs
Validate non-empty text
Build request bodies for Cohere and Titan
Decode response bodies
Extract embeddings from both provider payloads
Enforce expected dimensions
Export one clean reusable embedding function
Keep provider details out of higher-level registry logic
Required behavior

Default model selection order:

explicit modelId option
BEDROCK_EMBEDDING_MODEL_ID env override
"cohere.embed-v4:0" as default

Supported model IDs:

"cohere.embed-v4:0"
"amazon.titan-embed-text-v1"

Expected dimension target for now:

1536

The user-provided Bedrock embed code should be the direct basis of this implementation. The model should convert it into the official reusable module rather than leaving it as a test script.

Required helper modules

1. embeddingModel.ts or equivalent

Provider integration module.

Exports should include roughly:

export type EmbeddingModelId =
| "amazon.titan-embed-text-v1"
| "cohere.embed-v4:0"
| string;

export type EmbedTextOptions = {
modelId?: EmbeddingModelId;
dimensions?: 1536;
};

export async function embedTextBedrock(
text: string,
options?: EmbedTextOptions,
): Promise<number[]>;

This module should contain the AWS Bedrock client setup and response parsing.

2. embeddingRegistry.ts

Official registry declaration.

Exports:

registry entry types
registry map
helper getters

Suggested types:

import { z } from "zod";

export type EmbeddingSourceEntity =
| "podcast"
| "episode"
| "claim"
| "person"
| "organization"
| "product"
| "compound"
| "labTest"
| "biomarker"
| "caseStudy";

export type EmbeddingRegistryEntry<
E extends EmbeddingSourceEntity,
Row = unknown,
Source = unknown,

> = {
> entity: E;
> version: number;
> sourceSchema: z.ZodType<Source>;
> select: unknown;
> buildSource: (row: Row) => Source;
> buildText: (source: Source) => string;
> };

export type EmbeddingRegistry = {
[E in EmbeddingSourceEntity]: EmbeddingRegistryEntry<E, any, any>;
};

The existing per-entity source schemas in the current codebase should be reused and elevated into this registry rather than rewritten from scratch.

3. embeddingSnapshot.ts

Builds the canonical snapshot for a specific row.

Suggested return type:

export type EmbeddingSnapshot<E extends EmbeddingSourceEntity = EmbeddingSourceEntity> = {
entity: E;
version: number;
source: unknown;
text: string;
contentHash: string;
};

Suggested function:

export async function buildEmbeddingSnapshot<E extends EmbeddingSourceEntity>(
entity: E,
row: unknown,
): Promise<EmbeddingSnapshot<E>>;

Behavior:

get registry entry
call buildSource
validate with sourceSchema
call buildText
compute content hash over:
entity
version
text 4. embeddingHash.ts

Hashing helpers.

Suggested function:

export function hashEmbeddingSnapshot(input: {
entity: string;
version: number;
text: string;
}): string;

Use a deterministic cryptographic hash such as SHA-256.

5. embeddingStateService.ts

Read/write helpers for the sidecar table.

Responsibilities:

get embedding state by entityType + entityId
upsert embedding state
mark stale
mark error
store vector + metadata
compare previous and next fingerprint 6. syncEmbeddingForEntity.ts

Main orchestration service.

Suggested shape:

export async function syncEmbeddingForEntity(args: {
entity: EmbeddingSourceEntity;
entityId: string;
mode: "AUTO" | "SKIP" | "FORCE";
}): Promise<void>;

Behavior:

get registry entry
fetch DB row using registry select
build snapshot
read previous embedding state
compare previous hash/version
decide whether embedding provider call is needed
if yes, call embedTextBedrock
persist updated embedding state
handle and persist errors cleanly
Registry implementation guidance
General rule

Every searchable entity must have:

minimal but meaningful select
normalized buildSource
deterministic buildText
Example: Product

The current source schema already includes:

name
description
recommendedUse
compounds
lab tests

That implies a registry entry similar to:

product: {
entity: "product",
version: 1,
sourceSchema: ProductEmbeddingSourceSchema,
select: {
name: true,
description: true,
recommendedUse: true,
containsCompounds: {
select: {
name: true,
slug: true,
},
},
labTests: {
select: {
name: true,
slug: true,
},
},
},
buildSource: (row) => ({
name: row.name,
description: row.description ?? null,
recommendedUse: row.recommendedUse ?? null,
compounds: row.containsCompounds?.map((c: any) => ({
name: c.name,
slug: c.slug ?? undefined,
})) ?? [],
labTests: row.labTests?.map((lt: any) => ({
name: lt.name,
slug: lt.slug ?? undefined,
})) ?? [],
}),
buildText: (source) => {
const parts = [
"entity: product",
`name: ${source.name}`,
];

    if (source.description) parts.push(`description: ${source.description}`);
    if (source.recommendedUse) parts.push(`recommended use: ${source.recommendedUse}`);
    if (source.compounds?.length) {
      parts.push(`compounds: ${source.compounds.map((c) => c.name).join(", ")}`);
    }
    if (source.labTests?.length) {
      parts.push(`lab tests: ${source.labTests.map((lt) => lt.name).join(", ")}`);
    }

    return parts.join("\n");

},
}
Example: LabTest

The current source schema includes:

name
description
biomarkers

The corresponding select must fetch biomarker names/slugs through the relation.

The current GraphQL update contract now supports nested relation handling for testsBiomarkers, which means relation changes to that field should trigger a parent embedding re-evaluation.

Example: Biomarker

The current source schema includes:

name
category
unit
age/range values

However, the domain model also includes:

description
aliases
relatedSystems

The implementing model should review whether the embedding source should be expanded before locking version: 1, because those omitted fields may materially improve retrieval quality.

Example: Compound

The current source schema includes:

name
canonicalName
description

The domain model also has:

aliases
mechanisms

The implementing model should make a deliberate choice about whether to include them in v1 and version accordingly.

Mutation integration requirements
All searchable create/update services must route through shared helpers

The implementation must avoid duplicating embedding logic in individual resolvers.

Pattern:

resolver validates GraphQL input
resolver calls entity service
entity service performs create/update
entity service invokes syncEmbeddingForEntity(...) as needed
Nested create / connectOrCreate behavior

Because nested create and connectOrCreate.create reuse model create inputs, they should inherit the same creation-time embedding contract when they actually create new records.

Rules:

nested create -> apply embedding mode
connectOrCreate resulting in create -> apply embedding mode
connectOrCreate resulting in connect -> do not run create-time embedding path for the child

The embedding mode chosen for the parent write operation should generally be propagated downward unless explicitly overridden internally.

Recommended default propagation:

parent AUTO -> child AUTO
parent SKIP -> child SKIP
parent FORCE -> child FORCE
Change detection requirements
Use content hashes

After every searchable create/update:

fetch fresh row using registry select
build normalized source
build embedding text
compute versioned content hash
compare with prior stored state
Hash input must include at least
entity
version
text
Regeneration decision logic

Implement helper logic equivalent to:

if (mode === "FORCE") regenerate = true;
else if (mode === "SKIP") regenerate = false;
else regenerate = previousVersion !== nextVersion || previousHash !== nextHash;
Relation-driven invalidation

When relation membership changes for embeddings that include related data, parent embeddings must be re-evaluated.

Examples from the current source definitions:

product embedding depends on compounds and lab tests
lab test embedding depends on biomarkers
case study embedding depends on sponsor organizations

Examples from the current GraphQL contract that can cause such changes:

ProductUpdateInput.containsCompounds
LabTestUpdateInput.testsBiomarkers
CaseStudyUpdateInput.businessSponsors
CaseStudyUpdateInput.referencedByOrganizations

The model must ensure the parent embedding sync happens after those relation updates are applied.

Required implementation order
Phase 1

Create the official embedding provider module from the supplied Bedrock code.

Deliverables:

reusable module
no test-runner-only shape
Cohere default
Titan fallback
exported clean API
Phase 2

Create the embedding sidecar Prisma model and migration.

Phase 3

Create official registry types and registry file.

Start with these entities first:

product
labTest
biomarker

These are highest leverage because their relation surfaces are already important in the domain and current embedding source work exists for them.

Phase 4

Create snapshot, hash, and state helper modules.

Phase 5

Integrate into create/update service flows for the initial searchable models.

Phase 6

Propagate embedding mode through nested create and connectOrCreate create branches.

Phase 7

Expand registry coverage to the remaining searchable models.

Acceptance criteria

The implementation is complete when all of the following are true:

There is an official Bedrock embedding initialization/helper module using Cohere by default.
There is a Prisma sidecar table for embedding state.
There is an official embedding registry with:
version
sourceSchema
select
buildSource
buildText
There is a hash helper using versioned content hashing.
There is a snapshot builder that validates source and builds text deterministically.
There is a sync orchestration service for one entity at a time.
Searchable create/update mutations accept embedding write options.
Nested creates and connectOrCreate.create routes can invoke the same embedding path.
Parent embeddings re-evaluate when embedding-relevant relations change.
The implementation starts with product, labTest, and biomarker, but is structured for extension to all searchable entities.
Non-goals for this pass

Do not implement these now unless required incidentally:

Full global search GraphQL API
Cross-model search filters
Bulk rebuild UI surface
DB-trigger-based invalidation as the primary mechanism
Client-controlled embedding field lists
Multiple provider routing strategies beyond Cohere-first and Titan fallback
Final guidance to the implementing model

Build this as a long-term foundation, not as a one-off mutation hook.

Even though embeddings are currently being controlled at mutation time for cost reasons, the implementation must be shaped so the exact same registry, hash logic, text building, and provider helper can later be reused by:

bulk rebuilds
stale refresh jobs
background queues
search indexing pipelines

That means the mutation layer should be only an invocation path, not the owner of the embedding logic.

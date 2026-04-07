Human Upgrade GraphQL Mutation Specification
Nested Writes, ConnectOrCreate, Smart Patching, and Array Operations

1. Design goals

The mutation layer should support:

Create with deep nesting
Create an episode with guests, sponsors, claims, and media in one request.
Update with smart patching
Only mutate fields explicitly provided.
Preserve omitted fields.
Allow explicit clearing of nullable fields.
Nested connect or create
For related entities like Person, Organization, Compound, and Biomarker.
Controlled relation patching
Add, remove, replace, or upsert related records.
Scalar array patching
For string arrays like tags, aliases, keyTakeaways, categories, platformUrls, etc.
Predictable semantics
No ambiguous update behavior.
Every mutation operation should map deterministically to Prisma. 2. Field mutation semantics

For all update inputs, use these semantics:

Omitted field

Do nothing.

Provided scalar value

Set to that value.

Provided null

Clear the field, if nullable.

Example:

input EpisodeUpdateInput {
title: String
summary: NullableStringPatchInput
}

Where:

input NullableStringPatchInput {
set: String
clear: Boolean
}

But in practice, to reduce noise, I recommend:

plain scalar for non-nullables
explicit patch objects only where clearing matters or operation complexity exists

So the better rule is:

title: String → set title
summary: StringNullableOperationInput → supports set or clear 3. Mutation shape strategy

Use three categories of input objects:

A. Scalar patch inputs

For nullable scalars and scalar arrays.

B. Relation patch inputs

For to-one and to-many relations.

C. Nested entity create/update inputs

For records that may be created inline.

This gives you a consistent API.

4. Core operation primitives
   4.1 Nullable scalar patch
   input StringNullableOperationInput {
   set: String
   clear: Boolean
   }

input IntNullableOperationInput {
set: Int
clear: Boolean
}

input DateTimeNullableOperationInput {
set: DateTime
clear: Boolean
}

input DecimalNullableOperationInput {
set: Decimal
clear: Boolean
}
Rules
exactly one of set or clear must be provided
clear: true maps to field: null
4.2 Scalar list patch

For fields like:

tags: String[]
aliases: String[]
categories: String[]
keyTakeaways: String[]

Use:

input StringListOperationInput {
set: [String!]
add: [String!]
remove: [String!]
}
Rules
set replaces the whole array
add appends unique values in application logic
remove removes matching values
set cannot be combined with add or remove
Why this matters

Prisma scalar lists support set, but not true set-like dedupe semantics at the ORM level. So:

set → Prisma set
add / remove → read current value, transform in resolver/service, then issue Prisma set

This is what you referred to as add-to-set or set logic.

Recommended semantics

Treat all string array fields as deduped, normalized sets with stable ordering.

Normalization example:

trim whitespace
remove empties
lowercase optionally for internal comparison
preserve original case if needed for display 5. Relation operation strategy

For relations, do not expose raw Prisma shapes directly. Instead, expose higher-level patch inputs.

5.1 To-one relation patch

For something like Claim.speaker or Product.organization:

input ToOneRelationOperationInput {
connect: EntityWhereUniqueInput
connectOrCreate: EntityConnectOrCreateInput
disconnect: Boolean
}
Rules
exactly one of connect, connectOrCreate, or disconnect: true
omitted means no change
disconnect: true maps to Prisma disconnect: true

For each domain entity, define specialized variants:

input PersonToOneRelationInput {
connect: PersonWhereUniqueInput
connectOrCreate: PersonConnectOrCreateInput
disconnect: Boolean
}
5.2 To-many relation patch

For Episode.guests, Episode.sponsorOrganizations, Product.containsCompounds, etc.

input PersonRelationManyOperationInput {
set: [PersonWhereUniqueInput!]
connect: [PersonWhereUniqueInput!]
connectOrCreate: [PersonConnectOrCreateInput!]
disconnect: [PersonWhereUniqueInput!]
}
Rules
set means replace entire relation membership
connect adds existing records
connectOrCreate adds records using unique selectors
disconnect removes links only
set should not be combined with connect, connectOrCreate, or disconnect

This pattern is extremely important. It gives the frontend exact control.

6. Unique identity strategy for connectOrCreate

connectOrCreate is only as good as your unique selectors.

You already have slug on top-level entities, which is good. I would expand the selector strategy like this:

Strong preferred unique selectors
Person
id
slug
maybe later externalSource + externalId
Organization
id
slug
maybe websiteUrl if reliably unique
maybe later externalSource + externalId
Product
id
slug
composite: organizationId + name
Compound
id
slug
maybe canonicalName
Biomarker
id
slug
maybe name only if carefully curated
Episode
id
slug
composite: podcastId + episodeNumber
ConnectOrCreate input shape

Example:

input PersonWhereUniqueInput {
id: ID
slug: String
}

input PersonCreateNestedInput {
slug: String!
fullName: String!
firstName: String
lastName: String
bio: String
media: MediaNestedManyCreateInput
}

input PersonConnectOrCreateInput {
where: PersonWhereUniqueInput!
create: PersonCreateNestedInput!
}
Best practice

Require where to reference a truly stable unique field, usually slug.

7. Create vs update mutation philosophy
   Create mutations

Allow rich nested create/connect/connectOrCreate.

Update mutations

Allow patch-style updates with:

partial scalar changes
relation patch operations
nested child upserts where useful
explicit clearing/disconnecting/removal 8. Smart patching specification

“Smart patching” should mean:

Scalars
only provided fields mutate
Nullable scalars
explicit clear operation supported
Scalar arrays
set, add, remove
To-many relations
set, connect, connectOrCreate, disconnect
Nested child records with identity
support create, update, upsert, delete

This last one is especially useful for entities like Claim and Media.

9. Recommended nested child mutation model

For child records owned by a parent, like:

Episode.claims
Episode.media
Product.media
Organization.media

Use a richer nested patch input.

Example: child collection patch
input ClaimNestedManyMutationInput {
create: [ClaimCreateWithoutEpisodeInput!]
update: [ClaimUpdateWithWhereUniqueInput!]
upsert: [ClaimUpsertWithWhereUniqueInput!]
delete: [ClaimWhereUniqueInput!]
}
Why this is better

For owned child records, connect is usually less important than:

create new
update existing
upsert existing-or-new
delete removed ones

Prisma maps well to this.

Example subtypes
input ClaimWhereUniqueInput {
id: ID
}

input ClaimUpdateWithWhereUniqueInput {
where: ClaimWhereUniqueInput!
data: ClaimUpdateInput!
}

input ClaimUpsertWithWhereUniqueInput {
where: ClaimWhereUniqueInput!
create: ClaimCreateWithoutEpisodeInput!
update: ClaimUpdateInput!
} 10. Entity-by-entity mutation strategy
10.1 Podcast
Create
scalar fields
nested episodes.create
nested media.create
Update
scalar patch
nested episodes should usually be managed through dedicated episode mutations unless you really want deep ownership editing
media can be patched inline
Suggested mutations
createPodcast(data: PodcastCreateInput!): Podcast!
updatePodcast(where: PodcastWhereUniqueInput!, data: PodcastUpdateInput!): Podcast!
deletePodcast(where: PodcastWhereUniqueInput!): Podcast!
10.2 Episode

This will be one of your most important write surfaces.

Create should support
connect podcast
connectOrCreate guests
connectOrCreate sponsor organizations
create claims
create media
Update should support
scalar patch
sponsor relation patch
guest relation patch
claim nested create/update/upsert/delete
media nested create/update/upsert/delete
Suggested shape
input EpisodeCreateInput {
slug: String!
podcast: PodcastToOneRequiredInput!
title: String!
episodeNumber: Int
seasonNumber: Int
summary: String
description: String
transcript: String
transcriptSourceUrl: String
audioUrl: String
videoUrl: String
publishedAt: DateTime
durationSeconds: Int
isPublished: Boolean

tags: [String!]
keyTakeaways: [String!]

guests: PersonRelationManyCreateInput
sponsorOrganizations: OrganizationRelationManyCreateInput
claims: ClaimNestedManyCreateInput
media: MediaNestedManyCreateInput
}
input EpisodeUpdateInput {
title: String
episodeNumber: Int
seasonNumber: Int
summary: StringNullableOperationInput
description: StringNullableOperationInput
transcript: StringNullableOperationInput
transcriptSourceUrl: StringNullableOperationInput
audioUrl: StringNullableOperationInput
videoUrl: StringNullableOperationInput
publishedAt: DateTimeNullableOperationInput
durationSeconds: IntNullableOperationInput
isPublished: Boolean

tags: StringListOperationInput
keyTakeaways: StringListOperationInput

guests: PersonRelationManyOperationInput
sponsorOrganizations: OrganizationRelationManyOperationInput
claims: ClaimNestedManyMutationInput
media: MediaNestedManyMutationInput
}
10.3 Claim

Claims are child-rich but still deserve standalone mutations.

Create
connect episode
optional speaker connect/connectOrCreate
nested media
Update
patch scalar fields
patch speaker
patch media
10.4 Organization
Create
scalar fields
owners connect/connectOrCreate
executives connect/connectOrCreate
products create/connectOrCreate
referencedCaseStudies connect/connectOrCreate
media create
Update
scalar patch
array patch for tags, aliases, categories
owners/executives relation patch
products nested mutation or dedicated product mutation
referenced case studies relation patch
media nested mutation
10.5 Product
Create
optional organization connect/connectOrCreate
compounds connect/connectOrCreate
lab tests create
media create
Update
scalar patch
string list patch
compounds relation patch
lab tests nested mutation
media nested mutation
10.6 LabTest
Create
optional product connect
optional organization connect
biomarkers connect/connectOrCreate
media create
Update
scalar patch
biomarkers relation patch
media nested mutation
10.7 CaseStudy
Create
sponsors connect/connectOrCreate
referencedByOrganizations relation patch if needed
media create
Update
scalar patch
sponsor relation patch
referencedByOrganizations relation patch
media nested mutation 11. String array fields you should add to schema

You correctly noted the original schema omitted scalar string arrays. Prisma Postgres supports these fine.

I would add fields like these where relevant:

Podcast
tags String[] @default([])
Episode
tags String[] @default([])
keyTakeaways String[] @default([])
topics String[] @default([])
Claim
tags String[] @default([])
evidenceUrls String[] @default([])
Person
aliases String[] @default([])
expertiseAreas String[] @default([])
Organization
tags String[] @default([])
aliases String[] @default([])
domains String[] @default([])
Product
tags String[] @default([])
categories String[] @default([])
benefits String[] @default([])
Compound
aliases String[] @default([])
mechanisms String[] @default([])
LabTest
tags String[] @default([])
Biomarker
aliases String[] @default([])
relatedSystems String[] @default([])
CaseStudy
tags String[] @default([])
keywords String[] @default([])

That gives you good flexibility without prematurely normalizing everything into separate tables.

12. Recommended GraphQL mutation API surface

I recommend keeping it explicit and domain-oriented.

Top-level CRUD
createPodcast
updatePodcast
deletePodcast

createEpisode
updateEpisode
deleteEpisode

createClaim
updateClaim
deleteClaim

createPerson
updatePerson
deletePerson

createOrganization
updateOrganization
deleteOrganization

createProduct
updateProduct
deleteProduct

createCompound
updateCompound
deleteCompound

createLabTest
updateLabTest
deleteLabTest

createBiomarker
updateBiomarker
deleteBiomarker

createCaseStudy
updateCaseStudy
deleteCaseStudy
Optional specialized mutations

These can be very useful for UX simplicity.

addGuestsToEpisode
removeGuestsFromEpisode
setEpisodeGuests

addSponsorsToEpisode
removeSponsorsFromEpisode
setEpisodeSponsors

addCompoundsToProduct
removeCompoundsFromProduct
setProductCompounds

You may not need these initially, but they can simplify client logic later.

13. Zod-first specification strategy

Zod should be the canonical input contract, not Prisma types.

Why

Prisma types are too low-level for your public mutation API. Zod gives you:

validation
normalization
discriminated operation parsing
inferred TS types
custom invariants
Example Zod scalar list operation
const StringListOperationSchema = z.object({
set: z.array(z.string().min(1)).optional(),
add: z.array(z.string().min(1)).optional(),
remove: z.array(z.string().min(1)).optional(),
}).superRefine((val, ctx) => {
const provided = ["set", "add", "remove"].filter((k) => val[k as keyof typeof val] !== undefined);
if (provided.length === 0) {
ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one list operation is required" });
}
if (val.set !== undefined && (val.add !== undefined || val.remove !== undefined)) {
ctx.addIssue({ code: z.ZodIssueCode.custom, message: "set cannot be combined with add/remove" });
}
});
Example Zod connectOrCreate
const PersonWhereUniqueSchema = z.object({
id: z.string().cuid().optional(),
slug: z.string().min(1).optional(),
}).superRefine((val, ctx) => {
if (!val.id && !val.slug) {
ctx.addIssue({ code: z.ZodIssueCode.custom, message: "One unique selector is required" });
}
});

const PersonCreateNestedSchema = z.object({
slug: z.string().min(1),
fullName: z.string().min(1),
firstName: z.string().optional(),
lastName: z.string().optional(),
bio: z.string().optional(),
});

const PersonConnectOrCreateSchema = z.object({
where: PersonWhereUniqueSchema,
create: PersonCreateNestedSchema,
}); 14. Prisma translation strategy

This is the most important implementation detail.

Do not pass GraphQL inputs directly to Prisma.

Instead:

validate with Zod
normalize values
translate patch inputs into Prisma nested write objects
Example translation rules
Scalar array patch

Input:

{
"tags": {
"add": ["longevity", "sleep"]
}
}

Resolver flow:

read current tags
normalize current + incoming
dedupe
Prisma update with:
{
tags: {
set: ["existing", "longevity", "sleep"]
}
}
Relation patch with connectOrCreate

Input:

{
"guests": {
"connectOrCreate": [
{
"where": { "slug": "andrew-huberman" },
"create": {
"slug": "andrew-huberman",
"fullName": "Andrew Huberman"
}
}
]
}
}

Maps to:

{
guests: {
connectOrCreate: [
{
where: { slug: "andrew-huberman" },
create: {
slug: "andrew-huberman",
fullName: "Andrew Huberman"
}
}
]
}
}
Nested child upsert

Input:

{
"claims": {
"upsert": [
{
"where": { "id": "clm_123" },
"update": { "text": "Updated claim text" },
"create": {
"text": "Updated claim text",
"claimType": "FACTUAL"
}
}
]
}
}

Maps to Prisma nested upsert.

15. Recommended smart patch rules by category
    Safe to patch inline
    scalar fields
    nullable scalar fields
    scalar string arrays
    to-one relations
    to-many membership relations
    owned child collections with identity
    Better handled with dedicated mutations later
    large transcript rewrites
    bulk ingestion
    cross-entity merge/deduplication
    destructive graph rewiring across many entities
16. Recommended resolver architecture

Use a service-layer pipeline like this:

A. GraphQL resolver
receives args
delegates to service
B. Zod validation/normalization
parse and enforce spec
normalize slugs, arrays, URLs, strings
C. Patch compiler
converts app-level input to Prisma input
D. Prisma transaction service
executes write
uses transaction for multi-step scalar list patching or read-modify-write logic
E. Return fully hydrated entity
include relations needed by frontend 17. Suggested transaction rules

Use a transaction when:

any scalar list uses add or remove
nested patch needs read-before-write
multiple related updates must be atomic
connectOrCreate occurs alongside child upserts and deletes

That will keep patching behavior stable.

18. Opinionated best practices
    Prefer connectOrCreate for:
    Person
    Organization
    Compound
    Biomarker
    Prefer dedicated child upserts for:
    Claim
    Media
    LabTest
    Prefer set only for:
    full replacement UX flows
    admin/editor screens with complete form ownership
    Prefer connect/disconnect for:
    incremental relation editing
    Prefer scalar list add/remove over full set for:
    tag-like fields
    aliases
    categories
    keywords
19. Concrete example spec: Episode update

Here is the sort of input contract I would treat as the reference shape.

input UpdateEpisodeInput {
where: EpisodeWhereUniqueInput!
data: EpisodeUpdateInput!
}

input EpisodeUpdateInput {
title: String
summary: StringNullableOperationInput
description: StringNullableOperationInput
transcript: StringNullableOperationInput
transcriptSourceUrl: StringNullableOperationInput
audioUrl: StringNullableOperationInput
videoUrl: StringNullableOperationInput
publishedAt: DateTimeNullableOperationInput
durationSeconds: IntNullableOperationInput
isPublished: Boolean

tags: StringListOperationInput
keyTakeaways: StringListOperationInput
topics: StringListOperationInput

guests: PersonRelationManyOperationInput
sponsorOrganizations: OrganizationRelationManyOperationInput
claims: ClaimNestedManyMutationInput
media: MediaNestedManyMutationInput
}
Semantic interpretation
omitted fields untouched
nullable patch objects can set or clear
tag arrays can replace/add/remove
guests/sponsors can replace or incrementally patch
claims/media can be created, updated, upserted, or deleted

That is the core pattern I would repeat across the rest of the graph.

20. Final recommended specification summary
    Use this mutation philosophy
    Create
    support deep nested create
    support nested connect
    support nested connectOrCreate
    Update
    patch semantics only
    omitted fields unchanged
    explicit clear for nullable scalars
    set/add/remove for scalar string arrays
    set/connect/connectOrCreate/disconnect for to-many relations
    connect/connectOrCreate/disconnect for to-one relations
    create/update/upsert/delete for owned child collections
    Validation
    Zod is canonical
    Prisma is an execution target, not the public contract
    Array strategy
    use Prisma String[]
    implement add-to-set behavior in application logic
    normalize and dedupe consistently
    Identity strategy
    every connectable entity needs stable unique selectors
    prefer slug, id, and later externalSource + externalId

The next best step is to turn this into a concrete GraphQL SDL + corresponding TypeScript/Zod input schemas for your initial entities, starting with Episode, Organization, Product, Claim, and Media.

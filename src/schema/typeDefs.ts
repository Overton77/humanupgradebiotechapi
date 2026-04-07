export const typeDefs = `#graphql
  scalar DateTime
  scalar Decimal
  scalar JSON

  # ─── Enums ──────────────────────────────────────────────────────────────────

  enum MediaType {
    IMAGE
    VIDEO
    AUDIO
    DOCUMENT
    LINK
    OTHER
  }

  enum ClaimType {
    FACTUAL
    CAUSAL
    MECHANISTIC
    STATISTICAL
    ANECDOTAL
    RECOMMENDATION
    SAFETY_RISK
    OTHER
  }

  enum ClaimStance {
    SUPPORTS
    OPPOSES
    ASSERTED
    NEUTRAL
    MIXED
    UNKNOWN
  }

  enum ClaimConfidence {
    LOW
    MEDIUM
    HIGH
    VERY_HIGH
    UNKNOWN
  }

  enum OrganizationType {
    BRAND
    MANUFACTURER
    RETAILER
    LAB
    CLINIC
    RESEARCH_INSTITUTION
    NONPROFIT
    MEDIA
    SPONSOR
    HOLDING_COMPANY
    OTHER
  }

  enum TranscriptStatus {
    MISSING
    QUEUED
    STORED
    ERROR
  }

  enum PipelineStatus {
    NOT_STARTED
    RUNNING
    COMPLETE
    ERROR
  }

  enum PublishStatus {
    HIDDEN
    READY
  }

  # ─── Object Types ──────────────────────────────────────────────────────────

  type Podcast {
    id: ID!
    slug: String!
    title: String!
    subtitle: String
    description: String
    rssUrl: String
    websiteUrl: String
    hostName: String
    language: String
    isPublished: Boolean!
    tags: [String!]!
    episodes: [Episode!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Episode {
    id: ID!
    slug: String!
    podcastId: String!
    podcast: Podcast!
    title: String!
    episodeNumber: Int
    seasonNumber: Int
    channelName: String
    summary: String
    description: String
    transcript: String
    transcriptSourceUrl: String
    audioUrl: String
    videoUrl: String
    publishedAt: DateTime
    durationSeconds: Int
    isPublished: Boolean!

    webPageSummary: String
    summaryShort: String
    summaryDetailed: String
    publishedSummary: String

    episodePageUrl: String
    episodeTranscriptUrl: String

    youtubeVideoId: String
    youtubeEmbedUrl: String
    youtubeWatchUrl: String

    s3TranscriptKey: String
    s3TranscriptUrl: String
    transcriptStatus: TranscriptStatus!
    transcriptSha256: String
    transcriptLastAttemptAt: DateTime
    transcriptErrorMessage: String
    transcriptErrorAt: DateTime
    transcriptStorageProvider: String
    transcriptStorageBucket: String
    transcriptStorageKey: String

    topicPrimary: String
    topicSecondary: [String!]!
    topicConcepts: [String!]!

    enrichmentStage1Status: PipelineStatus!
    enrichmentStage1CompletedAt: DateTime
    enrichmentStage1RunId: String
    enrichmentStage2Status: PipelineStatus!
    enrichmentStage2CompletedAt: DateTime
    enrichmentStage2RunId: String

    publishStatus: PublishStatus!
    webPageTimelines: JSON

    tags: [String!]!
    keyTakeaways: [String!]!
    topics: [String!]!

    sponsorOrganizations: [Organization!]!
    guests: [Person!]!
    claims: [Claim!]!
    media: [Media!]!

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Claim {
    id: ID!
    episodeId: String!
    episode: Episode!
    speakerId: String
    speaker: Person
    text: String!
    evidenceExcerpt: String
    claimType: ClaimType!
    stance: ClaimStance!
    claimConfidence: ClaimConfidence!
    startTimeSeconds: Int
    endTimeSeconds: Int
    sourceUrl: String
    tags: [String!]!
    evidenceUrls: [String!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Person {
    id: ID!
    slug: String!
    fullName: String!
    firstName: String
    lastName: String
    title: String
    bio: String
    websiteUrl: String
    linkedinUrl: String
    xUrl: String
    aliases: [String!]!
    expertiseAreas: [String!]!
    guestEpisodes: [Episode!]!
    spokenClaims: [Claim!]!
    ownedOrganizations: [Organization!]!
    executiveOrganizations: [Organization!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Organization {
    id: ID!
    slug: String!
    name: String!
    legalName: String
    description: String
    websiteUrl: String
    headquarters: String
    foundedYear: Int
    annualRevenue: Float
    stockTicker: String
    employeeCount: Int
    organizationType: OrganizationType!
    tags: [String!]!
    aliases: [String!]!
    domains: [String!]!
    products: [Product!]!
    owners: [Person!]!
    executives: [Person!]!
    labTests: [LabTest!]!
    sponsoredEpisodes: [Episode!]!
    referencedCaseStudies: [CaseStudy!]!
    businessSponsoredCases: [CaseStudy!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    slug: String!
    organizationId: String
    organization: Organization
    isLabTestPanelDefinition: Boolean
    name: String!
    recommendedUse: String
    description: String
    category: String
    sku: String
    productUrl: String
    price: Decimal
    currency: String
    isActive: Boolean!
    tags: [String!]!
    categories: [String!]!
    benefits: [String!]!
    containsCompounds: [Compound!]!
    labTests: [LabTest!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Compound {
    id: ID!
    slug: String!
    name: String!
    description: String
    canonicalName: String
    externalRef: String
    aliases: [String!]!
    mechanisms: [String!]!
    products: [Product!]!
    biomarkers: [Biomarker!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type LabTest {
    id: ID!
    slug: String!
    productId: String
    product: Product
    organizationId: String
    organization: Organization
    name: String!
    description: String
    labName: String
    reportUrl: String
    testedAt: DateTime
    sampleType: String
    tags: [String!]!
    testsBiomarkers: [Biomarker!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Biomarker {
    id: ID!
    slug: String!
    name: String!
    description: String
    unit: String
    category: String
    referenceRange: String
    referenceAgeMin: Int
    referenceAgeMax: Int
    referenceRangeLow: Float
    referenceRangeMax: Float
    aliases: [String!]!
    relatedSystems: [String!]!
    labTests: [LabTest!]!
    compounds: [Compound!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CaseStudy {
    id: ID!
    slug: String!
    title: String!
    description: String
    studyType: String
    publicationDate: DateTime
    sourceUrl: String
    doi: String
    journal: String
    outcomeSummary: String
    fullTextSummary: String
    tags: [String!]!
    keywords: [String!]!
    businessSponsors: [Organization!]!
    referencedByOrganizations: [Organization!]!
    media: [Media!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Media {
    id: ID!
    url: String!
    type: MediaType!
    mimeType: String
    title: String
    altText: String
    caption: String
    width: Int
    height: Int
    durationSeconds: Int
    fileSizeBytes: Int
    sortOrder: Int!
    podcastId: String
    episodeId: String
    claimId: String
    personId: String
    organizationId: String
    productId: String
    compoundId: String
    labTestId: String
    biomarkerId: String
    caseStudyId: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ─── Shared Input Types ────────────────────────────────────────────────────

  input WhereUniqueInput {
    id: ID
    slug: String
  }

  input StringNullableOperationInput {
    set: String
    clear: Boolean
  }

  input IntNullableOperationInput {
    set: Int
    clear: Boolean
  }

  input FloatNullableOperationInput {
    set: Float
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

  input StringListOperationInput {
    set: [String!]
    add: [String!]
    remove: [String!]
  }

  input ToManyRelationOperationInput {
    set: [WhereUniqueInput!]
    connect: [WhereUniqueInput!]
    disconnect: [WhereUniqueInput!]
  }

  input ToOneRelationOperationInput {
    connect: WhereUniqueInput
    disconnect: Boolean
  }

  # ─── Create Inputs ─────────────────────────────────────────────────────────

  input PodcastCreateInput {
    slug: String!
    title: String!
    subtitle: String
    description: String
    rssUrl: String
    websiteUrl: String
    hostName: String
    language: String
    isPublished: Boolean
    tags: [String!]
  }

  input EpisodeCreateInput {
    slug: String!
    podcastId: String!
    title: String!
    episodeNumber: Int
    seasonNumber: Int
    channelName: String
    summary: String
    description: String
    transcript: String
    transcriptSourceUrl: String
    audioUrl: String
    videoUrl: String
    publishedAt: DateTime
    durationSeconds: Int
    isPublished: Boolean
    webPageSummary: String
    summaryShort: String
    summaryDetailed: String
    publishedSummary: String
    episodePageUrl: String
    episodeTranscriptUrl: String
    youtubeVideoId: String
    youtubeEmbedUrl: String
    youtubeWatchUrl: String
    s3TranscriptKey: String
    s3TranscriptUrl: String
    transcriptStatus: TranscriptStatus
    transcriptSha256: String
    topicPrimary: String
    topicSecondary: [String!]
    topicConcepts: [String!]
    enrichmentStage1Status: PipelineStatus
    enrichmentStage2Status: PipelineStatus
    publishStatus: PublishStatus
    tags: [String!]
    keyTakeaways: [String!]
    topics: [String!]
    webPageTimelines: JSON
  }

  input ClaimCreateInput {
    episodeId: String!
    speakerId: String
    text: String!
    evidenceExcerpt: String
    claimType: ClaimType
    stance: ClaimStance
    claimConfidence: ClaimConfidence
    startTimeSeconds: Int
    endTimeSeconds: Int
    sourceUrl: String
    tags: [String!]
    evidenceUrls: [String!]
  }

  input PersonCreateInput {
    slug: String!
    fullName: String!
    firstName: String
    lastName: String
    title: String
    bio: String
    websiteUrl: String
    linkedinUrl: String
    xUrl: String
    aliases: [String!]
    expertiseAreas: [String!]
  }

  input OrganizationCreateInput {
    slug: String!
    name: String!
    legalName: String
    description: String
    websiteUrl: String
    headquarters: String
    foundedYear: Int
    annualRevenue: Float
    stockTicker: String
    employeeCount: Int
    organizationType: OrganizationType
    tags: [String!]
    aliases: [String!]
    domains: [String!]
  }

  input ProductCreateInput {
    slug: String!
    organizationId: String
    isLabTestPanelDefinition: Boolean
    name: String!
    recommendedUse: String
    description: String
    category: String
    sku: String
    productUrl: String
    price: Decimal
    currency: String
    isActive: Boolean
    tags: [String!]
    categories: [String!]
    benefits: [String!]
  }

  input CompoundCreateInput {
    slug: String!
    name: String!
    description: String
    canonicalName: String
    externalRef: String
    aliases: [String!]
    mechanisms: [String!]
  }

  input LabTestCreateInput {
    slug: String!
    productId: String
    organizationId: String
    name: String!
    description: String
    labName: String
    reportUrl: String
    testedAt: DateTime
    sampleType: String
    tags: [String!]
  }

  input BiomarkerCreateInput {
    slug: String!
    name: String!
    description: String
    unit: String
    category: String
    referenceRange: String
    referenceAgeMin: Int
    referenceAgeMax: Int
    referenceRangeLow: Float
    referenceRangeMax: Float
    aliases: [String!]
    relatedSystems: [String!]
  }

  input CaseStudyCreateInput {
    slug: String!
    title: String!
    description: String
    studyType: String
    publicationDate: DateTime
    sourceUrl: String
    doi: String
    journal: String
    outcomeSummary: String
    fullTextSummary: String
    tags: [String!]
    keywords: [String!]
  }

  input MediaCreateInput {
    url: String!
    type: MediaType!
    mimeType: String
    title: String
    altText: String
    caption: String
    width: Int
    height: Int
    durationSeconds: Int
    fileSizeBytes: Int
    sortOrder: Int
    podcastId: String
    episodeId: String
    claimId: String
    personId: String
    organizationId: String
    productId: String
    compoundId: String
    labTestId: String
    biomarkerId: String
    caseStudyId: String
  }

  # ─── Update Inputs ─────────────────────────────────────────────────────────

  input PodcastUpdateInput {
    title: String
    subtitle: StringNullableOperationInput
    description: StringNullableOperationInput
    rssUrl: StringNullableOperationInput
    websiteUrl: StringNullableOperationInput
    hostName: StringNullableOperationInput
    language: StringNullableOperationInput
    isPublished: Boolean
    tags: StringListOperationInput
  }

  input EpisodeUpdateInput {
    title: String
    episodeNumber: IntNullableOperationInput
    seasonNumber: IntNullableOperationInput
    channelName: StringNullableOperationInput
    summary: StringNullableOperationInput
    description: StringNullableOperationInput
    transcript: StringNullableOperationInput
    transcriptSourceUrl: StringNullableOperationInput
    audioUrl: StringNullableOperationInput
    videoUrl: StringNullableOperationInput
    publishedAt: DateTimeNullableOperationInput
    durationSeconds: IntNullableOperationInput
    isPublished: Boolean
    webPageSummary: StringNullableOperationInput
    summaryShort: StringNullableOperationInput
    summaryDetailed: StringNullableOperationInput
    publishedSummary: StringNullableOperationInput
    episodePageUrl: StringNullableOperationInput
    episodeTranscriptUrl: StringNullableOperationInput
    youtubeVideoId: StringNullableOperationInput
    youtubeEmbedUrl: StringNullableOperationInput
    youtubeWatchUrl: StringNullableOperationInput
    s3TranscriptKey: StringNullableOperationInput
    s3TranscriptUrl: StringNullableOperationInput
    transcriptStatus: TranscriptStatus
    transcriptSha256: StringNullableOperationInput
    topicPrimary: StringNullableOperationInput
    topicSecondary: StringListOperationInput
    topicConcepts: StringListOperationInput
    enrichmentStage1Status: PipelineStatus
    enrichmentStage2Status: PipelineStatus
    publishStatus: PublishStatus
    tags: StringListOperationInput
    keyTakeaways: StringListOperationInput
    topics: StringListOperationInput
    webPageTimelines: JSON
    guests: ToManyRelationOperationInput
    sponsorOrganizations: ToManyRelationOperationInput
  }

  input ClaimUpdateInput {
    text: String
    evidenceExcerpt: StringNullableOperationInput
    claimType: ClaimType
    stance: ClaimStance
    claimConfidence: ClaimConfidence
    startTimeSeconds: IntNullableOperationInput
    endTimeSeconds: IntNullableOperationInput
    sourceUrl: StringNullableOperationInput
    tags: StringListOperationInput
    evidenceUrls: StringListOperationInput
    speaker: ToOneRelationOperationInput
  }

  input PersonUpdateInput {
    fullName: String
    firstName: StringNullableOperationInput
    lastName: StringNullableOperationInput
    title: StringNullableOperationInput
    bio: StringNullableOperationInput
    websiteUrl: StringNullableOperationInput
    linkedinUrl: StringNullableOperationInput
    xUrl: StringNullableOperationInput
    aliases: StringListOperationInput
    expertiseAreas: StringListOperationInput
  }

  input OrganizationUpdateInput {
    name: String
    legalName: StringNullableOperationInput
    description: StringNullableOperationInput
    websiteUrl: StringNullableOperationInput
    headquarters: StringNullableOperationInput
    foundedYear: IntNullableOperationInput
    annualRevenue: FloatNullableOperationInput
    stockTicker: StringNullableOperationInput
    employeeCount: IntNullableOperationInput
    organizationType: OrganizationType
    tags: StringListOperationInput
    aliases: StringListOperationInput
    domains: StringListOperationInput
    owners: ToManyRelationOperationInput
    executives: ToManyRelationOperationInput
  }

  input ProductUpdateInput {
    name: String
    recommendedUse: StringNullableOperationInput
    description: StringNullableOperationInput
    category: StringNullableOperationInput
    sku: StringNullableOperationInput
    productUrl: StringNullableOperationInput
    price: DecimalNullableOperationInput
    currency: StringNullableOperationInput
    isActive: Boolean
    isLabTestPanelDefinition: Boolean
    tags: StringListOperationInput
    categories: StringListOperationInput
    benefits: StringListOperationInput
    organization: ToOneRelationOperationInput
    containsCompounds: ToManyRelationOperationInput
  }

  input CompoundUpdateInput {
    name: String
    description: StringNullableOperationInput
    canonicalName: StringNullableOperationInput
    externalRef: StringNullableOperationInput
    aliases: StringListOperationInput
    mechanisms: StringListOperationInput
  }

  input LabTestUpdateInput {
    name: String
    description: StringNullableOperationInput
    labName: StringNullableOperationInput
    reportUrl: StringNullableOperationInput
    testedAt: DateTimeNullableOperationInput
    sampleType: StringNullableOperationInput
    tags: StringListOperationInput
    product: ToOneRelationOperationInput
    organization: ToOneRelationOperationInput
    testsBiomarkers: ToManyRelationOperationInput
  }

  input BiomarkerUpdateInput {
    name: String
    description: StringNullableOperationInput
    unit: StringNullableOperationInput
    category: StringNullableOperationInput
    referenceRange: StringNullableOperationInput
    referenceAgeMin: IntNullableOperationInput
    referenceAgeMax: IntNullableOperationInput
    referenceRangeLow: FloatNullableOperationInput
    referenceRangeMax: FloatNullableOperationInput
    aliases: StringListOperationInput
    relatedSystems: StringListOperationInput
  }

  input CaseStudyUpdateInput {
    title: String
    description: StringNullableOperationInput
    studyType: StringNullableOperationInput
    publicationDate: DateTimeNullableOperationInput
    sourceUrl: StringNullableOperationInput
    doi: StringNullableOperationInput
    journal: StringNullableOperationInput
    outcomeSummary: StringNullableOperationInput
    fullTextSummary: StringNullableOperationInput
    tags: StringListOperationInput
    keywords: StringListOperationInput
    businessSponsors: ToManyRelationOperationInput
    referencedByOrganizations: ToManyRelationOperationInput
  }

  input MediaUpdateInput {
    url: String
    type: MediaType
    mimeType: StringNullableOperationInput
    title: StringNullableOperationInput
    altText: StringNullableOperationInput
    caption: StringNullableOperationInput
    width: IntNullableOperationInput
    height: IntNullableOperationInput
    durationSeconds: IntNullableOperationInput
    fileSizeBytes: IntNullableOperationInput
    sortOrder: Int
  }

  # ─── Queries ────────────────────────────────────────────────────────────────

  type Query {
    podcast(id: ID, slug: String): Podcast
    podcasts: [Podcast!]!

    episode(id: ID, slug: String): Episode
    episodes(podcastId: ID, limit: Int, offset: Int): [Episode!]!

    claim(id: ID): Claim
    claims(episodeId: ID, limit: Int, offset: Int): [Claim!]!

    person(id: ID, slug: String): Person
    persons(limit: Int, offset: Int): [Person!]!

    organization(id: ID, slug: String): Organization
    organizations(limit: Int, offset: Int): [Organization!]!

    product(id: ID, slug: String): Product
    products(organizationId: ID, limit: Int, offset: Int): [Product!]!

    compound(id: ID, slug: String): Compound
    compounds(limit: Int, offset: Int): [Compound!]!

    labTest(id: ID, slug: String): LabTest
    labTests(limit: Int, offset: Int): [LabTest!]!

    biomarker(id: ID, slug: String): Biomarker
    biomarkers(limit: Int, offset: Int): [Biomarker!]!

    caseStudy(id: ID, slug: String): CaseStudy
    caseStudies(limit: Int, offset: Int): [CaseStudy!]!

    media(id: ID): Media
  }

  # ─── Mutations ──────────────────────────────────────────────────────────────

  type Mutation {
    createPodcast(data: PodcastCreateInput!): Podcast!
    updatePodcast(where: WhereUniqueInput!, data: PodcastUpdateInput!): Podcast!
    deletePodcast(where: WhereUniqueInput!): Podcast!

    createEpisode(data: EpisodeCreateInput!): Episode!
    updateEpisode(where: WhereUniqueInput!, data: EpisodeUpdateInput!): Episode!
    deleteEpisode(where: WhereUniqueInput!): Episode!

    createClaim(data: ClaimCreateInput!): Claim!
    updateClaim(id: ID!, data: ClaimUpdateInput!): Claim!
    deleteClaim(id: ID!): Claim!

    createPerson(data: PersonCreateInput!): Person!
    updatePerson(where: WhereUniqueInput!, data: PersonUpdateInput!): Person!
    deletePerson(where: WhereUniqueInput!): Person!

    createOrganization(data: OrganizationCreateInput!): Organization!
    updateOrganization(where: WhereUniqueInput!, data: OrganizationUpdateInput!): Organization!
    deleteOrganization(where: WhereUniqueInput!): Organization!

    createProduct(data: ProductCreateInput!): Product!
    updateProduct(where: WhereUniqueInput!, data: ProductUpdateInput!): Product!
    deleteProduct(where: WhereUniqueInput!): Product!

    createCompound(data: CompoundCreateInput!): Compound!
    updateCompound(where: WhereUniqueInput!, data: CompoundUpdateInput!): Compound!
    deleteCompound(where: WhereUniqueInput!): Compound!

    createLabTest(data: LabTestCreateInput!): LabTest!
    updateLabTest(where: WhereUniqueInput!, data: LabTestUpdateInput!): LabTest!
    deleteLabTest(where: WhereUniqueInput!): LabTest!

    createBiomarker(data: BiomarkerCreateInput!): Biomarker!
    updateBiomarker(where: WhereUniqueInput!, data: BiomarkerUpdateInput!): Biomarker!
    deleteBiomarker(where: WhereUniqueInput!): Biomarker!

    createCaseStudy(data: CaseStudyCreateInput!): CaseStudy!
    updateCaseStudy(where: WhereUniqueInput!, data: CaseStudyUpdateInput!): CaseStudy!
    deleteCaseStudy(where: WhereUniqueInput!): CaseStudy!

    createMedia(data: MediaCreateInput!): Media!
    updateMedia(id: ID!, data: MediaUpdateInput!): Media!
    deleteMedia(id: ID!): Media!
  }
`

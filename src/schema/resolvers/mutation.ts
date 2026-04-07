import type { GraphQLContext } from '../../lib/context.js'
import { resolveWhere, applyNullableOp, applyStringListOp, applyToManyRelationOp } from './helpers.js'

function pickDefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v
  }
  return result
}

export const mutationResolvers = {
  Mutation: {
    // ─── Podcast ───────────────────────────────────────────────────────
    createPodcast: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.podcast.create({ data }),

    updatePodcast: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.podcast.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.podcast.update({
        where: { id: existing.id },
        data: pickDefined({
          title: data.title,
          subtitle: applyNullableOp(data.subtitle),
          description: applyNullableOp(data.description),
          rssUrl: applyNullableOp(data.rssUrl),
          websiteUrl: applyNullableOp(data.websiteUrl),
          hostName: applyNullableOp(data.hostName),
          language: applyNullableOp(data.language),
          isPublished: data.isPublished,
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
        }),
      })
    },

    deletePodcast: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.podcast.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.podcast.delete({ where: { id: existing.id } })
    },

    // ─── Episode ──────────────────────────────────────────────────────
    createEpisode: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.episode.create({ data }),

    updateEpisode: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.episode.findUniqueOrThrow({ where: resolveWhere(where) })
      const guests = applyToManyRelationOp(data.guests)
      const sponsors = applyToManyRelationOp(data.sponsorOrganizations)

      return ctx.prisma.episode.update({
        where: { id: existing.id },
        data: pickDefined({
          title: data.title,
          episodeNumber: applyNullableOp(data.episodeNumber),
          seasonNumber: applyNullableOp(data.seasonNumber),
          channelName: applyNullableOp(data.channelName),
          summary: applyNullableOp(data.summary),
          description: applyNullableOp(data.description),
          transcript: applyNullableOp(data.transcript),
          transcriptSourceUrl: applyNullableOp(data.transcriptSourceUrl),
          audioUrl: applyNullableOp(data.audioUrl),
          videoUrl: applyNullableOp(data.videoUrl),
          publishedAt: applyNullableOp(data.publishedAt),
          durationSeconds: applyNullableOp(data.durationSeconds),
          isPublished: data.isPublished,
          webPageSummary: applyNullableOp(data.webPageSummary),
          summaryShort: applyNullableOp(data.summaryShort),
          summaryDetailed: applyNullableOp(data.summaryDetailed),
          publishedSummary: applyNullableOp(data.publishedSummary),
          episodePageUrl: applyNullableOp(data.episodePageUrl),
          episodeTranscriptUrl: applyNullableOp(data.episodeTranscriptUrl),
          youtubeVideoId: applyNullableOp(data.youtubeVideoId),
          youtubeEmbedUrl: applyNullableOp(data.youtubeEmbedUrl),
          youtubeWatchUrl: applyNullableOp(data.youtubeWatchUrl),
          s3TranscriptKey: applyNullableOp(data.s3TranscriptKey),
          s3TranscriptUrl: applyNullableOp(data.s3TranscriptUrl),
          transcriptStatus: data.transcriptStatus,
          transcriptSha256: applyNullableOp(data.transcriptSha256),
          topicPrimary: applyNullableOp(data.topicPrimary),
          topicSecondary: data.topicSecondary ? { set: applyStringListOp(existing.topicSecondary, data.topicSecondary)! } : undefined,
          topicConcepts: data.topicConcepts ? { set: applyStringListOp(existing.topicConcepts, data.topicConcepts)! } : undefined,
          enrichmentStage1Status: data.enrichmentStage1Status,
          enrichmentStage2Status: data.enrichmentStage2Status,
          publishStatus: data.publishStatus,
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          keyTakeaways: data.keyTakeaways ? { set: applyStringListOp(existing.keyTakeaways, data.keyTakeaways)! } : undefined,
          topics: data.topics ? { set: applyStringListOp(existing.topics, data.topics)! } : undefined,
          webPageTimelines: data.webPageTimelines,
          guests,
          sponsorOrganizations: sponsors,
        }),
      })
    },

    deleteEpisode: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.episode.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.episode.delete({ where: { id: existing.id } })
    },

    // ─── Claim ────────────────────────────────────────────────────────
    createClaim: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.claim.create({ data }),

    updateClaim: async (_: unknown, { id, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.claim.findUniqueOrThrow({ where: { id } })
      const speakerOp = data.speaker
        ? data.speaker.disconnect
          ? { disconnect: true }
          : data.speaker.connect
            ? { connect: resolveWhere(data.speaker.connect) }
            : undefined
        : undefined

      return ctx.prisma.claim.update({
        where: { id },
        data: pickDefined({
          text: data.text,
          evidenceExcerpt: applyNullableOp(data.evidenceExcerpt),
          claimType: data.claimType,
          stance: data.stance,
          claimConfidence: data.claimConfidence,
          startTimeSeconds: applyNullableOp(data.startTimeSeconds),
          endTimeSeconds: applyNullableOp(data.endTimeSeconds),
          sourceUrl: applyNullableOp(data.sourceUrl),
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          evidenceUrls: data.evidenceUrls ? { set: applyStringListOp(existing.evidenceUrls, data.evidenceUrls)! } : undefined,
          speaker: speakerOp,
        }),
      })
    },

    deleteClaim: (_: unknown, { id }: any, ctx: GraphQLContext) =>
      ctx.prisma.claim.delete({ where: { id } }),

    // ─── Person ───────────────────────────────────────────────────────
    createPerson: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.person.create({ data }),

    updatePerson: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.person.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.person.update({
        where: { id: existing.id },
        data: pickDefined({
          fullName: data.fullName,
          firstName: applyNullableOp(data.firstName),
          lastName: applyNullableOp(data.lastName),
          title: applyNullableOp(data.title),
          bio: applyNullableOp(data.bio),
          websiteUrl: applyNullableOp(data.websiteUrl),
          linkedinUrl: applyNullableOp(data.linkedinUrl),
          xUrl: applyNullableOp(data.xUrl),
          aliases: data.aliases ? { set: applyStringListOp(existing.aliases, data.aliases)! } : undefined,
          expertiseAreas: data.expertiseAreas ? { set: applyStringListOp(existing.expertiseAreas, data.expertiseAreas)! } : undefined,
        }),
      })
    },

    deletePerson: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.person.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.person.delete({ where: { id: existing.id } })
    },

    // ─── Organization ─────────────────────────────────────────────────
    createOrganization: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.organization.create({ data }),

    updateOrganization: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.organization.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.organization.update({
        where: { id: existing.id },
        data: pickDefined({
          name: data.name,
          legalName: applyNullableOp(data.legalName),
          description: applyNullableOp(data.description),
          websiteUrl: applyNullableOp(data.websiteUrl),
          headquarters: applyNullableOp(data.headquarters),
          foundedYear: applyNullableOp(data.foundedYear),
          annualRevenue: applyNullableOp(data.annualRevenue),
          stockTicker: applyNullableOp(data.stockTicker),
          employeeCount: applyNullableOp(data.employeeCount),
          organizationType: data.organizationType,
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          aliases: data.aliases ? { set: applyStringListOp(existing.aliases, data.aliases)! } : undefined,
          domains: data.domains ? { set: applyStringListOp(existing.domains, data.domains)! } : undefined,
          owners: applyToManyRelationOp(data.owners),
          executives: applyToManyRelationOp(data.executives),
        }),
      })
    },

    deleteOrganization: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.organization.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.organization.delete({ where: { id: existing.id } })
    },

    // ─── Product ──────────────────────────────────────────────────────
    createProduct: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.product.create({ data }),

    updateProduct: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.product.findUniqueOrThrow({ where: resolveWhere(where) })
      const orgOp = data.organization
        ? data.organization.disconnect
          ? { disconnect: true }
          : data.organization.connect
            ? { connect: resolveWhere(data.organization.connect) }
            : undefined
        : undefined

      return ctx.prisma.product.update({
        where: { id: existing.id },
        data: pickDefined({
          name: data.name,
          recommendedUse: applyNullableOp(data.recommendedUse),
          description: applyNullableOp(data.description),
          category: applyNullableOp(data.category),
          sku: applyNullableOp(data.sku),
          productUrl: applyNullableOp(data.productUrl),
          price: applyNullableOp(data.price),
          currency: applyNullableOp(data.currency),
          isActive: data.isActive,
          isLabTestPanelDefinition: data.isLabTestPanelDefinition,
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          categories: data.categories ? { set: applyStringListOp(existing.categories, data.categories)! } : undefined,
          benefits: data.benefits ? { set: applyStringListOp(existing.benefits, data.benefits)! } : undefined,
          organization: orgOp,
          containsCompounds: applyToManyRelationOp(data.containsCompounds),
        }),
      })
    },

    deleteProduct: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.product.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.product.delete({ where: { id: existing.id } })
    },

    // ─── Compound ─────────────────────────────────────────────────────
    createCompound: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.compound.create({ data }),

    updateCompound: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.compound.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.compound.update({
        where: { id: existing.id },
        data: pickDefined({
          name: data.name,
          description: applyNullableOp(data.description),
          canonicalName: applyNullableOp(data.canonicalName),
          externalRef: applyNullableOp(data.externalRef),
          aliases: data.aliases ? { set: applyStringListOp(existing.aliases, data.aliases)! } : undefined,
          mechanisms: data.mechanisms ? { set: applyStringListOp(existing.mechanisms, data.mechanisms)! } : undefined,
        }),
      })
    },

    deleteCompound: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.compound.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.compound.delete({ where: { id: existing.id } })
    },

    // ─── LabTest ──────────────────────────────────────────────────────
    createLabTest: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.labTest.create({ data }),

    updateLabTest: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.labTest.findUniqueOrThrow({ where: resolveWhere(where) })
      const productOp = data.product
        ? data.product.disconnect ? { disconnect: true } : data.product.connect ? { connect: resolveWhere(data.product.connect) } : undefined
        : undefined
      const orgOp = data.organization
        ? data.organization.disconnect ? { disconnect: true } : data.organization.connect ? { connect: resolveWhere(data.organization.connect) } : undefined
        : undefined

      return ctx.prisma.labTest.update({
        where: { id: existing.id },
        data: pickDefined({
          name: data.name,
          description: applyNullableOp(data.description),
          labName: applyNullableOp(data.labName),
          reportUrl: applyNullableOp(data.reportUrl),
          testedAt: applyNullableOp(data.testedAt),
          sampleType: applyNullableOp(data.sampleType),
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          product: productOp,
          organization: orgOp,
          testsBiomarkers: applyToManyRelationOp(data.testsBiomarkers),
        }),
      })
    },

    deleteLabTest: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.labTest.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.labTest.delete({ where: { id: existing.id } })
    },

    // ─── Biomarker ────────────────────────────────────────────────────
    createBiomarker: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.biomarker.create({ data }),

    updateBiomarker: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.biomarker.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.biomarker.update({
        where: { id: existing.id },
        data: pickDefined({
          name: data.name,
          description: applyNullableOp(data.description),
          unit: applyNullableOp(data.unit),
          category: applyNullableOp(data.category),
          referenceRange: applyNullableOp(data.referenceRange),
          referenceAgeMin: applyNullableOp(data.referenceAgeMin),
          referenceAgeMax: applyNullableOp(data.referenceAgeMax),
          referenceRangeLow: applyNullableOp(data.referenceRangeLow),
          referenceRangeMax: applyNullableOp(data.referenceRangeMax),
          aliases: data.aliases ? { set: applyStringListOp(existing.aliases, data.aliases)! } : undefined,
          relatedSystems: data.relatedSystems ? { set: applyStringListOp(existing.relatedSystems, data.relatedSystems)! } : undefined,
        }),
      })
    },

    deleteBiomarker: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.biomarker.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.biomarker.delete({ where: { id: existing.id } })
    },

    // ─── CaseStudy ────────────────────────────────────────────────────
    createCaseStudy: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.caseStudy.create({ data }),

    updateCaseStudy: async (_: unknown, { where, data }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.caseStudy.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.caseStudy.update({
        where: { id: existing.id },
        data: pickDefined({
          title: data.title,
          description: applyNullableOp(data.description),
          studyType: applyNullableOp(data.studyType),
          publicationDate: applyNullableOp(data.publicationDate),
          sourceUrl: applyNullableOp(data.sourceUrl),
          doi: applyNullableOp(data.doi),
          journal: applyNullableOp(data.journal),
          outcomeSummary: applyNullableOp(data.outcomeSummary),
          fullTextSummary: applyNullableOp(data.fullTextSummary),
          tags: data.tags ? { set: applyStringListOp(existing.tags, data.tags)! } : undefined,
          keywords: data.keywords ? { set: applyStringListOp(existing.keywords, data.keywords)! } : undefined,
          businessSponsors: applyToManyRelationOp(data.businessSponsors),
          referencedByOrganizations: applyToManyRelationOp(data.referencedByOrganizations),
        }),
      })
    },

    deleteCaseStudy: async (_: unknown, { where }: any, ctx: GraphQLContext) => {
      const existing = await ctx.prisma.caseStudy.findUniqueOrThrow({ where: resolveWhere(where) })
      return ctx.prisma.caseStudy.delete({ where: { id: existing.id } })
    },

    // ─── Media ────────────────────────────────────────────────────────
    createMedia: (_: unknown, { data }: any, ctx: GraphQLContext) =>
      ctx.prisma.media.create({ data }),

    updateMedia: (_: unknown, { id, data }: any, ctx: GraphQLContext) =>
      ctx.prisma.media.update({
        where: { id },
        data: pickDefined({
          url: data.url,
          type: data.type,
          mimeType: applyNullableOp(data.mimeType),
          title: applyNullableOp(data.title),
          altText: applyNullableOp(data.altText),
          caption: applyNullableOp(data.caption),
          width: applyNullableOp(data.width),
          height: applyNullableOp(data.height),
          durationSeconds: applyNullableOp(data.durationSeconds),
          fileSizeBytes: applyNullableOp(data.fileSizeBytes),
          sortOrder: data.sortOrder,
        }),
      }),

    deleteMedia: (_: unknown, { id }: any, ctx: GraphQLContext) =>
      ctx.prisma.media.delete({ where: { id } }),
  },
}

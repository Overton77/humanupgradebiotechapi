import type { GraphQLContext } from '../../lib/context.js'
import { resolveWhere } from './helpers.js'

export const queryResolvers = {
  Query: {
    podcast: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.podcast.findUnique({ where: resolveWhere(args) }),

    podcasts: (_: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.podcast.findMany({ orderBy: { title: 'asc' } }),

    episode: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.episode.findUnique({ where: resolveWhere(args) }),

    episodes: (_: unknown, args: { podcastId?: string; limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.episode.findMany({
        where: args.podcastId ? { podcastId: args.podcastId } : undefined,
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { publishedAt: 'desc' },
      }),

    claim: (_: unknown, args: { id?: string }, ctx: GraphQLContext) =>
      args.id ? ctx.prisma.claim.findUnique({ where: { id: args.id } }) : null,

    claims: (_: unknown, args: { episodeId?: string; limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.claim.findMany({
        where: args.episodeId ? { episodeId: args.episodeId } : undefined,
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
      }),

    person: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.person.findUnique({ where: resolveWhere(args) }),

    persons: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.person.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { fullName: 'asc' },
      }),

    organization: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: resolveWhere(args) }),

    organizations: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.organization.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { name: 'asc' },
      }),

    product: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.product.findUnique({ where: resolveWhere(args) }),

    products: (_: unknown, args: { organizationId?: string; limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.product.findMany({
        where: args.organizationId ? { organizationId: args.organizationId } : undefined,
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { name: 'asc' },
      }),

    compound: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.compound.findUnique({ where: resolveWhere(args) }),

    compounds: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.compound.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { name: 'asc' },
      }),

    labTest: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.labTest.findUnique({ where: resolveWhere(args) }),

    labTests: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.labTest.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { name: 'asc' },
      }),

    biomarker: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.biomarker.findUnique({ where: resolveWhere(args) }),

    biomarkers: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.biomarker.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { name: 'asc' },
      }),

    caseStudy: (_: unknown, args: { id?: string; slug?: string }, ctx: GraphQLContext) =>
      ctx.prisma.caseStudy.findUnique({ where: resolveWhere(args) }),

    caseStudies: (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) =>
      ctx.prisma.caseStudy.findMany({
        take: args.limit ?? 50,
        skip: args.offset ?? 0,
        orderBy: { title: 'asc' },
      }),

    media: (_: unknown, args: { id?: string }, ctx: GraphQLContext) =>
      args.id ? ctx.prisma.media.findUnique({ where: { id: args.id } }) : null,
  },
}

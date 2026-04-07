import type { GraphQLContext } from '../../lib/context.js'

export const episodeResolvers = {
  Episode: {
    podcast: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.podcast.findUnique({ where: { id: parent.podcastId } }),
    guests: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.guestsByEpisodeId.load(parent.id),
    sponsorOrganizations: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.sponsorsByEpisodeId.load(parent.id),
    claims: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.claimsByEpisodeId.load(parent.id),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByEpisodeId.load(parent.id),
  },
}

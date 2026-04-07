import type { GraphQLContext } from '../../lib/context.js'

export const claimResolvers = {
  Claim: {
    episode: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.episode.findUnique({ where: { id: parent.episodeId } }),
    speaker: (parent: any, _: unknown, ctx: GraphQLContext) =>
      parent.speakerId ? ctx.loaders.personById.load(parent.speakerId) : null,
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByClaimId.load(parent.id),
  },
}

import type { GraphQLContext } from '../../lib/context.js'

export const podcastResolvers = {
  Podcast: {
    episodes: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.episodesByPodcastId.load(parent.id),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByPodcastId.load(parent.id),
  },
}

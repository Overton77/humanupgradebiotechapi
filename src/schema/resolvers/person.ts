import type { GraphQLContext } from '../../lib/context.js'

export const personResolvers = {
  Person: {
    guestEpisodes: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.person.findUnique({ where: { id: parent.id } }).guestEpisodes(),
    spokenClaims: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.person.findUnique({ where: { id: parent.id } }).spokenClaims(),
    ownedOrganizations: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.person.findUnique({ where: { id: parent.id } }).ownedOrganizations(),
    executiveOrganizations: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.person.findUnique({ where: { id: parent.id } }).executiveOrganizations(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByPersonId.load(parent.id),
  },
}

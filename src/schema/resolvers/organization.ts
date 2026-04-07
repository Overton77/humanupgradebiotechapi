import type { GraphQLContext } from '../../lib/context.js'

export const organizationResolvers = {
  Organization: {
    products: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.productsByOrganizationId.load(parent.id),
    owners: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: { id: parent.id } }).owners(),
    executives: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: { id: parent.id } }).executives(),
    labTests: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.labTestsByOrganizationId.load(parent.id),
    sponsoredEpisodes: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: { id: parent.id } }).sponsoredEpisodes(),
    referencedCaseStudies: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: { id: parent.id } }).referencedCaseStudies(),
    businessSponsoredCases: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.organization.findUnique({ where: { id: parent.id } }).businessSponsoredCases(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByOrganizationId.load(parent.id),
  },
}

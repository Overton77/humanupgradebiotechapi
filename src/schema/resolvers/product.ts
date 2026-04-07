import type { GraphQLContext } from '../../lib/context.js'

export const productResolvers = {
  Product: {
    organization: (parent: any, _: unknown, ctx: GraphQLContext) =>
      parent.organizationId ? ctx.loaders.organizationById.load(parent.organizationId) : null,
    containsCompounds: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.product.findUnique({ where: { id: parent.id } }).containsCompounds(),
    labTests: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.labTestsByProductId.load(parent.id),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByProductId.load(parent.id),
  },
}

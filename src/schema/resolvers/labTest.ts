import type { GraphQLContext } from '../../lib/context.js'

export const labTestResolvers = {
  LabTest: {
    product: (parent: any, _: unknown, ctx: GraphQLContext) =>
      parent.productId ? ctx.loaders.productById.load(parent.productId) : null,
    organization: (parent: any, _: unknown, ctx: GraphQLContext) =>
      parent.organizationId ? ctx.loaders.organizationById.load(parent.organizationId) : null,
    testsBiomarkers: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.labTest.findUnique({ where: { id: parent.id } }).testsBiomarkers(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByLabTestId.load(parent.id),
  },
}

import type { GraphQLContext } from '../../lib/context.js'

export const compoundResolvers = {
  Compound: {
    products: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.compound.findUnique({ where: { id: parent.id } }).products(),
    biomarkers: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.compound.findUnique({ where: { id: parent.id } }).biomarkers(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByCompoundId.load(parent.id),
  },
}

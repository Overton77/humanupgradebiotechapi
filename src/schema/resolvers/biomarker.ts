import type { GraphQLContext } from '../../lib/context.js'

export const biomarkerResolvers = {
  Biomarker: {
    labTests: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.biomarker.findUnique({ where: { id: parent.id } }).labTests(),
    compounds: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.biomarker.findUnique({ where: { id: parent.id } }).compounds(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByBiomarkerId.load(parent.id),
  },
}

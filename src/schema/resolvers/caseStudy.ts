import type { GraphQLContext } from '../../lib/context.js'

export const caseStudyResolvers = {
  CaseStudy: {
    businessSponsors: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.caseStudy.findUnique({ where: { id: parent.id } }).businessSponsors(),
    referencedByOrganizations: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.prisma.caseStudy.findUnique({ where: { id: parent.id } }).referencedByOrganizations(),
    media: (parent: any, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.mediaByCaseStudyId.load(parent.id),
  },
}

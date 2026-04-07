import { z } from 'zod'
import {
  StringNullableOperationSchema,
  DateTimeNullableOperationSchema,
  StringListOperationSchema,
  ToManyRelationOperationSchema,
} from './scalars.js'

export const CaseStudyCreateInputSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  studyType: z.string().optional(),
  publicationDate: z.string().datetime().optional(),
  sourceUrl: z.string().url().optional(),
  doi: z.string().optional(),
  journal: z.string().optional(),
  outcomeSummary: z.string().optional(),
  fullTextSummary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
})
export type CaseStudyCreateInput = z.infer<typeof CaseStudyCreateInputSchema>

export const CaseStudyUpdateInputSchema = z.object({
  title: z.string().min(1).optional(),
  description: StringNullableOperationSchema.optional(),
  studyType: StringNullableOperationSchema.optional(),
  publicationDate: DateTimeNullableOperationSchema.optional(),
  sourceUrl: StringNullableOperationSchema.optional(),
  doi: StringNullableOperationSchema.optional(),
  journal: StringNullableOperationSchema.optional(),
  outcomeSummary: StringNullableOperationSchema.optional(),
  fullTextSummary: StringNullableOperationSchema.optional(),
  tags: StringListOperationSchema.optional(),
  keywords: StringListOperationSchema.optional(),
  businessSponsors: ToManyRelationOperationSchema.optional(),
  referencedByOrganizations: ToManyRelationOperationSchema.optional(),
})
export type CaseStudyUpdateInput = z.infer<typeof CaseStudyUpdateInputSchema>

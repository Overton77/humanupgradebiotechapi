import { z } from 'zod'
import {
  StringNullableOperationSchema,
  DateTimeNullableOperationSchema,
  StringListOperationSchema,
  ToOneRelationOperationSchema,
  ToManyRelationOperationSchema,
} from './scalars.js'

export const LabTestCreateInputSchema = z.object({
  slug: z.string().min(1),
  productId: z.string().optional(),
  organizationId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  labName: z.string().optional(),
  reportUrl: z.string().url().optional(),
  testedAt: z.string().datetime().optional(),
  sampleType: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
export type LabTestCreateInput = z.infer<typeof LabTestCreateInputSchema>

export const LabTestUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: StringNullableOperationSchema.optional(),
  labName: StringNullableOperationSchema.optional(),
  reportUrl: StringNullableOperationSchema.optional(),
  testedAt: DateTimeNullableOperationSchema.optional(),
  sampleType: StringNullableOperationSchema.optional(),
  tags: StringListOperationSchema.optional(),
  product: ToOneRelationOperationSchema.optional(),
  organization: ToOneRelationOperationSchema.optional(),
  testsBiomarkers: ToManyRelationOperationSchema.optional(),
})
export type LabTestUpdateInput = z.infer<typeof LabTestUpdateInputSchema>

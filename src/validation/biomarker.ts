import { z } from 'zod'
import {
  StringNullableOperationSchema,
  IntNullableOperationSchema,
  FloatNullableOperationSchema,
  StringListOperationSchema,
} from './scalars.js'

export const BiomarkerCreateInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  referenceRange: z.string().optional(),
  referenceAgeMin: z.int().optional(),
  referenceAgeMax: z.int().optional(),
  referenceRangeLow: z.number().optional(),
  referenceRangeMax: z.number().optional(),
  aliases: z.array(z.string()).optional(),
  relatedSystems: z.array(z.string()).optional(),
})
export type BiomarkerCreateInput = z.infer<typeof BiomarkerCreateInputSchema>

export const BiomarkerUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: StringNullableOperationSchema.optional(),
  unit: StringNullableOperationSchema.optional(),
  category: StringNullableOperationSchema.optional(),
  referenceRange: StringNullableOperationSchema.optional(),
  referenceAgeMin: IntNullableOperationSchema.optional(),
  referenceAgeMax: IntNullableOperationSchema.optional(),
  referenceRangeLow: FloatNullableOperationSchema.optional(),
  referenceRangeMax: FloatNullableOperationSchema.optional(),
  aliases: StringListOperationSchema.optional(),
  relatedSystems: StringListOperationSchema.optional(),
})
export type BiomarkerUpdateInput = z.infer<typeof BiomarkerUpdateInputSchema>

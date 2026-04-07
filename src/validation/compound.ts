import { z } from 'zod'
import { StringNullableOperationSchema, StringListOperationSchema } from './scalars.js'

export const CompoundCreateInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  canonicalName: z.string().optional(),
  externalRef: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  mechanisms: z.array(z.string()).optional(),
})
export type CompoundCreateInput = z.infer<typeof CompoundCreateInputSchema>

export const CompoundUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: StringNullableOperationSchema.optional(),
  canonicalName: StringNullableOperationSchema.optional(),
  externalRef: StringNullableOperationSchema.optional(),
  aliases: StringListOperationSchema.optional(),
  mechanisms: StringListOperationSchema.optional(),
})
export type CompoundUpdateInput = z.infer<typeof CompoundUpdateInputSchema>

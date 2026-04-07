import { z } from 'zod'

// ─── Nullable scalar patch operations ────────────────────────────────────────

export const StringNullableOperationSchema = z.object({
  set: z.string().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) ctx.issues.push({ code: 'custom', message: 'Provide set or clear' })
    if (provided === 2) ctx.issues.push({ code: 'custom', message: 'Cannot provide both set and clear' })
  }
)
export type StringNullableOperation = z.infer<typeof StringNullableOperationSchema>

export const IntNullableOperationSchema = z.object({
  set: z.int().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) ctx.issues.push({ code: 'custom', message: 'Provide set or clear' })
    if (provided === 2) ctx.issues.push({ code: 'custom', message: 'Cannot provide both set and clear' })
  }
)
export type IntNullableOperation = z.infer<typeof IntNullableOperationSchema>

export const FloatNullableOperationSchema = z.object({
  set: z.number().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) ctx.issues.push({ code: 'custom', message: 'Provide set or clear' })
    if (provided === 2) ctx.issues.push({ code: 'custom', message: 'Cannot provide both set and clear' })
  }
)
export type FloatNullableOperation = z.infer<typeof FloatNullableOperationSchema>

export const DateTimeNullableOperationSchema = z.object({
  set: z.string().datetime().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) ctx.issues.push({ code: 'custom', message: 'Provide set or clear' })
    if (provided === 2) ctx.issues.push({ code: 'custom', message: 'Cannot provide both set and clear' })
  }
)
export type DateTimeNullableOperation = z.infer<typeof DateTimeNullableOperationSchema>

export const DecimalNullableOperationSchema = z.object({
  set: z.number().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) ctx.issues.push({ code: 'custom', message: 'Provide set or clear' })
    if (provided === 2) ctx.issues.push({ code: 'custom', message: 'Cannot provide both set and clear' })
  }
)
export type DecimalNullableOperation = z.infer<typeof DecimalNullableOperationSchema>

// ─── String list operations ──────────────────────────────────────────────────

export const StringListOperationSchema = z.object({
  set: z.array(z.string().min(1)).optional(),
  add: z.array(z.string().min(1)).optional(),
  remove: z.array(z.string().min(1)).optional(),
}).check(
  ctx => {
    const { set, add, remove } = ctx.value
    const hasSet = set !== undefined
    const hasAdd = add !== undefined
    const hasRemove = remove !== undefined
    if (!hasSet && !hasAdd && !hasRemove) {
      ctx.issues.push({ code: 'custom', message: 'At least one list operation is required' })
    }
    if (hasSet && (hasAdd || hasRemove)) {
      ctx.issues.push({ code: 'custom', message: 'set cannot be combined with add/remove' })
    }
  }
)
export type StringListOperation = z.infer<typeof StringListOperationSchema>

// ─── Unique selectors ────────────────────────────────────────────────────────

export const WhereUniqueInputSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).optional(),
}).check(
  ctx => {
    if (!ctx.value.id && !ctx.value.slug) {
      ctx.issues.push({ code: 'custom', message: 'Provide at least id or slug' })
    }
  }
)
export type WhereUniqueInput = z.infer<typeof WhereUniqueInputSchema>

// ─── Relation operation schemas ──────────────────────────────────────────────

export const ConnectOrCreateInputSchema = (createSchema: z.ZodType) =>
  z.object({
    where: WhereUniqueInputSchema,
    create: createSchema,
  })

export const ToOneRelationOperationSchema = z.object({
  connect: WhereUniqueInputSchema.optional(),
  disconnect: z.boolean().optional(),
})
export type ToOneRelationOperation = z.infer<typeof ToOneRelationOperationSchema>

export const ToManyRelationOperationSchema = z.object({
  set: z.array(WhereUniqueInputSchema).optional(),
  connect: z.array(WhereUniqueInputSchema).optional(),
  disconnect: z.array(WhereUniqueInputSchema).optional(),
})
export type ToManyRelationOperation = z.infer<typeof ToManyRelationOperationSchema>

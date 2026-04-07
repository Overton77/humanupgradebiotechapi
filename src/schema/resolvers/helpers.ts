/**
 * Converts a nullable operation input { set, clear } into a Prisma-compatible value.
 * Returns undefined if the operation should be skipped (not provided).
 */
export function applyNullableOp<T>(
  op: { set?: T; clear?: boolean } | undefined
): T | null | undefined {
  if (op === undefined) return undefined
  if (op.clear) return null
  if (op.set !== undefined) return op.set
  return undefined
}

/**
 * Applies a string list operation (set/add/remove) to an existing array.
 * Returns the new array value for Prisma { set: [...] }, or undefined to skip.
 */
export function applyStringListOp(
  current: string[],
  op: { set?: string[]; add?: string[]; remove?: string[] } | undefined
): string[] | undefined {
  if (op === undefined) return undefined
  if (op.set) return [...new Set(op.set)]
  let result = [...current]
  if (op.add) {
    const addSet = new Set(op.add)
    for (const item of addSet) {
      if (!result.includes(item)) result.push(item)
    }
  }
  if (op.remove) {
    const removeSet = new Set(op.remove)
    result = result.filter(item => !removeSet.has(item))
  }
  return result
}

/**
 * Resolves a WhereUniqueInput { id, slug } to a Prisma where clause.
 */
export function resolveWhere(where: { id?: string | null; slug?: string | null }) {
  if (where.id) return { id: where.id }
  if (where.slug) return { slug: where.slug }
  throw new Error('Provide at least id or slug')
}

/**
 * Builds a Prisma to-many relation operation from a relation operation input.
 */
export function applyToManyRelationOp(
  op: {
    set?: Array<{ id?: string | null; slug?: string | null }>
    connect?: Array<{ id?: string | null; slug?: string | null }>
    disconnect?: Array<{ id?: string | null; slug?: string | null }>
  } | undefined
) {
  if (op === undefined) return undefined
  const result: any = {}
  if (op.set) result.set = op.set.map(resolveWhere)
  if (op.connect) result.connect = op.connect.map(resolveWhere)
  if (op.disconnect) result.disconnect = op.disconnect.map(resolveWhere)
  return result
}

//@flow

const canHaveProps = (val: mixed): boolean %checks =>
  val !== null
  && (typeof val === 'object'
     || typeof val === 'function')

/**
 *
 * @deprecated
 */
export function transformMonoInput(input: *) {
  if (canHaveProps(input) && input.value !== undefined)
    return input
  return { value: input }
}

export const ensureProp = (key: string, obj: mixed): boolean %checks =>
     canHaveProps(obj)
  && (
       obj[key] !== undefined
    || Object.keys(obj).indexOf(key) !== -1
  )

export const isObject = (obj: mixed): boolean %checks =>
     typeof obj === 'object'
  && obj !== null

export const isMezzanine = (obj: mixed): boolean %checks =>
     (  typeof obj === 'function'
     || isObject(obj))
  && obj.ಠ_ಠ !== undefined

export const toJSON = (ctx: *) => {
  if (!isMezzanine(ctx)) return ctx
  if (ctx.isMono) return toJSON(ctx.value)
  const result: * = {}
  for (const [key, value] of ctx)
    result[key] = toJSON(value)
  return result
}

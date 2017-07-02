//@flow
import { type Descript, type TypeRecord } from './type-container'


export const isObject = (obj: mixed): boolean %checks =>
     typeof obj === 'object'
  && obj !== null

export const isMezzanine = (obj: mixed): boolean %checks =>
     (  typeof obj === 'function'
     || isObject(obj))
  && obj.ಠ_ಠ !== undefined
export function toJSON<D: Descript, T: TypeRecord<D>>(ctx: T & D) {
  if (!isMezzanine(ctx)) return ctx
  if (ctx.isMono) return toJSON(ctx.value)
  const result: {[id: string]: Descript } = ({}: any)
  for (const [key, value] of ctx)
    result[key] = toJSON(value)
  return result
}

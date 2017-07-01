//@flow
import { isSingleProof } from '../verify'

import typeContainer from './type-container'
import { mergeTemplateArgs } from '../decorators'
import { type ContextMethod } from './index.h'
type Pred = <+T>(val: T) => boolean
type Descript =
  | typeof String
  | typeof Number
  | typeof Array
  | typeof Boolean
  | typeof Function
  | string
  | number
  | boolean
  | Pred
  | {[id: string]: Descript }
/**
 * Make single type which
 * implements `fantasy-land` spec:
 * - Semigroup
 * - Setoid
 * - Functor
 * - Apply
 * - Applicative
 * - Chain
 * - Monad
 * - Extend
 * - Comonad
 *
 * @example
 * Type`User`({ id: Number, name: String })
 */
function Type(tag: string[] | string, ...restOfName: mixed[]) {
  const typeName = typeof tag === 'string'
    ? tag
    : mergeTemplateArgs(tag, ...restOfName).join('')
  return <+T: *, P: Descript, +F>(desc: P, func: {[name: string]: ContextMethod<T, F>} = {}) => {
    const isMono = isSingleProof(desc)
    return typeContainer(typeName, typeName, desc, isMono, func)
  }
}
export { typeContainer }
export default Type
const inc = (ctx) => ({ x: ctx.x + 1, y: ctx.y })
const remap =
  (ctx, Ctx) => (fn) => Ctx(fn(ctx))
const Point = Type`Point`({
  x: Number,
  y: Number,
}, { remap })
const point = Point({ x: 1, y: 2 })
const result = point.remap(inc)
// expect(result).toHaveProperty('type', 'Point')
// expect(result).toHaveProperty('x', 2)
// expect(result).toHaveProperty('y', 2)
// expect(result.equals({ x: 2, y: 2 })).toBe(true)
// expect(result.ಠ_ಠ).toBe(Point.ಠ_ಠ)
console.log(Point)
console.log(result)
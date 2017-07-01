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

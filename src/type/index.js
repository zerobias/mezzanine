//@flow

import { isSingleProof } from '../verify'
import typeContainer from './type-container'

import type { ContextMethod } from './index.h'
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
 * Record`User`({ id: Number, name: String })
 */
function Type([typeName]: string[]) {
  return <+T: *, +P, +F>(desc: {+[name: string]: P}, func: {[name: string]: ContextMethod<T, F>} = {}) => {
    const isMono = isSingleProof(desc)
    return typeContainer(typeName, typeName, desc, isMono, func)
  }
}

export { typeContainer }
export default Type

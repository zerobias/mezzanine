//@flow
'use strict'

/**
 * Union of types
 *
 * @module mezzanine/union
 */

import { nonenumerable, readonly } from 'core-decorators'
import { zip, difference, isEmpty } from 'ramda'

import verify, { isSingleProof, isSingleAlike } from './verify'
import Type from './type'
import isOrthogonal from './ortho'
import { callableClass, omitNew, rename } from './decorators'
import { mark, typeMark } from './config'

const matchFabric =
  (that: *) =>
    function match(newVal: *) {
      newVal /*?*/
      for (const [key, pattern] of that) {
        if (pattern.is(newVal)) return pattern(newVal)
      }
      throw new TypeError('Unmatched pattern')
    }
const makeSubtype = (arg: *, key: string, typeName: string) => {
  const withName = rename(key)
  if (isSingleProof(arg))
    return withName(Type(key, typeName, { value: arg }, true))
  if (isSingleAlike(arg))
    return withName(Type(key, typeName, arg, true))
  if (typeof arg !== 'object' || arg === null) throw new TypeError(`Wrong arg type, expect object got ${typeof arg}`)

  return withName(Type(key, typeName, arg, false))
}

/**
 * Make type union
 * @param {string} typeName
 *
 * @example
 * Union`User`({ Account: String, Guest: {} })
 */
const Union = ([typeName]: [string]) => (desc: {[name: string]: *}) => {
  const canMatch = isOrthogonal(desc)

  const keys = Object.keys(desc)
  const values = Object.values(desc)
  const subtypes = zip(keys, values)
  const subtypesMap = {}
  for (const [key, arg] of subtypes)
    subtypesMap[key] = makeSubtype(arg, key, typeName)
  // @omitNew
  @callableClass(matchFabric)
  @rename(typeName)
  //$FlowIssue
  class UnionType implements $Iterable<[string, *], void, void> {
    $call: (data: *) => *;

    @nonenumerable
    static ಠ_ಠ = true
    @nonenumerable
    ಠ_ಠ = true;
    //$FlowIssue
    [typeMark] = true
    //$FlowIssue
    static [typeMark] = true

    @readonly
    typeName: string = typeName

    @readonly
    canMatch: boolean = canMatch

    @nonenumerable
    get _types(): string[] {
      return keys
    }

    //$FlowIssue
    * [Symbol.iterator]() {
      for (const key of keys)
        yield [key, subtypesMap[key]]
    }

    is(val: *) {
      for (const [key, pattern] of this) {
        console.log(key, pattern, val)
        if (pattern.is) {
          if (pattern.is(val)) return true
        } else if (typeof pattern === 'function' && pattern(val)) return true
      }
      return false
    }

    constructor() {
      Object.assign(this, subtypesMap)
    }

    @nonenumerable
    case = (cases: {[string]: (val: *) => *}, subtype: *) => {
      if (!subtype) return (subtype: *) => this.case(cases, subtype)

      const {
        _ = () => { throw new Error(`Unmatched case on union ${typeName}`) },
        ...realCases
      } = cases
      const diff = difference(Object.keys(realCases), keys)
      if (!isEmpty(diff)) {
        throw new Error(`Unrelevant case types ${diff} on type ${typeName}`)
      }
      for (const variant of Object.keys(realCases)) {
        const childType = subtypesMap[variant]
        const currentCase = realCases[variant]
        if (childType.is(subtype)) {
          const finalValue = subtype.ಠ_ಠ && childType[mark] === subtype[mark]
            ? subtype
            : childType(subtype)
          return currentCase(finalValue)
        }
      }
      return _(subtype)
    }
  }
  Object.assign(UnionType, subtypesMap)
  return new UnionType
}

export default Union
// const List = Union`List`({
//   Cons: { list: Array },
//   Nil: { list: Object },
// })

// const maybe = Union`Maybe`({
//   Just   : { value: List },
//   Nothing: { },
// })

// const list = List.Cons({ list: [] })

// const res = maybe.Nothing({ value: list })
// res



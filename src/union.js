//@flow
'use strict'

import { nonenumerable, readonly } from 'core-decorators'
import { zip } from 'ramda'

import verify, { isSingleProof, isSingleAlike } from './verify'
import Container from './container'
import isOrthogonal from './ortho'
import { callableClass, omitNew, rename } from './decorators'
import { containerMark, typeMark } from './config'

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
    return withName(Container(key, typeName, { value: arg }, true))
  if (isSingleAlike(arg))
    return withName(Container(key, typeName, arg, true))
  if (typeof arg !== 'object' || arg === null) throw new TypeError(`Wrong arg type, expect object got ${typeof arg}`)

  return withName(Container(key, typeName, arg, false))
}

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
  class UnionType {
    //$FlowIssue
    [typeMark] = true
    //$FlowIssue
    static [typeMark] = true
    // static typeName: string = typeName
    // static canMatch: boolean = canMatch


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
      for (const [key, pattern] of this)
        if (pattern.is(val)) return true
      return false
    }

    constructor() {
      Object.assign(this, subtypesMap)
      // for (const [key, arg] of subtypes)
      //   this[key] = makeSubtype(arg, key, typeName)
    }
  }
  Object.assign(UnionType, subtypesMap)
  return new UnionType()
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



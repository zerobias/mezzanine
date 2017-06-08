//
'use strict'

/**
 * Union of types
 *
 * @module mezzanine/union
 */

import { nonenumerable, readonly } from 'core-decorators'
import { zip, difference, isEmpty, map, pick } from 'ramda'

import verify, { isSingleProof, isSingleAlike } from './verify'
import TypeFab, { Type } from './type'
import isOrthogonal from './ortho'
import { callableClass, rename } from './decorators'
import { typeMark } from './config'

const matchFabric =
  (that: *) => function match(newVal: *) {
    const funcDesc = <T>(inst: T): T => {
      const funcMap = map(fn => ({
        enumerable: false,
        value     : fn(inst, that),
      }), that.funcs)
      Object.defineProperties(inst, funcMap)
      return inst
    }
    for (const [, pattern] of that) {
      if (pattern.is(newVal)) {
        return funcDesc(pattern(newVal))
      }
    }
    throw new TypeError('Unmatched pattern')
  }

const makeSubtype = (arg: *, key: string, typeName: string) => {
  const withName = rename(key)
  if (isSingleProof(arg))
    return withName(TypeFab(key, typeName, { value: arg }, true, {}))
  if (isSingleAlike(arg))
    return withName(TypeFab(key, typeName, arg, true, {}))
  if (typeof arg !== 'object' || arg === null) throw new TypeError(`Wrong arg type, expect object got ${typeof arg}`)

  return withName(TypeFab(key, typeName, arg, false, {}))
}

/* eslint-disable */

/**
 * Make type union
 * @param {string} typeName
 *
 * @example
 * Union`User`({ Account: String, Guest: {} })
 */
const Union = ([typeName]: string[]) =>
(desc: {[name: string]: *}, funcBlob: {[string]: Function} = {}) => {
  const canMatch = isOrthogonal(desc)

  const keys = Object.keys(desc)
  const values = Object.values(desc)
  const subtypes = zip(keys, values)
  const subtypesMap = {}
  for (const [key, arg] of subtypes)
    subtypesMap[key] = makeSubtype(arg, key, typeName)

  @callableClass(matchFabric)
  @rename(typeName)
  //$FlowIssue
  class UnionType implements Iterable<[string, *]> {
    $call: (data: *) => *;

    @nonenumerable
    ಠ_ಠ = true;
    //$FlowIssue
    [typeMark] = true

    @readonly
    typeName: string = typeName

    @readonly
    canMatch: boolean = canMatch

    @nonenumerable
    get types(): string[] {
      return keys
    }

    //$FlowIssue
    * [Symbol.iterator]() {
      for (const key of keys)
        yield ([key, subtypesMap[key]])
    }
    // toJSON(): {[key: string]: *} {
    //   return pick(keys, this)
    // }
    is(val: *) {
      for (const [key, pattern] of this) {
        console.log(key, pattern, val)
        if (pattern.is) {
          if (pattern.is(val)) return true
        } else if (typeof pattern === 'function' && pattern(val)) return true
      }
      return false
    }
    toJSON() {
      return this.value.toJSON()
    }
    funcs: *
    constructor() {
      Object.assign(this, subtypesMap)
      const instanceCase = (inst: *) => (cases) => this.case(cases, inst)
      this.funcs = {
        ...funcBlob,
        'case': instanceCase,
        // toJSON: (inst: *) => pick(keys, inst),
        map: (inst: *) => fn => union(fn(inst.toJSON())),
        chain: (inst: *) => (fn) => fn(this.toJSON().value)
      }
    }
    map(fn) {
      return union(fn(this.toJSON()))
    }
    @nonenumerable
    case = (cases: {[string]: (val: *) => *}, subtype: *) => {
      if (!subtype) return (subtype: *) => this.case(cases, subtype)

      const {
        _ = defaultCase,
        ...realCases
      } = cases
      const diff = difference(Object.keys(realCases), keys)
      if (!isEmpty(diff)) {
        throw new Error(`Unrelevant case types ${diff.toString()} on type ${typeName}`)
      }
      for (const variant of Object.keys(realCases)) {
        const childType = subtypesMap[variant]
        const currentCase = realCases[variant]
        if (childType.is(subtype)) {
          const finalValue = childType.ಠ_ಠ === subtype.ಠ_ಠ
            ? subtype
            : childType(subtype)
          return currentCase(finalValue, this)
        }
      }
      return _(subtype)
    }
  }
  Object.assign(UnionType, subtypesMap)
  const union = new UnionType
  return union
}

const defaultCase = (instance: *) => {
  throw new Error(`Unmatched case on union ${instance.typeName}`)
}

export default Union

const Boy = Type`Boy`({
  name: String,
  alive: Boolean
}, {
  mutableKill: (ctx) => () => { ctx.alive = false }
})

// mutable function
const Fred = Boy({ name: 'Fred', alive: true })
Fred

Fred.mutableKill()
Fred



const Brothers = Type`Brothers`({
  elder  : Boy,
  younger: Boy
})
const Childs = Union`Childs`({
  Single: Boy,
  Couple: Brothers,
})

const rawData = { name: 'Fred' }
Fred.equals(Boy({ name: 'Fred', alive: true })); /*?*/
Fred.equals(rawData) /*?*/

//transforms
// Fred.map(({ name }) => ({ name: name+'dy' }))/*?*/

//deep patterns
const family1 = Childs({ name: 'John', alive: true })
const family2 = Childs({
  elder  : Fred,
  younger: { name: 'Bob', alive: true }
})


/*?*/

const onlyOne = family2.chain(({younger}) => Childs(younger));
onlyOne

family1.type; /*?*/
family2.type; /*?*/
onlyOne.type; /*?*/

[...family1].map(([key,value])=>key)/*?*/
//pattern-switch
const actions = {
  Single:({ value: child }) => child.name,
  Couple:({ value: childs }) => [childs.elder.name, childs.younger.name]
}

// family2.case(actions)/*?*/
// family1.case(actions)/*?*/
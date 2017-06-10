//@flow

/**
 * Union of types
 *
 * @module mezzanine/union
 */

import { nonenumerable, readonly } from 'core-decorators'
import { zip, difference, isEmpty, map, pick } from 'ramda'

import { isSingleProof, isSingleAlike } from './verify'
import { typeContainer } from './type'
import isOrthogonal from './ortho'
import { copyProps, rename, omitNew } from './decorators'
import { typeMark } from './config'
import { isMezzanine } from './type/fixtures'


const makeSubtype = (arg: *, key: string, typeName: string) => {
  const withName = rename(key)
  if (isSingleProof(arg))
    return withName(typeContainer(key, typeName, { value: arg }, true, {}))
  if (isSingleAlike(arg))
    return withName(typeContainer(key, typeName, arg, true, {}))
  if (typeof arg !== 'object' || arg === null) throw new TypeError(`Wrong arg type, expect object got ${typeof arg}`)

  return withName(typeContainer(key, typeName, arg, false, {}))
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

  const uniqMark = Symbol(typeName)

  const keys = Object.keys(desc)
  const values = Object.values(desc)
  const subtypes = zip(keys, values)
  const subtypesMap = {}
  for (const [key, arg] of subtypes)
    subtypesMap[key] = makeSubtype(arg, key, typeName)

  @omitNew
  @rename(typeName)
  // @callableClass(matchFabric)
  //$FlowIssue
  class UnionType implements Iterable<[string, *]> {
    static $call: (data: *) => *;

    @nonenumerable
    static ಠ_ಠ = uniqMark;
    @nonenumerable
    ಠ_ಠ = uniqMark;
    //$FlowIssue
    static [typeMark] = true;
    //$FlowIssue
    [typeMark] = true

    @readonly
    static typeName: string = typeName
    // @readonly
    typeName: string = typeName

    @readonly
    static canMatch: boolean = canMatch
    // @readonly
    canMatch: boolean = canMatch

    @nonenumerable
    get types(): string[] {
      return keys
    }
    @nonenumerable
    static get types(): string[] {
      return keys
    }

    //$FlowIssue
    * [Symbol.iterator]() {
      for (const key of keys)
        yield ([key, this[key]])
    }

    //$FlowIssue
    static * [Symbol.iterator]() {
      for (const key of keys)
        yield ([key, subtypesMap[key]])
    }
    // toJSON(): {[key: string]: *} {
    //   return pick(keys, this)
    // }
    // static is(val: *) {
    //   for (const [key, pattern] of UnionType) {
    //     console.log(key, pattern, val)
    //     if (pattern.is) {
    //       if (pattern.is(val)) return true
    //     } else if (typeof pattern === 'function' && pattern(val)) return true
    //   }
    //   return false
    // }
    static is(val: *) {
      //$FlowIssue
      for (const [key, pattern] of UnionClass) {
        // console.log(key, pattern, val)
        if (pattern.is) {
          if (pattern.is(val)) return true
        } else if (typeof pattern === 'function' && pattern(val)) return true
      }
      return false
    }
    is(val: *) {
      for (const [key, pattern] of this) {
        // console.log(key, pattern, val)
        if (pattern.is) {
          if (pattern.is(val)) return true
        } else if (typeof pattern === 'function' && pattern(val)) return true
      }
      return false
    }
    // toJSON() {
    //   return pick(keys, this)
    // }
    static funcs = funcBlob
    keys: string[]
    isMono: boolean
    toJSON: () => Object
    constructor(arg: *) {
      // console.log(arg)
      const data = arg && arg.value
        ? arg.value
        : arg;
      // const funcDesc = <T>(inst: T): T => {


      //   // return this
      // }
      let matched = false
      for (const key of Object.keys(subtypesMap)) {
        const pattern = subtypesMap[key]
        if (pattern.is(data)) {
          const fin = pattern(data)
          reflectProps(this, fin)
          if (fin.isMono)
            this.value = fin.value
          matched = true
          break
        }
      }
      if (!matched)
        throw new TypeError('Unmatched pattern')
        const applyFn = fn => fn(this, UnionClass)
      const funcMap = Object
        .keys(funcBlob)
        .reduce(
          (acc, key) =>
            (acc[key] = {
              enumerable: true,
              value     : applyFn(funcBlob[key]),
            }, acc)
          , {}
        )
      // console.log(funcMap, funcBlob)
      Object.defineProperties(this, funcMap)
      // Object.assign(this, subtypesMap)
    }
    map(mapFunction: <T>(val: T) => T) {
      return UnionClass(this.chain(mapFunction))
    }
    chain(chainFunction: (val: *) => UnionClass) {
      return chainFunction(this.toJSON())
    }
    static contramap<T, S>(prependFunction: (...vals: S[]) => T) {
      function preprocessed(...data: S[]) {
        const preprocessResult = prependFunction(...data)
        return UnionClass(preprocessResult)
      }
      copyProps(UnionClass, preprocessed)
      return preprocessed
    }
    @nonenumerable
    case(cases: {[string]: (val: *) => *}) {
      return UnionClass.case(cases, this)
    }

    static case(cases: {[string]: (val: *) => *}, subtype: *) {
      if (!subtype) return (subtype: *) => UnionClass.case(cases, subtype)

      const {
        _ = defaultCase,
        ...realCases
      } = cases
      const diff = difference(Object.keys(realCases), keys)
      if (!isEmpty(diff)) {
        throw new Error(`Unrelevant case types ${diff.toString()} on type ${typeName}`)
      }
      if (isMezzanine(subtype) && (subtype.ಠ_ಠ === uniqMark)) {
        const currentCase = realCases[subtype.type]
        if (typeof currentCase === 'function')
          return currentCase(subtype.toJSON(), UnionClass)
        else return _(subtype)
      }
      for (const variant of Object.keys(realCases)) {
        const childType = subtypesMap[variant]
        const currentCase = realCases[variant]
        if (childType.is(subtype)) {
          const finalValue = childType.ಠ_ಠ === subtype.ಠ_ಠ
            ? subtype
            : childType(subtype)
          return currentCase(finalValue.toJSON(), UnionClass)
        }
      }
      return _(subtype)
    }
  }
  Object.assign(UnionType, subtypesMap)
  const UnionClass = UnionType
  return UnionClass
}

const defaultCase = (instance: *) => {
  throw new Error(`Unmatched case on union ${instance.typeName}`)
}

const reflectProps = (uni: *, child: *) => {
  Object.assign(uni, child)
  //$FlowIssue
  Object.defineProperties(
    uni, {
      keys: {
        enumerable: false,
        get() {
          return child.keys
        }
      },
      isMono: {
        enumerable: false,
        get() {
          return child.isMono
        }
      },
      toJSON: {
        enumerable: false,
        value() {
          return child.toJSON()
        }
      },
    })
}

export default Union

// const Boy = Type`Boy`({
//   name: String,
//   alive: Boolean
// }, {
//   mutableKill: (ctx) => () => { ctx.alive = false }
// })

// // mutable function
// const Fred = Boy({ name: 'Fred', alive: true })
// Fred

// Fred.mutableKill()
// Fred



// const Brothers = Type`Brothers`({
//   elder  : Boy,
//   younger: Boy
// })
// const Childs = Union`Childs`({
//   Single: Boy,
//   Couple: Brothers,
// })

// const rawData = { name: 'Fred' }
// // Fred.equals(Boy({ name: 'Fred', alive: true })); /*?*/
// // Fred.equals(rawData) /*?*/

// //transforms
// // Fred.map(({ name }) => ({ name: name+'dy' }))/*?*/

// // deep patterns
// const family1 = Childs({ name: 'John', alive: true })
// const family2 = Childs({
//   elder  : Fred,
//   younger: { name: 'Bob', alive: true }
// })


// family2 /*?*/

// const onlyOne = family2.map((data) =>( console.log(data), data, family2));
// onlyOne

// family1.type; /*?*/
// family2.type; /*?*/
// onlyOne.type; /*?*/

// [...family1].map(([key,value])=>key)/*?*/
// //pattern-switch
// const actions = {
//   Single:({ value: child }) => child.name,
//   Couple:({ value: childs }) => [childs.elder.name, childs.younger.name]
// }

// // family2.case(actions)/*?*/
// // family1.case(actions)/*?*/
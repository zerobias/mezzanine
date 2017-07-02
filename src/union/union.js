//@flow

/**
 * Union of types
 *
 * @module mezzanine/union
 */


import { zip, difference, isEmpty, values as getValues } from 'ramda'

import Type, { typeContainer } from '../type'
import isOrthogonal from '../ortho'
import { copyProps, rename } from '../decorators'
import { typeMark } from '../config'
import { isMezzanine } from '../type/fixtures'
import { addProperties } from '../utils/props'
import { curry2 } from '../utils/fp'

import { type FieldMap } from '../utils/props'

/* eslint-disable */

export interface UnionType extends Iterable<[string, *]> {
  ಠ_ಠ: Symbol,
  keys: string[],
  isMono: boolean,
  typeName: string,


  toJSON(): mixed,
  is(val: mixed): boolean,
  map(mapFunction: <T>(val: T) => T): UnionType,
  case(cases: {[string]: (val: mixed) => mixed}): mixed,
  chain<T>(chainFunction: (val: T) => UnionType): UnionType,
}

export interface UnionStatic extends Iterable<[string, *]> {
  (data: *): UnionType,
  $call(data: *): UnionType,

  ಠ_ಠ: Symbol,
  keys: string[],
  isMono: boolean,
  typeName: string,


  toJSON(): Object,
  is(val: mixed): boolean,
  case(cases: {[string]: (val: mixed) => mixed}): (subtype: *) => mixed,
  case(cases: {[string]: (val: mixed) => mixed}, subtype: *): mixed,
  contramap<T, S>(prependFunction: (...vals: S[]) => T): (...data: S[]) => UnionStatic
}


const staticFantasy = addProperties({
  contramap:  (ctx: UnionStatic) =>
    function contramap<T, S>(prependFunction: (...vals: S[]) => T) {
      function preprocessed(...data: S[]) {
        const preprocessResult = prependFunction(...data)
        return ctx(preprocessResult)
      }
      copyProps(ctx, preprocessed)
      return preprocessed
    }
})

const instanceFantasy = addProperties({
  map: (ctx: UnionType, Ctx: UnionStatic) =>
    function map(mapFunction: <T>(val: T) => T) {
      return Ctx(ctx.chain(mapFunction))
    },
  chain: (ctx: UnionType, Ctx: UnionStatic) =>
    function chain(chainFunction: (val: mixed) => UnionType) {
      return chainFunction(ctx.toJSON())
    },
})

const subclassReference = addProperties({
  keys: (_: any, child) => child.keys,
  isMono: (_: any, child) => child.isMono,
  toJSON: (_: any, child) =>  child.toJSON(),
})


/**
 * Make type union
 * @param {string} typeName
 *
 * @example
 * Union`User`({ Account: String, Guest: {} })
 */
const Union = ([typeName]: string[]) =>
(desc: {[name: string]: *}, funcBlob: FieldMap = {}) => {
  const canMatch = isOrthogonal(desc)

  const uniqMark = Symbol(typeName)

  const keys = Object.keys(desc)
  const values = getValues(desc)
  const subtypes = zip(keys, values)
  const subtypesMap = {}
  for (const [key, arg] of subtypes)
    subtypesMap[key] = rename(key)(typeContainer(key, typeName, arg, {}))

  function* iterator() {
    for (const key of keys)
      yield ([key, subtypesMap[key]])
  }
  function is(val: *) {
    for (const [key, pattern] of iterator()) {
      if (pattern.is) {
        if (pattern.is(val)) return true
      } else if (typeof pattern === 'function' && pattern(val))
        return true
    }
    return false
  }
  const caseWith =
    curry2(function caseWith(cases: {[string]: (val: *) => *}, subtype: *) {
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
    })

  const staticProps = addProperties({
    funcs: {
      get: () => funcBlob,
      enumerable: false,
    },
    name: {
      value: typeName,
      enumerable: false,
    },
    case: {
      value: caseWith,
      enumerable: false,
    },
  })

  const mainProps = addProperties({
    ಠ_ಠ: {
      value     : uniqMark,
      enumerable: false,
    },
    //$FlowIssue
    [typeMark]: {
      get: () => true,
      enumerable: false,
    },
    //$ FlowIssue
    [Symbol.iterator]: () => iterator,
    is: {
      value: () => is,
      inject: true,
      enumerable: true,
    },
    typeName: {
      value     : typeName,
      enumerable: true,
    },
    canMatch: {
      value     : canMatch,
      enumerable: true,
    },
    types: {
      value: keys,
      enumerable: true,
    },
  })

  const instProps = addProperties({
    case: (ctx: UnionType) =>
      (cases: {[string]: (val: mixed) => mixed}) =>
        caseWith(cases, ctx),
  })

  const userMeth = addProperties(funcBlob)

  //$FlowIssue
  function UnionClass(arg: *): UnionType {
    //$FlowIssue
    if (new.target !== UnionClass)
      return new UnionClass(arg)
    const data = arg && arg.value
      ? arg.value
      : arg;
    let matched = false
    for (const [key, pattern] of iterator()) {
      if (pattern.is(data)) {
        const fin = pattern(data)
        Object.assign(this, fin)
        subclassReference(this, fin)
        if (fin.isMono)
          this.value = fin.value
        matched = true
        break
      }
    }
    if (!matched)
      throw new TypeError('Unmatched pattern')

    instProps(this, UnionClass)
    mainProps(this, UnionClass)
    instanceFantasy(this, UnionClass)
    userMeth(this, UnionClass)
  }

  staticProps(UnionClass, UnionClass)
  mainProps(UnionClass, UnionClass)
  staticFantasy(UnionClass, UnionClass)

  Object.assign(UnionClass, subtypesMap)
  console.log(UnionClass)
  return UnionClass
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
// const Fred = Boy({ name: 'Fred', alive: true })
// console.log(Fred)

// Fred.mutableKill()
// console.log(Fred)



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

// deep patterns
// const family1 = Childs({ name: 'John', alive: true })
// const family2 = Childs({
//   elder  : Fred,
//   younger: { name: 'Bob', alive: true }
// })
// console.log(family2)

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

// console.log(family2.case(actions))
// // family1.case(actions)/*?*/
//@flow

/**
 * Union of types
 *
 * @module mezzanine/union
 */


import { zip, difference, isEmpty, values as getValues } from 'ramda'

import /*Type, */{ typeContainer } from '../type'
import isOrthogonal from '../ortho'
import { rename } from '../decorators'
import { typeMark } from '../config'
import { isMezzanine } from '../type/fixtures'
import { addProperties } from '../utils/props'
import { type TypeRecord } from '../type/type-container'
import { createBuilder, createPred, transformInput } from '../type/descriptor'
import { curry2 } from '../utils/fp'
import { append } from '../utils/list'

import { type FieldMap } from '../utils/props'
import { getInitialValue, applyStack } from '../virtual-stack'

/* eslint-disable */

//$FlowIssue
export interface UnionType extends Iterable<[string, *]> {
  ಠ_ಠ: Symbol,
  keys: string[],
  isMono: boolean,
  typeName: string,

  value: TypeRecord<any>,

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
  stackUpdate: (Ctx: UnionStatic) =>
    (newStack: Array<(val: mixed) => mixed>) => {
      //$FlowIssue
      const { typeName, desc, func } = Ctx
      return Union([typeName])(desc, func, newStack)
    },
  contramap: (Ctx: UnionStatic) =>
    function contramap<T, S>(prependFunction: (...vals: S[]) => T) {
      //$FlowIssue
      const newStack = append(prependFunction, Ctx.stack)
      //$FlowIssue
      const NewRecord = Ctx.stackUpdate(newStack)
      return NewRecord
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

const instProps = addProperties({
  case: (ctx: UnionType, Ctx: UnionStatic) =>
    (cases: {[string]: (val: mixed) => mixed}) =>
      Ctx.case(cases, ctx.value),
})

const subclassReference = addProperties({
  keys  : (_: any, child) => child.keys,
  isMono: (_: any, child) => child.isMono,
  toJSON(_: any, child) {
    if (typeof child.toJSON === 'function')
      return child.toJSON()
    return _.toJSON()
  },
})

function unrelevantCaseError(union: UnionStatic, diff: string[], data: *) {
  console.error(union)
  console.error(data)
  throw new Error(`Unrelevant case types ${diff.toString()} on type ${union.typeName}`)
}

function caseSelector(
  union: UnionStatic,
  subtypesMap: *,
  uniqMark: Symbol,
  cases: {[key: string]: (val: *) => *},
  subtype: *) {
  const {
    _ = defaultCase,
    ...realCases
  } = cases
  const diff = difference(Object.keys(realCases), union.types)
  if (!isEmpty(diff))
    unrelevantCaseError(union, diff, subtype)
  if (isMezzanine(subtype) && (subtype.ಠ_ಠ === uniqMark)) {
    const currentCase = realCases[subtype.type]
    // console.log(currentCase)
    if (typeof currentCase === 'function')
      return currentCase(subtype.toJSON(), union)
    else return _(subtype)
  }
  for (const variant of Object.keys(realCases)) {
    const childType = subtypesMap[variant]
    const currentCase = realCases[variant]
    if (childType.is(subtype)) {
      const finalValue = childType.ಠ_ಠ === subtype.ಠ_ಠ
        ? subtype
        : childType(subtype)
      return currentCase(finalValue.toJSON(), union)
    }
  }
  return _(subtype)
}

//$FlowIssue
const caseFactory = (union: UnionStatic, subtypesMap: *, uniqMark: Symbol) =>
  (cases: {[key: string]: (val: *) => *}, subtype: *) =>
    caseSelector(union, subtypesMap, uniqMark, cases, subtype)

/**
 * Make type union
 *
 * @param {string[]} [typeName]
 * @returns
 *
 * @example
 * Union`User`({ Account: String, Guest: {} })
 */
const Union = ([typeName]: string[]) => {
  return (
    desc: {[name: string]: *},
    funcBlob: FieldMap = {},
    stack: Array<(val: mixed) => mixed> = []
  ) => {
    const canMatch = isOrthogonal(desc)

    const uniqMark = Symbol(typeName)

    const keys = Object.keys(desc)
    const values = getValues(desc)
    const subtypes = zip(keys, values)
    const subtypesMap = {}
    for (const [key, arg] of subtypes)
      subtypesMap[key] = rename(key)(typeContainer(key, typeName, arg, {}))
    const caseWith = caseFactory(UnionClass, subtypesMap, uniqMark)
    function* iterator() {
      for (const key of keys)
        yield ([key, subtypesMap[key]])
    }
    const needTransform = stack.length !== 0
    function is(obj: *) {
      let val = obj
      if (needTransform === true) {
        const initial = getInitialValue(stack, val)
        if (initial.succ === false) return false
        val = initial.val
      }
      for (const [key, pattern] of iterator()) {
        if (pattern.is) {
          if (pattern.is(val)) return true
        } else if (typeof pattern === 'function' && pattern(val))
          return true
      }
      return false
    }


    const staticProps = addProperties({
      funcs: {
        value     : funcBlob,
        enumerable: false,
      },
      desc: {
        value     : desc,
        enumerable: false,
      },
      name: {
        value     : typeName,
        enumerable: false,
      },
      case: {
        value     : caseWith,
        enumerable: false,
      },
      stack: {
        value     : stack,
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
        get       : () => true,
        enumerable: false,
      },
      //$ FlowIssue
      [Symbol.iterator]: () => iterator,
      is               : {
        value     : () => is,
        inject    : true,
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
        value     : keys,
        enumerable: true,
      },
    })

    const userMeth = addProperties(funcBlob)

    //$FlowIssue
    function UnionClass(obj: *): UnionType {
      //$FlowIssue
      if (new.target !== UnionClass)
        return new UnionClass(obj)
      const arg = applyStack(stack, obj)
      const data = transformInput(obj, true)
      let matched = false
      for (const [key, pattern] of iterator()) {
        if (pattern.is(data)) {
          const fin = pattern(data)
          Object.assign(this, fin)
          if (fin.isMono)
            this.value = fin.value
          subclassReference(this, fin)
          matched = true
          break
        }
      }
      if (matched === false)
        unmatchError(UnionClass, data)

      instProps(this, UnionClass)
      mainProps(this, UnionClass)
      instanceFantasy(this, UnionClass)
      userMeth(this, UnionClass)
    }

    staticProps(UnionClass, UnionClass)
    mainProps(UnionClass, UnionClass)
    staticFantasy(UnionClass, UnionClass)

    Object.assign(UnionClass, subtypesMap)
    // console.log(UnionClass)
    return UnionClass
  }
}
//$FlowIssue
function unmatchError(union: UnionStatic, data: mixed) {
  console.error(union)
  console.error(data)
  throw new TypeError('Unmatched pattern')
}

const defaultCase = (instance: *) => {
  throw new Error(`Unmatched case on union ${instance.typeName}`)
}

export default Union

// const Boy = Type`Boy`({
//   name: String,
//   alive: Boolean
// }, {
//   mutableKill: (ctx) => () => { ctx.alive = false }
// })

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
//   Single:(child) => child.name,
//   Couple:({ elder, younger }) => [elder.name, younger.name]
// }

// console.log(family2.case(actions))
// console.log(family1.case(actions))


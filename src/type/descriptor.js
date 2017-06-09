//@flow

import { map, is, when, equals, isNil } from 'ramda'
import { ensureProp } from './fixtures'

const isDirectlyEquals = (val: mixed): boolean %checks =>
     ['string', 'number', 'boolean'].indexOf(typeof val) !== -1
const isCheckByType = (val: mixed): boolean %checks =>
     val === String
  || val === Number
  || val === Boolean
// const doAtomicEqual = when(
//   isDirectlyEquals,
//   equals
// )

const isObject = (obj: mixed): boolean %checks =>
     typeof obj === 'object'
  && obj !== null

export const isMezzanine = (obj: mixed): boolean %checks =>
     (  typeof obj === 'function'
     || isObject(obj))
  && obj.ಠ_ಠ !== undefined

export const createPred = (val: $FlowIssue): Pred => {
  switch (true) {
    case isDirectlyEquals(val): return (obj: mixed) => obj === val
    case isCheckByType(val): return is(val)
    case isMezzanine(val): return (obj: mixed) => val.is(obj)
    case typeof val === 'function': return val
    case isNil(val): return isNil
    case typeof val === 'object': return reducePred(map(createPred, val))
    default: return val
  }
}

export const createBuilder = (val: $FlowIssue, data: *): * => {
  switch (true) {
    case isDirectlyEquals(val): return data
    case isCheckByType(val): return data
    case isMezzanine(val): return val(data)
    case typeof val === 'function': return data
    case isNil(val): return data
    case typeof val === 'object': return reduceBuilder(val, data)
    default: return data
  }
}

const reduceBuilder = (predMap: PredMap, data: {[string]: *}) =>
  Object
    .keys(predMap)
    .reduce(
      (acc, key: string) =>
        (acc[key] =
          createBuilder(predMap[key], data[key]),
          acc)
      , {})

type Pred = (val: *) => boolean
type PredMap = {[key: string]: Pred}
type ReducePred = (predMap: PredMap) => Pred
const reducePred: ReducePred = (predMap) => {
  const keys = Object.keys(predMap)
  return function validatePredicate(val: {[key: string]: *}) {
    if (val == null) return false
    return keys.reduce(
      (acc: boolean, key: string): boolean => acc
        ? predMap[key](val[key])
        : acc
      , true)
  }
}

export const transformInput = (val: mixed, isMono: boolean) => {
  switch (true) {
    case isMono === false         : return val
    case isMezzanine(val)         : return { value: val }
    case !isObject(val)           : return { value: val }
    case !ensureProp('value', val): return { value: val }
    default                       : return val
  }
}

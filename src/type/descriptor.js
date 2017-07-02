//@flow
import { map, is, isNil, where, prop, has } from 'ramda'

import { isObject, isMezzanine } from './fixtures'
import { type TypeRecord } from './type-container'

export type Pred = <+T>(val: T) => boolean
type PredMap = {[key: string]: Pred}
type ReducePred = (predMap: PredMap) => Pred
//$FlowIssue
const reducePred: ReducePred = where

export function createPred<T>(val: T): Pred {
  switch (true) {
    case isDirectlyEquals(val): return (obj: mixed) => obj === val
    case isCheckByType(val): return is(val)
    case isMezzanine(val): {
      //$FlowIssue
      const cast: TypeRecord<T> = (val: any)
      return (obj: mixed) => cast.is(obj)
    }
    case typeof val === 'function': {
      const cast: Pred = (val: any)
      return cast
    }
    case isNil(val): return isNil
    case typeof val === 'object': {
      const cast: {[key: string]: T} = (val: any)
      const mapped: {[key: string]: Pred} = map(createPred, cast)
      return reducePred(mapped)
    }
    default: {
      const cast: Pred = (val: any)
      return cast
    }
  }
}
export function createBuilder(val: $FlowIssue, data: $FlowIssue): * {
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
function reduceBuilder<T, Data: {[id: string]: T}>(predMap: PredMap, data: Data) {
  const keys = Object.keys(predMap)
  const result: {[key: string]: any} = {}
  for (let i = 0, ln = keys.length; i < ln; ++i) {
    const key = keys[i]
    const keyPred = predMap[key]
    const nestedData = prop(key, data)
    result[key] = createBuilder(keyPred, nestedData)
  }
  return result
}

export function transformInput(val: any, isMono: boolean) {
  switch (true) {
    case isMono === false         : return val
    case isMezzanine(val)         : return { value: val }
    case !isObject(val)           : return { value: val }
    case !(has('value', val))     : return { value: val }
    default                       : return val
  }
}
const isDirectlyEquals = (val: mixed): boolean %checks =>
  typeof val === 'string'
  || typeof val === 'number'
  || typeof val === 'boolean'
const isCheckByType = (val: mixed): boolean %checks =>
  val === String
  || val === Number
  || val === Boolean
  || val === Function
  || val === Array

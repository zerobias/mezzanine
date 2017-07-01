//@flow
import { map, is, isNil, where, prop, assoc, mapObjIndexed } from 'ramda'

import { ensureProp, isObject, isMezzanine } from './fixtures'
import { type TypeRecord } from './type-container'
import { Check, Rule } from '../validation'
export function createPred<T>(val: T): Pred {
  switch (true) {
    case isDirectlyEquals(val): return (obj: mixed) => obj === val
    case isCheckByType(val): return is(val)
    case isMezzanine(val): {
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
export function createBuilder(val: $FlowIssue, data: *): * {
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
  return mapObjIndexed(
    (val, key: string) =>
      createBuilder(
        val,
        prop(key, data)),
    predMap)
}
export type Pred = <+T>(val: T) => boolean
type PredMap = {[key: string]: Pred}
type ReducePred = (predMap: PredMap) => Pred
//$FlowIssue
const reducePred: ReducePred = where
export function transformInput(val: any, isMono: boolean) {
  switch (true) {
    case isMono === false         : return val
    case isMezzanine(val)         : return { value: val }
    case !isObject(val)           : return { value: val }
    case !ensureProp('value', val): return { value: val }
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
const checkByTypeCheck: Check<'check by type'> = new Check(
  isCheckByType,
  () => 'sholud check by type',
  'check by type')
const checkByType: Rule<'check by type'> = new Rule(
  'check by type',
  () => 'sholud check by type',
  [checkByTypeCheck]
)
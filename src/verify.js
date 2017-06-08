//@flow
'use strict'

import { is } from 'ramda'

import { typeMark } from './config'

const nativeTypes: NativeType[] = [
  String, Number, Boolean, Object, Array, Function, RegExp, Symbol
]

type NativeType =
    typeof Number
  | typeof String
  | typeof Boolean
  | typeof Object
  | typeof Array
  | typeof Function
  | typeof RegExp
  | typeof Symbol

type Pred = (input: *, dataKey: ?string) => boolean

interface Model {
  +ಠ_ಠ: Symbol,
  +keys: string[],
  is(val: *): boolean,
  // [key: string]: *,
}

type Proof =
    NativeType
  | Pred
  | Model
  | { +[key: string]: Model | NativeType | Pred }

// interface ModelCheck {
//   ()
// }

const proofCase = {
  native: (rule: NativeType | mixed): boolean %checks =>
       rule === Number
    || rule === String
    || rule === Boolean
    || rule === Object
    || rule === Array
    || rule === Function
    || rule === RegExp
    || rule === Symbol,
  func : (rule: mixed): boolean %checks => typeof rule === 'function',
  model: (rule: *): boolean %checks => (
       typeof rule === 'function'
    && rule.ಠ_ಠ !== undefined
    && typeof rule.is === 'function'),
  obj: (rule: mixed): boolean %checks => typeof rule === 'object',
}

export const isSingleProof = (proof: *): boolean %checks =>
    //  proofCase.model(proof)
     proofCase.native(proof)
  || proofCase.func(proof)

export const isSingleAlike = (proof: *): boolean %checks =>
     typeof proof === 'object'
  && Object.keys(proof).length === 1
  && Object.keys(proof)[0] === 'value'

export const validateMono =
  (proof: Proof) =>
    (data: mixed, dataKey: ?string) => {
      if (proof === Number
        || proof === String
        || proof === Boolean
        || proof === Object
        || proof === Array
        || proof === Function
        || proof === RegExp
        || proof === Symbol) return is(proof, data)
      else if (typeof proof === 'function'
        && proof.ಠ_ಠ !== undefined
        && typeof proof.is === 'function')
        return proof.is(data)
      else if (typeof proof === 'function') return proof(data, dataKey)
      return false
    }

const canAccessKeys = (data: *): %checks =>
     typeof data === 'object'
  || proofCase.model(data)

function validate(proof: Proof, data: mixed, dataKey: ?string): boolean {
  // console.log(proof, data) /*?*/
  if (data === '=')
    console.log(
      proof,
      data,
      proof.is && proof.is({ value: data }) ||
      typeof proof === 'function' && proof({ value: data }))
  if (proofCase.native(proof)) return is(proof, data)
  if (proofCase.model(proof)) return proof.is(data)
  if (proofCase.func(proof)) return proof(data, dataKey)
  if (proof == null) return false
  if (data == null) return false
  // typeof proof/*?*/
  if (proofCase.obj(proof) && (canAccessKeys(data))) {
    ((proof): {+[key: string]: Proof})
    const tProof: {+[key: string]: Proof} = (proof: any)
    const typeKeys = Object.keys(tProof)
    if (typeKeys.length === 0) return true
    for (const typeKey of typeKeys) {
      const rule: Proof = tProof[typeKey]
      const property = data[typeKey]
      const result = validate(rule, property, typeKey)
      if (!result) return false
    }
    return true
  }
  return false
}

export default validate

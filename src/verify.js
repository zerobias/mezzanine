//@flow
'use strict'

import { is } from 'ramda'

import { typeMark } from './config'

const nativeTypes: NativeType[] = [
  String, Number, Boolean, Object, Array, Function, RegExp
]

type NativeType =
    typeof Number
  | typeof String
  | typeof Boolean
  | typeof Object
  | typeof Array
  | typeof Function
  | typeof RegExp

type Pred = (input: *, dataKey: ?string) => boolean

type Model = { [typeMark]: true, [key: string]: * }

type Proof =
    NativeType
  | Pred
  | Model
  | { [key: string]: NativeType | Pred | Model }


const proofCase = {
  native: (rule) => nativeTypes.includes(rule),
  func  : (rule) => typeof rule === 'function',
  model : (rule) => !!rule[typeMark],
  obj   : (rule) => typeof rule === 'object',
}

export const isSingleProof = (proof: *): boolean =>
    //  proofCase.model(proof)
     proofCase.native(proof)
  || proofCase.func(proof)

export const isSingleAlike = (proof: *): boolean =>
     typeof proof === 'object'
  && Object.keys(proof).length === 1
  && Object.keys(proof)[0] === 'value'
/*const selectProofCase = (rule, property, typeKey: string, data) => {
  switch (true) {
    case proofCase.native(rule): {
      if (!is(rule, property)) return false
      break
    }
    case proofCase.func(rule): {
      if (!rule(property, typeKey, data)) return false
      break
    }
    case proofCase.model(rule): {
      if (!verify(rule, property)) return false
      break
    }
    default: return false
  }
  return true
}

function verify(proof: ?{+[key: string | typeof typeMark]: *}, data: ?mixed): boolean {
  if (data == null) return false
  if (proof == null) return false
  const isModel = proofCase.model(proof)
  if (isModel) {
    for (const [typeKey, rule] of proof) {
      const property = data[typeKey]
      const result = selectProofCase(rule, property, typeKey, data)
      if (!result) return false
    }
  } else {
    const typeKeys = Object.keys(proof)
    for (const typeKey of typeKeys) {
      const rule = proof[typeKey]
      const property = data[typeKey]
      const result = selectProofCase(rule, property, typeKey, data)
      if (!result) return false
    }
  }
  return true
}*/

export const validateMono =
  (proof: Proof) =>
    (data: mixed, dataKey: ?string) => {
      if (proofCase.native(proof)) return is(proof, data)
      if (proofCase.model(proof)) return proof.is(data)
      if (proofCase.func(proof)) return proof(data, dataKey)
      return false
    }

function validate(proof: Proof, data: mixed, dataKey: ?string) {
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
  if (proofCase.obj(proof) && (typeof data === 'object' || data[typeMark])) {
    const typeKeys = Object.keys(proof)
    if (typeKeys.length === 0) return true
    for (const typeKey of typeKeys) {
      const rule: Proof = proof[typeKey]
      const property = data[typeKey]
      rule
      property
      const result = validate(rule, property, typeKey)
      if (!result) return false
    }
    return true
  }
  return false
}

export default validate

type ShapeType = {
  _keys: string[],
  // [key: string]: *
}

//$FlowIssue
function Shape(shape: {[key: string]: *}): ShapeType {
  Object.assign(this, shape)
  //$FlowIssue
  this[typeMark] = true
  const keys = Object.keys(shape)

  //$FlowIssue
  Object.defineProperty(this, '_keys', {
    get() {
      return keys
    },
  })
  Object.defineProperty(this, Symbol.toPrimitive, {
    get() {
      return 'tagg'
    },
    enumerable: true,
  })
}

Shape.prototype.toJSON = function() {
  const result = Object.assign({}, this)
  result._keys = this._keys
  return result
}

Shape.prototype[Symbol.iterator] = function* () {
  for (const key of this._keys)
    yield [key, this[key]]
}

// Shape.prototype[Symbol.toPrimitive] = function() {
//   return ''
// }

Shape.prototype.toString = function() {
  return `Shape ${[...this._keys]}`
}

function ShapeFactory(shape: {[key: string]: *}): ShapeType {
  const result = new Shape(shape)
  return result
}

export { ShapeFactory as Shape }

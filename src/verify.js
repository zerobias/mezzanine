//@flow

import { is } from 'ramda'

export const typeSign = Symbol('type sign')

const nativeTypes = [
  String, Number, Boolean, Object, Array, Function
]

const proofCase = {
  native: (rule) => nativeTypes.includes(rule),
  func  : (rule) => typeof rule === 'function',
  model : (rule) => !!rule[typeSign],
}

const selectProofCase = (rule, property, typeKey: string, data) => {
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


function verify(proof: ?{+[key: string | typeof typeSign]: *}, data: ?mixed): boolean {
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
}

export default verify

type ShapeType = {
  _keys: string[],
  // [key: string]: *
}

//$FlowIssue
function Shape(shape: {[key: string]: *}): ShapeType {
  Object.assign(this, shape)
  //$FlowIssue
  this[typeSign] = true
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

//@flow

import { curryN, compose, contains } from 'ramda'
const isString = function(s) { return typeof s === 'string' }
const isNumber = function(n) { return typeof n === 'number' }
const isBoolean = function(b) { return typeof b === 'boolean' }
const isObject = function(value) {
  const type = typeof value
  return !!value && (type == 'object' || type == 'function')
}
const isFunction = function(f) { return typeof f === 'function' }
const isArray = Array.isArray || function(a) { return 'length' in a }

export const self = Symbol('reference')

const mapConstrToFn = function(group, constr) {
  if (constr === String)    return isString
  else if (constr === Number)    return isNumber
  else if (constr === Boolean)   return isBoolean
  else if (constr === Object)    return isObject
  else if (constr === Array)     return isArray
  else if (constr === Function)  return isFunction
  else if (constr === undefined || constr === self) return group
  else return constr
}

const numToStr = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']

const validate = function(group, validators, name: string, args) {
  let validator, v, i
  if (args.length > validators.length) {
    throw new TypeError(`too many arguments supplied to constructor ${
      name} (expected ${validators.length} but got ${args.length})`)
  }
  for (i = 0; i < args.length; ++i) {
    v = args[i]
    validator = mapConstrToFn(group, validators[i])
    if (Type.check === true &&
        (validator.prototype === undefined || !validator.prototype.isPrototypeOf(v)) &&
        (typeof validator !== 'function' || !validator(v))) {
      const strVal = typeof v === 'string'
        ? `'${v}'`
        : v // put the value in quotes if it's a string
      throw new TypeError(`wrong value ${strVal} passed as ${numToStr[i]} argument to constructor ${name}`)
    }
  }
}

function valueToArray(value) {
  const arr = []
  for (let i = 0; i < value._keys.length; ++i) {
    arr.push(value[value._keys[i]])
  }
  return arr
}

function extractValues(keys: string[], obj) {
  const arr = []
  for (let i = 0; i < keys.length; ++i) arr[i] = obj[keys[i]]
  return arr
}

function constructor(group, name: string, fields) {
  let validators: mixed[]
  const keys = Object.keys(fields)
  if (Array.isArray(fields)) {
    validators = fields
  } else {
    validators = extractValues(keys, fields)
  }
  function construct(...args: mixed[]) {
    const val = Object.create(group.prototype)
    Object.defineProperty(val, '_keys', {
      enumerable  : false,
      configurable: false,
      get() {
        return keys
      }
    })
    Object.defineProperty(val, '_name', {
      enumerable  : true,
      configurable: false,
      // get() {
      //   return name
      // }
      value: name
    })
    if (Type.check === true) {
      validate(group, validators, name, args)
    }
    for (let i = 0; i < args.length; ++i) {
      val[keys[i]] = args[i]
    }
    return val
  }
  group[name] = keys.length === 0 ? construct() : curryN(keys.length, construct)
  if (keys !== undefined) {
    group[`${name}Of`] = function(obj) {
      return construct(...extractValues(keys, obj))
    }
  }
}

function rawCase(type, cases, value, arg) {
  let wildcard = false
  let handler = cases[value._name]
  if (handler === undefined) {
    handler = cases['_']
    wildcard = true
  }
  if (Type.check === true) {
    if (!type.prototype.isPrototypeOf(value)) {
      throw new TypeError('wrong type passed to case')
    } else if (handler === undefined) {
      throw new Error('non-exhaustive patterns in a function')
    }
  }
  if (handler !== undefined) {
    const args = wildcard === true ? [arg]
             : arg !== undefined ? valueToArray(value).concat([arg])
             : valueToArray(value)
    return handler(...args)
  }
}

const typeCase = curryN(3, rawCase)
const caseOn = curryN(4, rawCase)

function createIterator() {
  return {
    idx: 0,
    val: this,
    next() {
      const keys = this.val._keys
      return this.idx === keys.length
        ? { done: true }
        : { value: this.val[keys[this.idx++]] }
    }
  }
}

function getValues<+T>(obj: T[] | {[key: string]: T}): T[] {
  return Array.isArray(obj)
    ? obj
    : Object.values(obj)
}
function isOrthogonal<+T>(desc: {[key: string]: T}) {
  const types = []
  for (const signature of Object.values(desc)) {
    const sigTypes = getValues(signature)
    if (contains(sigTypes, types))
      return false
    else
      types.push(sigTypes)
  }
  return true
}
function Type(desc) {
  let key, res, obj = {}
  obj.case = typeCase(obj)
  obj.caseOn = caseOn(obj)
  obj.canMatch = isOrthogonal(desc)
  const keyList = Object.keys(desc).sort(
    (a, b) => {
      const al = desc[a].length
      const bl = desc[b].length
      if (al === bl) return 0
      if (al > bl) return 1
      return -1
    })
  keyList
  obj.match = obj.canMatch
    ? (newVal) => {
      let i = 0
      do {
        try {
          const result = obj[`${keyList[i]}Of`](newVal)
          return result
        } catch (err) {}
        i+=1
      } while (i < keyList.length)
      throw new TypeError('Unmatched pattern')
    }
    : () => { throw new Error('Can not match on this type') }

  obj.prototype = {}
  obj.prototype[Symbol ? Symbol.iterator : '@@iterator'] = createIterator
  obj.prototype.case = function(cases) { return obj.case(cases, this) }
  obj.prototype.caseOn = function(cases) { return obj.caseOn(cases, this) }

  obj.prototype[Symbol.toPrimitive] = function(){ return this.toString() }
  obj.prototype.toString = function(){
    const objKeys = this._keys
    console.log(...objKeys)
    let keyVals = []
    if (objKeys.length === 0) keyVals.push('{ - }')
    else if (objKeys.length === 1) keyVals.push(objKeys[0])
    else keyVals = objKeys.map(key => `${key}:${this[key]}`)
    return `Union { ${keyVals.join(', ')} }`
  }

  for (key in desc) {
    res = constructor(obj, key, desc[key])
  }
  return obj
}

Type.check = true

Type.ListOf = function(T) {
  const List = Type({ List: [Array] })
  const innerType = Type({ T: [T] }).T
  const validate = List.case({
    List: function(array) {
      let n = 0
      try {
        for (; n < array.length; n++) {
          innerType(array[n])
        }
      } catch (e) {
        throw new TypeError(`wrong value ${array[n]} passed to location ${numToStr[n]} in List`)
      }
      return true
    }
  })
  return compose(validate, List.List)
}

export default Type

const CombinatorPart = Type({
  Ident: { '@@value': String },
  Code : { '@@value': String }
})

const Combinator = Type({
  Full : { name: CombinatorPart, code: CombinatorPart },
  Short: { name: CombinatorPart },
})

const val = Combinator.match({
  name: CombinatorPart.Ident('ok'),
  code: CombinatorPart.Code('ok'),
})

val
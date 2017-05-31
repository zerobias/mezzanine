//@flow
'use strict'

import { curryN, compose } from 'ramda'

import type { PropDescriptor, Descriptor } from './index.h'
import config from './config'
import typeInstance from './type-instance'

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

function validate(group, validators, name: string, args) {
  let validator, v, i
  if (args.length > validators.length) {
    throw new TypeError(`too many arguments supplied to constructor ${
      name} (expected ${validators.length} but got ${args.length})`)
  }
  if (args.length < validators.length) {
    throw new TypeError(`Lack of arguments supplied to constructor ${
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


function extractValues<T>(keys: string[], obj: Descriptor<T>): T[] {
  const ln = keys.length
  const arr = Array(ln)
  for (let i = 0; i < keys.length; ++i) arr[i] = obj[keys[i]]
  return arr
}

const fillCounter = (_: any, index: number) => index.toString(10)
const makeNumericArray = (ln: number) =>
  Array(ln|0)
    .fill(0)
    .map(fillCounter)



function TypeValue(args: Array<*>, keys: string[], name: string, typeName: string, parent: *) {
  const props: Array<[string, PropDescriptor<>]> = []
  props.push(
    ['_keys', {
      enumerable  : false,
      configurable: false,
      get() {
        return keys
      }
    }],
    ['_name', {
      enumerable  : true,
      configurable: false,
      value       : name,
    }],
    ['type', {
      enumerable  : true,
      configurable: false,
      value       : typeName,
    }],
  )
  // defineProperty(this, '_keys', {
  //   enumerable  : false,
  //   configurable: false,
  //   get() {
  //     return keys
  //   }
  // })
  // this._name = name
  // this.type = typeName
  for (let i = 0; i < args.length; ++i) {
    // defineProperty(this, keys[i], {
    //   enumerable  : true,
    //   configurable: false,
    //   value       : args[i],
    //   // get() {
    //   //   return name
    //   // }
    // })
    props.push([keys[i], {
      enumerable  : true,
      configurable: false,
      value       : args[i],
      // get() {
      //   return name
      // }
    }])
  }
  const objType = props.reduce((acc, [key, val]) => (acc[key] = val, acc), ({}: { [string]: * }))
  return Object.defineProperties(Object.create(parent), objType)
  // defineProperty(val, 'type', {
  //   enumerable  : true,
  //   configurable: false,
  //   get() {
  //     return typeName
  //   }
  //   // value: name
  // })
}

function constructor<T>(typeName: string, group: *, name: string, fields: T[] | Descriptor<T>) {
  let validators: T[], keys: string[]
  if (Array.isArray(fields)) {
    validators = fields
    keys = makeNumericArray(fields.length | 0)
  } else {
    keys = Object.keys(fields)
    validators = extractValues(keys, fields)
  }

  function construct(...args: mixed[]) {
    const val = TypeValue(args, keys, name, typeName, group.prototype)
    if (Type.check === true) {
      validate(group, validators, name, args)
    }
    // for (let i = 0; i < args.length; ++i) {
    //   val[keys[i]] = args[i]
    // }
    return val
  }
  group[name] = keys.length === 0
    ? construct()
    : curryN(keys.length, construct)
  if (keys !== undefined) {
    group[`${name}Of`] = function(obj) {
      return construct(...extractValues(keys, obj))
    }
  }
}

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


function Type<-T>(typeData: string | Descriptor<T>, descData: Descriptor<T>) {
  let typeName: string, desc: Descriptor<T>
  if (typeof typeData === 'string') {
    typeName = typeData
    desc = (descData: Descriptor<T>)
  } else {
    typeName = 'Type'
    desc = (typeData: Descriptor<T>)
  }
  const keyList = Object.keys(desc).sort(
    (a, b) => {
      const al = desc[a].length
      const bl = desc[b].length
      if (al === bl) return 0
      if (al > bl) return 1
      return -1
    })

  const obj = typeInstance(keyList, desc)
  obj


  keyList


  const typeProto = {
    canMatch         : obj.canMatch,
    [Symbol.iterator]: createIterator,
    case(cases) {
      return obj.case(cases, this)
    },
    caseOn(cases) {
      return obj.caseOn(cases, this)
    },
    //$FlowIssue
    get [Symbol.toPrimitive](){ return this.toString() },
    /*toString() {
      const objKeys = this._keys
      console.log(...objKeys)
      let keyVals = []
      if (objKeys.length === 0) keyVals.push('{ - }')
      else if (objKeys.length === 1) keyVals.push(objKeys[0])
      else keyVals = objKeys.map(key => `${key}:${this[key]}`)
      return `Union { ${keyVals.join(', ')} }`
    }*/
  }

  obj.prototype = typeProto
  /*obj.prototype.canMatch = obj.canMatch
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
  }*/

  for (const key of keyList)
    constructor(typeName, obj, key, desc[key])

  return obj
}

//$FlowIssue
Object.defineProperty(Type, 'check', {
  enumerable: true,
  get() {
    return config.check
  },
  set(check: bool) {
    config.check = check
  }
})

Type.check = true

Type.ListOf = function(T) {
  const List = Type({ List: [Array] })
  const innerType = Type({ T: [T] }).T
  const validateList = List.case({
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
  return compose(validateList, List.List)
}

export function TypeMatch(typeName: string[]) {
  const name = typeName.join('')
  return (desc: *) => {
    const instance = Type(name, desc)
    //$FlowIssue
    instance.match = instance.match.bind(instance)
    const match = instance.match
    Object.assign(match, instance)
    match._name = name
    return match
  }
}

export default Type

const CombinatorPart = TypeMatch`CombinatorPart`({
  Ident: { '@@value': String },
  Code : { '@@value': String }
})

const Combinator = TypeMatch`Combinator`({
  Full : { name: CombinatorPart, code: CombinatorPart },
  Short: { name: CombinatorPart },
})

const val = Combinator({
  name: CombinatorPart.Ident('ok'),
  code: CombinatorPart.Code('ok'),
})

const issue = Type({ Foo: { a: Number, b: Number } })
console.log(issue)
console.log(Combinator)
console.log(val)

const randomNumber = () => Math.floor((Math.random() * 1e8)) | 0
const randomString = () => randomNumber().toString(16)

function testing() {
  const typeA = randomString()
  const typeB = randomString()
  const typeName = randomString()
  const newType = {
    [typeA]: { a: Number, b: String },
    [typeB]: { c: Number, d: String },
  }
  const NewType = TypeMatch(typeName, newType)
  const results = Array(50)
  for (let i = 0; i < 25; i++)
    results[i] = NewType({ a: randomNumber(), b: randomString() })
  for (let i = 0; i < 25; i++)
    results[i + 25] = NewType({ c: randomNumber(), d: randomString() })
  return results
}

// for (let i = 0; i < 100; i++) testing()

const Update = Type('Update', {
  ChatUpdate: { chat_id: String, messages: Array },
  UserUpdate: { user_id: String, online: Boolean }
})

const SystemMessage = Type('Update', {
  Ack     : { id: Number, data: Object },
  LongPoll: { wait: Number }
})

const RpcMessage = TypeMatch`RpcMessage`({
  System : { _: String, msg: SystemMessage },
  Updates: { _: String, msg: Update },
})

/*const msg1 = RpcMessage({ _: 'ack', msg: { id: 0x1fd, data: {} } })
const msg2 = RpcMessage({ _: 'upd', msg: { chat_id: '123', messages: [] } })
const msg3 = RpcMessage({ _: 'poll', msg: { wait: 0 } })

msg1

msg2

msg3*/

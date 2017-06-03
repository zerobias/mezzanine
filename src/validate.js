//@flow
'use strict'

import config from './config'
import { ArgumentsCountError } from './error'

export const numToStr = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']

const isString = (s) => typeof s === 'string'
const isNumber = (n) => typeof n === 'number'
const isBoolean = (b) => typeof b === 'boolean'
const isObject = function(value) {
  const type = typeof value
  return !!value && (type === 'object' || type === 'function')
}
const isFunction = (f) => typeof f === 'function'
const isArray = Array.isArray
const isJsConstructor = (validator: *): bool => [
  String, Number, Boolean, Object, Array, Function
].includes(validator)

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

const validatorCheck =
  (validator: *, v: *) =>
    isFunction(validator) &&
    validator(v)

const prototypeCheck =
  (validator: *, v: *) =>
    validator.prototype !== undefined && validator.prototype.isPrototypeOf(v)

const typeCheck = (validator: *, v: *): boolean => {
  if (config.check !== true) return false
  return (
    prototypeCheck(validator, v) ||
    validatorCheck(validator, v)
  )
}

function validate(group: *,
                  validators: Array<*>,
                  name: string,
                  args: Array<*>) {
  const argLn = args.length
  if (argLn > validators.length) {
    throw new ArgumentsCountError(`Too many`, name, validators, args)
  }
  if (argLn < validators.length) {
    throw new ArgumentsCountError(`Lack of`, name, validators, args)
  }
  for (let i = 0; i < argLn; ++i) {
    const v = args[i]
    const validator = mapConstrToFn(group, validators[i])
    if (!typeCheck(validator, v)) {
      // put the value in quotes if it's a string
      const strVal = isString(v)
        ? `'${v}'`
        : v
      throw new TypeError(`wrong value ${strVal} passed as ${numToStr[i]} argument to constructor ${name}`)
    }
  }
}


export default validate

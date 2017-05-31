//@flow
'use strict'

import { curryN } from 'ramda'

import config from './config'

function valueToArray(value) {
  const arr = []
  for (let i = 0; i < value._keys.length; ++i) {
    arr.push(value[value._keys[i]])
  }
  return arr
}

function rawCase(type, cases, value, arg) {
  let wildcard = false
  let handler = cases[value._name]
  if (handler === undefined) {
    handler = cases['_']
    wildcard = true
  }
  if (config.check === true) {
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

export const typeCase = curryN(3, rawCase)
export const caseOn = curryN(4, rawCase)

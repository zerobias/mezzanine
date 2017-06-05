//@flow
'use strict'

import { contains } from 'ramda'

import type { Descriptor } from './index.h'

function getValues<+T: *>(obj: T[] | Descriptor<T>): T[] {
  return Array.isArray(obj)
    ? obj
    : Object.values(obj)
}

const isBuiltIn = (signature: *) => contains(signature, [String, Number, Function, Array, Object, RegExp])

function isOrthogonal<+T: *>(desc: Descriptor<T>) {
  const types: Array<*> = []
  const signatures = Object.values(desc)
  for (const signature of signatures) {
    if (contains(signature, types))
      return false
    else
      types.push(signature)
    /*if (Array.isArray(signature)) {
      const sigTypes = getValues(signature)
      if (contains(sigTypes, types))
        return false
      else
        types.push(sigTypes)
    } else if (typeof signature === 'object') {
      if (contains(signature, types))
        return false
      else
        types.push(signature)
    }*/
  }
  return true
}

export default isOrthogonal

const result = isOrthogonal({
  English: { '@@value': String, key: String },
  French : { '@@value': String, key: Number },
})

result


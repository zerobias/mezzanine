//@flow
'use strict'

import { contains, values } from 'ramda'

import type { Descriptor } from './index.h'


function isOrthogonal<+T: *>(desc: Descriptor<T>) {
  const types: Array<*> = []
  const signatures = values(desc)
  for (const signature of signatures) {
    if (contains(signature, types))
      return false
    types.push(signature)
  }
  return true
}

export default isOrthogonal

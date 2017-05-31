//@flow
'use strict'

import { typeCase, caseOn } from './raw-case'
import isOrthogonal from './ortho'

class TypeInstance {
  +canMatch: bool
  keyList: string[]
  case = typeCase(this)
  caseOn = caseOn(this)
  constructor(canMatch: bool, keyList: string[]) {
    //$FlowIssue
    this.canMatch = canMatch
    this.keyList = keyList
  }
}
class MatchableTypeInstance extends TypeInstance {
  canMatch: true
  static canMatch: true = true
  match(newVal: *){
    let i = 0
    do {
      try {
        const result = this[`${this.keyList[i]}Of`](newVal)
        return result
      } catch (err) {}
      i+=1
    } while (i < this.keyList.length)
    throw new TypeError('Unmatched pattern')
  }
}
class NonMatchableTypeInstance extends TypeInstance {
  canMatch: false
  static canMatch: false = false
  match(){ throw new Error('Can not match on this type') }
}

function typeInstance(keyList: string[], desc: *) {
  const canMatch = isOrthogonal(desc)
  return canMatch
    ? new MatchableTypeInstance(canMatch, keyList)
    : new NonMatchableTypeInstance(canMatch, keyList)
}

export default typeInstance

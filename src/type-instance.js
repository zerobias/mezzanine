//@flow
'use strict'

import { typeCase, caseOn } from './raw-case'
import isOrthogonal from './ortho'
import { UnmatchedPatternError } from './error'
class TypeInstance {
  +canMatch: bool
  keyList: string[]
  // case = typeCase(this)
  // caseOn = caseOn(this)
  constructor(canMatch: bool, keyList: string[]) {
    //$FlowIssue
    this.canMatch = canMatch
    this.keyList = keyList
  }
}

const matchExeption = (that: TypeInstance) =>
  function NoMatch() {
    throw new Error('Can not match on this type')
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

interface Matchable extends TypeInstance {
  +$call: (newVal: *) => *
}

const matchFabric = (that: TypeInstance) => {
  function TypeMatching(newVal: *) {
    let i = 0
    do {
      try {
        const key = that.keyList[i]
        const keyOf = `${key}Of`
        //$FlowIssue
        const result = that[keyOf](newVal)
        return result
      } catch (err) {}
      i+=1
    } while (i < that.keyList.length)
    throw new UnmatchedPatternError(newVal, JSON.stringify(that), i)
  }
  Object.setPrototypeOf(TypeMatching, TypeInstance)
  TypeMatching.case = typeCase(TypeMatching)
  TypeMatching.caseOn = caseOn(TypeMatching)
  return TypeMatching
}

function typeInstance(keyList: string[], desc: *): Matchable {
  const canMatch = isOrthogonal(desc)
  const classInstance = new TypeInstance(canMatch, keyList)
  const matchFn = canMatch
    ? matchFabric(classInstance)
    : matchExeption(classInstance)
  return Object.assign(matchFn, classInstance)
}

export default typeInstance

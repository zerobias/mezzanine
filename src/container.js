//@flow
'use strict'

import { nonenumerable, readonly, enumerable } from 'core-decorators'
import { zip, fromPairs } from 'ramda'

import verify, { isSingleProof } from './verify'
import { callableClass, omitNew, rename } from './decorators'
import { containerMark, typeMark } from './config'

const matchFabric =
  (that: *) => {
    function match(data: *) {
      const newVal = that.isMono
        ? transformMonoInput(data)
        : data
      let i = 0
      const ln = that._keys.length
      do {
        try {
          // const result = that[`${that._keys[i]}Of`](newVal)
          const result = that[that._keys[i]](newVal)
          if (result) return result
        } catch (err) {}
        i+=1
      } while (i < ln)
      throw new TypeError('Unmatched pattern')
    }
    const name = that._name || 'match'
    rename(name)(match)
    return match
  }

const canHaveProps = (val: *) =>
     (typeof val === 'object' && val !== null)
  || typeof val === 'function'

function transformMonoInput(input: *) {
  if (canHaveProps(input) && input.value !== undefined)
    return input
  return { value: input }
}

const makeContainer = (
  name: string,
  typeName: string,
  desc: *,
  isMono: boolean
) => {
  const keys = Object.keys(desc)
  const values = Object.values(desc)
  const subtypes = zip(keys, values)
  const uniqMark = Symbol(name)
  @omitNew
  // @callableClass(matchFabric)
  @rename(name)
  class Container {
    //$FlowIssue
    [typeMark] = true
    //$FlowIssue
    static [containerMark] = uniqMark

    //$FlowIssue
    static [typeMark] = true
    @enumerable
    static is(val: *) {
      const data = isMono
        ? transformMonoInput(val)
        : val
      return verify(desc, data)
    }
    //$FlowIssue
    [containerMark] = uniqMark
    is(val: *) {
      // if (!!val && val[containerMark] === uniqMark) return true
      const data = isMono
        ? transformMonoInput(val)
        : val
      return verify(desc, data)
    }

    @readonly
    _name: string = name
    static _name: string = name

    @readonly
    typeName: string = typeName

    // @readonly
    @nonenumerable
    get _keys(): string[] {
      return keys
    }

    @nonenumerable
    isMono: boolean = isMono
    // @readonly
    // @nonenumerable
    static get _keys(): string[] {
      return keys
    }

    constructor(obj: *) {
      const data = isMono
        ? transformMonoInput(obj)
        : obj
      if (!!data && data[containerMark] === uniqMark) return data
      if (!!data && !!data.value && data.value[containerMark] === uniqMark) return data
      // let i = 0
      // const ln = this._keys.length
      // do {
      //   try {
      //     // const result = that[`${that._keys[i]}Of`](data)
      //     const result = this[this._keys[i]](data)
      //     if (result) return result
      //   } catch (err) {}
      //   i+=1
      // } while (i < ln)

      if (!Container.is(data) && !Container.is(obj))  {
        console.log(Container, obj, desc)
        console.log(Container.is(data))
        throw new TypeError(`Unsafe pattern mismatch`)
      }
      for (const key of keys)
        //$FlowIssue
        this[key] = data[key]
    }
  }
  // for (const [key, arg] of subtypes)
  //   //$FlowIssue
  //   Container[key] = arg

  return Container
}

export const Type = ([typeName]: [string]) => (desc: {[name: string]: *}) => {
  const isMono = isSingleProof(desc)
  return makeContainer(typeName, typeName, desc, isMono)
}

export default makeContainer

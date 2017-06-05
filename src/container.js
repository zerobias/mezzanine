//@flow
'use strict'

import { nonenumerable, readonly, enumerable } from 'core-decorators'
// import { zip, tap } from 'ramda'

import toFastProps from './to-fast-props'
import verify, { isSingleProof } from './verify'
import { omitNew, rename } from './decorators'
import { containerMark, typeMark } from './config'
import Union from '../es/union';

const canHaveProps = (val: *) =>
     (typeof val === 'object' && val !== null)
  || typeof val === 'function'

function transformMonoInput(input: *) {
  if (canHaveProps(input) && input.value !== undefined)
    return input
  return { value: input }
}

// const normalizeMono = (input: *) =>
//   !!input && !!input.value
//     ? input.value
//     : input

/*const makeMonoType = (
  name: string,
  typeName: string,
  desc: *
) => {
  const uniqMark = Symbol(name)

  const check = validateMono(desc)

  @toFastProps
  @omitNew
  @rename(name)
  class Monotype {
    //$ FlowIssue
    [typeMark] = true
    //$ FlowIssue
    static [containerMark] = uniqMark

    //$ FlowIssue
    static [typeMark] = true

    @enumerable
    static is(data: *, field: ?string): * {
      return check(data, field)
    }

    @enumerable
    is(data: *): * {
      return check(data)
    }
    @nonenumerable
    isMono: boolean = true
    value: *
    constructor(data: *, field: ?string) {
      const val = normalizeMono(data)
      if (!check(val, field))  {
        throw new TypeError(`Unsafe pattern mismatch`)
      }
      this.value = val
    }

    static get _keys(): string[] {
      return ['value']
    }

    //$ FlowIssue
    * [Symbol.iterator]() {
      yield* this._keys
    }
  }

  return Monotype
}*/

const makeContainer = (
  name: string,
  typeName: string,
  desc: *,
  isMono: boolean
) => {


  const keys = Object.keys(desc)
  // const values = Object.values(desc)
  // const subtypes = zip(keys, values)
  const uniqMark = Symbol(name)

  @toFastProps
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
      //eslint-disable-next-line
      if (!!val) {
        if (val[containerMark] === uniqMark) return true
        if (!!val.value && val.value[containerMark] === uniqMark) return true
      }

      const data = isMono
        ? transformMonoInput(val)
        : val
      return verify(desc, data)
    }
    //$FlowIssue
    [containerMark] = uniqMark
    is(val: *) {
      // if (!!val && val[containerMark] === uniqMark) return true
      //eslint-disable-next-line
      if (!!val) {
        if (val[containerMark] === uniqMark) return true
        if (!!val.value && val.value[containerMark] === uniqMark) return true
      }
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
      //$FlowIssue
      if (!!data && data[containerMark] === uniqMark) return data
      if (!!data && !!data.value && data.value[containerMark] === uniqMark) return data

      if (!Container.is(data) && !Container.is(obj))  {
        console.log(Container, obj, desc)
        console.log(Container.is(obj), obj)
        throw new TypeError(`Unsafe pattern mismatch`)
      }
      for (const key of keys)
        //$FlowIssue
        this[key] = data[key]
      toFastProps(this)
    }
  }
  // for (const [key, arg] of subtypes)
  //   //$ FlowIssue
  //   Container[key] = arg

  return Container
}

/**
 * Make single type
 *
 * @param {string} typeName
 *
 * @example
 * Type`User`({ id: Number, name: String })
 */
export const Type = ([typeName]: [string]) => (desc: {[name: string]: *}) => {
  const isMono = isSingleProof(desc)
  return makeContainer(typeName, typeName, desc, isMono)
}

export default makeContainer

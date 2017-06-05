//@flow
'use strict'

import { nonenumerable, readonly, enumerable } from 'core-decorators'
import { map, is, when, equals } from 'ramda'

import toFastProps from './to-fast-props'
import verify, { isSingleProof } from './verify'
import { omitNew, rename, methodTag } from './decorators'
import { containerMark, typeMark } from './config'

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

    static get keys(): string[] {
      return ['value']
    }

    //$ FlowIssue
    * [Symbol.iterator]() {
      yield* this.keys
    }
  }

  return Monotype
}*/

//$FlowIssue
const makeStringDesc = when(
  is(String),
  equals
)

const makeContainer = (
  name: string,
  typeName: string,
  descriptor: *,
  isMono: boolean
) => {
  const desc = map(makeStringDesc, descriptor)

  const keys = Object.keys(desc)
  // const values = Object.values(desc)
  // const subtypes = zip(keys, values)
  const uniqMark = Symbol(name)

  @toFastProps
  @omitNew
  // @callableClass(matchFabric)
  @rename(name)
  class Type {
    @nonenumerable
    static ಠ_ಠ = true
    @nonenumerable
    ಠ_ಠ = true;
    //$FlowIssue
    [typeMark] = true
    //$FlowIssue
    static [containerMark] = uniqMark

    //$FlowIssue
    static [typeMark] = true
    @enumerable
    @methodTag`is${name}`
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

    @methodTag`is${name}`
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

    //$FlowIssue
    * [Symbol.iterator]() {
      yield* keys //TODO Replace with more useful values
    }

    @readonly
    type: string = name
    @readonly
    static type: string = name

    @readonly
    typeName: string = typeName

    // @readonly
    @nonenumerable
    get keys(): string[] {
      return keys
    }

    @nonenumerable
    static keys: string[] = keys

    @nonenumerable
    isMono: boolean = isMono
    @nonenumerable
    static isMono: boolean = isMono

    constructor(obj: *) {
      const data = isMono
        ? transformMonoInput(obj)
        : obj
      isMono && console.log('isMono', obj, data)
      //$FlowIssue
      if (!!data && data[containerMark] === uniqMark) return data
      if (!!data && !!data.value && data.value[containerMark] === uniqMark) return data

      if (!Type.is(data) && !Type.is(obj))  {
        console.log(Type, obj, desc)
        console.log(Type.is(obj), obj)
        throw new TypeError(`Unsafe pattern mismatch`)
      }
      for (const key of keys) {
        const rule = desc[key]
        const property = data[key]
        //$FlowIssue
        this[key] = rule && rule.ಠ_ಠ
          ? rule(property)
          : property
      }
      toFastProps(this)
    }
  }
  // for (const [key, arg] of subtypes)
  //   //$ FlowIssue
  //   Type[key] = arg

  return Type
}

/**
 * Make single type
 *
 * @param {string} typeName
 *
 * @example
 * Type`User`({ id: Number, name: String })
 */
export function Type([typeName]: [string]) {
  return (desc: {[name: string]: *}) => {
    const isMono = isSingleProof(desc)
    return makeContainer(typeName, typeName, desc, isMono)
  }
}

export default makeContainer

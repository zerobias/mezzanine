//@flow
'use strict'

import { nonenumerable, readonly, enumerable } from 'core-decorators'
import { map, is, when, equals, pick, merge } from 'ramda'

import toFastProps from './to-fast-props'
import verify, { isSingleProof } from './verify'
import { omitNew, rename, methodTag, fantasySpec } from './decorators'
import { typeMark } from './config'

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
    static ಠ_ಠ = uniqMark

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

interface TypeRecord<Schema>{
  is(val: *): boolean,
  toJSON(): Schema,
}

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

  // @toFastProps
  @omitNew
  @rename(name) //eslint-disable-next-line
  class Record implements TypeRecord<typeof descriptor> {
    static $call: (shape: *) => Record

    @nonenumerable
    static ಠ_ಠ = uniqMark
    @nonenumerable
    ಠ_ಠ = uniqMark;
    //$FlowIssue
    [typeMark] = true

    //$FlowIssue
    static [typeMark] = true

    toJSON(): {[key: string]: *} {
      return pick(keys, this)
    }

    @enumerable
    @methodTag`is${name}`
    static is(val: *): boolean {
      //eslint-disable-next-line
      if (!!val) {
        if (val.ಠ_ಠ === uniqMark) return true
        if (!!val.value && val.value.ಠ_ಠ === uniqMark) return true
      }

      const data = isMono
        ? transformMonoInput(val)
        : val
      //$FlowIssue
      return verify(desc, data)
    }

    @methodTag`is${name}`
    is(val: *): boolean {
      // if (!!val && val.ಠ_ಠ === uniqMark) return true
      //eslint-disable-next-line
      if (!!val) {
        if (val.ಠ_ಠ === uniqMark) return true
        if (!!val.value && val.value.ಠ_ಠ === uniqMark) return true
      }
      const data = isMono
        ? transformMonoInput(val)
        : val
      //$FlowIssue
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

    // @fantasySpec
    map(fn: <T>(val: T) => T): Record {
      return RecordStatic(fn(this.toJSON()))
    }

    //$FlowIssue
    ['fantasy-land/map'](fn: <T>(val: T) => T): Record {
      return RecordStatic(fn(this.toJSON()))
    }

    // @fantasySpec
    chain(fn: <T>(val: T) => Record): Record {
      return fn(this.toJSON())
    }

    // @fantasySpec
    extend(fn: (val: Record) => *): Record {
      return RecordStatic(fn(this))
    }

    // @fantasySpec
    static equals = (a: Record, b: Record): boolean => {
      return a.equals(b)
    }

    //$FlowIssue
    static ['fantasy-land/equals'] = (a: Record, b: Record): boolean => {
      return a.equals(b)
    }

    // @fantasySpec
    equals(val: Record): boolean {
      if (!RecordStatic.is(val)) return false
      const asTyped = RecordStatic.of(val)
      const json = this.toJSON()
      // console.log(this, val, asTyped)
      // console.log(json, asTyped.toJSON(), equals(json, val), keys)
      return equals(json, asTyped.toJSON())
    }

    //$FlowIssue
    ['fantasy-land/equals'](val: Record): boolean {
      if (!RecordStatic.is(val)) return false
      const asTyped = RecordStatic.of(val)
      const json = this.toJSON()
      return equals(json, asTyped.toJSON())
    }

    concat(val: *): Record {
      const struct = RecordStatic
        .of(val)
        .toJSON()
      return RecordStatic(merge(this.toJSON(), struct))
    }

    //$FlowIssue
    ['fantasy-land/concat'](val: *): Record {
      const struct = RecordStatic
        .of(val)
        .toJSON()
      return RecordStatic(merge(this.toJSON(), struct))
    }

    // @fantasySpec
    extract() {
      return this.toJSON()
    }
    //$FlowIssue
    ['fantasy-land/extract']() {
      return this.toJSON()
    }

    // @fantasySpec
    ap(m: *) {
      return m.chain(f => this.map(f))
    }
    //$FlowIssue
    ['fantasy-land/ap'](m: *) {
      return m.chain(f => this.map(f))
    }

    // @fantasySpec
    static of = (val: *): Record => {
      return val && (Record.ಠ_ಠ === val.ಠ_ಠ)
        ? val
        : RecordStatic(val)
    }
    //$FlowIssue
    static ['fantasy-land/of'] = (val: *): Record => {
      return val && (Record.ಠ_ಠ === val.ಠ_ಠ)
        ? val
        : RecordStatic(val)
    }

    constructor(obj: *) {
      //$ FlowIssue
      // this.toJSON = this.toJSON.bind(this)
      const data = isMono
        ? transformMonoInput(obj)
        : obj
      // isMono && console.log('isMono', obj, data)

      if (!!data && data.ಠ_ಠ === uniqMark) return data
      if (!!data && !!data.value && data.value.ಠ_ಠ === uniqMark) return data

      if (!RecordStatic.is(data) && !RecordStatic.is(obj))  {
        console.log(RecordStatic, obj, desc)
        console.log(RecordStatic.is(obj), obj)
        throw new TypeError(`Unsafe pattern mismatch`)
      }
      for (const key of keys) {
        const rule = desc[key]
        const property = data[key]
        // console.log(rule, property, (rule && rule.ಠ_ಠ))
        //$FlowIssue
        this[key] = (rule && rule.ಠ_ಠ)
          ? rule(property)
          : property
        // console.log(this[key])
      }
      toFastProps(this)
      // console.log(this)
    }
  }
  // for (const [key, arg] of subtypes)
  //   //$ FlowIssue
  //   Record[key] = arg

  const RecordStatic = Record

  return Record
}

/**
 * Make single type which
 * implements `fantasy-land` spec:
 * - Semigroup
 * - Setoid
 * - Functor
 * - Apply
 * - Applicative
 * - Chain
 * - Monad
 * - Extend
 * - Comonad
 *
 * @param {string} typeName
 *
 * @example
 * Record`User`({ id: Number, name: String })
 */
export function Type([typeName]: [string]) {
  return (desc: {[name: string]: *}) => {
    const isMono = isSingleProof(desc)
    return makeContainer(typeName, typeName, desc, isMono)
  }
}

export default makeContainer

// const Point = Type`Point`({
//   x: Number,
//   y: Number,
// })

// const data1 = { x: 1, y: 10 }
// const point1 = Point(data1)
// const point2 = Point(data1)

// point1.equals(point2)

//@flow

import { nonenumerable, readonly, enumerable } from 'core-decorators'
import { map, equals, pick, merge } from 'ramda'

import toFastProps from '../to-fast-props'
import { omitNew, rename, methodTag } from '../decorators'
import { isMezzanine, toJSON } from './fixtures'
import { typeMark } from '../config'
import { createBuilder, createPred, transformInput } from './descriptor'

import type { ContextMethod } from './index.h'




interface TypeRecord<Schema>{
  +ಠ_ಠ: Symbol,
  +keys: string[],
  is(val: mixed): boolean,
  toJSON(): Schema,
}

const makeContainer = <F>(
  name: string,
  typeName: string,
  descriptor: mixed,
  isMonoOld: boolean,
  func: {[name: string]: ContextMethod<*, F>}
) => {
  const desc: * = typeof descriptor !== 'object'
    ? { value: descriptor }
    : descriptor
  const keys = Object.keys(desc)
  const pred = createPred(desc)
  const isMono = keys.length === 1 && keys[0] === 'value'
  // const values = Object.values(desc)
  // const subtypes = zip(keys, values)
  const uniqMark = Symbol(name)

  // const plainCheck =

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
      return toJSON(this)
    }

    @enumerable
    @methodTag`is${name}`
    static is(val: *): boolean {
      const data = transformInput(val, isMono)
      if (data == null) return false
      if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return true
      return pred(data)
    }

    @methodTag`is${name}`
    is(val: *): boolean {
      const data = transformInput(val, isMono)
      if (data == null) return false
      if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return true
      return pred(data)
    }

    //$FlowIssue
    * [Symbol.iterator]() {
      for (const key of keys) //TODO Replace with more useful values
        yield ([key, this[key]])
    }

    @readonly
    type: string = name
    @readonly
    static type: string = name

    @nonenumerable
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

    map(mapFunction: <T>(val: T) => T): Record {
      return RecordStatic(mapFunction(this.toJSON()))
    }

    //$FlowIssue
    ['fantasy-land/map'](mapFunction: <T>(val: T) => T): Record {
      return RecordStatic(mapFunction(this.toJSON()))
    }

    chain(chainFunction: <T>(val: T) => Record): Record {
      return chainFunction(this.toJSON())
    }

    extend(extendFunction: (val: Record) => *): Record {
      return RecordStatic(extendFunction(this))
    }

    static equals = (a: Record, b: Record): boolean => a.equals(b)

    //$FlowIssue
    static ['fantasy-land/equals'] = (a: Record, b: Record): boolean => a.equals(b)

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

    extract() {
      return this.toJSON()
    }
    //$FlowIssue
    ['fantasy-land/extract']() {
      return this.toJSON()
    }

    ap(m: *) {
      return m.chain(f => this.map(f))
    }
    //$FlowIssue
    ['fantasy-land/ap'](m: *) {
      return m.chain(f => this.map(f))
    }

    static of = (val: *): Record => val && (Record.ಠ_ಠ === val.ಠ_ಠ)
        ? val
        : RecordStatic(val)
    //$FlowIssue
    static ['fantasy-land/of'] = (val: *): Record => val && (Record.ಠ_ಠ === val.ಠ_ಠ)
        ? val
        : RecordStatic(val)

    constructor(obj: *) {
      //$ FlowIssue
      // this.toJSON = this.toJSON.bind(this)
      const data = transformInput(obj, isMono)
      // isMono && console.log('isMono', obj, data)
      if (data == null) {
        throw new TypeError(`${name}{isMono: ${isMono}}: No value recieved`)
      }
      if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return data.value

      if (!pred(data))  {
        // console.log(RecordStatic, obj, desc)
        // console.log(pred(obj), obj)
        throw new TypeError(`${name}{isMono: ${isMono}}: Unsafe pattern mismatch\nKeys: ${Object.keys(data).toString()}\nValues: ${Object.values(data).toString()}`)
      }
      const dataResult = createBuilder(desc, data)
      for (const key of keys) {
        // console.log(rule, property, (rule && rule.ಠ_ಠ))
        //$FlowIssue
        this[key] = dataResult[key]
        // console.log(this[key])
      }
      funcDesc(this)
      toFastProps(this)
      // console.log(this)
    }
  }

  const RecordStatic = Record
  const funcDesc = ctx => {
    const funcMap = map(fn => ({
      enumerable: false,
      value     : fn(ctx, RecordStatic),
    }), func)
    Object.defineProperties(ctx, funcMap)
  }
  return Record
}



export default makeContainer

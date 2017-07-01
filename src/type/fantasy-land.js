//@flow

import { equals, merge } from 'ramda'
import { copyProps } from '../decorators'


export const fantasyMethods = {
  equals: (ctx, Record) => (val): boolean => {
    if (!Record.is(val)) return false
    const asTyped = Record.of(val)
    const json = ctx.toJSON()
    return equals(json, asTyped.toJSON())
  },
  concat: (ctx, Record) => (val) => {
    const struct = Record
      .of(val)
      .toJSON()
    return Record(merge(ctx.toJSON(), struct))
  },
  extract: (ctx) => function extract() { return ctx.toJSON() },
  ap     : (ctx) => function ap(m) { return m.chain(f => ctx.map(f)) },
  extend : (ctx, Record) => function extend(fn) { return Record(fn(ctx)) },
  chain  : (ctx) => (fn) => fn(ctx.toJSON()),
  map    : (ctx, Record) => (fn) => Record(fn(ctx)),
}

export const fantasyStatic = {
  of: (Record) => (val: *) =>
    val && (Record.ಠ_ಠ === val.ಠ_ಠ)
      ? val
      : Record(val),
  equals   : () => (a, b) => a.equals(b),
  contramap: (Record) => (fn) => {
    function preprocessed(...data: S[]) {
      const preprocessResult = fn(...data)
      return Record(preprocessResult)
    }
    copyProps(Record, preprocessed) //TODO replace copyProps
    return preprocessed
  },
}

export default fantasyMethods


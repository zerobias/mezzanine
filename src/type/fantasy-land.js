//@flow

import { equals, merge } from 'ramda'
import { append, cons } from '../utils/list'
import { type TypeRecord, type TypeStatic } from './type-container'


export const fantasyMethods = {
  equals: (ctx: TypeRecord<any>, Record: TypeStatic<any>) => (val: TypeRecord<any>): boolean => {
    if (!Record.is(val)) return false
    const asTyped = Record.of(val)
    const json = ctx.toJSON()
    return equals(json, asTyped.toJSON())
  },
  concat: (ctx: TypeRecord<any>, Record: TypeStatic<any>) => (val: TypeRecord<any>) => {
    const struct = Record
      .of(val)
      .toJSON()
    return Record(merge(ctx.toJSON(), struct))
  },
  extract: (ctx: TypeRecord<any>) => function extract() { return ctx.toJSON() },
  ap     : (ctx: TypeRecord<any>) =>
    function ap(m: TypeRecord<any>) { return m.chain(f => ctx.map(f)) },
  extend : (ctx: TypeRecord<any>, Record: TypeStatic<any>) =>
    function extend(fn: (val: TypeRecord<any>) => any) { return Record(fn(ctx)) },
  chain  : (ctx: TypeRecord<any>) =>
    (fn: (val: any) => TypeRecord<any>) =>
      fn(ctx.toJSON()),
  map    : (ctx: TypeRecord<any>, Record: TypeStatic<any>) =>
    (fn: (val: any) => TypeRecord<any>) =>
      Record(fn(ctx)),
}

export const fantasyStatic = {
  of: (Record: TypeStatic<any>) => (val: *) =>
    val && (Record.ಠ_ಠ === val.ಠ_ಠ)
      ? val
      : Record(val),
  equals   : () => (a: TypeRecord<any>, b: TypeRecord<any>) => a.equals(b),
  contramap: (Record: TypeStatic<any>) => (fn: *) => {
    //$FlowIssue
    const newStack = append(fn, Record.stack)
    //$FlowIssue
    const NewRecord = Record.stackUpdate(newStack)
    return NewRecord
  },
  map: (Record: TypeStatic<any>) => (fn: *) => {
    //$FlowIssue
    const newStack = cons(fn, Record.stack)
    //$FlowIssue
    const NewRecord = Record.stackUpdate(newStack)
    return NewRecord
  },
}

export default fantasyMethods


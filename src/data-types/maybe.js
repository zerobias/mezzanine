//@flow

import { complement, isNil } from 'ramda'

import Union from '../union'
import Type from '../type'


const id = <+T>(x: T): T => x


const Maybe = Union`Maybe`({
  Just   : complement(isNil),
  Nothing: isNil,
}, {
  map: (ctx, Ctx) => mapFunction => Ctx(ctx.case({
    Just   : mapFunction,
    Nothing: id
  })),
  chain: ctx => chainFunction => ctx.case({
    Just   : chainFunction,
    Nothing: () => ctx
  }),
  filter: (ctx, Ctx) => filterPredicate => ctx.chain(
    data => {
      const res = filterPredicate(data)
      const ret = res == null
        ? Ctx(null)
        : Ctx(data)
      return ret
    }
  ),
  reject: ctx => rejectPredicate => ctx.chain(
    data => rejectPredicate(data)
      ? Maybe(null)
      : Maybe(data)
  ),
})

export default Maybe

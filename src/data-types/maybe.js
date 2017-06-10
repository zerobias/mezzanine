//@flow

import { complement, isNil } from 'ramda'

import Union from '../union'
import Type from '../type'


const id = <+T>(x: T): T => x

const Just = Type`Just`(complement(isNil))
const Nothing = Type`Nothing`(isNil)

const Maybe = Union`Maybe`({ Just, Nothing }, {
  map: ctx => mapFunction => Maybe(ctx.case({
    Just   : mapFunction,
    Nothing: id
  })),
  chain: ctx => chainFunction => ctx.case({
    Just   : chainFunction,
    Nothing: () => ctx
  }),
  filter: ctx => filterPredicate => ctx.chain(
    data => filterPredicate(data)
      ? Maybe(data)
      : Maybe()
  ),
  reject: ctx => rejectPredicate => ctx.chain(
    data => rejectPredicate(data)
      ? Maybe()
      : Maybe(data)
  ),
})

export default Maybe

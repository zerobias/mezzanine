//@flow

import { complement, isNil } from 'ramda'

import Union from '../union'
import Type from '../type'


const id = <+T>(x: T): T => x

const Just = Type`Just`(complement(isNil))
const Nothing = Type`Nothing`(isNil)


const Maybe = Union`Maybe`({ Just, Nothing }, {
  map: ctx => fn => Maybe(ctx.case({
    Just   : fn,
    Nothing: id
  })),
  chain: ctx => fn => ctx.case({
    Just   : fn,
    Nothing: () => ctx
  }),
})

export default Maybe

//@flow



import { toPairs, pipe } from 'ramda'
import { toJSON } from './fixtures'
import { fantasyStatic, fantasyMethods } from './fantasy-land'


import { type FieldList } from '../utils/props'
import {
  type Descript,
  type TypeRecord,
} from './type-container'


type InstanceIterator =
  <Type: Descript>(ctx: TypeRecord<Type>) =>
    () => Iterable<[string, mixed]>

export const iterator: InstanceIterator =
  (ctx) => function* iterator() {
    for (const key of ctx.keys) //TODO Replace with more useful values
    //$FlowIssue
      yield ([key, ctx[key]])
  }



export const instanceInjectableProps = {
  toJSON: {
    value<Type: Descript>(ctx: TypeRecord<Type>) {
      //$FlowIssue
      return () => toJSON(ctx)
    },
    writable  : true,
    enumerable: false,
    inject    : true,
  },
  //$FlowIssue
  [Symbol.hasInstance]: (ctx: TypeRecord<any>) => (val: mixed) => ctx.is(val),
  //$ FlowIssue
  [Symbol.iterator]   : iterator,
}


const prepareFl = pipe(
  toPairs,
  //$ FlowIssue
  (arr: FieldList) => arr.concat(arr.map(([name, value]) => [`fantasy-land/${name}`, value])))

export const fantasyInstance = prepareFl(fantasyMethods)
export const fantasyOnClass = prepareFl(fantasyStatic)

//@flow
import { nonenumerable, readonly, enumerable } from 'core-decorators'

import { map, equals, values, unnest, fromPairs, toPairs, pipe, apply, evolve } from 'ramda'
import toFastProps from '../to-fast-props'
import { omitNew, rename, methodTag, copyProps } from '../decorators'
import { isMezzanine, toJSON } from './fixtures'
import { typeMark } from '../config'
import { createBuilder, createPred, transformInput } from './descriptor'
import { type Pred } from './descriptor'
import { type ContextMethod } from './index.h'
import { fantasyStatic, fantasyMethods } from './fantasy-land'
import { addLazyProperty, addProperties } from '../utils/props'
export type Descript =
  | typeof String
  | typeof Number
  | typeof Array
  | typeof Boolean
  | typeof Function
  | string
  | number
  | boolean
  | Pred
  | TypeRecord
  | {[id: string]: Descript }
export interface TypeRecord {
  +ಠ_ಠ: Symbol,
  +keys: string[],
  is(val: mixed): boolean,
  toJSON(): Schema,
  equals>(val: R | D | mixed): boolean,
  concat>(val: R | D): TypeRecord,
  extract(): Schema,
  ap>(m: R): R, //???
}
// export type FantasyMethods<Schema: Descript> = {
//   equals(ctx: TypeRecord<Schema>, Record: any): $PropertyType<TypeRecord<Schema>, 'equals'>
// }
function isType(pred: Pred, uniqMark: Symbol, isMono: boolean) {
  return function checkIsType(val: any): boolean {
    const data = transformInput(val, isMono)
    if (data == null) return false
    if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return true
    return pred(data)
  }
}
const makeContainer = <F>(
  name: string,
  typeName: string,
  descriptor: Descript,
  isMonoOld: boolean,
  func: {[name: string]: ContextMethod<*, F>}
) => {
  const desc: * =
    typeof descriptor !== 'object'
    || descriptor == null
      ? { value: descriptor }
      : descriptor
  const keys = Object.keys(desc)
  const pred = createPred(desc)
  const isMono = keys.length === 1 && keys[0] === 'value'
  // const values = values(desc)
  // const subtypes = zip(keys, values)
  const uniqMark = Symbol(name)
  const checkIs = isType(pred, uniqMark, isMono)
  function RecordFn<Type: Descript>(obj: any) {
    //$FlowIssue
    if (new.target == null)
      return new RecordFn(obj)
    const data = transformInput(obj, isMono)
    if (data == null) {
      throw new TypeError(`${name}{isMono: ${isMono.toString()}}: No value recieved`)
    }
    if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return data.value
    if (!pred(data))  {
      // console.log(RecordStatic, obj, desc)
      // console.log(pred(obj), obj)
      const mono = isMono.toString()
      const keysList = Object.keys(data).toString()
      const valuesList = values(data).toString()
      const message = `${name}{isMono: ${mono}}: Unsafe pattern mismatch\nKeys: ${keysList}\nValues: ${valuesList}`
      throw new TypeError(message)
    }
    // funcDesc(this)
    // getUserMethods(func)(this, RecordFn)
    // addProperties(staticProps)(RecordFn, RecordFn)
    // addProperties(mainProps)(RecordFn, RecordFn)
    addProperties(mainProps)(this, RecordFn)
    addProperties(instProps)(this, RecordFn)
    // fantasyOnClass(RecordFn, RecordFn)
    fantasyInstance(this, RecordFn)
    userMeth(this, RecordFn)
    const dataResult = createBuilder(desc, data)
    for (const key of keys) {
      // console.log(rule, property, (rule && rule.ಠ_ಠ))
      //$FlowIssue
      this[key] = dataResult[key]
      // console.log(this[key])
    }
    // funcDesc(this)
    // getUserMethods(func)(this, RecordFn)
    // addProperties(staticProps)(RecordFn, RecordFn)
    // addProperties(mainProps)(RecordFn, RecordFn)
    addProperties(mainProps)(this, RecordFn)
    addProperties(instProps)(this, RecordFn)
    // fantasyOnClass(RecordFn, RecordFn)
    fantasyInstance(this, RecordFn)
    userMeth(this, RecordFn)
    toFastProps(this)
  }
  const mainProps = {
    ಠ_ಠ: {
      value     : uniqMark,
      enumerable: true,
    },
    //$FlowIssue
    [typeMark]: {
      get: () => true,
      enumerable: true,
    },
    type: {
      value     : name,
      enumerable: true,
    },
    keys: {
      value   : keys,
      writable: true,
    },
    isMono: {
      get: () => isMono,
    },
    is: {
      value: checkIs
    }
  }
  const staticProps = {
    //$FlowIssue
    [Symbol.hasInstance]: {
      value(instance) {
        return checkIs(instance)
      },
    },
    name: {
      value: name
    }
  }
  const instProps = {
    typeName: {
      get: () => typeName
    },
    toJSON: {
      value() {
        return toJSON(this)
      },
      writable: true,
    },
    [Symbol.iterator]: {
      * value() {
        for (const key of keys) //TODO Replace with more useful values
          yield ([key, this[key]])
      }
    }
  }
  const userMeth = getUserMethods(func)
  addProperties(staticProps)(RecordFn, RecordFn)
  addProperties(mainProps)(RecordFn, RecordFn)
  addProperties(mainProps)(RecordFn.prototype, RecordFn)
  addProperties(instProps)(RecordFn.prototype, RecordFn)
  fantasyOnClass(RecordFn, RecordFn)
  fantasyInstance(RecordFn.prototype, RecordFn)
  userMeth(RecordFn.prototype, RecordFn)
  // console.log(RecordFn.prototype)
  return RecordFn
}
function getUserMethods(func: *) {
  const pairs = Object.getOwnPropertyNames(func)
  //$FlowIssue
    .concat(Object.getOwnPropertySymbols(func))
    .map(key => [key, { value: func[key], enumerable: true, writable: true, inject: true }])
  const methodMap = fromPairs(pairs)
  return addProperties(methodMap)
}
// function injectFantasy<O: Function, T>(name: string, method: (O, Class<O>) => T) {
//   return (object: O, enumerable?: boolean) => {
//     addLazyProperty(object, name, method, enumerable)
//     addLazyProperty(object, `fantasy-land/${name}`, method, enumerable)
//   }
// }
//$FlowIssue
const prepareFl = pipe(
  map(value => ({ value, enumerable: true, writable: true, inject: true })),
  e => {
    console.log('ppp', e)
    return e
  },
  toPairs,
  // map(([name, value]) => [[name, value], [`fantasy-land/${name}`, value]]),
  arr => arr.concat(arr.map(([name, value]) => [`fantasy-land/${name}`, value])),
  e=> {
    console.log('eee', ...e)
    return e
  },
  fromPairs)
console.log(fantasyMethods)
console.log(fantasyStatic)
const fantasyInstance = addProperties(prepareFl(fantasyMethods))
const fantasyOnClass = addProperties(prepareFl(fantasyStatic))
console.log(prepareFl(fantasyMethods))
console.log(prepareFl(fantasyStatic))
export default makeContainer
//@flow

import { map, values, fromPairs, toPairs, pipe } from 'ramda'
import toFastProps from '../to-fast-props'
import { isMezzanine, toJSON } from './fixtures'
import { typeMark } from '../config'
import { createBuilder, createPred, transformInput } from './descriptor'
import { type Pred } from './descriptor'
import { type ContextMethod } from './index.h'
import { fantasyStatic, fantasyMethods } from './fantasy-land'
import { addProperties } from '../utils/props'
import { type FieldList } from '../utils/props'
import { arrify } from '../utils/arrify'
import { append, tail } from '../utils/list'

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
  | TypeRecord<Descript>
  | {[id: string]: Descript }

export interface TypeRecord<Schema: Descript> {
  +ಠ_ಠ: Symbol,
  +keys: string[],
  is(val: mixed): boolean,
  toJSON(): Schema,
  equals(val: mixed): boolean,
  map<T>(fn: (val: Schema) => T): TypeRecord<T>,
  chain<T>(fn: (val: Schema) => TypeRecord<T>): TypeRecord<T>,
  // concat<R, D>(val: R | D): TypeRecord,
  // extract(): Schema,
  // ap<R>(m: R): R, //???
}

export interface TypeStatic<Schema: Descript> {
  $call(val: Schema): TypeRecord<Schema>,
  (val: Schema): TypeRecord<Schema>,
  +ಠ_ಠ: Symbol,
  +keys: string[],
  is(val: mixed): boolean,
  contramap<T>(prependFunction: (...vals: T[]) => Schema): TypeStatic<T>,
  of<T: Schema | TypeRecord<Schema>>(val: T): TypeRecord<Schema>,
  equals(a: TypeRecord<Schema>, b: TypeRecord<Schema>): boolean,
  // equals<R, D>(val: R | D | mixed): boolean,
  // concat<R, D>(val: R | D): TypeRecord,
  // extract(): Schema,
  // ap<R>(m: R): R, //???
}

function getInitialValue(stack: Array<(val: mixed) => mixed>, obj: any): {  val: mixed, succ: boolean } {
  let val = obj
  let succ = true
  try {
    val = applyStack(stack, val)
  } catch (err) {
    succ = false
    val = err.message
  }
  return { val, succ }
}

function isType(pred: Pred, uniqMark: Symbol, isMono: boolean, stack: Array<(val: mixed) => mixed>) {
  const needTransform = stack.length !== 0
  return function checkIsType(obj: any): boolean {
    let val = obj
    if (needTransform === true) {
      const initial = getInitialValue(stack, val)
      if (initial.succ === false) return false
      val = initial.val
    }
    const data = transformInput(val, isMono)
    if (data == null) return false
    if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark)
      return true
    return pred(data)
  }
}

const staticInjectableProps = addProperties({
  stackUpdate: (Static: any) => (newStack: Array<(val: mixed) => mixed>) => {
    const result = makeContainer(Static.name, Static.typeName, Static.desc, Static.func, newStack)
    return result
  },
  clone: (Static: any) => () =>
    makeContainer(Static.name, Static.typeName, Static.desc, Static.func, Static.stack)
})
/*function applyStack(stack: Array<(val: mixed) => mixed>, data: mixed, hist: mixed[]) {
  if (stack.length === 0)
    return data
  const fn = stack[0]
  const val = fn(data)
  const history = append(val, hist)
  const nextStack = tail(stack)
  return applyStack(nextStack, val, history)
}*/

function applyStack(stack: Array<(val: mixed) => mixed>, data: mixed) {
  const ln = stack.length
  if (ln === 0)
    return data
  const history = []
  let current = data
  for (let i = 0; i < ln; ++i) {
    const fn = stack[i]
    const val = fn(current)
    history.length = i + 1
    current = history[i] = val
  }
  return current
}
function makeContainer<F, Type: Descript>(
  name: string,
  typeName: string,
  descriptor: Descript,
  func: {[name: string]: ContextMethod<*, F>},
  stack: Array<(val: mixed) => mixed> = []
  //$FlowIssue
): TypeStatic<Type> {
  const desc: * =
    typeof descriptor !== 'object'
    || descriptor == null
      ? { value: descriptor }
      : descriptor
  const keys = Object.keys(desc)
  const pred = createPred(desc)
  const isMono = keys.length === 1 && keys[0] === 'value'
  const uniqMark = Symbol(name)
  const checkIs = isType(pred, uniqMark, isMono, stack)
  function RecordFn<Type: Descript>(arg: any) {
    //$FlowIssue
    if (new.target == null)
      return new RecordFn(arg)
    const obj = applyStack(stack, arg)
    const data = transformInput(obj, isMono)
    if (data == null) {
      throw new TypeError(`${name}{isMono: ${isMono.toString()}}: No value recieved`)
    }
    if (isMono && isMezzanine(data.value) && data.value.ಠ_ಠ === uniqMark) return data.value
    if (!pred(data))  {
      const mono = isMono.toString()
      const keysList = Object.keys(data).toString()
      const valuesList = values(data).toString()
      const message = `${name}{isMono: ${mono}}: Unsafe pattern mismatch\nKeys: ${keysList}\nValues: ${valuesList}`
      throw new TypeError(message)
    }

    const dataResult = createBuilder(desc, data)
    // console.log(data, obj, dataResult)
    for (const key of keys) {
      this[key] = dataResult[key]
      // console.log(this[key])
    }
    mainProps(this, RecordFn)
    instProps(this, RecordFn)
    fantasyInstance(this, RecordFn)
    userMeth(this, RecordFn)
    toFastProps(this)
  }
  const mainProps = addProperties({
    ಠ_ಠ: {
      value     : uniqMark,
      enumerable: false,
    },
    //$FlowIssue
    [typeMark]: {
      get       : () => true,
      enumerable: false,
    },
    type: {
      value     : name,
      enumerable: true,
    },
    keys: {
      value     : keys,
      enumerable: false,
    },
    isMono: {
      get       : () => isMono,
      enumerable: false,
    },
    is: {
      value     : checkIs,
      enumerable: true,
    }
  })
  const staticProps = addProperties({
    //$FlowIssue
    [Symbol.hasInstance]: {
      value(instance) {
        return checkIs(instance)
      },
      enumerable: false,
    },
    name: {
      value     : name,
      enumerable: false,
    },
    typeName: {
      value     : typeName,
      enumerable: false,
    },
    desc: {
      value     : descriptor,
      enumerable: false,
    },
    func: {
      value     : func,
      enumerable: false,
    },
    stack: {
      value     : stack,
      enumerable: false,
    },
  })
  const instProps = addProperties({
    typeName: {
      value     : typeName,
      enumerable: true,
    },
    toJSON: {
      value() {
        return toJSON(this)
      },
      writable  : true,
      enumerable: false,
    },
    [Symbol.iterator]: {
      * value() {
        for (const key of keys) //TODO Replace with more useful values
          yield ([key, this[key]])
      },
      enumerable: false,
    },
  })
  const userMeth = getUserMethods(func)
  staticProps(RecordFn, RecordFn)
  staticInjectableProps(RecordFn, RecordFn)
  mainProps(RecordFn, RecordFn)
  fantasyOnClass(RecordFn, RecordFn)
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

const prepareFl = pipe(
  toPairs,
  //$FlowIssue
  (arr: FieldList) => arr.concat(arr.map(([name, value]) => [`fantasy-land/${name}`, value])),
  addProperties)

const fantasyInstance = prepareFl(fantasyMethods)
const fantasyOnClass = prepareFl(fantasyStatic)
export default makeContainer
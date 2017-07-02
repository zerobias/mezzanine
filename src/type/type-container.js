//@flow

import { values } from 'ramda'
import toFastProps from '../to-fast-props'
import { isMezzanine } from './fixtures'
import { typeMark } from '../config'
import { createBuilder, createPred, transformInput } from './descriptor'
import { type Pred } from './descriptor'
import { type ContextMethod } from './index.h'
import { injector } from '../utils/props'
import { getInitialValue, applyStack } from '../virtual-stack'
import { instanceInjectableProps, fantasyInstance, fantasyOnClass } from './properties'

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
  +keys: string[],
  is(val: mixed): boolean,
  typeName: string,
  contramap<T>(prependFunction: (...vals: T[]) => Schema): TypeStatic<T>,
  of<T: Schema | TypeRecord<Schema>>(val: T): TypeRecord<Schema>,
  equals(a: TypeRecord<Schema>, b: TypeRecord<Schema>): boolean,
  // equals<R, D>(val: R | D | mixed): boolean,
  // concat<R, D>(val: R | D): TypeRecord,
  // extract(): Schema,
  // ap<R>(m: R): R, //???
}

export interface TypeStaticPrivate {
  +ಠ_ಠ: Symbol,
  desc: Descript,
  func: {[name: string]: ContextMethod<*, *>},
  stack: Array<(val: mixed) => mixed>
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

const newUniqMark = (name: string) => Symbol(name)


const generalInjectableProps = {
  clone: (_: any, Static: TypeStatic<any> & TypeStaticPrivate) => () => {
    const { name, typeName, desc, func, stack } = Static
    return makeContainer(name, typeName, desc, func, stack)
  },
  //$FlowIssue
  [typeMark]: {
    get       : () => true,
    enumerable: false,
  },
}

const staticInjectableProps = {
  //$FlowIssue
  [Symbol.hasInstance]: (Static: TypeStatic<any>) => (val: mixed) => Static.is(val),
  stackUpdate         : (Static: TypeStatic<any> & TypeStaticPrivate) =>
    (newStack: Array<(val: mixed) => mixed>) => {
      const { name, typeName, desc, func } = Static
      return makeContainer(name, typeName, desc, func, newStack)
    },
}

const fullStaticProps = injector([
  generalInjectableProps,
  staticInjectableProps,
  fantasyOnClass,
])

const fullInstanceProps = injector([
  generalInjectableProps,
  instanceInjectableProps,
  fantasyInstance,
])

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
  const uniqMark = newUniqMark(name)
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
    fullInnerInstProps(this, RecordFn)
    fullInstanceProps(this, RecordFn)
    toFastProps(this)
  }
  const generalProps = {
    ಠ_ಠ: {
      value     : uniqMark,
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
  }
  const staticProps = {
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
  }
  const instProps = {
    typeName: {
      value     : typeName,
      enumerable: true,
    },
  }
  const fullInnerStaticProps = injector([
    generalProps,
    staticProps,
  ])
  const userMeth = getUserMethods(func)
  const fullInnerInstProps = injector([
    generalProps,
    instProps,
    userMeth,
  ])
  fullInnerStaticProps(RecordFn, RecordFn)
  fullStaticProps(RecordFn, RecordFn)
  return RecordFn
}
const getUserMethods = (func: *) =>
  Object.getOwnPropertyNames(func)
  //$FlowIssue
    .concat(Object.getOwnPropertySymbols(func))
    .map(key => [key, {
      value     : func[key],
      enumerable: true,
      writable  : true,
      inject    : true
    }])


export default makeContainer

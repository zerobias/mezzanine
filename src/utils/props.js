//@flow

export function copyObject<T: Object | Function>(orig: T): T {
  // 1. copy has same prototype as orig
  const copy: any = Object.create(Object.getPrototypeOf(orig))

  // 2. copy has all of orig’s properties
  copyOwnPropertiesFrom(copy, orig)

  return copy
}


export function copyOwnPropertiesFrom<
  T: Object | Function,
  S: Object | Function
>(target: T, source: S): T | S {
  const ownProps = Object.getOwnPropertyNames(source)
  const ln = ownProps.length
  let descBuffer,
      propKey = ''
  for (let i = 0; i < ln; i++) {
    propKey = ownProps[i]
    descBuffer = Object.getOwnPropertyDescriptor(source, propKey)
    Object.defineProperty(target, propKey, descBuffer)
  }
  return target
}

export function addLazyProperty<O, T>(
  name: string | Symbol,
  initializer: (O, Class<O>) => T,
  enumerable?: boolean) {
  return function(object: O, klass: Class<O>) {
    Object.defineProperty(object, name, {
      get() {
        const v = initializer(this, klass)
        Object.defineProperty(this, name, {
          value     : v,
          enumerable: !!enumerable,
          writable  : true
        })
        return v
      },
      set(v) {
        Object.defineProperty(this, name, {
          value     : v,
          enumerable: !!enumerable,
          writable  : true
        })
        return v
      },
      enumerable  : !!enumerable,
      configurable: true
    })
  }
}

export function addProperty(
  name: string | Symbol,
  value: any,
  enumerable: boolean = true,
  writable: boolean = true,
  injected: boolean = false) {
  return function property(target: any, klass: any) {
    const val = injected
      ? value(target, klass)
      : value
    // console.log(val)
    Object.defineProperty(target, name, {
      value       : val,
      enumerable,
      configurable: writable,
      writable,
    })
  }
}

export function addGetSetter(
  name: string | Symbol,
  //$FlowIssue
  get?: () => any,
  set?: (val: any) => void,
  enumerable: boolean = false,
  writable: boolean = false) {
  const desc: Property = {
    enumerable,
    configurable: writable,
  }
  if (get != null)
    desc.get = get
  if (set != null)
    desc.set = set
  return function getSetter(target: any) {
    Object.defineProperty(target, name, desc)
  }
}

type Property = {
  value?: mixed,
  get?: mixed,
  set?: (val: any) => void,
  enumerable?: boolean,
  writable?: boolean,
  lazy?: boolean,
  inject?: boolean,
}

export type Injectable = (ctx: mixed, Ctx: mixed) => mixed
export type FieldMap = {[field: string]: Property | Injectable}
export type FieldList = Array<[string | Symbol, Property | Injectable]>

const funcToProperty =
  <T: Property | Injectable>(property: T): Property =>
    typeof property === 'function'
      ? {
        value     : property,
        enumerable: false,
        writable  : true,
        inject    : true,
      }
      : property

function ownKeys(desc: FieldMap) {
  //$FlowIssue
  const keys: Array<string | Symbol> = Object.getOwnPropertyNames(desc)
    .concat(Object.getOwnPropertySymbols(desc))
  return keys
}

function toKeyVal<T: FieldMap | FieldList>(desc: T): FieldList {
  if (Array.isArray(desc)) return desc
  const keys = ownKeys(desc)
  const ln = keys.length
  const keyVal = Array(ln)
  for (let i = 0; i < ln; i++)
    keyVal[i] = [keys[i], desc[keys[i]]]
  return keyVal
}

export function addProperties<T: FieldMap | FieldList>(desc: T) {
  const pairs: FieldList = toKeyVal(desc)
  const funcs = pairs
    .map(([key, val]) => [key, funcToProperty(val)])
    .map(([key, val]: [string | Symbol, Property]) => {
      let get = val.get
      const getter = get
      if (val.lazy)
        //$FlowIssue
        return addLazyProperty(key, val.value, true)
      const isGet = get !== undefined
      const isGetSet = isGet || val.set != null
      if (isGetSet) {
        if (isGet && typeof get !== 'function')
          get = () => getter
        return addGetSetter(key, get, val.set, val.enumerable, val.writable)
      } else
        return addProperty(key, val.value, val.enumerable, val.writable, val.inject)
    })
  return (target: any, klass: any) => {
    funcs.forEach(fn =>
      // console.log(fn)
      //$FlowIssue
      fn(target, klass)
    )
  }
}



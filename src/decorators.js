//@flow
import { without } from 'ramda'

const omitProto = without(['prototype'])

export function omitNew<+T>(klass: Class<T>) {
  function Decorated(...args: Array<*>) {
    return new klass(...args)
  }
  return copyProps(klass, Decorated)
}

export const rename = (name: string) => <T>(fn: T): T => {
  const nameDescriptor = Object.getOwnPropertyDescriptor(fn, 'name')
  nameDescriptor.value = name
  Object.defineProperty(fn, 'name', nameDescriptor)
  return fn
}

export const callableClass = <T, F>(fabric: (obj: T) => F) => (klass: Class<T>): Class<(T | F)> => {
  class Decorated {
    $call: F
    constructor(...args: Array<*>) {
      const instance = new klass(...args)
      const callable = fabric(instance)
      copyProps(instance, callable)
      return callable
    }
  }

  copyProps(klass, Decorated)

  return ((Decorated: any): Class<(T | F)>)
}

export function copyProps<+T: Object, S>(source: T, target: S): T | S {
  const props = omitProto(Reflect.ownKeys(source))
  props.forEach((prop) => {
    Object.defineProperty(
      target,
      prop,
      Object.getOwnPropertyDescriptor(source, prop)
    )
  })
  Object.setPrototypeOf(target, source)
  return ((target: any): T | S)
}

//@flow
'use strict'

import { without } from 'ramda'

const omitProto = without(['prototype'])

export function mergeTemplateArgs(strings: string[], ...values?: Array<*>): Array<*> {
  const stringsLn = strings.length
  const hasValues = stringsLn > 1
  if (!hasValues) return strings
  const pairsCount = stringsLn - 1
  const fullLength = pairsCount * 2 + 1
  const result = Array(fullLength)
  result[fullLength -1] = strings[stringsLn-1]
  for (let i = 0, j = 0; i < pairsCount; i++, j+=2) {
    result[j] = strings[i]
    result[j+1] = values[i]
  }
  return result
}

export const rename = (name: string) => <T: Function>(fn: T): T => {
  const nameDescriptor = Object.getOwnPropertyDescriptor(fn, 'name')
  nameDescriptor.value = name
  Object.defineProperty(fn, 'name', nameDescriptor)
  return fn
}

// export const methodTag = (...tags: *) => {
//   const name = Array.isArray(tags[0])
//     ? mergeTemplateArgs(...tags).join('')
//     : tags[0] || ''
//   const renamer = rename(name)
//   return <K, P: Function>(target: K, key: string, descriptor: PropDescriptor<P>) => {
//     if (descriptor.value === undefined)
//       throw new TypeError('undefined renamed value')
//     renamer(descriptor.value)
//     return descriptor
//   }
// }

// export const callableClass =
//   <T, F>(fabric: (klass: Class<T>, obj: T) => F) =>
//     (klass: Class<T> & Function): Class<(T | F)> => {
//       class Decorated {
//         $call: F
//         constructor(...args: Array<*>) {
//           const instance = new klass(...args)
//           const callable = fabric(klass, instance)
//           copyProps(instance, callable)
//           return callable
//         }
//       }

//       copyProps(klass, Decorated)

//       return ((Decorated: any): Class<(T | F)>)
//     }

export function copyProps<+T: Object, S>(source: T, target: S): T | S {
  const props =
    omitProto(Object.getOwnPropertyNames(source))
      .concat(Object.getOwnPropertySymbols(source))
  props.forEach((prop) => {
    // console.log(target, prop)
    try {
      Object.defineProperty(
        target,
        prop,
        Object.getOwnPropertyDescriptor(source, prop)
      )
    } catch (error) {
      console.log(prop)
      console.log(error)
      console.log(source, target)
    }
  })

  Object.setPrototypeOf(target, Object.getPrototypeOf(source))
  return ((target: any): T | S)
}


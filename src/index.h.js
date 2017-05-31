//@flow
'use strict'

export type PropDescriptor<+Prop=*> = {
  configurable?: bool,
  enumerable?: bool,
  get?: () => Prop,
  value?: Prop,
  set?: (obj: Prop) => void,
}

export type Descriptor<T=*> = {[key: string]: T}

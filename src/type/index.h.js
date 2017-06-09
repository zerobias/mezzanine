//@flow

export type ContextMethod<T, F> = (ctx: T) => F

export type Pred = (val: mixed) => boolean

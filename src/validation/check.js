//@flow

export class Check<Annotation = 'Check'> {
  name: Annotation
  check: (mixed) => boolean
  error: (mixed) => string

  constructor(check: (mixed) => boolean, error: (mixed) => string, name: Annotation) {
    this.name = name
    this.check = check
    this.error = error
  }
  static of<Name>(config: { name: Name, check: (mixed) => boolean, error: (mixed) => string }): Check<*> {
    const { name, check, error } = config
    return new Check(check, error, name)
  }
}
const of = Check.of

export const isObject: Check<'is object'> = of({
  check: (val) => typeof val === 'object',
  error: (val) => `${String(val)} should be object`,
  name : 'is object',
})

export const isNotNull: Check<'is not falsey'> = of({
  check: (val) => val != null,
  error: (val) => `${String(val)} should not be nullable`,
  name : 'is not falsey',
})

export const isFunc: Check<'is function'> = of({
  check: (val) => typeof val === 'function',
  error: (val) => `${String(val)} should be function`,
  name : 'is function',
})

export const isArray: Check<'is array'> = of({
  check: (val) => Array.isArray(val),
  error: (val) => `${String(val)} should be array`,
  name : 'is array',
})

export const isString: Check<'is string'> = of({
  check: (val) => typeof val === 'string',
  error: (val) => `${String(val)} should be string`,
  name : 'is string',
})

export const isNotEmpty: Check<'is not empty'> = of({
  check: (val: any) => val.length > 0,
  error: (val) => `${String(val)} should be not empty`,
  name : 'is not empty',
})

export default Check

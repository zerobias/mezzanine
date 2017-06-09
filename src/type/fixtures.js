//@flow

const canHaveProps = (val: mixed): boolean %checks =>
  val !== null
  && (typeof val === 'object'
     || typeof val === 'function')

/**
 *
 * @deprecated
 */
export function transformMonoInput(input: *) {
  if (canHaveProps(input) && input.value !== undefined)
    return input
  return { value: input }
}

export const ensureProp = (key: string, obj: mixed): boolean %checks =>
     canHaveProps(obj)
  && (
       obj[key] !== undefined
    || Object.keys(obj).indexOf(key) !== -1
  )
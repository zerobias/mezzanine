//@flow

export function applyStack(stack: Array<(val: mixed) => mixed>, data: mixed) {
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

export function getInitialValue(stack: Array<(val: mixed) => mixed>, obj: any): {  val: mixed, succ: boolean } {
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

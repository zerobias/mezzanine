//@flow

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

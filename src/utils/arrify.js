//@flow

import { flatten } from 'ramda'

//$FlowIssue
export function arrify<T,
  L: Array<Array<Array<T> | T> | Array<T> | T> | Array<Array<T> | T> | Array<T> | T>(list: L): Array<T> {
  if (Array.isArray(list)) return flatten(list)
  else return [list]
}

export default arrify

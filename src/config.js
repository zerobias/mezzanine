//@flow
'use strict'

const config = {
  check: true
}

// declare class Taggy<Tag: string> { value: Tag }

// function TaggedSymbol<Tag: string>(tag: Tag): Symbol & Taggy<Tag> {
//   return Symbol(tag)
// }

export const typeMark = Symbol('type mark')

export default config

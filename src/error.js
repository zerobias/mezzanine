//@flow

class MezzanineError extends Error {
  name='MezzanineError'
  constructor(message: string) {
    super(message)
    this.stack = cleanStack(this.stack)
  }
}


const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/
const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/babel-polyfill\/.*)?\w+)\.js:\d+:\d+)|native)/
function cleanStack(stack: string) {
  return stack.replace(/\\/g, '/')
    .split('\n')
    .filter(x => {
      const pathMatches = x.match(extractPathRegex)
      if (pathMatches === null || !pathMatches[1]) {
        return true
      }
      const match = pathMatches[1]
      return !pathRegex.test(match)
    })
    .filter(x => x.trim() !== '')
    .join('\n')
}

export class ArgumentsCountError extends MezzanineError {
  constructor(submessage: string,
              typeName: string,
              validators: Array<*>,
              args: Array<*>) {
    const message = `${submessage} arguments supplied to constructor ${
      typeName} (expected ${validators.length} but got ${args.length})`
    super(message)
  }
}

export class UnmatchedPatternError extends MezzanineError {
  constructor(val: *, obj: string, i: number) {
    super(`Unmatched pattern ${obj} ${i}`)
    this.val = val
  }
}

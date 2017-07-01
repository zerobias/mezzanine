//@flow


export class Either<Right = mixed, Left = mixed> {
  value: Right | Left
  status: 'right' | 'left'
  case<R, L>(select: { Right: (val: Right) => R, Left: (val: Left) => L }) {
    switch (this.status) {
      case 'right': {
        const data: Right = (this.value: any)
        return select.Right(data)
      }
      case 'left': {
        const data: Left = (this.value: any)
        return select.Left(data)
      }
      default: {
        throw new TypeError(`[Either] Unexpected status ${this.status}`)
      }
    }
  }
  caseWrap<R, L>(select: { Right: (val: Right) => R, Left: (val: Left) => L }) {
    const result: any = this.case(select)
    //$FlowIssue
    const wrapped: Either<R, L> = new Either(result, this.status)
    return wrapped
  }
  isRight() {
    return this.case({
      Right: () => true,
      Left : () => false,
    })
  }
  isLeft() {
    return this.case({
      Right: () => false,
      Left : () => true,
    })
  }
  map<NewRight>(fn: (val: Right) => NewRight) {
    return this.case({
      Right: fn,
      Left : (val: Left): Left => val,
    })
  }
  mapl<NewLeft>(fn: (val: Left) => NewLeft) {
    return this.caseWrap({
      Right: (val: Right): Right => val,
      Left : fn,
    })
  }
  bimap<NewRight, NewLeft>(fnRight: (val: Right) => NewRight, fnLeft: (val: Left) => NewLeft) {
    return this.caseWrap({
      Right: fnRight,
      Left : fnLeft,
    })
  }
  chain<NewRight, NewLeft>(fn: (val: Right) => Either<NewRight, NewLeft>): Either<NewRight, Left | NewLeft> {
    //$FlowIssue
    return this.case({
      Right: fn,
      Left : () => this,
    })
  }
  chainl<NewRight, NewLeft>(fn: (val: Left) => Either<NewRight, NewLeft>): Either<Right | NewRight, NewLeft> {
    //$FlowIssue
    return this.case({
      Right: () => this,
      Left : fn,
    })
  }
  //$FlowIssue
  alt<AltRight>(either: Either<AltRight, any>): Either<Right | AltRight, Left> {
    if (this.isRight()) return this
    return either.isRight()
      ? either
      : this
  }
  static Right(val: Right) {
    const result = new Either(val, 'right')
    return result
  }
  static Left(val: Left) {
    const result = new Either(val, 'left')
    return result
  }
  static of<T>(val: T): Either<T, void> {
    const result: Either<T, void> = new Either(val, 'right')
    return result
  }
  static when<T>(fn: (val: T) => boolean, val: T) {
    const status: 'right' | 'left' = fn(val)
      ? 'right'
      : 'left'
    return new Either(val, status)
  }
  //$FlowIssue
  static validate<T, R, L>(fn: (val: T) => boolean,
                           select: { Right: (val: T) => R, Left: (val: T) => L },
                           val: T): Either<R, L> {
    //$FlowIssue
    const raw: Either<T, T> = Either.when(fn, val)
    return raw.caseWrap(select)
  }
  constructor(value: Right | Left, status: 'right' | 'left') {
    this.value = value
    this.status = status
  }
}

export default Either

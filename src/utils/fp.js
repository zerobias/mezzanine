//@flow


/**
 * id :: a -> a
 *
 *
 * @template A
 * @param {A} a
 * @returns {A}
 */
export function id<A>(a: A) {
  return a
}



/**
 * compose :: (b -> c) -> (a -> b) -> (a -> c)
 *
 * @template A
 * @template B
 * @template C
 * @param {function(B): C} f
 * @param {function(A): B} g
 * @returns {function(A): C}
 */
export function compose<A, B, C>(f: (B) => C, g: (A) => B): (A) => C {
  return function(x: A) {
    return f(g(x))
  }
}


/**
 * apply :: (a -> b) -> a -> b
 *
 * @template A
 * @template B
 * @param {function(A): B} f
 * @param {A} x
 * @returns {B}
 */
function apply<A, B>(f: (A) => B, x: A): B {
  return f(x)
}


interface CurriedFunction2<A, B, C> {
  (): CurriedFunction2<A, B, C>,
  (A): (B) => C,
  (A, B): C
}

interface CurriedFunction3<A, B, C, D> {
  (): CurriedFunction3<A, B, C, D>,
  (A): CurriedFunction2<B, C, D>,
  (A, B): (C) => D,
  (A, B, C): D
}

interface CurriedFunction4<A, B, C, D, E> {
  (): CurriedFunction4<A, B, C, D, E>,
  (A): CurriedFunction3<B, C, D, E>,
  (A, B): CurriedFunction2<C, D, E>,
  (A, B, C): (D) => E,
  (A, B, C, D): E
}


/**
 * curry2 :: ((a, b) -> c) -> (a -> b -> c)
 *
 * @template A
 * @template B
 * @template C
 * @param {function(A, B): C} f
 * @returns {CurriedFunction2<A, B, C>}
 */
export function curry2<A, B, C>(f: (A, B) => C): CurriedFunction2<A, B, C> {
  function curried(a, b) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return b => f(a, b)
      default: return f(a, b)
    }
  }
  return curried
}


/**
 * curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
 *
 * @template A
 * @template B
 * @template C
 * @template D
 * @param {function(A, B, C): D} f
 * @returns {CurriedFunction3<A, B, C, D>}
 */
export function curry3<A, B, C, D>(f: (A, B, C) => D): CurriedFunction3<A, B, C, D> {
  function curried(a, b, c) { // eslint-disable-line complexity
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry2((b, c) => f(a, b, c))
      case 2: return c => f(a, b, c)
      default:return f(a, b, c)
    }
  }
  return curried
}


/**
 * curry4 :: ((a, b, c, d) -> e) -> (a -> b -> c -> d -> e)
 *
 * @template A
 * @template B
 * @template C
 * @template D
 * @template E
 * @param {function(A, B, C, D): E} f
 * @returns {CurriedFunction4<A, B, C, D, E>}
 */
export function curry4<A, B, C, D, E>(f: (A, B, C, D) => E): CurriedFunction4<A, B, C, D, E> {
  function curried(a, b, c, d) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry3((b, c, d) => f(a, b, c, d))
      case 2: return curry2((c, d) => f(a, b, c, d))
      case 3: return d => f(a, b, c, d)
      default:return f(a, b, c, d)
    }
  }
  return curried
}

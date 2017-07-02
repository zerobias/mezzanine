//@flow

/**
 * cons :: a -> [a] -> [a]
 *
 * a with x prepended
 *
 * @export
 * @template T
 * @param {T} x
 * @param {T[]} a
 * @returns {T[]}
 */
export function cons<T>(x: T, a: T[]): T[] {
  const l = a.length
  const b = new Array(l + 1)
  b[0] = x
  for (let i = 0; i < l; ++i) {
    b[i + 1] = a[i]
  }
  return b
}

/**
 * append :: a -> [a] -> [a]
 *
 * a with x appended
 *
 * @export
 * @template T
 * @param {T} x
 * @param {T[]} a
 * @returns {T[]}
 */
export function append<T>(x: T, a: T[]): T[] {
  const l = a.length
  const b = new Array(l + 1)
  for (let i = 0; i < l; ++i) {
    b[i] = a[i]
  }

  b[l] = x
  return b
}

/**
 * drop :: Int -> [a] -> [a]
 *
 * drop first n elements
 *
 * @export
 * @template T
 * @param {number} n
 * @param {T[]} a
 * @returns {T[]}
 */
export function drop<T>(n: number, a: T[]): T[] {
  if (n < 0) {
    throw new TypeError('n must be >= 0')
  }

  const l = a.length
  if (n === 0 || l === 0) {
    return a
  }

  if (n >= l) {
    return []
  }

  return unsafeDrop(n, a, l - n)
}

/**
 * unsafeDrop :: Int -> [a] -> Int -> [a]
 *
 * Internal helper for drop
 *
 * @template T
 * @param {number} n
 * @param {T[]} a
 * @param {number} l
 * @returns {T[]}
 */
function unsafeDrop<T>(n: number, a: T[], l: number): T[] {
  const b = new Array(l)
  for (let i = 0; i < l; ++i) {
    b[i] = a[n + i]
  }
  return b
}

/**
 * tail :: [a] -> [a]
 *
 * drop head element
 *
 * @export
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function tail<T>(a: T[]): T[] {
  return drop(1, a)
}

/**
 * copy :: [a] -> [a]
 *
 * duplicate a (shallow duplication)
 *
 * @export
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function copy<T>(a: T[]): T[] {
  const l = a.length
  const b = new Array(l)
  for (let i = 0; i < l; ++i) {
    b[i] = a[i]
  }
  return b
}

/**
 * map :: (a -> b) -> [a] -> [b]
 * transform each element with f
 *
 * @export
 * @template T
 * @template S
 * @param {(val: T) => S} f
 * @param {T[]} a
 * @returns {S[]}
 */
export function map<T, S>(f: (val: T) => S, a: T[]): S[] {
  const l = a.length
  const b = new Array(l)
  for (let i = 0; i < l; ++i) {
    b[i] = f(a[i])
  }
  return b
}

/**
 * reduce :: (a -> b -> a) -> a -> [b] -> a
 *
 * accumulate via left-fold
 *
 * @export
 * @template T
 * @template S
 * @param {(result: S, val: T, index: number) => S} f
 * @param {S} z
 * @param {T[]} a
 * @returns {S}
 */
export function reduce<T, S>(f: (result: S, val: T, index: number) => S, z: S, a: T[]): S {
  let r = z
  for (let i = 0, l = a.length; i < l; ++i) {
    r = f(r, a[i], i)
  }
  return r
}

/**
 * replace :: a -> Int -> [a]
 *
 * replace element at index
 *
 * @export
 * @template T
 * @param {T} x
 * @param {number} i
 * @param {T[]} a
 * @returns {T[]}
 */
export function replace<T>(x: T, i: number, a: T[]): T[] {
  if (i < 0) {
    throw new TypeError('i must be >= 0')
  }

  const l = a.length
  const b = new Array(l)
  for (let j = 0; j < l; ++j) {
    b[j] = i === j ? x : a[j]
  }
  return b
}

/**
 * remove :: Int -> [a] -> [a]
 *
 * remove element at index
 *
 *
 * @export
 * @template T
 * @param {number} i
 * @param {T[]} a
 * @returns
 */
export function remove<T>(i: number, a: T[]) {
  if (i < 0) {
    throw new TypeError('i must be >= 0')
  }

  const l = a.length
  if (l === 0 || i >= l) {  // exit early if index beyond end of array
    return a
  }

  if (l === 1) {  // exit early if index in bounds and length === 1
    return []
  }

  return unsafeRemove(i, a, l - 1)
}

/**
 * unsafeRemove :: Int -> [a] -> Int -> [a]
 *
 * Internal helper to remove element at index
 *
 *
 * @template T
 * @param {number} i
 * @param {T[]} a
 * @param {number} l
 * @returns {T[]}
 */
function unsafeRemove<T>(i: number, a: T[], l: number): T[] {
  const b = new Array(l)
  let j
  for (j = 0; j < i; ++j) {
    b[j] = a[j]
  }
  for (j = i; j < l; ++j) {
    b[j] = a[j + 1]
  }

  return b
}

/**
 * removeAll :: (a -> boolean) -> [a] -> [a]
 *
 * remove all elements matching a predicate
 *
 * @export
 * @template T
 * @param {(val: T) => boolean} f
 * @param {T[]} a
 * @returns {T[]}
 */
export function removeAll<T>(f: (val: T) => boolean, a: T[]): T[] {
  const l = a.length
  const b = new Array(l)
  let j = 0
  for (let x, i = 0; i < l; ++i) {
    x = a[i]
    if (!f(x)) {
      b[j] = x
      ++j
    }
  }

  b.length = j
  return b
}

/**
 * findIndex :: a -> [a] -> Int
 * find index of x in a, from the left
 *
 *
 * @export
 * @template T
 * @param {number} x
 * @param {T[]} a
 * @returns {number}
 */
export function findIndex<T>(x: number, a: T[]): number {
  for (let i = 0, l = a.length; i < l; ++i) {
    if (x === a[i]) {
      return i
    }
  }
  return -1
}

/**
 * isArrayLike :: * -> boolean
 *
 * Return true if x is array-like
 *
 * @export
 * @param {mixed} x
 * @returns
 */
export function isArrayLike(x: mixed): boolean %checks {
  return (
    x != null
    && typeof x.length === 'number'
    && typeof x !== 'function'
  )
}

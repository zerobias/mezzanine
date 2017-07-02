# 0.2.0
- Major perfomance boost
- Remove `core-decorators`
- Fix contramap inconsistency
```js
const toLength = (text) => text.length

const Num = Type`Num`(Number)
const Length = Num.contramap(toLength)

expect(Num.is('word')).toBe(false)
expect(Length.is('word')).toBe(true)

```
- Implement stack-safe contramap computations
- Add relevant stress-test
- Fix all flow errors

# 0.1.3
- Fix node 6 support

# 0.1.2

- Add `Tuple` data type
- Add symbol methodth support.
E.g., now you can define iterable types with `Symbol.iterator`
```js
const Iterable = Type`Iterable`(Array, {
  length: ({ value }) => value.length,
  [Symbol.iterator](ctx) {
    return function* () {
      const length = ctx.length
      for (let i = 0; i < length; i++)
        yield (ctx.value[i])
    }
  },
})
const result = [...Iterable(['a', 'b', 'c'])]
// => ['a', 'b', 'c']
```
- Add fantasy-land contravariant suport as static method. `.contramap` returns type with constructor arguments transformation prepended
```js
const Text = Type`Text`(String).contramap(chars => chars.join(' '))
const text = Text(['from','array','of','words'])
// => { type: 'Text', value: 'from array of words' }

```
- Add Travis CI integration
- Add readme

# 0.1.1

- Add `Maybe` data type

# =<0.1.0

Several early proof-of-concept versions

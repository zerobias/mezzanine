# Mezzanine

[![npm version][npm-image]][npm-url]![build status][build-status]

Fantasy land union types with pattern matching


## Installation

```bash
$ npm install --save mezzanine
```

## Motivation

### Principles:

-  No `this`
-  No `new`
-  No `.prototype`
-  Minimal api surface

Object classes, described with rules and linked methods.

## Usage

```js
import { Type, Union } from 'mezzanine'

const Point = Type`Point`({
  x: Number,
  y: Number,
})
const Line = Type`Line`({
  start: Point,
  end  : Point,
})
const Circle = Type`Circle`({
  center: Point,
  radius: Number,
})
const Shape = Union`Shape`({
  Line,
  Circle,
})
const point1 = Point({ x: 1, y: 2 })
const point2 = Point({ x: 0, y: 10 })

point1.equals(Point({ x: 1, y: 2 })) // => true
point1.equals({ x: 1, y: 2 }) // => true, smart type inference

const shape1 = Shape({
  start: { x: 0, y: 0 },
  end  : point2,
})
shape1.type // => Line

```

### syntaxShockMode = off
You can also use the library without backtick tags, with classic parentheses.
```js
import { Type } from 'mezzanine'
const Point = Type('Point')({ x: Number, y: Number })
```

## Methods & computed properties

Second argument in the constructor is the function map, object with *linked methods*, which apply and attach to instances on create
```js
import { Type } from 'mezzanine'

const Point = Type`Point`({
  x: Number,
  y: Number,
}, {
  concat:
    (ctx) => // context, works as `this`
      (point) => // can be another Point instance or plain object
        Point({
          x: ctx.x + point.x,
          y: ctx.y + point.y
        })
})

const Rectangle = Type`Rectangle`({
  root  : Point,
  width : Number,
  height: Number
}, {
  area: ctx => ctx.width * ctx.height, //Will be computed property
  endPoint(ctx) {
    return ctx.root.concat({ // Use Point .concat method
      x: ctx.width,
      y: ctx.height
    })
  }
})

const rect = Rectangle({
  root: { x: 1, y: 4 },
  width: 10,
  height: 5
})
/*
  => {
    type    : 'Rectangle',
    root    : { type: 'Point', x: 1, y: 4 },
    width   : 10,
    height  : 5,
    area    : 50,
    endPoint: { type: 'Point', x: 11, y: 9 }
  }
*/

```

## Iterable types
You can define iterable types with `Symbol.iterator`. Another symbols, well-known or not, are also available as method names
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

## Data types

Mezzanine has some built-in object classes.

### Tuple
```js
import { Tuple } from 'mezzanine'

const Point = Type`Point`({ x: Number, y: Number })

const NamedPoint = Tuple(String, Point)

const point1 = NamedPoint('start point', Point({ x: 1, y: 1 }))
const point2 = NamedPoint('end point', { x: 2, y: 3 })

NamedPoint.is(['label', { x: 0, y: 0 }]) // => true
```
Tuples are iterable

```js
point2.length
// => 2
for (const value of point2) {
  console.log(value)
}
// => 'end point'
// => { type: 'Point', x: 2, y: 3 }
```

### Maybe

```js
import { Maybe } from 'mezzanine'

const filterFarmer = human => human.occupation === 'farmer'

const users = {
  230: { name: 'bob', occupation: 'farmer' },
  231: { name: 'jerry', occupation: 'doctor' },
  232: { name: 'frank', occupation: 'teacher' }
}

const readField = prop => data => data[prop]

const toUpperCase = (text) => text.toUpperCase()

const maybeName =
  Maybe(users)
    .map(readField(230))
    .filter(filterFarmer)
    .map(readField('name'))
    .map(toUpperCase)
    .toJSON()
// => BOB
```
What happens if we select an id that doesn't exist? Nothing. The whole chain will *safely* skip incorrect values without changes
### Ramda support
```js
import { pipe, map, filter, chain } from 'ramda'
import { Maybe } from 'mezzanine'

const readName = (id) => pipe(
  Maybe,
  map(readField(id)),
  filter(filterFarmer),
  map(readField('name')),
  map(toUpperCase)
)

readName(230)(users) // => { type: 'Just', value: 'BOB' }
readName(231)(users) // => { type: 'Nothing', value: undefined }
readName(NaN)(users) // => { type: 'Nothing', value: undefined }

```



## Recipes

### `Any` type
```js
import { T } from 'ramda'

const Any = Type`Any`(T)
```
or
```js
const Any = Type`Any`(() => true)
```

Usage:
```js
const example1 = Any('ok')
const example2 = Any(null)
const example3 = Any()
```

## License

The project is released under the [Mit License](./LICENSE)

[npm-url]: https://www.npmjs.org/package/mezzanine
[npm-image]: https://badge.fury.io/js/mezzanine.svg
[build-status]: https://travis-ci.org/zerobias/mezzanine.svg?branch=master

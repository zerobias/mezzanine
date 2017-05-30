'use strict'

import Type, { self } from '../src'
import { T, add } from 'ramda'


function isNumber(n) { return typeof n === 'number' }

test('returns type with constructors', () => {
  const Point = Type({ Point: [isNumber, isNumber] })
  expect(typeof Point.Point).toBe('function')
})
test('constructors create object with fields in array', () => {
  const Point = Type({ Point: [isNumber, isNumber] })
  const point = Point.Point(5, 10)
  expect(point[0]).toBe(5)
  expect(point[1]).toBe(10)
})
test('throws if field value does not pass validator', () => {
  const Point = Type({ Point: [isNumber, isNumber] })
  expect(() => {
    Point.Point('lol', 10)
  }).toThrow()
})
describe('primitives', () => {
  test('accepts strings with primitive constructors', () => {
    const Name = Type({ Name: [String] })
    const name = Name.Name('Thumper')
    expect(name[0]).toBe('Thumper')
  })
  test('throws on strings with primitive constructors', () => {
    const Name = Type({ Name: [String] })
    expect(() => {
      const name = Name.Name(12)
    }).toThrow()
  })
  test('accepts number with primitive constructors', () => {
    const Age = Type({ Age: [Number] })
    expect(Age.Age(12)[0]).toBe(12)
  })
  test('throws on number with primitive constructors', () => {
    const Age = Type({ Age: [Number] })
    expect(() => {
      Age.Age('12')
    }).toThrow()
  })
  test('throws on too many arguments', () => {
    const Foo = Type({ Foo: [Number, Number] })
    expect(() => {
      Foo.Foo(3, 3, 3)
    }).toThrow()
  })
  test('accepts boolean true with primitive constructors', () => {
    const Exists = Type({ Exists: [Boolean] })
    expect(Exists.Exists(true)[0]).toBe(true)
  })
  test('accepts boolean false with primitive constructors', () => {
    const Exists = Type({ Exists: [Boolean] })
    expect(Exists.Exists(false)[0]).toBe(false)
  })
  test('throws on boolean with primitive constructors', () => {
    const Exists = Type({ Exists: [Boolean] })
    expect(() => {
      Exists.Exists('12')
    }).toThrow()
  })
})
test('array of types', () => {
  const Point = Type({ Point: [Number, Number] })
  const { Shape } = Type({ Shape: [Type.ListOf(Point)] })
  expect(() => {
    Shape([1, Point.Point(1, 2), 3])
  }).toThrow()
  expect(() => {
    Shape([Point.Point(1, 2), Point.Point('3', 1)])
  }).toThrow()
  Shape([Point.Point(1, 2), Point.Point(1, 2)])
  Shape([])
  expect(() => {
    Shape('not a List')
  }, /wrong value/)
})
test('nest types', () => {
  const Point = Type({ Point: [isNumber, isNumber] })
  const Shape = Type({ Circle   : [Number, Point],
                       Rectangle: [Point, Point] })
  const square = Shape.Rectangle(Point.Point(1, 1), Point.Point(4, 4))
})
test('throws if field value is not of correct type', () => {
  const Length = Type({ Length: [isNumber] })
  const Shape = Type({ Rectangle: [Length, Length] })
  expect(() => {
    Shape.Rectangle(1, Length.Length(12))
  }).toThrow()
})
describe('records', () => {
  test('can create types from object descriptions', () => {
    const Point = Type({ Point: { x: Number, y: Number } })
  })
  test('can create values from objects', () => {
    const Point = Type({ Point: { x: Number, y: Number } })
    const p = Point.PointOf({ x: 1, y: 2 })
    expect(p.x).toBe(1)
    expect(p.y).toBe(2)
  })
  test('can create values from arguments', () => {
    const Point = Type({ Point: { x: Number, y: Number } })
    const p = Point.Point(1, 2)
    expect(p.x).toBe(1)
    expect(p.y).toBe(2)
  })
  test('does not add numerical properties to records', () => {
    const Point = Type({ Point: { x: Number, y: Number } })
    const p = Point.Point(1, 2)
    expect(p[0]).toBe(undefined)
    expect(p[1]).toBe(undefined)
  })
})
describe('type methods', () => {
  test('can add instance methods', () => {
    const Maybe = Type({ Just: [T], Nothing: [] })
    Maybe.prototype.map = function(fn) {
      return Maybe.case({
        Nothing: () => Maybe.Nothing,
        Just   : (v) => Maybe.Just(fn(v))
      }, this)
    }
    const just1 = Maybe.Just(1)
    const just4 = just1.map(add(3))
    expect(just4[0]).toBe(4)
    const nothing = Maybe.Nothing
    const alsoNothing = nothing.map(add(3))
    expect(alsoNothing._name).toBe('Nothing')
  })
})
describe('case', () => {
  const Action = Type({
    Translate: [isNumber, isNumber],
    Rotate   : [isNumber],
    Scale    : { x: Number, y: Number }
  })
  const sum = Action.case({
    Translate: function(x, y) {
      return x + y
    },
    Rotate: function(n) { return n },
    Scale : function(x, y) {
      return x + y
    }
  })
  test('works on types', () => {
    expect(sum(Action.Translate(10, 8))).toBe(18)
    expect(sum(Action.Rotate(30))).toBe(30)
  })
  test('destructs record types', () => {
    expect(sum(Action.ScaleOf({ x: 3, y: 4 }))).toBe(7)
  })
  test('throws on incorrect type', () => {
    const AnotherAction = Type({ Translate: [Number] })
    expect(() => {
      sum(AnotherAction.Translate(12))
    }).toThrow()
  })
  test('calls back to placeholder', () => {
    let called = false
    const fn = Action.case({
      Translate: function() { throw new Error() },
      _        : function() { called = true }
    })
    fn(Action.Rotate(30))
  })
  test('throws if no case handler found', () => {
    const called = false
    const fn = Action.case({
      Translate: function() { throw new Error() }
    })
    expect(() => {
      fn(Action.Rotate(30))
    }).toThrow()
  })
  test('does not throw with Type.check = false if no case handler found', () => {
    Type.check = false
    Action.case({
      Translate: function(x, y) {
        return x + y
      }
    }, Action.Rotate(90))
    Type.check = true
  })
})
describe('caseOn', () => {
  const Modification = Type({ Append: [Number], Remove: [Number], Slice: [Number, Number], Sort: [] })
  const update = Modification.caseOn({
    Append: function(number, list) {
      return list.concat([number])
    },
    Remove: function(number, list) {
      const idx = list.indexOf(number)
      return list.slice(0, idx).concat(list.slice(idx+1))
    },
    Slice: function(begin, end, list) { return list.slice(begin, end) },
    Sort : function(list) { return list.sort() }
  })
  test('passes argument along to case functions', () => {
    expect(update(Modification.Append(3), [1, 2])).toEqual([1, 2, 3])
    expect(update(Modification.Remove(2), [1, 2, 3, 4])).toEqual([1, 3, 4])
    expect(update(Modification.Slice(1, 4), [1, 2, 3, 4, 5])).toEqual([2, 3, 4])
    expect(update(Modification.Sort, [1, 3, 2])).toEqual([1, 2, 3])
  })
  test('partially applied to same action does not affect each other', () => {
    const append3 = update(Modification.Append(3))
    expect(append3([1, 2])).toEqual([1, 2, 3])
    expect(append3([5, 4])).toEqual([5, 4, 3])
  })
})
describe('caseOn _', () => {
  const Action = Type({ Jump: [], Move: [Number] })
  const Context = { x: 1, y: 2 }
  const update = Action.caseOn({
    _: function(context) { return context }
  })
  test('does not extract fields when matching _', () => {
    expect(update(Action.Jump, Context)).toEqual(Context)
    expect(update(Action.Move(5), Context)).toEqual(Context)
  })
})
describe('case instance method', () => {
  const Maybe = Type({ Just: [Number], Nothing: [] })
  expect(Maybe.Just(1).case({
    Nothing: function() { return 'oops' },
    Just   : function(n) { return n + 2 }
  })).toBe(3)
})
describe('recursive data types', () => {
  describe('with self symbol', () => {
    const List = Type({ Nil: [], Cons: [T, self] })
    test('can create single element list', () => {
      const list = List.Cons(1, List.Nil)
    })
    test('can get head', () => {
      const list = List.Cons(1, List.Cons(2, List.Cons(3, List.Nil)))
      function head(list) { return list[0] }
      function tail(list) { return list[1] }
      const toString = List.case({
        Cons: function(head, tail) { return `${head  } : ${  toString(tail)}` },
        Nil : function() { return 'Nil' }
      })
      expect(toString(list)).toBe('1 : 2 : 3 : Nil')
    })
  })
  describe('plain recursion', () => {
    //eslint-disable-next-line
    var List = Type({ Nil: [], Cons: [T, List] })
    test('can create single element list', () => {
      const list = List.Cons(1, List.Nil)
    })
    test('can get head', () => {
      const list = List.Cons(1, List.Cons(2, List.Cons(3, List.Nil)))
      function head(list) { return list[0] }
      function tail(list) { return list[1] }
      const toString = List.case({
        Cons: function(head, tail) { return `${head  } : ${  toString(tail)}` },
        Nil : function() { return 'Nil' }
      })
      expect(toString(list)).toBe('1 : 2 : 3 : Nil')
    })
  })

})
describe('iterator support', () => {
  test('is can be destructured like array', () => {
    const { Point, PointOf } = Type({ Point: { x: Number, y: Number, z: Number } })
    const p1 = PointOf({ x: 1, y: 2, z: 3 })
    const p2 = Point(1, 2, 3)
    const [x, y, z] = p1
    expect([x, y, z]).toEqual([1, 2, 3])
  })
})

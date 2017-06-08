'use strict'
import { equals } from 'ramda'
import { Type } from '../src'


describe('simple type', () => {
  test('Declare vith value; use with value', () => {
    const Data = Type`Data`({
      value: Object,
    })
    const data = Data({
      value: {},
    })
    console.log(Data)
    console.log(data)
    expect(Data).toHaveProperty('type', 'Data')
    expect(Data).not.toHaveProperty('value')
    expect(typeof Data.ಠ_ಠ).toBe('symbol')
    expect(data).toHaveProperty('type', 'Data')
    expect(data).toHaveProperty('value', {})
    expect(data.ಠ_ಠ).toBe(Data.ಠ_ಠ)

    const Num = Type`Num`({
      value: Number,
    })
    const num1 = Num({
      value: 0,
    })
    expect(Num).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('value', 0)
  })

  test.skip('Declare vith value; use without', () => {
    const Data = Type`Data`({
      value: Object,
    })
    const data = Data({})
    console.log(data)
    expect(Data).toHaveProperty('type', 'Data')
    expect(Data).not.toHaveProperty('value')
    expect(data).toHaveProperty('type', 'Data')
    expect(data).toHaveProperty('value', {})

    const Num = Type`Num`({
      value: Number,
    })
    const num1 = Num(0)
    console.log(num1)
    expect(Num).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('value', 0)
  })
  test.skip('Declare vithout value; use with it', () => {
    const Data = Type`Data`(Object)
    const data = Data({
      value: {},
    })
    console.log(data)
    expect(Data).toHaveProperty('type', 'Data')
    expect(Data).not.toHaveProperty('value')
    expect(data).toHaveProperty('type', 'Data')
    expect(data).toHaveProperty('value', {})

    const Num = Type`Num`(Number)
    const num1 = Num({
      value: 0,
    })
    console.log(num1)
    expect(Num).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('value', 0)
  })

  test.skip('Declare vithout value; use without too', () => {
    const Data = Type`Data`(Object)
    const data = Data({})
    console.log(data)
    expect(Data).toHaveProperty('type', 'Data')
    expect(Data).not.toHaveProperty('value')
    expect(data).toHaveProperty('type', 'Data')
    expect(data).toHaveProperty('value', {})

    const Num = Type`Num`(Number)
    const num1 = Num(0)
    console.log(num1)
    expect(Num).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('value', 0)
  })
})


describe('disjoint fields', () => {

  test('disjoint string', () => {
    const Tagged = Type`Tagged`({
      tag : 'tag type',
      data: Object,
    })
    const tagged = Tagged({
      tag : 'tag type',
      data: {},
    })
    expect(Tagged).toHaveProperty('type', 'Tagged')
    expect(tagged).toHaveProperty('type', 'Tagged')
    expect(tagged).toHaveProperty('tag', 'tag type')
    expect(tagged).toHaveProperty('data', {})

    expect(() => {
      Tagged({
        tag : 'invalid tag',
        data: {},
      })
    }).toThrow()
  })


  test('disjoint number', () => {
    const Third = Type`Third`({
      id  : 3,
      data: Object,
    })
    const third = Third({
      id  : 3,
      data: {},
    })
    expect(Third).toHaveProperty('type', 'Third')
    expect(third).toHaveProperty('id', 3)
    expect(third).toHaveProperty('data', {})

    expect(() => {
      Third({
        id  : 4,
        data: {},
      })
    }).toThrow()
  })


  test('disjoint bool', () => {
    const Rejected = Type`Rejected`({
      status: false,
      data  : Object,
    })
    const rejected = Rejected({
      status: false,
      data  : {},
    })
    expect(rejected).toHaveProperty('status', false)
    expect(rejected).toHaveProperty('data', {})

    expect(() => {
      Rejected({
        status: true,
        data  : {},
      })
    }).toThrow()
  })

})


describe('equals', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })

  const rawData = { x: 1, y: 10 }
  const point1 = Point(rawData)
  const point2 = Point(rawData)


  test('objects with same values should be equals', () => {
    expect(point1.equals(point2)).toBe(true)
  })


  test('even plain objects should be correctly compared', () => {
    expect(point1.equals(rawData)).toBe(true)
  })
})




describe('user defined functions', () => {
  test('basic function definition', () => {
    const fun = (ctx) => function testFun(...args) {
      return [ctx, ...args]
    }
    const Point = Type`Point`({
      x: Number,
      y: Number,
    }, { fun })
    const point = Point({ x: 1, y: 2 })
    expect(point.fun(1, 2, 3)).toEqual([point, 1, 2, 3])
  })

  test('use context', () => {
    const sum =
      (ctx) => (num) => ctx.x + ctx.y + num
    const Point = Type`Point`({
      x: Number,
      y: Number,
    }, { sum })
    const point = Point({ x: 1, y: 2 })
    expect(point.sum(10)).toBe(13)
  })

  test('computed property', () => {
    const sum = (ctx) => ctx.x + ctx.y
    const Point = Type`Point`({
      x: Number,
      y: Number,
    }, { sum })
    const point = Point({ x: 1, y: 2 })
    expect(point.sum).toEqual(3)
  })

  test('access to type constructor', () => {
    const inc = (ctx) => ({ x: ctx.x + 1, y: ctx.y })
    const remap =
      (ctx, Ctx) => (fn) => Ctx(fn(ctx))
    const Point = Type`Point`({
      x: Number,
      y: Number,
    }, { remap })
    const point = Point({ x: 1, y: 2 })
    const result = point.remap(inc)
    expect(result).toHaveProperty('type', 'Point')
    expect(result).toHaveProperty('x', 2)
    expect(result).toHaveProperty('y', 2)
    expect(result.equals({ x: 2, y: 2 })).toBe(true)
    expect(result.ಠ_ಠ).toBe(Point.ಠ_ಠ)
  })
})



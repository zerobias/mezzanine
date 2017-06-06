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


describe('string types', () => {
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


test('equals', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })

  const data1 = { x: 1, y: 10 }
  const point1 = Point(data1)
  const point2 = Point(data1)
  // point2.
  expect(point1.equals(point2)).toBe(true)
  // console.log(point1, point1.toJSON(), Point.ಠ_ಠ === point1.ಠ_ಠ)
  // console.log(equals(point1.toJSON(), data1))
  expect(point1.equals(data1)).toBe(true)
})


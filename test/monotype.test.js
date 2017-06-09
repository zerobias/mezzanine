'use strict'
import { T } from 'ramda'
import { Type } from '../src'


test('Declare vith value; use with value', () => {
  const Data = Type`Data`({
    value: Object,
  })
  const data = Data({
    value: {},
  })
  // console.log(Data)
  // console.log(data)
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

describe('Declare vith value; use without', () => {

  test('value: Object', () => {
    const Data = Type`Data`({
      value: Object,
    })
    const data = Data({})
    // console.log(data)
    expect(Data).toHaveProperty('type', 'Data')
    expect(Data).not.toHaveProperty('value')
    expect(data).toHaveProperty('type', 'Data')
    expect(data).toHaveProperty('value', {})
  })


  test('value: Number', () => {
    const Num = Type`Num`({
      value: Number,
    })
    const num1 = Num(0)
    const num2 = Num(NaN)
    // console.log(num1)
    expect(Num).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('type', 'Num')
    expect(num1).toHaveProperty('value', 0)
    expect(num2).toHaveProperty('value', NaN)
  })


  test('value: T (any type)', () => {
    const Any = Type`Any`({
      value: T,
    })
    const any1 = Any(0)
    const any2 = Any(null)
    const any3 = Any()
    // console.log(any1)
    expect(Any).toHaveProperty('type', 'Any')
    expect(any1).toHaveProperty('type', 'Any')
    expect(any1).toHaveProperty('value', 0)
    expect(any2).toHaveProperty('value', null)
    expect(any3).toHaveProperty('value', undefined)
  })
})

test('Declare vithout value; use with it', () => {
  const Data = Type`Data`(Object)
  const data = Data({
    value: {},
  })
  // console.log(data)
  expect(Data).toHaveProperty('type', 'Data')
  expect(Data).not.toHaveProperty('value')
  expect(data).toHaveProperty('type', 'Data')
  expect(data).toHaveProperty('value', {})

  const Num = Type`Num`(Number)
  const num1 = Num({
    value: 0,
  })
  // console.log(num1)
  expect(Num).toHaveProperty('type', 'Num')
  expect(num1).toHaveProperty('type', 'Num')
  expect(num1).toHaveProperty('value', 0)
})

test('Declare vithout value; use without too', () => {
  const Data = Type`Data`(Object)
  const data = Data({})
  // console.log(data)
  expect(Data).toHaveProperty('type', 'Data')
  expect(Data).not.toHaveProperty('value')
  expect(data).toHaveProperty('type', 'Data')
  expect(data).toHaveProperty('value', {})

  const Num = Type`Num`(Number)
  const num1 = Num(0)
  // console.log(num1)
  expect(Num).toHaveProperty('type', 'Num')
  expect(num1).toHaveProperty('type', 'Num')
  expect(num1).toHaveProperty('value', 0)
})

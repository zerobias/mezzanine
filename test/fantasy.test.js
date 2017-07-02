'use strict'

import { Type, Union } from '../src'



test('.map method', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })

  const point1 = Point({ x: 1, y: 10 })

  const inc = ({ x, y }) => ({
    x: x++,
    y: y++,
  })

  expect(point1.map).toBeDefined()
  expect(() => {
    const mapped = point1.map(inc)
    mapped.equals({ x: 2, y: 11 })
  }).not.toThrow()
})


describe('[ Type ][ static ] `.contramap` (Contravariant)', () => {
  const Num = Type`Num`(Number)
  const toLength = (text/*:string*/) => text.length
  const inc = (n/*:number*/) => n + 1


  test('Basic test', () => {
    expect(Num.contramap).toBeDefined()
    expect(() => {
      const Length = Num.contramap(toLength)
      console.log(Length)
      expect(Length.type).toBe('Num')
    }).not.toThrow()
    expect(() => {
      const Length = Num.contramap(toLength)
      const value1 = Length('word')
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(4)
    }).not.toThrow()
    expect(() => {
      const Length = Num.contramap(toLength)
      expect(Num.is('word')).toBe(false)
      expect(Length.is('word')).toBe(true)
    }).not.toThrow()
  })


  test('Deep chaining; tail call optimisation', () => {
    expect(() => {
      let Counter = Num
      for (let i = 0; i < 1000; ++i)
        Counter = Counter.contramap(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(1000)
    }).not.toThrow()

    expect(() => {
      let Counter = Num
      for (let i = 0; i < 5000; ++i)
        Counter = Counter.contramap(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(5000)
    }).not.toThrow()

    expect(() => {
      let Counter = Num
      for (let i = 0; i < 10e3; ++i)
        Counter = Counter.contramap(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(10e3)
    }).not.toThrow()

    /*expect(() => {
      let Counter = Num
      for (let i = 0; i < 30e3; ++i)
        Counter = Counter.contramap(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(30e3)
    }).not.toThrow()*/
  })
})

describe('[ Type ][ static ] `.map` (Functor)', () => {
  const Num = Type`Num`(Number)
  const toLength = (text/*:string*/) => text.length
  const inc = (n/*:number*/) => n + 1


  test('Basic test', () => {
    expect(Num.map).toBeDefined()
    expect(() => {
      const Length = Num.map(toLength)
      console.log(Length)
      expect(Length.type).toBe('Num')
    }).not.toThrow()
    expect(() => {
      const Length = Num.map(toLength)
      const value1 = Length('word')
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(4)
    }).not.toThrow()
  })


  test('Deep chaining; tail call optimisation', () => {
    expect(() => {
      let Counter = Num
      for (let i = 0; i < 1000; ++i)
        Counter = Counter.map(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(1000)
    }).not.toThrow()

    expect(() => {
      let Counter = Num
      for (let i = 0; i < 5000; ++i)
        Counter = Counter.map(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(5000)
    }).not.toThrow()

    expect(() => {
      let Counter = Num
      for (let i = 0; i < 10e3; ++i)
        Counter = Counter.map(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(10e3)
    }).not.toThrow()

    expect(() => {
      let Counter = Num
      for (let i = 0; i < 30e3; ++i)
        Counter = Counter.map(inc)
      const value1 = Counter(0)
      console.log(value1)
      expect(value1.type).toBe('Num')
      expect(value1.value).toBe(30e3)
    }).not.toThrow()
  })
})


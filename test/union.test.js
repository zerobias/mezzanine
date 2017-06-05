'use strict'
import { propEq } from 'ramda'

import Union from '../src/union'
import { Type } from '../src/container'

describe('example: Maybe type', () => {

  describe('basic constructors', () => {
    const Just = { value: Object }
    const Nothing = { }
    const Maybe = Union`Maybe`({ Just, Nothing })
    Maybe
    test('Just create', () => {
      const just1 = Maybe.Just({ value: { ok: 'ok' } })
      const just2 = Maybe.Just({ value: {} })
      expect(just1).toHaveProperty('_name', 'Just')
      expect(just1.typeName).toBe('Maybe')
      expect(just1).toHaveProperty('value', { ok: 'ok' })
      expect(just2).toHaveProperty('_name', 'Just')
      expect(just2).toHaveProperty('value', { })
    })

    test('Nothing create', () => {
      const nothing1 = Maybe.Nothing({})

      expect(() => {
        /** Because Nothing type *is Object*, just empty */
        const nothing2 = Maybe.Nothing(null)
      }).toThrow()
      expect(() => {
        /** Because Nothing type *is Object*, just empty */
        const nothing3 = Maybe.Nothing()
      }).toThrow()
      expect(nothing1).toHaveProperty('_name', 'Nothing')
      expect(nothing1.typeName).toBe('Maybe')
    })
  })
  describe('no-inner constructors', () => {
    const Just = Object
    const Nothing = (val) => val == null
    const Maybe = Union`Maybe`({ Just, Nothing })
    test('Just create', () => {
      const just1 = Maybe.Just({ ok: 'ok' })
      const just2 = Maybe.Just({ })
      expect(just1).toHaveProperty('_name', 'Just')
      expect(just1).toHaveProperty('typeName', 'Maybe')
      console.log(just1)
      console.log(Maybe)
      console.log(Maybe.Nothing)
      expect(just1).toHaveProperty('value', { ok: 'ok' })
      expect(just2).toHaveProperty('_name', 'Just')
      expect(just2).toHaveProperty('value', { })
    })

    test('Nothing create', () => {
      // const nothing1 = Maybe.Nothing({})
      const nothing2 = Maybe.Nothing(null)
      const nothing3 = Maybe.Nothing()

      // expect(nothing1).toHaveProperty('_name', 'Nothing')
      // expect(nothing1.typeName).toBe('Maybe')
      expect(nothing2).toHaveProperty('_name', 'Nothing')
      expect(nothing3).toHaveProperty('_name', 'Nothing')
    })
  })

  describe('function types', () => {

    describe('basic func', () => {
      const Nullable = Union`Nullable`({
        Valid: { value: (val) => val != null },
        Empty: { value: (val) => val == null }
      })

      test('create Valid', () => {
        const valid1 = Nullable.Valid({ value: 'ok' })
        const valid2 = Nullable.Valid({ value: {} })
        expect(valid1).toHaveProperty('value', 'ok')
        expect(valid2).toHaveProperty('value', {})
      })
      test('create Empty', () => {
        const valid1 = Nullable.Empty({ value: null })
        const valid2 = Nullable.Empty(null)
        expect(valid1).toBeDefined()
        expect(valid2).toBeDefined()
      })
    })

    describe('no-inner func', () => {
      const Nullable = Union`Nullable`({
        Valid: (val) => val != null,
        Empty: (val) => val == null,
      })

      test('create Valid', () => {
        const valid1 = Nullable.Valid({ value: 'ok' })
        const valid1a = Nullable.Valid('ok')
        const valid2 = Nullable.Valid({ value: {} })
        const valid2a = Nullable.Valid({})
        expect(valid1).toHaveProperty('value', 'ok')
        expect(valid1a).toHaveProperty('value', 'ok')
        expect(valid2).toHaveProperty('value', {})
        expect(valid2a).toHaveProperty('value', {})
      })
      test('create Empty', () => {
        const valid1 = Nullable.Empty({ value: null })
        const valid2 = Nullable.Empty()
        const valid3 = Nullable.Empty(null)
        expect(valid1).toBeDefined()
        expect(valid2).toBeDefined()
        expect(valid3).toBeDefined()
      })

      // test('create function', () => {
      //   const Sign = Type`Sign`((val) => ['+', '-', '*', '/', '='].includes(val))
      //   const valid1 = Sign('=')
      //   const valid2 = Sign({ value: '=' })
      //   expect(valid1).toBeDefined()
      //   expect(valid2).toBeDefined()
      // })

    })

  })


  describe('union match', () => {
    describe('basic func', () => {
      const Nullable = Union`Nullable`({
        Valid: { value: (val) => val != null },
        Null : { value: (val) => val == null }
      })
      console.log(Nullable)
      test('create Valid', () => {
        const valid1 = Nullable({ value: 'ok' })
        const valid2 = Nullable({ value: {} })
        console.log(valid1)
        expect(valid1).toHaveProperty('value', 'ok')
        expect(valid2).toHaveProperty('value', {})
        expect(valid1).toHaveProperty('typeName', 'Nullable')
        expect(valid1).toHaveProperty('_name', 'Valid')
        expect(valid2).toHaveProperty('_name', 'Valid')
      })
      test('create Empty', () => {
        const valid1 = Nullable({ value: null })
        const valid2 = Nullable(null)
        expect(valid1).toBeDefined()
        expect(valid2).toBeDefined()
        expect(valid1).toHaveProperty('typeName', 'Nullable')
        expect(valid1).toHaveProperty('_name', 'Null')
        expect(valid2).toHaveProperty('_name', 'Null')
      })
    })

    describe('no-inner func', () => {
      const Nullable = Union`Nullable`({
        Valid: (val) => val != null,
        Empty: (val) => val == null,
      })

      test('create Valid', () => {
        const valid1 = Nullable({ value: 'ok' })
        const valid1a = Nullable('ok')
        const valid2 = Nullable({ value: {} })
        const valid2a = Nullable({})
        valid1
        expect(valid1).toHaveProperty('value', 'ok')
        expect(valid1a).toHaveProperty('value', 'ok')
        expect(valid2).toHaveProperty('value', {})
        expect(valid2a).toHaveProperty('value', {})
      })
      test('create Empty', () => {
        const valid1 = Nullable({ value: null })
        const valid2 = Nullable()
        const valid3 = Nullable(null)
        valid2
        expect(valid1).toBeDefined()
        expect(valid2).toBeDefined()
        expect(valid3).toBeDefined()
        expect(valid1).toHaveProperty('_name', 'Empty')
        expect(valid2).toHaveProperty('_name', 'Empty')
        expect(valid3).toHaveProperty('_name', 'Empty')
      })
    })
  })
})


test('complex types', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })
  const Line = Type`Line`({
    Start: Point,
    End  : Point,
  })
  const Circle = Type`Circle`({
    Center: Point,
    Radius: Number,
  })
  const Shape = Union`Shape`({
    Line,
    Circle,
  })
  const point1 = Point({ x: 1, y: 2 })
  const point2 = Point({ x: 0, y: 10 })

  const shape1 = Shape({
    Start: { x: 0, y: 0 },
    End  : { x: 1, y: 0 },
  })
  expect(shape1).toHaveProperty('_name', 'Line')
  expect(shape1).toHaveProperty('typeName', 'Shape')
  expect(shape1).toHaveProperty('value.End.x', 1)
  const circle = Circle({
    Center: point1,
    Radius: 1,
  })
  const shape2 = Shape({
    Center: point1,
    Radius: 1,
  })
  expect(Point.is({ x: 1, y: 2 })).toBe(true)
  expect(Point.is(point1)).toBe(true)
  expect(shape2).toHaveProperty('_name', 'Circle')
  expect(shape2).toHaveProperty('typeName', 'Shape')
  expect(shape2).toHaveProperty('value.Center.y', 2)
  const shape3 = Shape({
    Center: { x: 1, y: 2 },
    Radius: 1,
  })
  expect(shape3).toHaveProperty('_name', 'Circle')
  expect(shape3).toHaveProperty('typeName', 'Shape')
  expect(shape3).toHaveProperty('value.Center.y', 2)
  console.log(shape3)
})

test('Ast example', () => {
  const Ident = Union`Ident`({
    Plain     : { name: String },
    Namespaced: { prefix: String, name: String },
  })
  const IdentFull = Union`IdentFull`({
    Linked  : Ident,
    Unlinked: { value: Ident, hash: propEq(0, '#') }
  })
  const Sign = Type`Sign`({
    value: (val) => ['+', '-', '*', '/', '='].includes(val)
  })
  const Equation = Type`Equation`({
    Lead: Ident,
    Sign,
    Tail: Ident,
  })

  const result = Equation({
    Lead: { name: 'val' },
    Sign: { value: '=' },
    Tail: Ident({ prefix: 'mod', name: 'ident' })
  })
  console.log(result)
})
